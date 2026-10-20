@echo off
rem ==============================================================================
rem TutorZen — Android APK Build Script for Windows (Docker & Cloud EAS)
rem
rem Compiles a standalone installable APK in the dist\ folder without requiring
rem Android Studio or the Android SDK on your Windows host.
rem
rem Usage:
rem   .\scripts\build-apk.bat                  rem Default: Builds Release APK via Docker
rem   .\scripts\build-apk.bat --debug          rem Builds Debug APK
rem   .\scripts\build-apk.bat --clean          rem Clean rebuild
rem   .\scripts\build-apk.bat --mode eas       rem Builds via Expo EAS Cloud
rem ==============================================================================

setlocal enabledelayedexpansion

set "REPO_ROOT=%~dp0.."
cd /d "%REPO_ROOT%"

set "MOBILE_DIR=%REPO_ROOT%\apps\mobile"
set "DIST_DIR=%REPO_ROOT%\dist"
set "MOBILE_DIST_DIR=%MOBILE_DIR%\dist"

if not exist "%DIST_DIR%" mkdir "%DIST_DIR%"
if not exist "%MOBILE_DIST_DIR%" mkdir "%MOBILE_DIST_DIR%"

set "BUILD_MODE=docker"
set "BUILD_TYPE=release"
set "CLEAN_BUILD=false"

:parse_args
if "%~1"=="" goto after_args
if /i "%~1"=="--debug" (
    set "BUILD_TYPE=debug"
    shift
    goto parse_args
)
if /i "%~1"=="--release" (
    set "BUILD_TYPE=release"
    shift
    goto parse_args
)
if /i "%~1"=="--clean" (
    set "CLEAN_BUILD=true"
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
echo Run '.\scripts\build-apk.bat --help' for available options.
exit /b 1

:show_help
echo TutorZen Android APK Generator (Windows)
echo.
echo Usage: .\scripts\build-apk.bat [OPTIONS]
echo.
echo Options:
echo   --debug              Build debug APK instead of release
echo   --release            Build release APK (default)
echo   --clean              Perform clean rebuild
echo   --mode ^<docker^|eas^> Build strategy (default: docker)
echo   -h, --help           Show this help message
exit /b 0

:after_args

echo ====================================================
echo    TutorZen - Android APK Build Process (Windows)
echo ====================================================
echo Target:     %BUILD_TYPE% APK
echo Mode:       %BUILD_MODE%
echo Output Dir: %DIST_DIR%
echo.

if /i "%BUILD_MODE%"=="eas" goto build_eas
goto build_docker

:build_docker
echo [1/4] Checking Docker daemon status...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and run this script again,
    echo or use EAS cloud build: .\scripts\build-apk.bat --mode eas
    exit /b 1
)

echo [2/4] Ensuring native Android project is prepared...
if not exist "%MOBILE_DIR%\android" (
    echo Generating native Android project via Expo prebuild...
    cd /d "%MOBILE_DIR%"
    call npx expo prebuild --platform android --no-install
    cd /d "%REPO_ROOT%"
) else if "%CLEAN_BUILD%"=="true" (
    echo Clean prebuild requested...
    cd /d "%MOBILE_DIR%"
    call npx expo prebuild --platform android --no-install --clean
    cd /d "%REPO_ROOT%"
)

echo [3/4] Checking Android builder container image (tutorzen-android-builder:amd64)...
docker image inspect tutorzen-android-builder:amd64 >nul 2>&1
if %errorlevel% neq 0 (
    echo Building lightweight Android builder container...
    echo (Creates OpenJDK 17 + Android SDK 35 inside Docker; host remains clean)
    docker build --platform linux/amd64 -t tutorzen-android-builder:amd64 -f "%REPO_ROOT%\infrastructure\docker\Dockerfile.android-builder" "%REPO_ROOT%\infrastructure\docker"
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to build builder container image.
        exit /b 1
    )
)

set "GRADLE_TASK=assembleRelease"
set "APK_SUBFOLDER=release"
if /i "%BUILD_TYPE%"=="debug" (
    set "GRADLE_TASK=assembleDebug"
    set "APK_SUBFOLDER=debug"
)

echo [4/4] Compiling APK inside Docker container (%GRADLE_TASK%)...
docker run --platform linux/amd64 --rm ^
  -v "%REPO_ROOT%":/workspace ^
  -v tutorzen-gradle-cache:/root/.gradle ^
  -w /workspace/apps/mobile/android ^
  tutorzen-android-builder:amd64 ^
  bash -c "./gradlew %GRADLE_TASK% -x lint -x test"

if %errorlevel% neq 0 (
    echo [ERROR] Docker build failed!
    exit /b 1
)

set "SEARCH_DIR=%MOBILE_DIR%\android\app\build\outputs\apk\%APK_SUBFOLDER%"
set "SOURCE_APK="
for /f "delims=" %%F in ('dir /b /s /o:-d "%SEARCH_DIR%\*.apk" 2^>nul') do (
    if not defined SOURCE_APK set "SOURCE_APK=%%F"
)

if not defined SOURCE_APK (
    echo [ERROR] Build finished but APK was not found in %SEARCH_DIR%
    exit /b 1
)

copy /y "%SOURCE_APK%" "%DIST_DIR%\tutorzen.apk" >nul
copy /y "%SOURCE_APK%" "%DIST_DIR%\tutorzen-0.1.0-%BUILD_TYPE%.apk" >nul
copy /y "%SOURCE_APK%" "%MOBILE_DIST_DIR%\tutorzen.apk" >nul

echo.
echo ====================================================
echo    BUILD SUCCESSFUL! APK Generated in dist\
echo ====================================================
echo Primary APK:    %DIST_DIR%\tutorzen.apk
echo Versioned APK:  %DIST_DIR%\tutorzen-0.1.0-%BUILD_TYPE%.apk
echo Mobile Copy:    %MOBILE_DIST_DIR%\tutorzen.apk
echo.
echo To install on your device or emulator:
echo   adb install -r %DIST_DIR%\tutorzen.apk
exit /b 0

:build_eas
echo [EAS] Triggering Expo EAS Cloud Build...
cd /d "%MOBILE_DIR%"
call npx eas-cli build --platform android --profile preview
exit /b %errorlevel%

