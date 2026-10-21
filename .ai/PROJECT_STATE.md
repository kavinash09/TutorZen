# Project State

Last verified: 2026-10-22 (Phase 0 V1 Rehaul Audit)

> **IMPORTANT — V1 REHAUL EXECUTION:**
> This repository is undergoing a controlled rehaul to deliver the approved V1 scope: Multi-Institute & Multi-Branch operations, Permission-based RBAC, Batch Schedules with Timing & Topics, Live Attendance (Teacher Roster + Student Check-In), Offline Fees Only (No online gateway, auditable reversals), Notes/Assignments Publishing Only (1-level nested comments), Dual Notifications (In-App + Critical WhatsApp), and Enrolled-Student Explore.

## Current status

- [VERIFIED] Baseline and vertical slice test suite fully operational with zero failures:
  - `apps/backend`: 55/55 unit & integration tests passing (`./mvnw test`).
  - `apps/mobile`: 20/20 unit tests passing (`npm test`), 0 TypeScript compile errors (`npx tsc --noEmit`).
  - `packages/design-tokens`: 12/12 test assertions passing (`npx tsx --test`).
  - Multi-container Docker stack running on ports 5432, 8080, 8081.
- [VERIFIED] Phase 0 Baseline Audit & Gap Assessment complete (`docs/audits/V1_REHAUL_AUDIT_REPORT.md`).
- [VERIFIED] Authoritative V1 Scope Definition formalized (`docs/product/V1_SCOPE.md`).
- [VERIFIED] 14-Epic Backlog (`TZ-E01` to `TZ-E14`) established in `docs/development/backlog.md`.
- [VERIFIED] Architectural decisions recorded in `.ai/DECISIONS.md`:
  - ADR-0012: Branch-Scoped God Mode Dashboard for Institute Admins (superseding ADR-0005).
  - ADR-0013: Multi-Branch Hierarchy and Granular Permission-Based RBAC (evolving ADR-0010).
  - ADR-0014: Offline Fees Only with Auditable Reversals.
  - ADR-0015: Notes and Assignment Publishing Scope (Publishing Only, No Submissions).
  - ADR-0016: Dual-Channel Notifications with WhatsApp Strictly for Critical Alerts.
- [VERIFIED] Established multi-container orchestration (`docker-compose.yml`), cross-platform scripts (`scripts/run-all.*`), and standalone Android APK container builder (`dist/tutorzen.apk`, 61.14 MB).
- [VERIFIED] Implemented Identity & Authentication (`com.tutorzen.identity`) with JJWT (15m access token + 7d rotating refresh token), BCrypt passwords, stateless `SecurityFilterChain`, 401 JSON entry point, and mobile transparent 401 interceptor.
- [VERIFIED] Implemented Tenant Isolation (`TenantFilter`, `TenantContext`) derived strictly from verified JWT claims.
- [VERIFIED] Implemented Academics & Teacher Attendance (`com.tutorzen.academics`, `com.tutorzen.attendance`) with Strategy Pattern (Bulk, QR, PIN), `TeacherSessionController`, and `MarkAttendanceScreen`.
- [VERIFIED] Implemented Learning Materials (`com.tutorzen.materials`) with `V4__materials_schema.sql` and `UploadNotesScreen.tsx`.
- [VERIFIED] Implemented Student Attendance Persistence & Mobile Wiring (`TZ-E09-S02`):
  - `StudentAttendanceController.submitAttendance` validates active session code and expiry against `ClassSessionRepository`, rejects duplicates with `409 Conflict`, and persists to `AttendanceRecordRepository`.
  - `StudentAttendanceController.getStudentAttendanceSummary` dynamically aggregates attended/absent/late counts and percentages from database records.
  - `apps/mobile`: `apiClient.ts` extended with `submitStudentAttendance` and `getStudentAttendanceSummary`; wired into `StudentAttendanceEntryScreen.tsx` and `StudentAttendanceSummaryScreen.tsx`.
  - 5/5 integration tests in `StudentAttendancePersistenceTests.java` passing.
- [VERIFIED] Implemented Multi-Branch & Permissions Schema Migration (`TZ-E04-S01`):
  - `V5__branches_and_permissions.sql` forward migration: `branches`, `permissions`, `user_permissions`, `branch_assignments`, and `batches.branch_id`.
  - Entities and Repositories in `com.tutorzen.branch` and `com.tutorzen.authorization`.
  - 4/4 integration tests in `BranchAndPermissionTests.java` passing.

## Active Slices & V1 Gaps to Deliver

| Milestone / Slice | Target Epic | Owner | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Student Check-In Persistence** | `TZ-E09-S02` | DEV-A / DEV-B | `VERIFIED` | Backend persistence, duplicate prevention (`409 Conflict`), live summary calculation, and mobile client wiring complete. |
| **Multi-Branch & Permissions Schema**| `TZ-E04-S01` | DEV-A | `VERIFIED` | Migration `V5__branches_and_permissions.sql` created; JPA entities and repositories implemented; tests passing. |
| **Batch Timings & Topics** | `TZ-E07-S02` | DEV-A / DEV-B | `IN_PROGRESS` | Add `start_time`, `end_time`, `days_of_week` to batches; `topic_title`, `topic_summary` to sessions. |
| **React Navigation Multi-Stack** | `TZ-E01-S02` | DEV-B | `IN_PROGRESS` | Replace manual `useState` in `App.tsx` with native navigation stacks (`AuthStack`, `TeacherTabs`, `StudentTabs`, `AdminTabs`). |
| **Offline Fee Ledger** | `TZ-E10-S01` | DEV-A / DEV-B | `NOT_STARTED` | `fee_plans`, `student_fee_accounts`, `fee_payments` with auditable reversals (`RECORDED`, `REVERSED`). |
| **Dual Notifications & WhatsApp** | `TZ-E12-S01` | DEV-A / DEV-B | `NOT_STARTED` | In-app/push for routine notices; WhatsApp Business Cloud API for critical fee/absence alerts. |
| **Enrolled-Student Explore** | `TZ-E13-S01` | DEV-B | `NOT_STARTED` | Authenticated students explore active batches/teachers within permitted institute scope only. |
| **God Mode Dashboard** | `TZ-E06-S01` | DEV-A / DEV-B | `NOT_STARTED` | Branch-wise operational and financial KPIs for Institute Admins. |

## Verification commands

- `packages/design-tokens`: `npx tsx --test` → 12/12 test assertions passing.
- `apps/mobile`: `npm test` → 20/20 unit tests passing (`rosterUtils.test.ts`, `materials.test.ts`).
- `apps/mobile`: `npx tsc --noEmit` → 0 errors.
- `apps/backend`: `./mvnw test` → 55/55 tests passing (0 failures, 0 errors).
- Multi-container: `./scripts/run-all.sh --status` (All 3 containers healthy).
- Backend API live: `http://localhost:8080` (Spring Boot running with PostgreSQL).
- Mobile Dev Server live: `http://localhost:8081` (Expo web running).
