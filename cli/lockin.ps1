# Lock in command line (Windows).  Usage: lockin [open|update|version|web|banner|uninstall|help]
# Installed by install.ps1 into %LOCALAPPDATA%\LockIn\bin, next to lockin.cmd, which is on your PATH.
# Saved as UTF-8 with a byte order mark so Windows PowerShell 5 reads the block characters correctly.
param([string]$Command = 'start')
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ProgressPreference = 'SilentlyContinue' # makes downloads much faster in Windows PowerShell
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch { }

$Repo = 'jamalmusialla81-hub/lock-in'
$Site = 'https://jamalmusialla81-hub.github.io/lock-in/'
$Bin = Split-Path -Parent $MyInvocation.MyCommand.Path

# ---------------------------------------------------------------- finding and installing the app
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
  if ($exe) { $v = (Get-Item $exe).VersionInfo.ProductVersion; if (($v -split '\.').Count -eq 4) { $v = $v -replace '\.0$', '' }; return $v } # 1.0.0.0 -> 1.0.0
  return $null
}

function Get-LatestRelease([int]$Timeout = 60) {
  $r = Invoke-RestMethod "https://api.github.com/repos/$Repo/releases/latest" -Headers @{ 'User-Agent' = 'lockin-cli' } -TimeoutSec $Timeout
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

# ---------------------------------------------------------------- the intro
$Esc = [char]27
$Fancy = $Host.UI.SupportsVirtualTerminal -and -not [Console]::IsOutputRedirected
$Stops = @(@(45, 212, 191), @(59, 130, 246), @(167, 139, 250)) # teal, blue, violet

function Get-Gradient([double]$t) {
  $t = [Math]::Max(0, [Math]::Min(1, $t)) * ($Stops.Count - 1)
  $i = [Math]::Min([int][Math]::Floor($t), $Stops.Count - 2); $f = $t - $i
  $a = $Stops[$i]; $b = $Stops[$i + 1]
  return , @(0..2 | ForEach-Object { [int]($a[$_] + ($b[$_] - $a[$_]) * $f) })
}
function Rgb($c) { return "$Esc[38;2;$($c[0]);$($c[1]);$($c[2])m" }
$Reset = "$Esc[0m"; $Dim = "$Esc[2m"; $Bold = "$Esc[1m"

# Block letters, built from per-letter rows so the columns always line up.
$Font = @{
  'L' = @('██╗     ', '██║     ', '██║     ', '██║     ', '███████╗', '╚══════╝')
  'O' = @(' ██████╗ ', '██╔═══██╗', '██║   ██║', '██║   ██║', '╚██████╔╝', ' ╚═════╝ ')
  'C' = @(' ██████╗', '██╔════╝', '██║     ', '██║     ', '╚██████╗', ' ╚═════╝')
  'K' = @('██╗  ██╗', '██║ ██╔╝', '█████╔╝ ', '██╔═██╗ ', '██║  ██╗', '╚═╝  ╚═╝')
  'I' = @('██╗', '██║', '██║', '██║', '██║', '╚═╝')
  'N' = @('███╗   ██╗', '████╗  ██║', '██╔██╗ ██║', '██║╚██╗██║', '██║ ╚████║', '╚═╝  ╚═══╝')
  ' ' = @('   ', '   ', '   ', '   ', '   ', '   ')
}
$BannerRows = 0..5 | ForEach-Object { $r = $_; ('LOCK IN'.ToCharArray() | ForEach-Object { $Font[[string]$_][$r] }) -join ' ' }

function Write-BannerRow([string]$row, [double]$phase) {
  $sb = New-Object Text.StringBuilder; [void]$sb.Append('  ')
  $w = $row.Length
  for ($x = 0; $x -lt $w; $x++) {
    $ch = $row[$x]
    if ($ch -eq ' ') { [void]$sb.Append(' '); continue }
    $t = ($x / $w + $phase) % 1.0
    $t = 1 - [Math]::Abs(1 - 2 * $t) # sweep there and back so the colours flow
    [void]$sb.Append((Rgb (Get-Gradient $t)) + $ch)
  }
  [void]$sb.Append($Reset); [Console]::WriteLine($sb.ToString())
}

function Show-Banner {
  Write-Host ''
  if (-not $Fancy) { $BannerRows | ForEach-Object { Write-Host "  $_" -ForegroundColor Cyan }; return }
  [Console]::Write("$Esc[?25l") # hide the cursor while animating
  try {
    foreach ($row in $BannerRows) { Write-BannerRow $row 0; Start-Sleep -Milliseconds 45 }
    for ($f = 1; $f -le 24; $f++) { # a shimmer runs across the letters
      [Console]::Write("$Esc[6F")
      foreach ($row in $BannerRows) { Write-BannerRow $row ($f / 24) }
      Start-Sleep -Milliseconds 28
    }
  } finally { [Console]::Write("$Esc[?25h") }
}

function Write-Typed([string]$text, [string]$color, [int]$ms = 14) {
  if (-not $Fancy) { Write-Host $text; return }
  [Console]::Write($color)
  foreach ($ch in $text.ToCharArray()) { [Console]::Write($ch); Start-Sleep -Milliseconds $ms }
  [Console]::WriteLine($Reset)
}

function Get-Exams {
  $cache = Join-Path $Bin 'exams.json'
  try {
    $json = (Invoke-WebRequest "https://raw.githubusercontent.com/$Repo/main/exams.json" -UseBasicParsing -TimeoutSec 3).Content
    Set-Content -Path $cache -Value $json -Encoding UTF8
  } catch { if (Test-Path $cache) { $json = Get-Content $cache -Raw } else { return @() } }
  return @($json | ConvertFrom-Json)
}

function Show-Exams {
  $now = Get-Date
  $up = @(Get-Exams | ForEach-Object { $_ | Add-Member -NotePropertyName At -NotePropertyValue ([datetime]$_.date) -PassThru } | Where-Object { $_.At -gt $now } | Sort-Object At)
  Write-Host ''
  if (-not $up) { Write-Host '  No exams coming up. Go outside.'; return }
  Write-Typed '  coming up' "$Bold$(Rgb @(167, 139, 250))" 20
  foreach ($e in $up) {
    $span = $e.At - $now
    $days = [int][Math]::Floor($span.TotalDays)
    $left = if ($days -ge 1) { "$days day$(if ($days -ne 1) { 's' })" } else { "$([int][Math]::Floor($span.TotalHours)) hours" }
    $c = if ($days -lt 7) { @(248, 113, 113) } elseif ($days -lt 14) { @(251, 191, 36) } else { @(52, 211, 153) }
    $cells = 24; $filled = [Math]::Max(1, $cells - [Math]::Min($cells - 1, $days))
    $bar = ('█' * $filled) + ('░' * ($cells - $filled))
    $line = '  {0,-19} {1,-21}' -f $e.name, $e.when
    if ($Fancy) { [Console]::WriteLine("$line$(Rgb $c)$bar$Reset  $Bold$(Rgb $c)$left$Reset"); Start-Sleep -Milliseconds 70 }
    else { Write-Host "$line$bar  $left" }
  }
}

$Tips = @(
  'Do the hardest topic first, while your brain is fresh.',
  'Past papers under timed conditions beat rereading notes.',
  'Explain it out loud. If you can teach it, you know it.',
  'Your mistakes list is the fastest way to marks. Clear it.',
  'Phone in another room for the next 50 minutes.',
  'Sleep is when it sticks. Don''t trade it for one more hour.',
  'Check the reference sheet so you know what you don''t need to memorise.'
)

function Show-Intro([switch]$Launch) {
  Show-Banner
  Write-Typed '  study like it is the night before.' $Dim 12
  Show-Exams
  Write-Host ''
  Write-Typed ('  tip  ' + ($Tips | Get-Random)) (Rgb @(148, 163, 184)) 6
  $installed = Get-InstalledVersion
  try {
    $latest = Get-LatestRelease 3
    if ($installed -and ([version]$latest.Version -gt [version]$installed)) { Write-Host ''; Write-Typed "  update available: $installed to $($latest.Version). run: lockin update" (Rgb @(251, 191, 36)) 8 }
  } catch { }
  Write-Host ''
  if (-not $Launch) { return }
  $exe = Get-AppExe
  if (-not $exe) { Write-Host "  Lock in isn't installed yet. Run: lockin update"; exit 1 }
  if ($Fancy) {
    $n = 32
    for ($i = 1; $i -le $n; $i++) {
      $sb = New-Object Text.StringBuilder
      [void]$sb.Append("`r  $Dim" + 'launching' + "$Reset  ")
      for ($j = 0; $j -lt $n; $j++) { if ($j -lt $i) { [void]$sb.Append((Rgb (Get-Gradient ($j / $n))) + '█') } else { [void]$sb.Append("$Dim░$Reset") } }
      [void]$sb.Append("$Reset  $([int]($i / $n * 100))%")
      [Console]::Write($sb.ToString()); Start-Sleep -Milliseconds 22
    }
    [Console]::WriteLine('')
  }
  Start-Process $exe
  Write-Typed '  locked in. good luck.' "$Bold$(Rgb @(45, 212, 191))" 18
  Write-Host ''
}

# ---------------------------------------------------------------- commands
switch ($Command.ToLower()) {
  'start' { Show-Intro -Launch }
  'banner' { Show-Intro }
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
lockin             the intro, then open the app
lockin open        open the app straight away
lockin update      install or update to the latest version
lockin version     show the installed version
lockin banner      just the intro (no app)
lockin web         open the website
lockin uninstall   remove the app and this command
'@
  }
}
