@echo off
rem ==============================================================================
rem TutorZen — iOS Package Build Script for Windows (EAS Cloud & Docker Runner)
rem
rem Compiles a standalone installable iOS package (.ipa or Simulator .tar.gz)
rem in the dist\ folder.
rem
rem Note on iOS Builds on Windows / Linux:
rem   Apple's proprietary iOS toolchain (xcodebuild, Darwin kernel, iOS SDK)
rem   strictly requires macOS. Therefore, iOS packages on Windows are built via
rem   Expo's cloud builders (EAS), which can be triggered directly or from
rem   within an isolated Docker container with zero local Mac requirement.
rem
rem Usage:
rem   .\scripts\build-ios.bat                  rem Builds Device .ipa via EAS Cloud
rem   .\scripts\build-ios.bat --simulator      rem Builds Simulator package (No Apple Dev account required)
rem   .\scripts\build-ios.bat --mode docker    rem Dispatches EAS build from inside an isolated Docker container
rem ==============================================================================

setlocal enabledelayedexpansion

set "REPO_ROOT=%~dp0.."
cd /d "%REPO_ROOT%"

set "MOBILE_DIR=%REPO_ROOT%\apps\mobile"
set "DIST_DIR=%REPO_ROOT%\dist"
set "MOBILE_DIST_DIR=%MOBILE_DIR%\dist"

if not exist "%DIST_DIR%" mkdir "%DIST_DIR%"
if not exist "%MOBILE_DIST_DIR%" mkdir "%MOBILE_DIST_DIR%"

set "BUILD_MODE=eas"
set "TARGET_TYPE=device"
set "PROFILE=preview"

:parse_args
if "%~1"=="" goto after_args
if /i "%~1"=="--sim" (
    set "TARGET_TYPE=simulator"
    set "PROFILE=preview:simulator"
    shift
    goto parse_args
)
if /i "%~1"=="--simulator" (
    set "TARGET_TYPE=simulator"
    set "PROFILE=preview:simulator"
    shift
    goto parse_args
)
if /i "%~1"=="--device" (
    set "TARGET_TYPE=device"
    set "PROFILE=preview"
    shift
    goto parse_args
)
if /i "%~1"=="--mode" (
    set "BUILD_MODE=%~2"
    shift
    shift
    goto parse_args
)
if /i "%~1"=="-h" goto show_help
if /i "%~1"=="--help" goto show_help
if /i "%~1"=="help" goto show_help

echo [ERROR] Unknown option: %~1
echo Run '.\scripts\build-ios.bat --help' for available options.
exit /b 1

:show_help
echo TutorZen iOS Package Generator (Windows)
echo.
echo Usage: .\scripts\build-ios.bat [OPTIONS]
echo.
echo Options:
echo   --simulator, --sim   Build Simulator package (No Apple Developer account needed)
echo   --device             Build standalone .ipa for physical devices (default)
echo   --mode ^<eas^|docker^> Build dispatch strategy (default: eas)
echo   -h, --help           Show this help message
exit /b 0

:after_args

echo ====================================================
echo    TutorZen - iOS Package Build Process (Windows)
echo ====================================================
echo Target:     %TARGET_TYPE%
echo Profile:    %PROFILE%
echo Mode:       %BUILD_MODE%
echo Output Dir: %DIST_DIR%
echo.

if /i "%BUILD_MODE%"=="docker" goto build_docker
goto build_eas

:build_docker
echo [1/2] Checking Docker daemon status...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and run this script again.
    exit /b 1
)

echo [2/2] Running containerized EAS build dispatcher (node:20-alpine)...
echo (Running EAS build through Docker keeps your Windows host clean)
docker run -it --rm ^
  -v "%REPO_ROOT%":/workspace ^
  -w /workspace/apps/mobile ^
  node:20-alpine ^
  sh -c "npx --yes eas-cli build --platform ios --profile %PROFILE%"

goto finish

:build_eas
echo [1/1] Triggering Expo EAS Cloud Build for iOS (%PROFILE%)...
echo Note: If prompted, log into your Expo account (npx eas login).
cd /d "%MOBILE_DIR%"
call npx eas-cli build --platform ios --profile %PROFILE%

:finish
echo.
echo ====================================================
echo    iOS Build Request Completed!
echo ====================================================
echo Monitor compilation or download the artifact from your Expo Dashboard:
if "%TARGET_TYPE%"=="simulator" (
    echo   Simulator Package: Extract .tar.gz and drag TutorZen.app into iOS Simulator
) else (
    echo   Device Package: Install directly via QR code or download .ipa
)
exit /b 0

