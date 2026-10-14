# Lock in command line (Windows).  Usage: lockin [open|update|version|web|uninstall|help]
# Installed by install.ps1 into %LOCALAPPDATA%\LockIn\bin, next to lockin.cmd, which is on your PATH.
param([string]$Command = 'open')
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ProgressPreference = 'SilentlyContinue' # makes downloads much faster in Windows PowerShell

$Repo = 'jamalmusialla81-hub/lock-in'
$Site = 'https://jamalmusialla81-hub.github.io/lock-in/'
$Bin = Split-Path -Parent $MyInvocation.MyCommand.Path

# Where the app is installed: ask Windows (the uninstall records Settings uses), then try the usual folders.
function Find-AppDir {
  $keys = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*', 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*', 'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*'
  foreach ($k in $keys) {
    $hit = Get-ItemProperty $k -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -like 'Lock in*' -and $_.InstallLocation } | Select-Object -First 1
    if ($hit -and (Test-Path (Join-Path $hit.InstallLocation 'Lock in.exe'))) { return $hit.InstallLocation }
  }
  foreach ($d in @((Join-Path $env:LOCALAPPDATA 'Programs\Lock in'), (Join-Path $env:LOCALAPPDATA 'Programs\lock-in'), (Join-Path $env:ProgramFiles 'Lock in'))) {
    if (Test-Path (Join-Path $d 'Lock in.exe')) { return $d }
  }
  return $null
}
function Get-AppExe { $d = Find-AppDir; if ($d) { return (Join-Path $d 'Lock in.exe') } return $null }

function Get-InstalledVersion {
  $exe = Get-AppExe
  if ($exe) { return (Get-Item $exe).VersionInfo.ProductVersion }
  return $null
}

function Get-LatestRelease {
  $r = Invoke-RestMethod "https://api.github.com/repos/$Repo/releases/latest" -Headers @{ 'User-Agent' = 'lockin-cli' }
  $asset = $r.assets | Where-Object { $_.name -eq 'Lock-In-Setup.exe' } | Select-Object -First 1
  if (-not $asset) { throw 'The latest release has no Lock-In-Setup.exe.' }
  return @{ Version = $r.tag_name.TrimStart('v'); Url = $asset.browser_download_url }
}

function Update-Cli {
  # Keep this command itself up to date (the running copy is already loaded, so replacing the file is safe).
  try {
    $new = Join-Path $Bin 'lockin.ps1.new'
    Invoke-WebRequest "https://raw.githubusercontent.com/$Repo/main/cli/lockin.ps1" -OutFile $new -UseBasicParsing
    Move-Item -Force $new (Join-Path $Bin 'lockin.ps1')
  } catch { Write-Host "Couldn't update the lockin command itself: $($_.Exception.Message)" }
}

function Update-App {
  Write-Host 'Checking for updates...'
  $latest = Get-LatestRelease
  $installed = Get-InstalledVersion
  if ($installed -and ([version]$installed -ge [version]$latest.Version)) {
    Write-Host "Lock in $installed is already the latest version."
  } else {
    $setup = Join-Path $env:TEMP 'Lock-In-Setup.exe'
    if ($installed) { Write-Host "Updating Lock in $installed to $($latest.Version)..." } else { Write-Host "Installing Lock in $($latest.Version)..." }
    Invoke-WebRequest $latest.Url -OutFile $setup -UseBasicParsing
    Get-Process -Name 'Lock in' -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Process $setup -ArgumentList '/S' -Wait
    Remove-Item $setup -ErrorAction SilentlyContinue
    if (-not (Get-AppExe)) { throw 'The installer finished but Lock in.exe could not be found.' }
    Write-Host "Lock in $(Get-InstalledVersion) is installed. Type 'lockin' to open it."
  }
  Update-Cli
}

switch ($Command.ToLower()) {
  'open' {
    $exe = Get-AppExe
    if (-not $exe) { Write-Host "Lock in isn't installed yet. Run: lockin update"; exit 1 }
    Start-Process $exe
  }
  'update' { Update-App }
  'version' {
    $v = Get-InstalledVersion
    if ($v) { Write-Host "Lock in $v" } else { Write-Host "Lock in isn't installed yet. Run: lockin update" }
  }
  'web' { Start-Process $Site }
  'uninstall' {
    Get-Process -Name 'Lock in' -ErrorAction SilentlyContinue | Stop-Process -Force
    $dir = Find-AppDir
    if ($dir) { $un = Join-Path $dir 'Uninstall Lock in.exe'; if (Test-Path $un) { Start-Process $un -ArgumentList '/S' -Wait } }
    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    if ($userPath) { [Environment]::SetEnvironmentVariable('Path', (($userPath -split ';') | Where-Object { $_ -and $_ -ne $Bin }) -join ';', 'User') }
    Write-Host 'Lock in is uninstalled. Your progress on the website is untouched.'
    Start-Process cmd -ArgumentList "/c timeout /t 2 >nul & rmdir /s /q `"$Bin`"" -WindowStyle Hidden
  }
  default {
    Write-Host @'
lockin             open the app
lockin update      install or update to the latest version
lockin version     show the installed version
lockin web         open the website
lockin uninstall   remove the app and this command
'@
  }
}
