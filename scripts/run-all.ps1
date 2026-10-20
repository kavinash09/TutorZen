<#
.SYNOPSIS
    TutorZen — All-In-One Service Orchestrator (Docker Compose for Windows)
.DESCRIPTION
    Launches all TutorZen services together on Windows:
      1. PostgreSQL 16 (Database)          -> localhost:5432
      2. Spring Boot 3.4.3 (Backend API)   -> localhost:8080
      3. React Native Web / Nginx (UI)     -> localhost:8081
.EXAMPLE
    .\scripts\run-all.ps1
    .\scripts\run-all.ps1 -down
    .\scripts\run-all.ps1 -logs
    .\scripts\run-all.ps1 -status
    .\scripts\run-all.ps1 -restart
#>

[CmdletBinding()]
param(
    [Parameter(Position=0)]
    [string]$Command = "up"
)

$ErrorActionPreference = "Stop"

$RepoRoot = (Get-Item $PSScriptRoot).Parent.FullName
$ComposeFile = Join-Path $RepoRoot "docker-compose.yml"

function Check-Docker {
    try {
        $null = docker info 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Docker not running"
        }
    } catch {
        Write-Host "Error: Docker is not running!" -ForegroundColor Red
        Write-Host "Please start Docker Desktop and run this script again."
        exit 1
    }
}

# Normalize commands and flags
$Action = "up"
switch -Regex ($Command) {
    "^(-h|--help|help)$"       { $Action = "help" }
    "^(--down|down|stop|-down)$" { $Action = "down" }
    "^(--logs|logs|-logs)$"     { $Action = "logs" }
    "^(--status|status|ps|-status)$" { $Action = "status" }
    "^(--restart|restart|-restart)$" { $Action = "restart" }
    default { $Action = "up" }
}

if ($Action -eq "help") {
    Write-Host "TutorZen Service Runner (PowerShell for Windows)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\scripts\run-all.ps1 [COMMAND]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  (no args)           Build and start all services in background"
    Write-Host "  -down, --down       Stop and remove all containers"
    Write-Host "  -logs, --logs       Follow logs from all services"
    Write-Host "  -status, --status   Check running status of all containers"
    Write-Host "  -restart, --restart Restart all containers"
    Write-Host "  -help, --help       Show this help message"
    exit 0
}

Check-Docker
Set-Location $RepoRoot

switch ($Action) {
    "down" {
        Write-Host "Stopping all TutorZen services..." -ForegroundColor Yellow
        docker compose -f $ComposeFile down
        Write-Host "✓ All services stopped successfully." -ForegroundColor Green
    }
    "logs" {
        docker compose -f $ComposeFile logs -f
    }
    "status" {
        docker compose -f $ComposeFile ps
    }
    "restart" {
        Write-Host "Restarting all TutorZen services..." -ForegroundColor Yellow
        docker compose -f $ComposeFile restart
        Write-Host "✓ Services restarted." -ForegroundColor Green
    }
    "up" {
        Write-Host "====================================================" -ForegroundColor Cyan
        Write-Host "   TutorZen — Launching All Services (Docker)       " -ForegroundColor Cyan
        Write-Host "====================================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "→ Building and starting containers in background..." -ForegroundColor Cyan
        docker compose -f $ComposeFile up --build -d

        Write-Host ""
        Write-Host "→ Waiting for PostgreSQL database to be healthy..." -ForegroundColor Cyan

        $isHealthy = $false
        while (-not $isHealthy) {
            $health = (docker inspect -f '{{.State.Health.Status}}' tutorzen-postgres 2>$null)
            if ($health -eq "healthy") {
                $isHealthy = $true
            } else {
                Start-Sleep -Seconds 2
            }
        }
        Write-Host "✓ Database is healthy." -ForegroundColor Green

        Write-Host ""
        Write-Host "====================================================" -ForegroundColor Green
        Write-Host "   All TutorZen Services Are Up & Running!          " -ForegroundColor Green
        Write-Host "====================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "  🌐 Frontend (Web App):      " -NoNewline
        Write-Host "http://localhost:8081" -ForegroundColor Cyan
        Write-Host "  ☕ Backend (Spring API):    " -NoNewline
        Write-Host "http://localhost:8080" -ForegroundColor Cyan
        Write-Host "  🐘 Database (PostgreSQL):   " -NoNewline
        Write-Host "localhost:5432 (tutorzen_dev)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Pre-seeded Demo Accounts:" -ForegroundColor White
        Write-Host "  • Teacher: teacher@demo.com  /  Teacher@123"
        Write-Host "  • Student: student@demo.com  /  Student@123"
        Write-Host "  • Admin:   admin@demo.com    /  Admin@123"
        Write-Host ""
        Write-Host "Management Commands:" -ForegroundColor White
        Write-Host "  • View container status:  .\scripts\run-all.ps1 -status"
        Write-Host "  • Stream live logs:       .\scripts\run-all.ps1 -logs"
        Write-Host "  • Stop all services:      .\scripts\run-all.ps1 -down"
        Write-Host ""
    }
}

