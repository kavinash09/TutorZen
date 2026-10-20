@echo off
rem ==============================================================================
rem TutorZen — All-In-One Service Orchestrator (Docker Compose for Windows)
rem
rem Launches all TutorZen services together:
rem   1. PostgreSQL 16 (Database)          -> localhost:5432
rem   2. Spring Boot 3.4.3 (Backend API)   -> localhost:8080
rem   3. React Native Web / Nginx (UI)     -> localhost:8081
rem
rem Usage:
rem   .\scripts\run-all.bat                 rem Start all services in background
rem   .\scripts\run-all.bat --down          rem Stop all services
rem   .\scripts\run-all.bat --logs          rem Stream container logs
rem   .\scripts\run-all.bat --status        rem View container status
rem   .\scripts\run-all.bat --restart       rem Restart all services
rem ==============================================================================

setlocal enabledelayedexpansion

set "REPO_ROOT=%~dp0.."
cd /d "%REPO_ROOT%"

set "COMPOSE_FILE=%REPO_ROOT%\docker-compose.yml"

rem Check if Docker daemon is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and run this script again.
    exit /b 1
)

set "ACTION=%~1"
if "%ACTION%"=="" set "ACTION=up"

if /i "%ACTION%"=="--down" set "ACTION=down"
if /i "%ACTION%"=="down" set "ACTION=down"
if /i "%ACTION%"=="stop" set "ACTION=down"
if /i "%ACTION%"=="--logs" set "ACTION=logs"
if /i "%ACTION%"=="logs" set "ACTION=logs"
if /i "%ACTION%"=="--status" set "ACTION=status"
if /i "%ACTION%"=="status" set "ACTION=status"
if /i "%ACTION%"=="ps" set "ACTION=status"
if /i "%ACTION%"=="--restart" set "ACTION=restart"
if /i "%ACTION%"=="restart" set "ACTION=restart"
if /i "%ACTION%"=="-h" set "ACTION=help"
if /i "%ACTION%"=="--help" set "ACTION=help"
if /i "%ACTION%"=="help" set "ACTION=help"

if /i "%ACTION%"=="help" (
    echo TutorZen Service Runner ^(Windows^)
    echo.
    echo Usage: .\scripts\run-all.bat [COMMAND]
    echo.
    echo Commands:
    echo   ^(no args^)           Build and start all services in background
    echo   --down, down        Stop and remove all containers
    echo   --logs, logs        Follow logs from all services
    echo   --status, status    Check running status of all containers
    echo   --restart, restart  Restart all containers
    echo   -h, --help          Show this help message
    exit /b 0
)

if /i "%ACTION%"=="down" (
    echo Stopping all TutorZen services...
    docker compose -f "%COMPOSE_FILE%" down
    echo All services stopped successfully.
    exit /b 0
)

if /i "%ACTION%"=="logs" (
    docker compose -f "%COMPOSE_FILE%" logs -f
    exit /b 0
)

if /i "%ACTION%"=="status" (
    docker compose -f "%COMPOSE_FILE%" ps
    exit /b 0
)

if /i "%ACTION%"=="restart" (
    echo Restarting all TutorZen services...
    docker compose -f "%COMPOSE_FILE%" restart
    echo Services restarted.
    exit /b 0
)

if /i "%ACTION%"=="up" (
    echo ====================================================
    echo    TutorZen - Launching All Services (Docker)
    echo ====================================================
    echo.
    rem Clean up any stale conflicting containers
    for %%C in (tutorzen-postgres tutorzen-backend tutorzen-frontend) do (
        docker inspect %%C >nul 2>&1
        if !errorlevel! equ 0 (
            for /f "tokens=*" %%P in ('docker inspect -f "{{index .Config.Labels ""com.docker.compose.project""}}" %%C 2^>nul') do set C_PROJ=%%P
            if not "!C_PROJ!"=="tutorzen" (
                echo Removing conflicting container %%C ^(project: !C_PROJ!^)...
                docker rm -f %%C >nul 2>&1
            )
        )
    )

    echo -^> Building and starting containers in background...
    docker compose -f "%COMPOSE_FILE%" up --build -d
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to start containers.
        exit /b 1
    )

    echo.
    echo -^> Waiting for PostgreSQL database to be healthy...
    :wait_loop
    for /f "tokens=*" %%i in ('docker inspect -f "{{.State.Health.Status}}" tutorzen-postgres 2^>nul') do set HEALTH=%%i
    if not "!HEALTH!"=="healthy" (
        timeout /t 2 /nobreak >nul
        goto wait_loop
    )
    echo Database is healthy.

    echo.
    echo ====================================================
    echo    All TutorZen Services Are Up ^& Running!
    echo ====================================================
    echo.
    echo   Frontend (Web App):      http://localhost:8081
    echo   Backend (Spring API):    http://localhost:8080
    echo   Database (PostgreSQL):   localhost:5432 (tutorzen_dev)
    echo.
    echo Pre-seeded Demo Accounts:
    echo   - Teacher: teacher@demo.com  /  password123
    echo   - Student: student@demo.com  /  password123
    echo   - Admin:   admin@demo.com    /  password123
    echo.
    echo Management Commands:
    echo   - View container status:  .\scripts\run-all.bat --status
    echo   - Stream live logs:       .\scripts\run-all.bat --logs
    echo   - Stop all services:      .\scripts\run-all.bat --down
    echo.
    exit /b 0
)

echo Unknown command: %ACTION%
echo Run '.\scripts\run-all.bat --help' for available commands.
exit /b 1

