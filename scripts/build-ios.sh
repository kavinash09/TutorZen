#!/usr/bin/env bash
# ==============================================================================
# TutorZen — iOS Build Script (Zero Mac Xcode Required via Cloud Build)
#
# Generates a standalone installable iOS package (.ipa or Simulator .tar.gz)
# in the `dist/` folder.
#
# Supported Strategies:
#   1. eas    (Default / Cloud Build) — Builds on Expo's macOS cloud infrastructure
#              without requiring Xcode or CocoaPods to be installed on your Mac.
#   2. local  (Host Build) — Uses local Xcode.app if installed and configured.
#
# Usage:
#   npm run build:ios                       # Default: Builds Device .ipa via EAS Cloud
#   npm run build:ios:sim                   # Builds Simulator package (No Apple Dev account required)
#   npm run build:ios:device                # Explicit physical device .ipa build
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
TARGET_TYPE="device" # 'device' (for .ipa) or 'simulator' (for .app/.tar.gz)
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
    --sim|--simulator)
      TARGET_TYPE="simulator"
      shift
      ;;
    --device)
      TARGET_TYPE="device"
      shift
      ;;
    --clean)
      CLEAN_BUILD=true
      shift
      ;;
    -h|--help)
      echo -e "${BOLD}TutorZen iOS Package Generator${RESET}"
      echo ""
      echo "Usage: ./scripts/build-ios.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --mode <eas|local|auto>  Build strategy (default: auto -> eas)"
      echo "  --simulator, --sim       Build Simulator package (no Apple Developer account required)"
      echo "  --device                 Build standalone .ipa for physical devices (default)"
      echo "  --clean                  Perform clean rebuild"
      echo "  -h, --help               Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${RESET}"
      echo "Run './scripts/build-ios.sh --help' for available options."
      exit 1
      ;;
  esac
done

echo -e "${BOLD}${CYAN}====================================================${RESET}"
echo -e "${BOLD}${CYAN}   TutorZen — iOS Build Process                     ${RESET}"
echo -e "${BOLD}${CYAN}====================================================${RESET}"
echo -e "Target:      ${BOLD}$TARGET_TYPE${RESET} $([[ "$TARGET_TYPE" == "simulator" ]] && echo "(Simulator .app/.tar.gz)" || echo "(.ipa Device Package)")"
echo -e "Requested:   ${BOLD}$BUILD_MODE${RESET}"
echo -e "Output Dir:  ${BOLD}$DIST_DIR${RESET}"
echo ""

# Ensure dist directories exist
mkdir -p "$DIST_DIR"
mkdir -p "$MOBILE_DIST_DIR"

# ------------------------------------------------------------------------------
# 2. Check Local Xcode Status
# ------------------------------------------------------------------------------
has_local_xcode() {
  if command -v xcodebuild &>/dev/null; then
    if xcodebuild -version &>/dev/null; then
      return 0
    fi
  fi
  return 1
}

# ------------------------------------------------------------------------------
# 3. Strategy Resolution (Auto Mode)
# ------------------------------------------------------------------------------
if [[ "$BUILD_MODE" == "auto" ]]; then
  if has_local_xcode; then
    echo -e "${GREEN}✓ Local Xcode.app detected.${RESET}"
    RESOLVED_MODE="local"
  else
    echo -e "${CYAN}ℹ Full Xcode.app not present locally — using EAS Cloud Build (No local Xcode required).${RESET}"
    RESOLVED_MODE="eas"
  fi
else
  RESOLVED_MODE="$BUILD_MODE"
fi

# ------------------------------------------------------------------------------
# 4. Strategy: EAS Cloud Build (Recommended — No Local Xcode Needed)
# ------------------------------------------------------------------------------
build_eas() {
  echo -e "\n${BOLD}${CYAN}▶ Starting EAS Cloud Build for iOS...${RESET}"
  cd "$MOBILE_DIR"

  local eas_profile="preview"
  if [[ "$TARGET_TYPE" == "simulator" ]]; then
    eas_profile="preview:simulator"
    echo -e "${CYAN}→ Building iOS Simulator package (Profile: $eas_profile)...${RESET}"
    echo -e "${GREEN}  (Simulator builds do NOT require an Apple Developer account)${RESET}"
  else
    echo -e "${CYAN}→ Building iOS Device .ipa package (Profile: $eas_profile)...${RESET}"
  fi

  echo -e "${YELLOW}Note: If prompted, log into your free Expo account ('npx eas login').${RESET}"
  npx eas-cli build --platform ios --profile "$eas_profile"

  echo ""
  echo -e "${BOLD}${GREEN}====================================================${RESET}"
  echo -e "${BOLD}${GREEN}   EAS Cloud Build Dispatched Successfully!         ${RESET}"
  echo -e "${BOLD}${GREEN}====================================================${RESET}"
  echo -e "Check your Expo dashboard to monitor compilation or download the artifact directly:"
  echo -e "  - For Simulator: Download the generated .tar.gz and drag into iOS Simulator"
  echo -e "  - For Device: Install directly via the generated QR code or download .ipa to dist/"
}

# ------------------------------------------------------------------------------
# 5. Strategy: Local Xcode Build (If Full Xcode Installed)
# ------------------------------------------------------------------------------
build_local() {
  echo -e "\n${BOLD}${CYAN}▶ Starting Local Xcode Build...${RESET}"

  if ! has_local_xcode; then
    echo -e "${RED}Error: Full Xcode.app is not active on this Mac!${RESET}"
    echo ""
    echo "To build without installing Xcode, use EAS Cloud Build (recommended):"
    echo "  ${CYAN}npm run build:ios:sim${RESET}    (Simulator build - no Apple Dev account needed)"
    echo "  ${CYAN}npm run build:ios:device${RESET} (Device build via cloud)"
    exit 1
  fi

  if ! command -v pod &>/dev/null; then
    echo -e "${RED}Error: CocoaPods ('pod') is required for local iOS builds.${RESET}"
    echo "Install via: brew install cocoapods"
    exit 1
  fi

  cd "$MOBILE_DIR"

  if [[ ! -d "$MOBILE_DIR/ios" || "$CLEAN_BUILD" == true ]]; then
    echo -e "${CYAN}→ Generating native iOS project via Expo prebuild...${RESET}"
    npx expo prebuild --platform ios --no-install ${CLEAN_BUILD:+--clean}
    cd "$MOBILE_DIR/ios" && pod install && cd "$MOBILE_DIR"
  fi

  local app_version
  app_version=$(node -p "require('$MOBILE_DIR/app.json').expo.version || '0.1.0'" 2>/dev/null || echo "0.1.0")

  cd "$MOBILE_DIR/ios"

  if [[ "$TARGET_TYPE" == "simulator" ]]; then
    echo -e "${CYAN}→ Compiling for iOS Simulator (xcodebuild)...${RESET}"
    xcodebuild -workspace TutorZen.xcworkspace \
               -scheme TutorZen \
               -configuration Release \
               -destination 'generic/platform=iOS Simulator' \
               -derivedDataPath "$MOBILE_DIR/ios/build" \
               clean build

    local sim_app="$MOBILE_DIR/ios/build/Build/Products/Release-iphonesimulator/TutorZen.app"
    if [[ -d "$sim_app" ]]; then
      local target_tar="$DIST_DIR/tutorzen-simulator.tar.gz"
      tar -czf "$target_tar" -C "$(dirname "$sim_app")" TutorZen.app
      cp "$target_tar" "$MOBILE_DIST_DIR/tutorzen-simulator.tar.gz"
      echo -e "${GREEN}✓ Simulator package created:${RESET} $target_tar"
    fi
  else
    echo -e "${CYAN}→ Archiving for iOS Device (xcodebuild archive)...${RESET}"
    xcodebuild -workspace TutorZen.xcworkspace \
               -scheme TutorZen \
               -configuration Release \
               -archivePath "$MOBILE_DIR/ios/build/TutorZen.xcarchive" \
               archive

    echo -e "${CYAN}→ Exporting .ipa package...${RESET}"
    xcodebuild -exportArchive \
               -archivePath "$MOBILE_DIR/ios/build/TutorZen.xcarchive" \
               -exportOptionsPlist "$MOBILE_DIR/ios/exportOptions.plist" \
               -exportPath "$DIST_DIR"

    if compgen -G "$DIST_DIR/*.ipa" > /dev/null; then
      local out_ipa
      out_ipa=$(ls -t "$DIST_DIR"/*.ipa | head -n 1)
      cp "$out_ipa" "$DIST_DIR/tutorzen.ipa"
      cp "$out_ipa" "$MOBILE_DIST_DIR/tutorzen.ipa"
      echo -e "${GREEN}✓ iOS IPA created:${RESET} $DIST_DIR/tutorzen.ipa"
    fi
  fi
}

# ------------------------------------------------------------------------------
# 6. Dispatch
# ------------------------------------------------------------------------------
case "$RESOLVED_MODE" in
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

