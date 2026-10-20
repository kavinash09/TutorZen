#!/usr/bin/env bash
# ==============================================================================
# TutorZen — All-In-One Service Orchestrator (Docker Compose)
#
# Launches all TutorZen services together:
#   1. PostgreSQL 16 (Database)          -> localhost:5432
#   2. Spring Boot 3.4.3 (Backend API)   -> localhost:8080
#   3. React Native Web / Nginx (UI)     -> localhost:8081
#
# Usage:
#   ./scripts/run-all.sh                 # Start all services in background
#   ./scripts/run-all.sh --down          # Stop all services
#   ./scripts/run-all.sh --logs          # Stream container logs
#   ./scripts/run-all.sh --status        # View container status
#   ./scripts/run-all.sh --restart       # Restart all services
# ==============================================================================

set -euo pipefail

BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
RED="\033[0;31m"
RESET="\033[0m"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/docker-compose.yml"

# Verify Docker daemon is running
check_docker() {
  if ! docker info &>/dev/null; then
    echo -e "${RED}Error: Docker is not running!${RESET}"
    echo "Please start Docker Desktop and run this script again."
    exit 1
  fi
}

ACTION="up"

if [[ $# -gt 0 ]]; then
  case "$1" in
    --down|down|stop)
      ACTION="down"
      ;;
    --logs|logs)
      ACTION="logs"
      ;;
    --status|status|ps)
      ACTION="status"
      ;;
    --restart|restart)
      ACTION="restart"
      ;;
    -h|--help)
      echo -e "${BOLD}TutorZen Service Runner${RESET}"
      echo ""
      echo "Usage: ./scripts/run-all.sh [COMMAND]"
      echo ""
      echo "Commands:"
      echo "  (no args)           Build and start all services in background"
      echo "  --down, down        Stop and remove all containers"
      echo "  --logs, logs        Follow logs from all services"
      echo "  --status, status    Check running status of all containers"
      echo "  --restart, restart  Restart all containers"
      echo "  -h, --help          Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown command: $1${RESET}"
      echo "Run './scripts/run-all.sh --help' for available commands."
      exit 1
      ;;
  esac
fi

check_docker

cd "$REPO_ROOT"

case "$ACTION" in
  down)
    echo -e "${YELLOW}Stopping all TutorZen services...${RESET}"
    docker compose -f "$COMPOSE_FILE" down
    echo -e "${GREEN}✓ All services stopped successfully.${RESET}"
    exit 0
    ;;

  logs)
    docker compose -f "$COMPOSE_FILE" logs -f
    exit 0
    ;;

  status)
    docker compose -f "$COMPOSE_FILE" ps
    exit 0
    ;;

  restart)
    echo -e "${YELLOW}Restarting all TutorZen services...${RESET}"
    docker compose -f "$COMPOSE_FILE" restart
    echo -e "${GREEN}✓ Services restarted.${RESET}"
    exit 0
    ;;

  up)
    echo -e "${BOLD}${CYAN}====================================================${RESET}"
    echo -e "${BOLD}${CYAN}   TutorZen — Launching All Services (Docker)       ${RESET}"
    echo -e "${BOLD}${CYAN}====================================================${RESET}"
    echo ""

    # Clean up any conflicting containers from previous runs or different compose projects
    for c in tutorzen-postgres tutorzen-backend tutorzen-frontend; do
      if docker ps -a --format '{{.Names}}' | grep -Eq "^/?${c}\$"; then
        # Check if container is part of a different compose project or orphaned
        project=$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project"}}' "$c" 2>/dev/null || true)
        if [[ "$project" != "tutorzen" ]]; then
          echo -e "${YELLOW}ℹ Removing conflicting container '${c}' (project: '${project}')...${RESET}"
          docker rm -f "$c" &>/dev/null || true
        fi
      fi
    done

    echo -e "${CYAN}→ Building and starting containers in background...${RESET}"
    docker compose -f "$COMPOSE_FILE" up --build -d

    echo ""
    echo -e "${CYAN}→ Waiting for PostgreSQL database to be healthy...${RESET}"
    until [ "$(docker inspect -f '{{.State.Health.Status}}' tutorzen-postgres 2>/dev/null || true)" == "healthy" ]; do
      sleep 2
    done
    echo -e "${GREEN}✓ Database is healthy.${RESET}"

    echo ""
    echo -e "${BOLD}${GREEN}====================================================${RESET}"
    echo -e "${BOLD}${GREEN}   All TutorZen Services Are Up & Running!          ${RESET}"
    echo -e "${BOLD}${GREEN}====================================================${RESET}"
    echo ""
    echo -e "  ${BOLD}🌐 Frontend (Web App):${RESET}      ${CYAN}http://localhost:8081${RESET}"
    echo -e "  ${BOLD}☕ Backend (Spring API):${RESET}    ${CYAN}http://localhost:8080${RESET}"
    echo -e "  ${BOLD}🐘 Database (PostgreSQL):${RESET}   ${CYAN}localhost:5432 (tutorzen_dev)${RESET}"
    echo ""
    echo -e "${BOLD}Pre-seeded Demo Accounts:${RESET}"
    echo -e "  • ${BOLD}Teacher:${RESET} teacher@demo.com  /  password123"
    echo -e "  • ${BOLD}Student:${RESET} student@demo.com  /  password123"
    echo -e "  • ${BOLD}Admin:${RESET}   admin@demo.com    /  password123"
    echo ""
    echo -e "${BOLD}Management Commands:${RESET}"
    echo -e "  • View container status:  ${CYAN}./scripts/run-all.sh --status${RESET}"
    echo -e "  • Stream live logs:       ${CYAN}./scripts/run-all.sh --logs${RESET}"
    echo -e "  • Stop all services:      ${CYAN}./scripts/run-all.sh --down${RESET}"
    echo ""
    ;;
esac

