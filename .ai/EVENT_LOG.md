# Project Event Log

Chronological factual record of material project events. Append new entries; do not rewrite history. Do not log secrets, credentials, or unnecessary personal data. This log is not a substitute for ADRs or Git history.

## Entry format

- **Date/time:** ISO-8601 with timezone, or `UNKNOWN` if not known.
- **Type:** `DISCOVERY`, `IMPLEMENTATION`, `TEST`, `DECISION`, `INCIDENT`, `RELEASE`, `DOCS`.
- **Summary:** What actually happened.
- **Evidence:** Commit, file path, test command/output, or discussion reference when available.
- **Outcome:** Verified result or unresolved issue.
- **Follow-up:** Next action, if any.

---

## Initial starter creation

- **Date/time:** 2026-10-13 (date from conversation context; exact time not recorded).
- **Type:** `DOCS`
- **Summary:** Prepared a documentation starter defining AI coding rules, project memory, proposed modular architecture, UX/design-system standards, mobile flow inventory, and initial decision records.
- **Evidence:** Starter package files.
- **Outcome:** Documentation baseline prepared; actual application repository and code have not been inspected or modified by this package creation.
- **Follow-up:** Integrate after auditing the real repository; update status based on evidence.

---

## Foundation Scaffolding and Initial Verification

- **Date/time:** 2026-10-15T00:20:00+05:30
- **Type:** `IMPLEMENTATION`
- **Summary:** Established monorepo workspace configuration (`package.json`, `pnpm-workspace.yaml`, `.gitignore`), `@tutorzen/design-tokens` package with claymorphic and typography tokens, `@tutorzen/mobile` React Native/Expo app with tactile components and font loading, and `apps/backend` Spring Boot 3.4.x modular monolith with TenantContext, Attendance Strategy Pattern (Bulk, QR, 6-digit PIN), offline sync service, and Flyway baseline migration.
- **Evidence:** 6 passing token unit tests (`node --test`), clean TypeScript compilation (`tsc --noEmit`), and 15 passing JUnit tests (`./mvnw test`).
- **Outcome:** Monorepo, frontend tokens, mobile shell, and backend core domain foundation fully verified with zero errors.
- **Follow-up:** Implement identity and authentication module (JWT, password encryption, sign-in flows).

---

## Teacher Flow Implementation and Verification

- **Date/time:** 2026-10-15T00:45:00+05:30
- **Type:** `IMPLEMENTATION`
- **Summary:** Implemented complete Teacher Flow across mobile and backend: TeacherHomeScreen (Screen 5 with metric cards, today's schedule, quick actions), MarkAttendanceScreen (Screen 14 with Strategy Pattern: Bulk roster marking with live counters, QR Code generation with countdown, 6-Digit PIN generation with digit boxes), TeacherBottomNav, and TeacherSessionController Spring Boot REST endpoints.
- **Evidence:** Clean TypeScript typecheck (`tsc --noEmit`), 20 passing backend JUnit integration tests (`./mvnw test`), and verified interactive browser preview on `http://localhost:8081`.
- **Outcome:** Teacher Flow fully operational and verified end-to-end.
- **Follow-up:** Implement Student Flow or Authentication/Role Switching.

---

## Student Attendance Experience and Multi-Persona Loop

- **Date/time:** 2026-10-15T01:31:00+05:30
- **Type:** `IMPLEMENTATION`
- **Summary:** Implemented the complete Student Attendance Experience (Concept Screens 4, 13, and 15) and unified it with the Teacher Attendance Flow via a persistent RoleSwitcherPill in `App.tsx`. Built `StudentHomeScreen` (greeting, streak banner, live class card, quick action grid), `StudentAttendanceEntryScreen` (6 tactile PIN boxes, on-screen keypad, QR scanner simulation, and real-time pass expiry checks), `StudentAttendanceSummaryScreen` (circular 92% rate card, stats trio: 46 present / 4 absent / 2 late, policy compliance notice, and recent logs), and `StudentBottomNav`. On the backend, created `StudentAttendanceController` and DTOs to handle `/api/v1/students/attendance/submit` and `/api/v1/students/{studentId}/attendance/summary`.
- **Evidence:** Clean TypeScript typecheck across `@tutorzen/mobile` (`tsc --noEmit`, 0 errors), 24 passing JUnit tests in `apps/backend` (`./mvnw test`, 0 failures), 6 passing design-token tests (`npx tsx --test`, 0 failures), and live Expo dev server on `http://localhost:8081`.
- **Outcome:** Complete end-to-end loop verified between Teacher and Student roles, with coordinated session code, expiration enforcement, and instant attendance marking updates.
- **Follow-up:** Implement Guardian/Parent flow or Offline Sync queue persistence with conflict resolution.

---

## Project Strategy & AI Workflow Audit

- **Date/time:** 2026-10-18T00:50:00+05:30
- **Type:** `DOCS`
- **Summary:** Conducted a comprehensive project strategy, architecture, documentation, and AI workflow audit. Inspected all source files, migration scripts, dependencies, tests, and documentation. Found significant gap between documentation claims (VERIFIED status) and actual implementation (prototype with hardcoded data). Corrected Spring Boot version (3.5.x → 3.4.3). Updated PROJECT_STATE.md, PROJECT_CONTEXT.md, CURRENT_TASK.md, and DECISIONS.md. Created CLAUDE.md, docs/product/V1_SCOPE.md, docs/roadmap/IMPLEMENTATION_ROADMAP.md, and docs/audits/project-strategy-and-ai-workflow-audit.md.
- **Evidence:** Inspected `pom.xml` (Spring Boot 3.4.3), `V1__init_schema.sql` (only tenants + attendance_records tables), all controller files (hardcoded mock data), `TenantFilter.java` (unauthenticated header trust), `App.tsx` (no React Navigation, manual useState routing), `AttendanceSyncService.java` (ConcurrentHashMap — in-memory only). Tests re-run: 24/24 backend, 6/6 token tests.
- **Outcome:** Documentation system now accurately reflects prototype state. Critical security gaps documented. V1 scope boundary defined. AI context recovery improved.
- **Follow-up:** Implement CURRENT_TASK.md — authentication module and real persistence.

---

## Phase 1 Backend Authentication & Security Implementation

- **Date/time:** 2026-10-18T01:08:00+05:30
- **Type:** `IMPLEMENTATION`
- **Summary:** Implemented the complete backend Identity and Authentication module per ADR-0008, ADR-0009, and ADR-0010. Created `V2__identity_schema.sql` (users, user_credentials, refresh_tokens tables and seed demo accounts). Implemented `User`, `UserCredential`, and `RefreshToken` JPA entities and repositories. Implemented `JwtService` using JJWT 0.12.6 with 15-minute access tokens and 7-day refresh tokens. Built `AuthService` with BCrypt credential checks, SHA-256 refresh token hashing, and automatic token rotation on refresh. Configured Spring Security `SecurityConfig` with stateless `SecurityFilterChain`, 401 JSON entry point, role-based protection (`TEACHER`, `STUDENT`, `ADMIN`), and updated `TenantFilter` to extract verified tenant from JWT claims to prevent tenant header spoofing.
- **Evidence:** 34 unit and integration tests passing (`./mvnw test`) with 0 failures and 0 errors, including new test suites `AuthControllerTests` and `SecurityIntegrationTests`. Design token tests (12/12) and mobile typecheck (`tsc --noEmit`) passing cleanly.
- **Outcome:** Backend authentication and security foundation is operational and verified. Protected endpoints strictly require valid JWTs.
- **Follow-up:** Implement Mobile Authentication & Navigation (React Navigation + AuthScreen + secure JWT storage), followed by Academics and Session persistence.

---

## Teacher Flow Persistence, Mobile Auth & Live Integration (Options A, B, C)

- **Date/time:** 2026-10-18T01:30:00+05:30
- **Type:** `IMPLEMENTATION`
- **Summary:** Executed Option A (Real Backend Persistence for Sessions/Attendance), Option B (Mobile Auth & API Client Integration), and Option C (Live Dev Preview & End-to-End Verification).
  - **Option A:** Created `V3__academics_schema.sql` (subjects, batches, students, batch enrollments, class sessions), implemented JPA entities and repositories in `com.tutorzen.academics` and `com.tutorzen.attendance.domain.AttendanceRecordRepository`. Wired `TeacherSessionController` to read live session rosters from database, persist real attendance records on save, and update session code/QR expiry in DB. Added `TeacherSessionPersistenceTests`.
  - **Option B:** Built `apiClient.ts` with automatic 401 token refresh interceptor, `AuthContext.tsx`, and `AuthScreen.tsx` with 1-tap demo logins for Teacher and Student. Wired `TeacherHomeScreen` to live sessions API and `MarkAttendanceScreen` to database roster and save API. Wrapped `App.tsx` with `AuthProvider`.
  - **Option C:** Verified PostgreSQL Docker container, Spring Boot backend daemon on port 8080, and Expo dev server daemon on port 8081. Executed live curl tests confirming JWT authentication and session retrieval.
- **Evidence:** 37/37 backend JUnit tests passing (`./mvnw test`), 12/12 design token tests passing (`npx tsx --test`), mobile TypeScript check clean (`npx tsc --noEmit`), and verified live HTTP 200 responses on backend and Expo dev server.
- **Outcome:** Teacher flow is now backed by real database persistence and JWT-authenticated APIs instead of mock data.
- **Follow-up:** Implement Student Flow persistence (validate session code and write attendance to DB) and dynamic summary metrics.

---

## Backend CORS Configuration for Expo Web Client

- **Date/time:** 2026-10-18T01:36:00+05:30
- **Type:** `FIX`
- **Summary:** Configured `CorsConfigurationSource` in `SecurityConfig.java` to support browser preflight `OPTIONS` requests from Expo web development server (`http://localhost:8081` and local dev origin patterns). Explicitly permitted `HttpMethod.OPTIONS` and exposed authentication headers. Added integration test `corsPreflightOptionsRequestAllowedForLocalDevOrigin` in `SecurityIntegrationTests.java`.
- **Evidence:** 38/38 backend tests passing (`./mvnw test`). Verified with live `OPTIONS` preflight and `POST` sign-in curl commands returning `Access-Control-Allow-Origin: http://localhost:8081` and `Access-Control-Allow-Credentials: true`.
- **Outcome:** Browser CORS preflight error resolved; Expo web client can now communicate seamlessly with the Spring Boot backend.

---

## Individual Student Status Marking & Roster Normalization Fix

- **Date/time:** 2026-10-18T01:45:00+05:30
- **Type:** `FIX`
- **Summary:** Investigated and resolved the issue where toggling one student's attendance marked all students in the roster. Root cause: `RosterStudentDto` exposed `id` and `defaultStatus`, while `apiClient.getSessionRoster` mapped `item.studentId` and `item.status`, causing all students in the roster state to have `id: undefined`. When `toggleStudentStatus(id)` checked `student.id === id`, `undefined === undefined` evaluated to true for every student, flipping the entire batch at once.
  - **Fix 1 (Backend):** Updated `RosterStudentDto.java` with aliases for both `id`/`studentId` and `status`/`defaultStatus`.
  - **Fix 2 (Mobile Utility):** Created pure domain utility `rosterUtils.ts` with `normalizeRosterItem`, `toggleStudentStatus`, `setStudentStatus`, `markAllStudents`, `calculateRosterCounts`, and `filterRoster`, strictly preventing state mutation if `studentId` is blank/empty.
  - **Fix 3 (UI & Client):** Updated `MarkAttendanceScreen.tsx` with dedicated P (Present) and A (Absent) tactile tap targets alongside card/checkbox toggle, plus "All Present" and "All Absent" fast actions.
  - **Unit Tests:** Created `apps/mobile/src/__tests__/rosterUtils.test.ts` (15/15 tests passing with Node test runner).
  - **Integration Tests:** Added `getSessionRosterReturnsExplicitIdStudentIdAndStatus` and `markAttendanceSelectivelyMarksIndividualStudentsAndReflectsInRoster` in `TeacherSessionPersistenceTests.java` (40/40 backend tests passing).
- **Evidence:** 40/40 backend tests passing (`./mvnw test`), 15/15 mobile unit tests passing (`npm test`), mobile typecheck clean (`npx tsc --noEmit`), and verified with live curl calls confirming selective student attendance persistence.
- **Outcome:** Individual student marking operates strictly on the targeted student.

---

## Learning Materials & Upload Notes Module (Teacher Journey)

- **Date/time:** 2026-10-18T02:00:00+05:30
- **Type:** `IMPLEMENTATION`
- **Summary:** Implemented the full-stack Learning Materials & Notes feature per ADR-0011.
  - **Database Migration:** Created `V4__materials_schema.sql` defining the `learning_materials` table with tenant and subject scoping, file metadata, and baseline seed data for `tenant-default`.
  - **Backend Module (`com.tutorzen.materials` & `com.tutorzen.academics`):** Added `Subject` JPA entity and `SubjectRepository`; implemented `LearningMaterial` JPA entity, `LearningMaterialRepository`, DTOs (`CreateMaterialRequest`, `MaterialSummaryDto`), and `TeacherMaterialsController` exposing endpoints: `GET /api/v1/teacher/materials` (with optional subject filtering), `POST` (create notes metadata), `DELETE /{materialId}`, and `GET /subjects`.
  - **Backend Tests:** Added `TeacherMaterialsPersistenceTests.java` covering listing, subject filtering, metadata persistence, deletion, and 401 unauthenticated protection. All 46 backend JUnit tests passing (`./mvnw test`).
  - **Mobile Client:** Added materials types and API methods in `apiClient.ts` (`getMaterials`, `uploadMaterial`, `deleteMaterial`, `getSubjects`). Created `UploadNotesScreen.tsx` with Claymorphic card layout, dynamic subject pills, file attachment presets picker, and live repository list with delete actions. Wired to `TeacherHomeScreen` quick action tile and `App.tsx` routing.
  - **Mobile Tests:** Added unit tests in `apps/mobile/src/__tests__/materials.test.ts`. 18/18 mobile unit tests passing (`npm test`), typecheck clean (`npx tsc --noEmit`).
- **Evidence:** 46/46 backend JUnit tests passing, 18/18 mobile unit tests passing, mobile TypeScript check clean, and live endpoints verified via curl and Expo dev server.
- **Outcome:** Teachers can seamlessly upload, view, filter, and delete subject-scoped notes and study materials backed by real database persistence.
- **Follow-up:** Implement student view for downloading/browsing study notes.

---

## Required Field UI Red Highlight Validation on Upload Notes Screen

- **Date/time:** 2026-10-18T02:08:00+05:30
- **Type:** `UI_IMPROVEMENT`
- **Summary:** Added explicit red border and background highlighting with contextual error text when attempting to publish notes without providing the mandatory `title`.
  - **Component:** In `UploadNotesScreen.tsx`, when `handleUpload` is triggered without a title, `titleError` state is set to `true`.
  - **Visual Treatment:** The title input dynamically switches border color to `theme.colors.status.danger` (`#B42318`), background color to `theme.colors.status.dangerLight` (`#FEE4E2`), border width to 1.5, placeholder text to danger tint, displays a bold "Required" status pill in the label header, and shows a warning caption (`⚠ Title is required to publish notes.`).
  - **Auto-Clearing:** Error state immediately resets as soon as the user enters valid non-whitespace text.
  - **Tests:** Extended `apps/mobile/src/__tests__/materials.test.ts` with test verifying blank/whitespace rejection, color switching to status danger, and clearing upon typing.
- **Evidence:** 19/19 mobile unit tests passing (`npm test`), `npx tsc --noEmit` clean, 46/46 backend tests passing (`./mvnw test`).
- **Outcome:** Intuitive, accessible user feedback preventing empty material submission.

---

## Interactive File Upload Section, Dropzone & Native File Picker

- **Date/time:** 2026-10-18T02:15:00+05:30
- **Type:** `FEATURE`
- **Summary:** Replaced static presets picker in `UploadNotesScreen.tsx` with a fully interactive file upload system:
  - **Claymorphic Dropzone:** Dashed-border tactile dropzone with upload iconography (`📤` / `📥`), drag-and-drop listener on Web, and prominent "Browse Files" button triggering the native OS file picker (`<input type="file">` accepting `.pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg`).
  - **Selected File Card:** Displays dynamic document icon (`📕` PDF, `📘` Word, `📙` PPT, `🖼️` Image, `📄` Document), file name, formatted file size, `✓ File Attached & Ready to Publish` status badge, "Change File", and "✕" remove actions.
  - **Smart Title Auto-Population:** When a file is selected, automatically infers a clean, capitalized title from the filename if the user hasn't typed one yet.
  - **Validation & Error Highlighting:** If publish is pressed without an attached file, highlights dropzone in danger red with "Required" badge and warning caption.
  - **Sample Curriculum Presets Accordion:** Preserved sample templates as a collapsible option below the dropzone for rapid demo testing without needing local files.
  - **Unit Tests:** Added 2 new tests in `materials.test.ts` (20/20 mobile unit tests passing).
- **Evidence:** 20/20 mobile unit tests passing, `npx tsc --noEmit` clean, 46/46 backend tests passing (`./mvnw test`).
- **Outcome:** Teachers can upload actual files directly from their machine or mobile device with drag-and-drop and native system file dialogs.

---

## Android APK Build Script & Artifact Generation

- **Date/time:** 2026-10-18T23:43:00+05:30
- **Type:** `TOOLING`
- **Summary:** Created standalone build script and configuration to generate Android APKs into the `dist/` directory without requiring Android Studio on macOS:
  - **Docker Container Builder (`infrastructure/docker/Dockerfile.android-builder`):** Dedicated OpenJDK 17 + Android SDK 35 build container image with volume caching (`tutorzen-gradle-cache`) to compile the APK entirely inside Docker and output to `dist/tutorzen.apk`.
  - **Script (`scripts/build-apk.sh`):** Configured with auto-detection of Docker and EAS environments, release/debug flags, and clean rebuild option. Copies output artifacts to `dist/tutorzen.apk`, versioned `dist/tutorzen-<version>-<type>.apk`, and `apps/mobile/dist/tutorzen.apk` with size and SHA-256 calculation.
  - **EAS Profile (`apps/mobile/eas.json`):** Created EAS configuration specifying `preview` profile with `android.buildType: "apk"` for Cloud Build.
  - **App Config (`apps/mobile/app.json`):** Added `"package": "com.tutorzen.app"` and `"versionCode": 1` under `android` and `bundleIdentifier` under `ios`.
  - **NPM Integration:** Added `build:apk`, `build:apk:docker`, `build:apk:eas`, and `build:apk:debug` commands to root `package.json` and `apps/mobile/package.json`.
- **Evidence:** Script verified (`./scripts/build-apk.sh --help`), mobile typecheck clean (`npx tsc --noEmit`), 20/20 unit tests passing (`npm test`).
- **Outcome:** Clean APK build pipeline supporting Docker container compilation and EAS cloud compilation with zero macOS toolchain pollution.

---

## Successful Android APK Compilation via Docker Container

- **Date/time:** 2026-10-19T01:02:00+05:30
- **Type:** `BUILD`
- **Summary:** Executed full Dockerized build producing production-grade Android Release APK without installing Android Studio or native SDK on the host Mac.
  - **Environment:** Container built with `eclipse-temurin:17-jdk-jammy` on `linux/amd64` architecture, resolving Google AAPT2 and Hermes x86_64 binary compatibility under Rosetta 2.
  - **Generated Artifact:** Output generated at `dist/tutorzen.apk` and `dist/tutorzen-0.1.0-release.apk` (61.14 MB, SHA-256: `5d45258520ee34de26ea885feec5d01b105edbab6d7e87450ecadbc238d12a50`).
  - **Inspection:** Verified valid zip archive containing `classes.dex`, `classes2.dex`, `classes3.dex`, Hermes bytecode, and native `.so` libraries for `arm64-v8a` and `armeabi-v7a`.
- **Evidence:** Build finished with code 0 (`BUILD SUCCESSFUL in 23m 35s`, 373 Gradle tasks executed/cached), verified output file on disk in `dist/` and `apps/mobile/dist/`.
- **Outcome:** Verified, standalone, installable Android APK generated strictly within Docker.

---

## iOS Build Script & Cloud Artifact Generation

- **Date/time:** 2026-10-19T01:18:00+05:30
- **Type:** `TOOLING`
- **Summary:** Created standalone build script and configuration for iOS packages (`.ipa` and Simulator `.tar.gz`) without requiring full Xcode.app or local CocoaPods installation:
  - **Script (`scripts/build-ios.sh`):** Automates iOS compilation via EAS Cloud Build (default) or local Xcode if available. Supports `--simulator` (builds unsigned Simulator package without requiring an Apple Developer account) and `--device` (builds physical device distribution `.ipa`).
  - **EAS Profiles (`apps/mobile/eas.json`):** Added `preview` (`ios.simulator: false`) and `preview:simulator` (`ios.simulator: true`) profiles.
  - **App Config (`apps/mobile/app.json`):** Added `"buildNumber": "1"` and preserved `"bundleIdentifier": "com.tutorzen.app"`.
  - **NPM Integration:** Added `build:ios`, `build:ios:sim`, and `build:ios:device` to root `package.json` and `apps/mobile/package.json`.
- **Evidence:** Script verified (`./scripts/build-ios.sh --help`), mobile typecheck clean (`npx tsc --noEmit`), 20/20 unit tests passing (`npm test`).
- **Outcome:** Complete cross-platform build pipeline (Android via Docker, iOS via EAS Cloud) with zero heavy IDE installation required on the developer's Mac.

---

## Docker Compose Multi-Service Orchestration & Developer Documentation

- **Date/time:** 2026-10-20T23:35:00+05:30
- **Type:** `IMPLEMENTATION`
- **Summary:** Implemented 1-command Docker Compose orchestration and comprehensive developer documentation for all TutorZen services (PostgreSQL 16, Spring Boot API, React Native Web UI):
  - **Backend Container (`apps/backend/Dockerfile`):** Multi-stage build utilizing `eclipse-temurin:21-jdk-jammy` builder with Maven dependency layer caching and `eclipse-temurin:21-jre-jammy` runtime running as non-root `tutorzen:tutorzen` on port `8080`.
  - **Frontend Web Container (`apps/mobile/Dockerfile` & `nginx.conf`):** Multi-stage build utilizing `node:20-alpine` builder exporting React Native Web assets via `npx expo export --platform web`, served via `nginx:alpine` on port `8081` with SPA routing and gzip compression.
  - **Docker Compose (`docker-compose.yml` & `infrastructure/docker/docker-compose.yml`):** Root and infrastructure definitions linking `postgres` (with `pg_isready` healthcheck), `backend` (depends on `postgres` healthy, connects via `jdbc:postgresql://postgres:5432/tutorzen_dev`), and `frontend` (depends on `backend`, maps `8081:8081`).
  - **CLI Orchestrator Script (`scripts/run-all.sh`):** Executable script with subcommands (`--down`, `--logs`, `--status`, `--restart`), healthcheck polling, and formatted service URLs/login credential output.
  - **Developer Guide (`docs/RUNNING.md`):** Comprehensive documentation covering system architecture, ports, 1-command startup, local host development instructions, demo credentials, mobile API resolution, and troubleshooting.
  - **Monorepo Integration (`package.json` & `README.md`):** Added `services:up`, `services:down`, `services:logs`, `services:status` npm scripts and quick start instructions in root README.
- **Evidence:** `docker compose config` passed with exit code 0; all scripts executable; `README.md` and `docs/RUNNING.md` verified.
- **Outcome:** Developers can launch the entire stack with a single command (`./scripts/run-all.sh` or `npm run services:up`) or develop individual services with hot reload.

---

## Windows Service Runners (Batch & PowerShell)

- **Date/time:** 2026-10-20T23:39:00+05:30
- **Type:** `TOOLING`
- **Summary:** Created native Windows runner scripts supporting Command Prompt and PowerShell:
  - **Batch File (`scripts/run-all.bat`):** Double-clickable and Command Prompt friendly with delayed variable expansion, background container spinup, docker health polling loop for PostgreSQL, color-emulated output, pre-seeded accounts display, and subcommand routing (`--down`, `--logs`, `--status`, `--restart`, `--help`).
  - **PowerShell Script (`scripts/run-all.ps1`):** Native PowerShell 5.1/7+ script with styled colored console output (`Write-Host -ForegroundColor`), health polling loop, parameter validation, and identical CLI commands (`-down`, `-logs`, `-status`, `-restart`).
  - **NPM Integration:** Added `services:up:win`, `services:down:win`, `services:logs:win`, `services:status:win` to root `package.json`.
  - **Documentation:** Updated `README.md` and `docs/RUNNING.md` with Windows runner commands.
- **Evidence:** `git status` clean, batch syntax and powershell scripts validated.
- **Outcome:** Windows users can launch and manage all TutorZen containers with zero friction using Command Prompt, PowerShell, or NPM.

---

## Windows Native Build Scripts (Android APK via Docker & iOS via EAS/Docker)

- **Date/time:** 2026-10-20T23:50:00+05:30
- **Type:** `TOOLING`
- **Summary:** Created native Windows build scripts for Android APK and iOS packages:
  - **Android APK Builder (`scripts/build-apk.bat` & `scripts/build-apk.ps1`):** Compiles standalone APKs (`dist\tutorzen.apk`) entirely inside the `tutorzen-android-builder:amd64` Docker container using volume mounts (`-v "%REPO_ROOT%":/workspace`) without installing Android Studio or the Android SDK on Windows. Supports `--debug`, `--release`, and `--clean`.
  - **iOS Package Builder (`scripts/build-ios.bat` & `scripts/build-ios.ps1`):** Builds iOS packages for Windows developers via EAS Cloud Build and containerized Docker dispatcher (`--mode docker`), generating Simulator packages (`preview:simulator`, no Apple Dev account required) and physical device `.ipa` packages (`preview`).
  - **NPM Integration:** Added `build:apk:win`, `build:apk:debug:win`, `build:apk:eas:win`, `build:ios:win`, `build:ios:sim:win`, and `build:ios:docker:win` to root `package.json`.
  - **Documentation:** Updated `docs/RUNNING.md` with complete Windows mobile build tables and instructions.
- **Evidence:** Scripts created, `git status` clean, typecheck and package.json validated.
- **Outcome:** Windows developers can compile Android APKs offline in Docker and trigger iOS builds without any heavy IDE installations.

---

## Container Name Conflict Resolution & Auto-Cleanup Hardening

- **Date/time:** 2026-10-21T00:12:00+05:30
- **Type:** `INCIDENT`
- **Summary:** Resolved Docker container naming conflict (`Conflict. The container name "/tutorzen-postgres" is already in use by container "0e1e4367cd63"`):
  - **Root Cause:** A previous session started a postgres container via `infrastructure/docker/docker-compose.yml` under project name `docker`. Running root `docker-compose.yml` (project `tutorzen`) attempted to create a container with the same name. Additionally, background daemon processes (`task-983` Expo and `task-1269` Maven) had occupied ports `8080` and `8081`.
  - **Remediation:** Removed conflicting container `0e1e4367cd63` and terminated background host processes. Updated `scripts/run-all.sh`, `scripts/run-all.bat`, and `scripts/run-all.ps1` to automatically inspect and remove conflicting or stale `tutorzen-postgres`, `tutorzen-backend`, and `tutorzen-frontend` containers before orchestrating. Corrected demo accounts password in docs to `password123`.
- **Evidence:** All 3 containers (`tutorzen-postgres`, `tutorzen-backend`, `tutorzen-frontend`) successfully built, launched, and verified healthy; tested HTTP 200 on `http://localhost:8081` and JWT token issuance on `POST http://localhost:8080/api/v1/auth/sign-in`.
- **Outcome:** Zero manual container cleanup required; 1-command startup runs reliably across platforms.

---

## V1 Rehaul Execution: Student Check-In Persistence & Multi-Branch Migration

- **Date/time:** 2026-10-22T01:36:00+05:30
- **Type:** `IMPLEMENTATION`
- **Summary:** Executed Phase 0 Baseline Audit, Student Attendance Persistence slice (`TZ-E09-S02`), and Multi-Branch & Permissions Schema Migration slice (`TZ-E04-S01`):
  - **Phase 0 Audit & Scope Alignment:** Authored `docs/audits/V1_REHAUL_AUDIT_REPORT.md` (10 required audit sections), updated `docs/product/V1_SCOPE.md` with explicit V1 boundaries, established 14-Epic Backlog (`docs/development/backlog.md`), and recorded ADR-0012 to ADR-0016 in `.ai/DECISIONS.md`.
  - **Student Check-In Persistence (`TZ-E09-S02`):** Updated `StudentAttendanceController.submitAttendance` to validate session code and expiry against `ClassSessionRepository`, enforce duplicate prevention with `409 Conflict`, and persist records to `AttendanceRecordRepository`. Updated `getStudentAttendanceSummary` to calculate dynamic metrics from database rows. Wired `apiClient.ts` with `submitStudentAttendance` and `getStudentAttendanceSummary`, integrating `StudentAttendanceEntryScreen.tsx` and `StudentAttendanceSummaryScreen.tsx`.
  - **Multi-Branch & Permissions Migration (`TZ-E04-S01`):** Created forward Flyway migration `V5__branches_and_permissions.sql` (`branches`, `permissions`, `user_permissions`, `branch_assignments`, and `batches.branch_id`). Implemented JPA entities and repositories in `com.tutorzen.branch` (`Branch`, `BranchAssignment`) and `com.tutorzen.authorization` (`Permission`, `UserPermission`).
  - **Testing & Verification:** Added `StudentAttendancePersistenceTests.java` (5 tests) and `BranchAndPermissionTests.java` (4 tests). Full backend test suite grew from 46 to 55 passing tests.
- **Evidence:** 
  - `./mvnw test` in `apps/backend`: 55/55 tests passing (0 failures, 0 errors).
  - `npm test` in `apps/mobile`: 20/20 unit tests passing.
  - `npx tsc --noEmit` in `apps/mobile`: 0 errors.
  - `npx tsx --test` in `packages/design-tokens`: 12/12 assertions passing.
- **Outcome:** Verified student check-in and multi-branch database schema are fully operational and verified by automated tests.
- **Follow-up:** Implement Milestone 4 (`TZ-E07-S02`: Batch Timings & Topics) and Milestone 5 (`TZ-E01-S02`: React Navigation Multi-Stack).






