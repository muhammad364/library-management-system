#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Automated Docker Desktop + WSL2 setup for Windows
.DESCRIPTION
    Downloads and installs Docker Desktop, configures WSL2 backend,
    and verifies the installation.
#>

$ErrorActionPreference = "Stop"

$DockerInstaller = "$env:TEMP\DockerDesktopInstaller.exe"
$DockerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
$InstallDir = "D:\Apps"
$DockerPath = "$InstallDir\Docker\Docker\Docker Desktop.exe"

Write-Host "`n=== Docker Desktop Auto-Setup ===" -ForegroundColor Cyan
Write-Host "Target directory: $InstallDir" -ForegroundColor Gray

# Create install directory if missing
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    Write-Host "Created $InstallDir" -ForegroundColor Green
}

# 1. Check if Docker is already installed
if (Test-Path $DockerPath) {
    Write-Host "Docker Desktop is already installed at $DockerPath." -ForegroundColor Green
    $version = (Get-ItemProperty -Path "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Docker Desktop" -ErrorAction SilentlyContinue).DisplayVersion
    if ($version) { Write-Host "Version: $version" -ForegroundColor Gray }
} else {
    Write-Host "Downloading Docker Desktop installer..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $DockerUrl -OutFile $DockerInstaller -UseBasicParsing
        Write-Host "Download complete." -ForegroundColor Green
    } catch {
        Write-Host "Failed to download Docker Desktop. Please download manually from:" -ForegroundColor Red
        Write-Host "https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
        exit 1
    }

    Write-Host "Installing Docker Desktop to $InstallDir (this may take a few minutes)..." -ForegroundColor Yellow
    try {
        # Silent install with WSL2 backend to custom directory
        Start-Process -FilePath $DockerInstaller -ArgumentList "install", "--quiet", "--backend=wsl-2", "--installation-dir=$InstallDir", "--accept-license" -Wait -NoNewWindow
        Write-Host "Docker Desktop installed successfully." -ForegroundColor Green
    } catch {
        Write-Host "Installation failed. Try running the installer manually." -ForegroundColor Red
        exit 1
    }
}

# 2. Ensure WSL2 is set as default
Write-Host "`nSetting WSL2 as default..." -ForegroundColor Yellow
wsl --set-default-version 2 | Out-Null
Write-Host "WSL2 default set." -ForegroundColor Green

# 3. Start Docker Desktop
Write-Host "`nStarting Docker Desktop..." -ForegroundColor Yellow
$DockerService = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
if (-not $DockerService) {
    Start-Process $DockerPath
} else {
    Write-Host "Docker Desktop is already running." -ForegroundColor Green
}

# 4. Wait for Docker daemon to be ready
Write-Host "Waiting for Docker daemon..." -ForegroundColor Yellow -NoNewline
$retries = 0
$maxRetries = 30
while ($retries -lt $maxRetries) {
    try {
        $dockerInfo = docker info 2>$null
        if ($dockerInfo) { break }
    } catch {}
    Start-Sleep -Seconds 2
    Write-Host "." -ForegroundColor Yellow -NoNewline
    $retries++
}
Write-Host ""

if ($retries -ge $maxRetries) {
    Write-Host "Docker daemon did not start in time. Try restarting Docker Desktop manually." -ForegroundColor Red
    exit 1
}

# 5. Verify
Write-Host "`n=== Verification ===" -ForegroundColor Cyan
try {
    $version = docker --version
    Write-Host "Docker CLI: $version" -ForegroundColor Green
    docker run --rm hello-world | Select-Object -First 4
    Write-Host "`nDocker is ready!" -ForegroundColor Green
} catch {
    Write-Host "Docker verification failed." -ForegroundColor Red
    exit 1
}

# 6. Cleanup
if (Test-Path $DockerInstaller) {
    Remove-Item $DockerInstaller -Force
}

Write-Host "`nSetup complete. You can now run:" -ForegroundColor Cyan
Write-Host "  docker compose build" -ForegroundColor White
Write-Host "  docker compose up -d" -ForegroundColor White
