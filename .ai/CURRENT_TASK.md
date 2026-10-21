# Current Task: TutorZen V1 Rehaul — Phase 0 Audit & Vertical Slice Execution

## Goal

Execute the controlled rehaul of TutorZen into the approved V1 specification: multi-institute, multi-branch, permission-based RBAC, batch schedules with timing/topics, teacher live attendance, verified student check-in, offline fee ledgering, publishing-only notes/assignments with 1-level nested comments, dual-channel notifications (app + critical WhatsApp), and enrolled-student explore.

---

## Acceptance Criteria

### Phase 0: Baseline Audit & Gap Assessment (COMPLETED)

- [x] Full codebase audit executed across Spring Boot backend, Expo mobile app, Flyway migrations, and tests.
- [x] Baseline commands verified passing: 46/46 backend tests, 20/20 mobile unit tests, 0 TypeScript compile errors, 12/12 design token assertions.
- [x] Authored comprehensive audit artifact: `docs/audits/V1_REHAUL_AUDIT_REPORT.md`.
- [x] Updated authoritative scope definition in `docs/product/V1_SCOPE.md` with explicit V1 boundaries (Offline fees only, notes/assignments publishing only, critical WhatsApp only, no public marketplace).
- [x] Established 14-Epic engineering backlog (`TZ-E01` to `TZ-E14`) in `docs/development/backlog.md`.
- [x] Appended ADR-0012 to ADR-0016 in `.ai/DECISIONS.md`.
- [x] Synchronized `AGENTS.md` and `.ai/` project memory.

---

### Active Slices: Student Check-In Persistence & Multi-Branch Migration (COMPLETED)

#### Milestone 1 & 3: Student Attendance Live Verification & Persistence (`TZ-E09-S02`)
- [x] `TZ-E09-S02-T01` (DEV-A): Update `StudentAttendanceController.submitAttendance` to validate active session status, expiry, matching PIN/QR code against `ClassSessionRepository`, check student batch enrollment, prevent duplicate submissions (`409 Conflict`), and persist record to `AttendanceRecordRepository`.
- [x] `TZ-E09-S02-T02` (DEV-A): Update `StudentAttendanceController.getStudentAttendanceSummary` to calculate dynamic metrics from database records (attended/total sessions, percentage, last 10 logs).
- [x] `TZ-E09-S02-T03` (DEV-B): Wire `StudentAttendanceEntryScreen.tsx` and `StudentAttendanceSummaryScreen.tsx` to live backend APIs via `apiClient.ts`.
- [x] Integration tests in `StudentAttendancePersistenceTests.java` verifying 200 on valid check-in, 400 on invalid PIN, 409 on duplicate check-in, 410 on expired session, and 403 on cross-tenant access.

#### Milestone 2: Multi-Branch & Permissions Schema Migration (`TZ-E04-S01`)
- [x] `TZ-E04-S01-T01` (DEV-A): Create `V5__branches_and_permissions.sql` forward migration:
  - `branches` table (`id, tenant_id, name, address, phone, status, availability`).
  - Seed default branch for `tenant-default` (`branch-default-main`).
  - Add `branch_id` column to `batches` referencing `branches(id)`.
  - `permissions` and `user_permissions` tables for fine-grained moderator delegation.
  - `branch_assignments` table for multi-branch staff/teacher assignments.
- [x] JPA entities (`Branch`, `BranchAssignment`, `Permission`, `UserPermission`) and repositories implemented with 4/4 passing tests in `BranchAndPermissionTests.java`.

---

### Immediate Next Slices (NEXT UP)

#### Milestone 4: Batch Timings & Topics (`TZ-E07-S02`)
- [ ] `TZ-E07-S02-T01` (DEV-A): Create `V6__batch_timings_and_topics.sql`:
  - Add recurring weekly schedule columns to `batches` (`days_of_week` VARCHAR(50), `start_time` TIME, `end_time` TIME).
  - Add session syllabus coverage columns to `class_sessions` (`topic_title` VARCHAR(255), `topic_summary` TEXT).
- [ ] `TZ-E07-S02-T02` (DEV-A): Update `Batch` and `ClassSession` domain models, repository queries, and service endpoints.
- [ ] `TZ-E07-S02-T03` (DEV-B): Display batch weekly timings and session topic coverage in mobile class session cards.

#### Milestone 5: React Navigation Multi-Stack Installation (`TZ-E01-S02`)
- [ ] Install `@react-navigation/native`, `@react-navigation/stack`, `@react-navigation/bottom-tabs`, `react-native-screens`, `react-native-safe-area-context` in `apps/mobile`.
- [ ] Configure role-based navigators (`AuthNavigator`, `TeacherNavigator`, `StudentNavigator`, `AdminNavigator`) replacing manual `useState` in `App.tsx`.

