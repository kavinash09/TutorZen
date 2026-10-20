# Project State

Last verified: 2026-10-20

> **IMPORTANT — READ BEFORE IMPLEMENTING FEATURES:**
> This project is transitioning from a UI/documentation prototype to a production-ready application. Backend authentication and security are now fully implemented with real persistence and JWT protection. Prototype components remain for session/attendance data mocking on the backend and manual useState routing on mobile.

## Current status

- [VERIFIED] Establish AI instructions and project-memory conventions.
- [VERIFIED] Audit repository, establish monorepo workspace structure, and add root `.gitignore`.
- [VERIFIED] Establish `@tutorzen/design-tokens` package with typography, palette, spacing, radii, and Claymorphism surface tokens (6 tests passing).
- [VERIFIED] Scaffold `apps/backend` Spring Boot 3.4.3 modular monolith with:
  - Identity & Authentication module (`POST /api/v1/auth/sign-in`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/sign-out`) with JJWT (15m access token + 7d rotating refresh token), BCrypt password hashing, and user credentials.
  - Spring Security `SecurityFilterChain` with stateless JWT authentication, 401 unauthenticated JSON entry point, and role-based authorization (`TEACHER`, `STUDENT`, `ADMIN`).
  - `TenantFilter` enforcing verified tenant context from JWT claims, preventing unauthenticated `X-Tenant-ID` header spoofing.
  - Flyway migrations `V1__init_schema.sql` (tenants, attendance_records), `V2__identity_schema.sql` (users, user_credentials, refresh_tokens, seed accounts), and `V3__academics_schema.sql` (subjects, batches, students, batch_enrollments, class_sessions, seed roster/sessions).
  - Academics module (`com.tutorzen.academics`) with JPA entities (`ClassSession`, `Student`, `Batch`) and repositories.
  - Attendance Strategy Pattern (Bulk, QR, 6-digit PIN), offline synchronization service, `TeacherSessionController` reading live sessions and persisting bulk records to `AttendanceRecordRepository`.
  - 46 unit and integration tests passing (`./mvnw test`).
- [VERIFIED] Implement Mobile Authentication & Teacher Flow live integration:
  - `apiClient.ts` handles JWT tokens, automatic 401 token refresh, sign-in, sign-out, session fetching, and attendance submission.
  - `AuthContext.tsx` wraps session state with authenticated profile.
  - `AuthScreen.tsx` with Claymorphic aesthetic and 1-tap demo logins for Teacher (`teacher@demo.com`) and Student (`student@demo.com`).
  - `TeacherHomeScreen` wired to live backend API (`GET /api/v1/teacher/sessions/today`) with live connection badge.
  - `MarkAttendanceScreen` loads live batch roster, supports single-student status toggling, and saves attendance to backend DB.
- [VERIFIED] Implement Learning Materials & Upload Notes module (ADR-0011):
  - `V4__materials_schema.sql` migration: `learning_materials` table with indexes and seed data.
  - `Subject` JPA entity and repository in `com.tutorzen.academics`.
  - `LearningMaterial` JPA entity, repository, and `TeacherMaterialsController` (`GET`, `POST`, `DELETE`, `GET /subjects`).
  - `UploadNotesScreen.tsx` with subject selector, interactive file upload dropzone, native OS file picker, attached file preview, published notes list with delete action, and red border/background highlight validation on required fields.
  - 20 mobile unit tests passing (`npm test`), 46 backend tests passing (`./mvnw test`).
  - Quick action tile on `TeacherHomeScreen` and navigation state in `App.tsx`.
- [VERIFIED-PROTOTYPE] Implement Student Flow on mobile: StudentHomeScreen (Screen 4), StudentAttendanceEntryScreen (Screen 15), StudentAttendanceSummaryScreen (Screen 13), StudentBottomNav, and RoleSwitcherPill (typecheck passing). **Backend endpoint integration for student submission in progress.**
- [VERIFIED] Establish `infrastructure/docker/docker-compose.yml` for local PostgreSQL database. Both backend and Expo servers verified running.
- [VERIFIED] Cross-Platform Standalone Build Pipelines:
  - Android APK containerized compilation via Docker (`scripts/build-apk.sh`) producing verified `dist/tutorzen.apk` (61.14 MB release build) with zero host Android Studio dependency.
  - iOS package compilation via EAS Cloud Build (`scripts/build-ios.sh`) supporting simulator bundles and physical device `.ipa`.
- [VERIFIED] Multi-Service Docker Compose Orchestration & Documentation:
  - Multi-stage Dockerfiles for backend (JDK 21 builder, JRE 21 non-root runtime) and frontend (Expo web export with Nginx Alpine).
  - Orchestrator script (`scripts/run-all.sh`) and root compose definition (`docker-compose.yml`) running PostgreSQL (5432), Spring Boot API (8080), and Web UI (8081).
  - Complete developer & operator guide authored in `docs/RUNNING.md`.


## Critical gaps before V1

The following gaps remain before closing the V1 gate:

| Gap | Severity | Status / Notes |
|-----|----------|----------------|
| ~~No authentication~~ | RESOLVED | Spring Security `SecurityFilterChain` + JWT access (15m) + refresh token (7d) rotation active (37/37 tests passing) |
| ~~Tenant ID from unauthenticated header~~ | RESOLVED | `TenantFilter` derives tenant context strictly from verified JWT claims; unauthenticated spoofing prevented |
| ~~No academics/schedule module~~ | RESOLVED | `V3__academics_schema.sql` applied; `ClassSession`, `Batch`, `Student` entities and repositories active |
| ~~Mobile auth flow not connected~~ | RESOLVED | `AuthScreen`, `AuthContext`, and `apiClient` with automatic 401 refresh implemented and wired in `App.tsx` |
| Real persistence for student attendance submission | HIGH | Student submission endpoint (`POST /api/v1/students/attendance/submit`) and summary endpoint must read/write to `AttendanceRecordRepository` |
| No React Navigation library | HIGH | Manual `useState` routing in mobile must be replaced with React Navigation |
| In-memory offline sync state | HIGH | `AttendanceSyncService` uses `ConcurrentHashMap` |
| `attendancesync` boundary violation | MEDIUM | `AttendanceSyncService` imports `AttendanceRecord` directly from `attendance` package |
| `HomeScreen.tsx` appears orphaned | LOW | File exists but not referenced in `App.tsx` |

## Planned (in roadmap order)

- [IN PROGRESS] Student Flow Live Persistence & Mobile Integration (`StudentAttendanceController` connected to `AttendanceRecordRepository`).
- [PLANNED] Install and configure React Navigation (Native Stack + Bottom Tabs) to replace manual `useState` routing.
- [PLANNED] Offline Sync Persistence (replace in-memory ConcurrentHashMap with SQLite / persistent store).
- [PLANNED] Phase 5: Guardian / Parent Flow (Screen 10 & 11) - Post-V1.

## Known product decisions

- Attendance marking uses a Strategy Pattern (ADR-0002).
- Offline attendance synchronization is a separate component (ADR-0003).
- QR and six-digit-code validity/policies are tenant-configurable (ADR-0004).
- Platform Super Admin / God View UI is deferred (ADR-0005).
- The UX direction is restrained Claymorphism with EB Garamond and Barlow (ADR-0006).
- V1 scope boundary is defined (ADR-0007).
- Spring Security must be configured before any production deployment (ADR-0008).
- JWT strategy: short-lived access token (15m) + refresh token (7d) rotation (ADR-0009).
- Role model: flat enum in users table (ADR-0010).

## Verification commands

- `packages/design-tokens`: `npx tsx --test` → 12/12 test assertions passing.
- `apps/mobile`: `npm test` → 18/18 unit tests passing (`rosterUtils.test.ts`, `materials.test.ts`).
- `apps/mobile`: `npx tsc --noEmit` → 0 errors.
- `apps/backend`: `./mvnw test` → 46/46 tests passing (0 failures, 0 errors).
- Backend API live: `http://localhost:8080` (Spring Boot running with PostgreSQL).
- Mobile Dev Server live: `http://localhost:8081` (Expo web running).



