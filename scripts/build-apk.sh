#!/usr/bin/env bash
# ==============================================================================
# TutorZen — Android APK Build Script (Zero Mac Android Studio Required)
#
# Generates a standalone installable APK in the `dist/` folder.
# Supported Modes:
#   1. docker (Default if Docker is running) — Builds in a self-contained container
#   2. eas    (Cloud Build) — Builds on Expo's cloud build servers
#   3. local  (Optional) — Uses local host Android SDK if already installed
#
# Usage:
#   npm run build:apk                       # Default: Builds via Docker into dist/
#   npm run build:apk:docker                # Explicit Docker container build
#   npm run build:apk:eas                   # Explicit EAS Cloud build
#   npm run build:apk:debug                 # Builds debug APK
# ==============================================================================

set -euo pipefail

# Color formatting
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
RED="\033[0;31m"
RESET="\033[0m"

# Project directories
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOBILE_DIR="$REPO_ROOT/apps/mobile"
DIST_DIR="$REPO_ROOT/dist"
MOBILE_DIST_DIR="$MOBILE_DIR/dist"

# Default options
BUILD_MODE="auto"
BUILD_TYPE="release"
CLEAN_BUILD=false

# ------------------------------------------------------------------------------
# 1. Parse Arguments
# ------------------------------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      BUILD_MODE="$2"
      shift 2
      ;;
    --debug)
      BUILD_TYPE="debug"
      shift
      ;;
    --release)
      BUILD_TYPE="release"
      shift
      ;;
    --clean)
      CLEAN_BUILD=true
      shift
      ;;
    -h|--help)
      echo -e "${BOLD}TutorZen Android APK Generator (No Mac Android Studio Required)${RESET}"
      echo ""
      echo "Usage: ./scripts/build-apk.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --mode <docker|eas|local|auto>  Build strategy (default: auto -> docker/eas)"
      echo "  --debug                         Build debug APK instead of release"
      echo "  --release                       Build release APK (default)"
      echo "  --clean                         Perform clean rebuild"
      echo "  -h, --help                      Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${RESET}"
      echo "Run './scripts/build-apk.sh --help' for available options."
      exit 1
      ;;
  esac
done

echo -e "${BOLD}${CYAN}====================================================${RESET}"
echo -e "${BOLD}${CYAN}   TutorZen — Android APK Build Process             ${RESET}"
echo -e "${BOLD}${CYAN}====================================================${RESET}"
echo -e "Target:      ${BOLD}$BUILD_TYPE${RESET} APK"
echo -e "Requested:   ${BOLD}$BUILD_MODE${RESET}"
echo -e "Output Dir:  ${BOLD}$DIST_DIR${RESET}"
echo ""

# Ensure dist directories exist
mkdir -p "$DIST_DIR"
mkdir -p "$MOBILE_DIST_DIR"

# ------------------------------------------------------------------------------
# 2. Strategy Resolution (Auto Mode)
# ------------------------------------------------------------------------------
if [[ "$BUILD_MODE" == "auto" ]]; then
  if docker info &>/dev/null; then
    echo -e "${GREEN}✓ Docker is running — using Docker Container Build (No Mac Android Studio needed).${RESET}"
    RESOLVED_MODE="docker"
  else
    echo -e "${YELLOW}ℹ Docker not running — falling back to EAS Cloud Build.${RESET}"
    RESOLVED_MODE="eas"
  fi
else
  RESOLVED_MODE="$BUILD_MODE"
fi

# ------------------------------------------------------------------------------
# 3. Publish & Finalize Artifacts
# ------------------------------------------------------------------------------
publish_apk() {
  local src_apk="$1"
  local app_version
  app_version=$(node -p "require('$MOBILE_DIR/app.json').expo.version || '0.1.0'" 2>/dev/null || echo "0.1.0")

  local canonical_apk="$DIST_DIR/tutorzen.apk"
  local versioned_apk="$DIST_DIR/tutorzen-${app_version}-${BUILD_TYPE}.apk"
  local mobile_canonical="$MOBILE_DIST_DIR/tutorzen.apk"

  if [[ "$src_apk" != "$canonical_apk" ]]; then
    cp "$src_apk" "$canonical_apk"
  fi
  cp "$canonical_apk" "$versioned_apk"
  cp "$canonical_apk" "$mobile_canonical"

  local file_size_bytes
  file_size_bytes=$(wc -c < "$canonical_apk" | tr -d ' ')
  local file_size_mb
  file_size_mb=$(node -p "($file_size_bytes / (1024 * 1024)).toFixed(2)" 2>/dev/null || echo "$((file_size_bytes / 1048576))")

  local sha256_sum
  if command -v shasum &>/dev/null; then
    sha256_sum=$(shasum -a 256 "$canonical_apk" | awk '{print $1}')
  else
    sha256_sum="n/a"
  fi

  echo ""
  echo -e "${BOLD}${GREEN}====================================================${RESET}"
  echo -e "${BOLD}${GREEN}   BUILD SUCCESSFUL! APK Generated in dist/         ${RESET}"
  echo -e "${BOLD}${GREEN}====================================================${RESET}"
  echo -e "Primary APK:     ${BOLD}$canonical_apk${RESET}"
  echo -e "Versioned APK:   ${BOLD}$versioned_apk${RESET}"
  echo -e "Mobile Copy:     ${BOLD}$mobile_canonical${RESET}"
  echo -e "File Size:       ${BOLD}${file_size_mb} MB${RESET} (${file_size_bytes} bytes)"
  echo -e "SHA-256:         ${BOLD}${sha256_sum}${RESET}"
  echo ""
  echo -e "To install on an Android device or emulator:"
  echo -e "  ${CYAN}adb install -r $canonical_apk${RESET}"
}

# ------------------------------------------------------------------------------
# 4. Strategy: Docker Container Build
# ------------------------------------------------------------------------------
build_docker() {
  echo -e "\n${BOLD}${CYAN}▶ Starting Docker Container Build...${RESET}"

  if ! docker info &>/dev/null; then
    echo -e "${RED}Error: Docker daemon is not running!${RESET}"
    echo "Please start Docker Desktop and retry, or run EAS cloud build: npm run build:apk:eas"
    exit 1
  fi

  # Ensure native Android project exists
  if [[ ! -d "$MOBILE_DIR/android" || "$CLEAN_BUILD" == true ]]; then
    echo -e "${CYAN}→ Generating native Android project via Expo prebuild...${RESET}"
    (cd "$MOBILE_DIR" && npx expo prebuild --platform android --no-install ${CLEAN_BUILD:+--clean})
  fi

  local image_tag="tutorzen-android-builder:amd64"
  if ! docker image inspect "$image_tag" &>/dev/null; then
    echo -e "${CYAN}→ Building lightweight Android builder container ($image_tag)...${RESET}"
    echo -e "${CYAN}  (This creates a dedicated build image with OpenJDK 17 + Android SDK 35 without touching your Mac)${RESET}"
    docker build --platform linux/amd64 -t "$image_tag" -f "$REPO_ROOT/infrastructure/docker/Dockerfile.android-builder" "$REPO_ROOT/infrastructure/docker"
  fi

  local gradle_task="assembleRelease"
  local apk_subfolder="release"
  if [[ "$BUILD_TYPE" == "debug" ]]; then
    gradle_task="assembleDebug"
    apk_subfolder="debug"
  fi

  echo -e "${CYAN}→ Compiling APK inside Docker container ($gradle_task)...${RESET}"
  docker run --platform linux/amd64 --rm \
    -v "$REPO_ROOT":/workspace \
    -v tutorzen-gradle-cache:/root/.gradle \
    -w /workspace/apps/mobile/android \
    "$image_tag" \
    bash -c "./gradlew $gradle_task -x lint -x test"

  local search_dir="$MOBILE_DIR/android/app/build/outputs/apk/$apk_subfolder"
  local source_apk=""
  if compgen -G "$search_dir/*.apk" > /dev/null; then
    source_apk=$(ls -t "$search_dir"/*.apk | head -n 1)
  fi

  if [[ -z "$source_apk" || ! -f "$source_apk" ]]; then
    echo -e "${RED}Error: Build finished but APK was not found in $search_dir${RESET}"
    exit 1
  fi

  publish_apk "$source_apk"
}

# ------------------------------------------------------------------------------
# 5. Strategy: EAS Cloud Build
# ------------------------------------------------------------------------------
build_eas() {
  echo -e "\n${BOLD}${CYAN}▶ Starting EAS Cloud Build...${RESET}"

  cd "$MOBILE_DIR"

  if [[ ! -f "$MOBILE_DIR/eas.json" ]]; then
    echo -e "${YELLOW}Creating eas.json with APK preview profile...${RESET}"
    cat <<EOF > "$MOBILE_DIR/eas.json"
{
  "cli": { "version": ">= 14.0.0" },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    }
  }
}
EOF
  fi

  echo -e "${CYAN}→ Triggering EAS Cloud build for profile 'preview' (standalone APK)...${RESET}"
  echo -e "${YELLOW}Note: If prompted, log into your Expo account ('npx eas login').${RESET}"
  npx eas-cli build --platform android --profile preview
}

# ------------------------------------------------------------------------------
# 6. Strategy: Local Host Build (If already configured)
# ------------------------------------------------------------------------------
build_local() {
  echo -e "\n${BOLD}${CYAN}▶ Starting Local Gradle Build on Host...${RESET}"
  cd "$MOBILE_DIR"

  if [[ ! -d "$MOBILE_DIR/android" || "$CLEAN_BUILD" == true ]]; then
    npx expo prebuild --platform android --no-install ${CLEAN_BUILD:+--clean}
  fi

  cd "$MOBILE_DIR/android"
  local gradle_task="assembleRelease"
  local apk_subfolder="release"
  if [[ "$BUILD_TYPE" == "debug" ]]; then
    gradle_task="assembleDebug"
    apk_subfolder="debug"
  fi

  ./gradlew "$gradle_task" -x lint -x test

  local search_dir="$MOBILE_DIR/android/app/build/outputs/apk/$apk_subfolder"
  local source_apk=$(ls -t "$search_dir"/*.apk 2>/dev/null | head -n 1)
  publish_apk "$source_apk"
}

# ------------------------------------------------------------------------------
# 7. Dispatch
# ------------------------------------------------------------------------------
case "$RESOLVED_MODE" in
  docker)
    build_docker
    ;;
  eas)
    build_eas
    ;;
  local)
    build_local
    ;;
  *)
    echo -e "${RED}Invalid mode: $RESOLVED_MODE${RESET}"
    exit 1
    ;;
esac
