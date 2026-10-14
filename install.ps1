# Installs the `lockin` command and the Lock in app on Windows.
#   irm https://raw.githubusercontent.com/jamalmusialla81-hub/lock-in/main/install.ps1 | iex
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ProgressPreference = 'SilentlyContinue'

$Repo = 'jamalmusialla81-hub/lock-in'
$Bin = Join-Path $env:LOCALAPPDATA 'LockIn\bin'
New-Item -ItemType Directory -Force -Path $Bin | Out-Null

Invoke-WebRequest "https://raw.githubusercontent.com/$Repo/main/cli/lockin.ps1" -OutFile (Join-Path $Bin 'lockin.ps1') -UseBasicParsing
Set-Content -Path (Join-Path $Bin 'lockin.cmd') -Encoding ASCII -Value "@echo off`r`npowershell -NoProfile -ExecutionPolicy Bypass -File `"%~dp0lockin.ps1`" %*"

# Put the lockin command on your PATH (for your user only).
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if (-not $userPath) { $userPath = '' }
if (-not (($userPath -split ';') -contains $Bin)) {
  [Environment]::SetEnvironmentVariable('Path', (($userPath.TrimEnd(';'), $Bin) -join ';').TrimStart(';'), 'User')
}
if (-not (($env:Path -split ';') -contains $Bin)) { $env:Path = "$env:Path;$Bin" }

& (Join-Path $Bin 'lockin.cmd') update
if ($LASTEXITCODE) { throw 'lockin update failed.' }
Write-Host ''
Write-Host 'All set. Open a new terminal and type: lockin'
