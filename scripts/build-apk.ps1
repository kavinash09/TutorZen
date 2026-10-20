<#
.SYNOPSIS
    TutorZen — Android APK Build Script for Windows PowerShell (Docker & Cloud EAS)
.DESCRIPTION
    Compiles a standalone installable APK in the dist/ folder without requiring
    Android Studio or the Android SDK on your Windows host.
.EXAMPLE
    .\scripts\build-apk.ps1
    .\scripts\build-apk.ps1 -Debug
    .\scripts\build-apk.ps1 -Clean
    .\scripts\build-apk.ps1 -Mode eas
#>

[CmdletBinding()]
param(
    [ValidateSet("docker", "eas", "auto")]
    [string]$Mode = "docker",

    [switch]$Debug,
    [switch]$Release,
    [switch]$Clean,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

if ($Help) {
    Write-Host "TutorZen Android APK Generator (PowerShell for Windows)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\scripts\build-apk.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Mode <docker|eas>   Build strategy (default: docker)"
    Write-Host "  -Debug               Build debug APK instead of release"
    Write-Host "  -Clean               Perform clean rebuild"
    Write-Host "  -Help                Show this help message"
    exit 0
}

$RepoRoot = (Get-Item $PSScriptRoot).Parent.FullName
$MobileDir = Join-Path $RepoRoot "apps\mobile"
$DistDir = Join-Path $RepoRoot "dist"
$MobileDistDir = Join-Path $MobileDir "dist"

if (-not (Test-Path $DistDir)) { New-Item -ItemType Directory -Path $DistDir -Force | Out-Null }
if (-not (Test-Path $MobileDistDir)) { New-Item -ItemType Directory -Path $MobileDistDir -Force | Out-Null }

$BuildType = if ($Debug) { "debug" } else { "release" }

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   TutorZen — Android APK Build Process (Windows)  " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Target:     $BuildType APK" -ForegroundColor White
Write-Host "Mode:       $Mode" -ForegroundColor White
Write-Host "Output Dir: $DistDir" -ForegroundColor White
Write-Host ""

if ($Mode -eq "eas") {
    Write-Host "▶ Triggering EAS Cloud Build..." -ForegroundColor Cyan
    Set-Location $MobileDir
    npx eas-cli build --platform android --profile preview
    exit $LASTEXITCODE
}

# Docker mode
Write-Host "[1/4] Checking Docker daemon status..." -ForegroundColor Cyan
try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Docker not running" }
} catch {
    Write-Host "Error: Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and run this script again,"
    Write-Host "or run EAS cloud build: .\scripts\build-apk.ps1 -Mode eas"
    exit 1
}

$AndroidDir = Join-Path $MobileDir "android"
if (-not (Test-Path $AndroidDir) -or $Clean) {
    Write-Host "[2/4] Generating native Android project via Expo prebuild..." -ForegroundColor Cyan
    Set-Location $MobileDir
    $cleanArg = if ($Clean) { "--clean" } else { "" }
    npx expo prebuild --platform android --no-install $cleanArg
    Set-Location $RepoRoot
} else {
    Write-Host "[2/4] Native Android directory already prepared." -ForegroundColor Green
}

Write-Host "[3/4] Checking Android builder container (tutorzen-android-builder:amd64)..." -ForegroundColor Cyan
$imgInspect = docker image inspect tutorzen-android-builder:amd64 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Building lightweight Android builder container..." -ForegroundColor Yellow
    docker build --platform linux/amd64 -t tutorzen-android-builder:amd64 -f "$RepoRoot\infrastructure\docker\Dockerfile.android-builder" "$RepoRoot\infrastructure\docker"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to build Docker image." -ForegroundColor Red
        exit 1
    }
}

$gradleTask = if ($BuildType -eq "debug") { "assembleDebug" } else { "assembleRelease" }
$apkSubfolder = if ($BuildType -eq "debug") { "debug" } else { "release" }

Write-Host "[4/4] Compiling APK inside Docker container ($gradleTask)..." -ForegroundColor Cyan
docker run --platform linux/amd64 --rm `
  -v "${RepoRoot}:/workspace" `
  -v tutorzen-gradle-cache:/root/.gradle `
  -w /workspace/apps/mobile/android `
  tutorzen-android-builder:amd64 `
  bash -c "./gradlew $gradleTask -x lint -x test"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker compilation failed." -ForegroundColor Red
    exit 1
}

$searchDir = Join-Path $MobileDir "android\app\build\outputs\apk\$apkSubfolder"
$apkFiles = Get-ChildItem -Path $searchDir -Filter "*.apk" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending

if (-not $apkFiles -or $apkFiles.Count -eq 0) {
    Write-Host "Error: Build completed but no APK was found in $searchDir" -ForegroundColor Red
    exit 1
}

$sourceApk = $apkFiles[0].FullName
$canonicalApk = Join-Path $DistDir "tutorzen.apk"
$versionedApk = Join-Path $DistDir "tutorzen-0.1.0-$BuildType.apk"
$mobileApk = Join-Path $MobileDistDir "tutorzen.apk"

Copy-Item -Path $sourceApk -Destination $canonicalApk -Force
Copy-Item -Path $sourceApk -Destination $versionedApk -Force
Copy-Item -Path $sourceApk -Destination $mobileApk -Force

$fileSizeMb = [math]::Round((Get-Item $canonicalApk).Length / 1MB, 2)
$sha256 = (Get-FileHash -Path $canonicalApk -Algorithm SHA256).Hash

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host "   BUILD SUCCESSFUL! APK Generated in dist\         " -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host "Primary APK:    $canonicalApk" -ForegroundColor White
Write-Host "Versioned APK:  $versionedApk" -ForegroundColor White
Write-Host "Mobile Copy:    $mobileApk" -ForegroundColor White
Write-Host "File Size:      $fileSizeMb MB" -ForegroundColor White
Write-Host "SHA-256:        $sha256" -ForegroundColor White
Write-Host ""
Write-Host "To install on an Android device or emulator:" -ForegroundColor White
Write-Host "  adb install -r $canonicalApk" -ForegroundColor Cyan
Write-Host ""

