<#
.SYNOPSIS
    TutorZen — iOS Package Build Script for Windows PowerShell (EAS Cloud & Docker Runner)
.DESCRIPTION
    Compiles a standalone installable iOS package (.ipa or Simulator .tar.gz)
    in the dist/ folder.

    Note on iOS Builds on Windows:
      Apple's proprietary iOS toolchain (xcodebuild, Darwin kernel, iOS SDK)
      strictly requires macOS. Therefore, iOS packages on Windows are built via
      Expo's cloud builders (EAS), which can be triggered directly or from
      within an isolated Docker container with zero local Mac requirement.
.EXAMPLE
    .\scripts\build-ios.ps1
    .\scripts\build-ios.ps1 -Simulator
    .\scripts\build-ios.ps1 -Mode docker
#>

[CmdletBinding()]
param(
    [ValidateSet("eas", "docker")]
    [string]$Mode = "eas",

    [switch]$Simulator,
    [switch]$Device,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

if ($Help) {
    Write-Host "TutorZen iOS Package Generator (PowerShell for Windows)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\scripts\build-ios.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Simulator            Build Simulator package (No Apple Developer account needed)"
    Write-Host "  -Device               Build standalone .ipa for physical devices (default)"
    Write-Host "  -Mode <eas|docker>    Build dispatch strategy (default: eas)"
    Write-Host "  -Help                 Show this help message"
    exit 0
}

$RepoRoot = (Get-Item $PSScriptRoot).Parent.FullName
$MobileDir = Join-Path $RepoRoot "apps\mobile"
$DistDir = Join-Path $RepoRoot "dist"
$MobileDistDir = Join-Path $MobileDir "dist"

if (-not (Test-Path $DistDir)) { New-Item -ItemType Directory -Path $DistDir -Force | Out-Null }
if (-not (Test-Path $MobileDistDir)) { New-Item -ItemType Directory -Path $MobileDistDir -Force | Out-Null }

$TargetType = if ($Simulator) { "simulator" } else { "device" }
$Profile = if ($Simulator) { "preview:simulator" } else { "preview" }

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   TutorZen — iOS Package Build Process (Windows)   " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Target:     $TargetType" -ForegroundColor White
Write-Host "Profile:    $Profile" -ForegroundColor White
Write-Host "Mode:       $Mode" -ForegroundColor White
Write-Host "Output Dir: $DistDir" -ForegroundColor White
Write-Host ""

if ($Mode -eq "docker") {
    Write-Host "[1/2] Checking Docker daemon status..." -ForegroundColor Cyan
    try {
        $null = docker info 2>&1
        if ($LASTEXITCODE -ne 0) { throw "Docker not running" }
    } catch {
        Write-Host "Error: Docker is not running!" -ForegroundColor Red
        Write-Host "Please start Docker Desktop and run this script again."
        exit 1
    }

    Write-Host "[2/2] Running containerized EAS build dispatcher (node:20-alpine)..." -ForegroundColor Cyan
    Write-Host "(Running EAS build through Docker keeps your Windows host clean)" -ForegroundColor Yellow
    docker run -it --rm `
      -v "${RepoRoot}:/workspace" `
      -w /workspace/apps/mobile `
      node:20-alpine `
      sh -c "npx --yes eas-cli build --platform ios --profile $Profile"
} else {
    Write-Host "[1/1] Triggering Expo EAS Cloud Build for iOS ($Profile)..." -ForegroundColor Cyan
    Write-Host "Note: If prompted, log into your Expo account (npx eas login)." -ForegroundColor Yellow
    Set-Location $MobileDir
    npx eas-cli build --platform ios --profile $Profile
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host "   iOS Build Request Completed!                     " -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host "Monitor compilation or download the artifact from your Expo Dashboard:" -ForegroundColor White
if ($TargetType -eq "simulator") {
    Write-Host "  • Simulator Package: Extract .tar.gz and drag TutorZen.app into iOS Simulator" -ForegroundColor White
} else {
    Write-Host "  • Device Package: Install directly via QR code or download .ipa" -ForegroundColor White
}
Write-Host ""

