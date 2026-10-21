# TutorZen V1 Rehaul — Authoritative Engineering Backlog

> **Document:** `docs/development/backlog.md`  
> **Status:** Active Execution Backlog (Phase 0 Baseline to V1 Release)  
> **Hierarchy Format:** Epic (`TZ-E01`) $\longrightarrow$ Story (`TZ-E01-S01`) $\longrightarrow$ Task (`TZ-E01-S01-T01`)  
> **Statuses:** `NOT_STARTED`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `BLOCKED`  
> **Developer Split:** `DEV-A` (Backend / Systems Lead) & `DEV-B` (Mobile / UX Lead), `SHARED` (Integration)  
> **Last Updated:** October 22, 2026  

---

## 1. Backlog Summary & Epic Index

| Epic ID | Epic Title | Milestone | Owner | Status | Total SP | Completed SP |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **`TZ-E01`** | **Repository Audit & AI Development Workflow** | Milestone 1 | SHARED | `DONE` | 5 | 5 |
| **`TZ-E02`** | **Authentication, Multi-Tenancy & Security** | Milestone 1 | DEV-A | `DONE` | 13 | 13 |
| **`TZ-E03`** | **Institute Onboarding & Lifecycle** | Milestone 2 | DEV-A | `NOT_STARTED` | 8 | 0 |
| **`TZ-E04`** | **Branch Administration & Multi-Branch Hierarchy** | Milestone 2 | DEV-A | `NOT_STARTED` | 10 | 0 |
| **`TZ-E05`** | **Moderator, Staff & Teacher Lifecycle** | Milestone 2 | SHARED | `NOT_STARTED` | 10 | 0 |
| **`TZ-E06`** | **God Mode Dashboard & Branch Analytics** | Milestone 5 | SHARED | `NOT_STARTED` | 12 | 0 |
| **`TZ-E07`** | **Academic Structure, Batches & Scheduling** | Milestone 3 | SHARED | `IN_PROGRESS`| 13 | 5 |
| **`TZ-E08`** | **Student Profile & Enrollment Lifecycle** | Milestone 3 | SHARED | `NOT_STARTED` | 10 | 0 |
| **`TZ-E09`** | **Attendance Management (Teacher & Student)** | Milestone 3 | SHARED | `IN_PROGRESS`| 16 | 13 |
| **`TZ-E10`** | **Offline Fees Management & Ledger (No Gateway)** | Milestone 4 | DEV-A | `NOT_STARTED` | 14 | 0 |
| **`TZ-E11`** | **Notes & Assignment Publishing (Publishing Only)** | Milestone 4 | SHARED | `IN_PROGRESS`| 12 | 10 |
| **`TZ-E12`** | **Announcements & Notifications (App + Critical WhatsApp)**| Milestone 4 | SHARED | `NOT_STARTED` | 14 | 0 |
| **`TZ-E13`** | **Enrolled-Student Explore (Restricted Scope)** | Milestone 5 | DEV-B | `NOT_STARTED` | 8 | 0 |
| **`TZ-E14`** | **Security, Quality & V1 Release Readiness** | Milestone 5 | SHARED | `IN_PROGRESS`| 8 | 3 |
| **TOTAL** | **Comprehensive V1 Rehaul Scope** | **V1 Release** | | **32% DONE** | **163 SP** | **49 SP** |

---

## 2. Team Workstream & Assignment Protocol

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        TUTORZEN TWO-DEVELOPER SPLIT                    │
├──────────────────────────────────┬─────────────────────────────────────┤
│  DEV-A (Backend / Systems Lead)  │  DEV-B (Mobile / UX Lead)           │
│  - Identity & Security Filter    │  - React Navigation Multi-Stack     │
│  - Multi-Branch Schema & Tenancy │  - Role-Aware Workspaces            │
│  - Financial Ledger & Receipts   │  - Attendance Entry & Live Counters │
│  - WhatsApp Cloud API Dispatcher │  - Notes & Notice Boards            │
│  - Audit Logging & Aggregations  │  - Enrolled Explore UI              │
└──────────────────────────────────┴─────────────────────────────────────┘
```

---

## 3. Detailed 14-Epic Backlog Catalog

---

### Epic TZ-E01: Repository Audit & AI Development Workflow
- **Parent Epic:** `TZ-E01` | **Status:** `DONE` | **Owner:** `SHARED` | **Estimate:** 5 SP
- **Summary:** Complete code/test audit, project memory synchronization (`AGENTS.md`, `.ai/`), and baseline test verification.

#### Story TZ-E01-S01: Baseline Audit & Gap Assessment
- **Status:** `DONE` | **Owner:** `SHARED` (5 SP)
- **Task `TZ-E01-S01-T01` (DONE, P0, SHARED):** Execute full codebase audit covering Java 21 Spring Boot backend, Expo mobile app, Flyway migrations, and test suites. Authored `docs/audits/V1_REHAUL_AUDIT_REPORT.md`. Evidence: 46/46 backend tests passing, 20/20 mobile unit tests passing, 0 TypeScript compile errors.

---

### Epic TZ-E02: Authentication, Multi-Tenancy & Security
- **Parent Epic:** `TZ-E02` | **Status:** `DONE` | **Owner:** `DEV-A` | **Estimate:** 13 SP
- **Summary:** Bank-grade stateless JWT authentication, rotating refresh tokens (7d), BCrypt credentials, and strict tenant isolation from JWT claims (ADR-0008, ADR-0009).

#### Story TZ-E02-S01: Stateless JWT Authentication & Refresh Rotation
- **Status:** `DONE` | **Owner:** `DEV-A` (8 SP)
- **Task `TZ-E02-S01-T01` (DONE, P0, DEV-A):** Create `V2__identity_schema.sql` (`users`, `user_credentials`, `refresh_tokens`). Implement `POST /api/v1/auth/sign-in`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/sign-out`. Evidence: 34 backend security tests passing.

#### Story TZ-E02-S02: Tenant Isolation Filter
- **Status:** `DONE` | **Owner:** `DEV-A` (5 SP)
- **Task `TZ-E02-S02-T01` (DONE, P0, DEV-A):** Implement `TenantFilter` extracting `tenant_id` claim strictly from validated JWTs; reject unauthenticated header spoofing. Evidence: 4 passing tenancy integration tests.

---

### Epic TZ-E03: Institute Onboarding & Lifecycle
- **Parent Epic:** `TZ-E03` | **Status:** `NOT_STARTED` | **Owner:** `DEV-A` | **Estimate:** 8 SP
- **Summary:** Platform Admin institute onboarding, initial Institute Admin invitation, and institute lifecycle (`PENDING_SETUP`, `ACTIVE`, `SUSPENDED`, `DEACTIVATED`).

#### Story TZ-E03-S01: Institute Lifecycle & Onboarding API
- **Status:** `NOT_STARTED` | **Owner:** `DEV-A` (5 SP)
- **Task `TZ-E03-S01-T01` (NOT_STARTED, P0, DEV-A):**
  - **Dependencies:** `TZ-E02`
  - **User Outcome:** Platform Admin can register an institute and invite its first Institute Admin.
  - **Acceptance Criteria:**  
    *Given* a Platform Admin token, *when* calling `POST /api/v1/platform/institutes` with institute name, slug, and admin email, *then* an institute record is created in status `ACTIVE`, an Institute Admin account is generated, and a secure invite link is issued.
  - **API / Data:** `institutes` table (evolved from `tenants`), columns: `id, slug, name, legal_name, contact_email, status, created_at, updated_at`.
  - **Auth:** Requires authority `PLATFORM_MANAGE`.
  - **Tests:** Integration test verifying institute creation and cross-institute isolation.

---

### Epic TZ-E04: Branch Administration & Multi-Branch Hierarchy
- **Parent Epic:** `TZ-E04` | **Status:** `NOT_STARTED` | **Owner:** `DEV-A` | **Estimate:** 10 SP
- **Summary:** Multi-branch hierarchy per institute, separate physical addresses, branch activation/deactivation, and branch-level data scoping (ADR-0013).

#### Story TZ-E04-S01: Branch Data Model & Administration Endpoints
- **Status:** `NOT_STARTED` | **Owner:** `DEV-A` (6 SP)
- **Task `TZ-E04-S01-T01` (NOT_STARTED, P0, DEV-A):**
  - **Dependencies:** `TZ-E03`
  - **User Outcome:** Institute Admin can add branches to their coaching institute and manage branch availability.
  - **Acceptance Criteria:**  
    *Given* an Institute Admin, *when* calling `POST /api/v1/branches`, *then* a branch row is created linked to `tenant_id` with status `ACTIVE`. Inactive branches reject new enrollments.
  - **API / Data:** `V5__branches_and_permissions.sql`: `branches (id, tenant_id, name, address, phone, status, availability, created_at)`.
  - **Auth:** Requires authority `BRANCH_MANAGE`.
  - **Tests:** Verify branch creation, listing, and state toggle (`ACTIVE` $\leftrightarrow$ `INACTIVE`).

---

### Epic TZ-E05: Moderator, Staff & Teacher Lifecycle
- **Parent Epic:** `TZ-E05` | **Status:** `NOT_STARTED` | **Owner:** `SHARED` | **Estimate:** 10 SP
- **Summary:** Create, invite, assign multiple branches, delegate moderator permissions, manage teacher lifecycles, and preserve historical records upon deactivation.

#### Story TZ-E05-S01: Delegated Moderator Permissions & Branch Assignment
- **Status:** `NOT_STARTED` | **Owner:** `DEV-A` (6 SP)
- **Task `TZ-E05-S01-T01` (NOT_STARTED, P0, DEV-A):**
  - **Dependencies:** `TZ-E04`
  - **User Outcome:** Institute Admin delegates specific permissions to Moderators scoped to selected branches.
  - **Acceptance Criteria:**  
    *Given* a Moderator assigned to Branch A with `ATTENDANCE_MANAGE`, *when* attempting attendance edits on Branch A, *then* access is granted. When attempting access on Branch B, access is rejected with `403 Forbidden`.
  - **API / Data:** `branch_assignments (id, tenant_id, user_id, branch_id, role)`, `user_permissions (user_id, permission_key, branch_id)`.
  - **Tests:** Test permissions matrix: allowed branch, disallowed branch, revoked permission.

---

### Epic TZ-E06: God Mode Dashboard & Branch Analytics
- **Parent Epic:** `TZ-E06` | **Status:** `NOT_STARTED` | **Owner:** `SHARED` | **Estimate:** 12 SP
- **Summary:** Branch-wise God Mode dashboard with fees billed/collected/outstanding, teachers, students, sessions, batches, attendance summaries, date filters, and independent financial permissions (ADR-0012).

#### Story TZ-E06-S01: Branch-Wise Metrics Aggregation Engine
- **Status:** `NOT_STARTED` | **Owner:** `DEV-A` (6 SP)
- **Task `TZ-E06-S01-T01` (NOT_STARTED, P1, DEV-A):**
  - **Dependencies:** `TZ-E04`, `TZ-E09`, `TZ-E10`
  - **User Outcome:** Institute Admin views reconciled operational and financial metrics per branch.
  - **Acceptance Criteria:**  
    *Given* a user with `DASHBOARD_VIEW`, *when* querying `GET /api/v1/dashboard/branches/{branchId}`, *then* operational counts (students, teachers, active batches, attendance %) are returned. If the user lacks `DASHBOARD_FEES_VIEW`, fee metrics are omitted.
  - **Auth:** Independent evaluation of `DASHBOARD_VIEW` and `DASHBOARD_FEES_VIEW`.

#### Story TZ-E06-S02: Mobile & Web God Mode Dashboard UI
- **Status:** `NOT_STARTED` | **Owner:** `DEV-B` (6 SP)
- **Task `TZ-E06-S02-T01` (NOT_STARTED, P1, DEV-B):**
  - **User Outcome:** Visual Claymorphic dashboard with branch switcher dropdown, date filter chips, and KPI metric cards.

---

### Epic TZ-E07: Academic Structure, Batches & Scheduling
- **Parent Epic:** `TZ-E07` | **Status:** `IN_PROGRESS` | **Owner:** `SHARED` | **Estimate:** 13 SP
- **Summary:** Academic hierarchy (Subjects, Batches, Class Sessions), batch schedules, timings, days of week, and topic/syllabus tracking.

#### Story TZ-E07-S01: Academic Foundation (V3 Schema)
- **Status:** `DONE` | **Owner:** `DEV-A` (5 SP)
- **Task `TZ-E07-S01-T01` (DONE, P0, DEV-A):** `V3__academics_schema.sql` creating `subjects`, `batches`, `students`, `batch_enrollments`, and `class_sessions`. 6 passing tests.

#### Story TZ-E07-S02: Batch Timings & Topic Tracking Engine
- **Status:** `NOT_STARTED` | **Owner:** `SHARED` (8 SP)
- **Task `TZ-E07-S02-T01` (NOT_STARTED, P0, DEV-A):** Add `start_time`, `end_time`, `days_of_week` to `batches`; add `topic_title`, `topic_summary` to `class_sessions`. Expose `POST /api/v1/teacher/sessions/{id}/topic`.
- **Task `TZ-E07-S02-T02` (NOT_STARTED, P0, DEV-B):** Mobile UI displaying timing chips and teacher "Edit Topic" modal.

---

### Epic TZ-E08: Student Profile & Enrollment Lifecycle
- **Parent Epic:** `TZ-E08` | **Status:** `NOT_STARTED` | **Owner:** `SHARED` | **Estimate:** 10 SP
- **Summary:** Separate student identity from enrollment, multi-branch student membership, batch enrollment lifecycle (`PENDING`, `ACTIVE`, `COMPLETED`, `WITHDRAWN`), and batch transfers with history preservation.

#### Story TZ-E08-S01: Enrollment Lifecycle & Transfer Service
- **Status:** `NOT_STARTED` | **Owner:** `DEV-A` (6 SP)
- **Task `TZ-E08-S01-T01` (NOT_STARTED, P0, DEV-A):** Implement student enrollment state machine and transfer API (`POST /api/v1/students/{id}/transfer-batch`). Previous enrollment marked `WITHDRAWN` with timestamp; prior attendance preserved.

---

### Epic TZ-E09: Attendance Management (Teacher & Student)
- **Parent Epic:** `TZ-E09` | **Status:** `IN_PROGRESS` | **Owner:** `SHARED` | **Estimate:** 16 SP
- **Summary:** Teacher roster marking (Bulk, QR, PIN), student self check-in via 6-digit PIN/QR, duplicate check-in defense (409), auditable corrections, and live summary statistics.

#### Story TZ-E09-S01: Teacher Live Attendance Flow
- **Status:** `DONE` | **Owner:** `SHARED` (13 SP)
- **Task `TZ-E09-S01-T01` (DONE, P0, DEV-A):** Strategy Pattern implementation (Bulk, QR, PIN) and `POST /roster/submit` persistence.
- **Task `TZ-E09-S01-T02` (DONE, P0, DEV-B):** `MarkAttendanceScreen.tsx` with live roster toggle state machine.

#### Story TZ-E09-S02: Student Verified Check-In & Summary Persistence (Sprint 1 Active)
- **Status:** `IN_PROGRESS` | **Owner:** `SHARED` (8 SP)
- **Task `TZ-E09-S02-T01` (IN_PROGRESS, P0, DEV-A):** Implement `POST /api/v1/students/attendance/submit` with active session verification, PIN/QR match, expiry check, enrollment check, and duplicate submission guard (`409 Conflict`). Save to `AttendanceRecordRepository`.
- **Task `TZ-E09-S02-T02` (NOT_STARTED, P0, DEV-A):** Implement live aggregation for `GET /api/v1/students/{id}/attendance/summary`.
- **Task `TZ-E09-S02-T03` (NOT_STARTED, P0, DEV-B):** Wire `StudentAttendanceEntryScreen.tsx` and `StudentAttendanceSummaryScreen.tsx` to live backend API.

---

### Epic TZ-E10: Offline Fees Management & Ledger (No Gateway)
- **Parent Epic:** `TZ-E10` | **Status:** `NOT_STARTED` | **Owner:** `DEV-A` | **Estimate:** 14 SP
- **Summary:** Configure fee obligations, record offline payments (Cash, UPI, Cheque, Bank Transfer), partial payments, immutable ledger, auditable reversals, and receipt generation. **No online payment gateway in V1.**

#### Story TZ-E10-S01: Offline Fee Ledger & Auditable Reversals
- **Status:** `NOT_STARTED` | **Owner:** `DEV-A` (8 SP)
- **Task `TZ-E10-S01-T01` (NOT_STARTED, P0, DEV-A):**
  - **Dependencies:** `TZ-E04`, `TZ-E08`
  - **Acceptance Criteria:**  
    *Given* a student with fee balance ₹10,000, *when* recording offline cash payment of ₹4,000, *then* a receipt is generated, `paid_amount` becomes ₹4,000, `balance_due` becomes ₹6,000, and status becomes `PARTIAL`. Reversing a payment creates an auditable compensating transaction; no row deletion.
  - **API / Data:** `fee_plans`, `student_fee_accounts`, `fee_payments` with `status: 'RECORDED' | 'REVERSED'`.
  - **Auth:** Requires `FEES_MANAGE`.

#### Story TZ-E10-S02: Mobile Fee Management & Student Receipt UI
- **Status:** `NOT_STARTED` | **Owner:** `DEV-B` (6 SP)
- **Task `TZ-E10-S02-T01` (NOT_STARTED, P0, DEV-B):** Teacher payment entry modal and student fee balance/receipt board.

---

### Epic TZ-E11: Notes & Assignment Publishing (Publishing Only)
- **Parent Epic:** `TZ-E11` | **Status:** `IN_PROGRESS` | **Owner:** `SHARED` | **Estimate:** 12 SP
- **Summary:** Create drafts, publish notes and assignments with deadlines, target eligible batches, student board. **No student submissions or grading in V1.** (ADR-0015). Includes 1-level nested discussion comments.

#### Story TZ-E11-S01: Learning Materials Metadata & Upload (V4)
- **Status:** `DONE` | **Owner:** `SHARED` (10 SP)
- **Task `TZ-E11-S01-T01` (DONE, P0, DEV-A):** `V4__materials_schema.sql` and `TeacherMaterialsController`.
- **Task `TZ-E11-S01-T02` (DONE, P0, DEV-B):** `UploadNotesScreen.tsx` with Claymorphic dropzone and field validation.

#### Story TZ-E11-S02: 1-Level Nested Discussion Comments
- **Status:** `NOT_STARTED` | **Owner:** `SHARED` (6 SP)
- **Task `TZ-E11-S02-T01` (NOT_STARTED, P1, DEV-A):** `comments` table with `parent_id`. Backend rejects nesting beyond 1 level with `400 Bad Request`.
- **Task `TZ-E11-S02-T02` (NOT_STARTED, P1, DEV-B):** Discussion thread UI on notes screen with indented reply cards.

---

### Epic TZ-E12: Announcements & Notifications (App + Critical WhatsApp)
- **Parent Epic:** `TZ-E12` | **Status:** `NOT_STARTED` | **Owner:** `SHARED` | **Estimate:** 14 SP
- **Summary:** Announcements targeting branches/batches. Shared notification subsystem (In-App/Push by default; **WhatsApp strictly for critical alerts: fee reminders, urgent schedule changes**). (ADR-0016).

#### Story TZ-E12-S01: Dual-Channel Notification Dispatcher
- **Status:** `NOT_STARTED` | **Owner:** `DEV-A` (8 SP)
- **Task `TZ-E12-S01-T01` (NOT_STARTED, P0, DEV-A):**
  - **Dependencies:** `TZ-E09`, `TZ-E10`
  - **User Outcome:** Automated dispatch of Expo In-App push notifications for general updates, and WhatsApp Cloud API messages for critical fee reminders and absent alerts.
  - **Technical Details:** `WhatsAppDispatchService` with mock mode (`tutorzen.whatsapp.mock-mode=true`) logging to `whatsapp_outbox` table. Retryable failure tracking.

#### Story TZ-E12-S02: Student Notice Board & Notification Center
- **Status:** `NOT_STARTED` | **Owner:** `DEV-B` (6 SP)
- **Task `TZ-E12-S02-T01` (NOT_STARTED, P1, DEV-B):** Notice board screen displaying published announcements and notification drawer.

---

### Epic TZ-E13: Enrolled-Student Explore (Restricted Scope)
- **Parent Epic:** `TZ-E13` | **Status:** `NOT_STARTED` | **Owner:** `DEV-B` | **Estimate:** 8 SP
- **Summary:** Explore other eligible batches and teacher profiles strictly within the student's permitted institute scope. **No public marketplace or anonymous discovery.**

#### Story TZ-E13-S01: Scoped Explore Screen
- **Status:** `NOT_STARTED` | **Owner:** `DEV-B` (8 SP)
- **Task `TZ-E13-S01-T01` (NOT_STARTED, P1, DEV-B):** Authenticated students view other active batches and teacher profiles in their institute with enrollment eligibility badges. Private data and fees concealed.

---

### Epic TZ-E14: Security, Quality & V1 Release Readiness
- **Parent Epic:** `TZ-E14` | **Status:** `IN_PROGRESS` | **Owner:** `SHARED` | **Estimate:** 8 SP
- **Summary:** Cross-cutting authorization tests, multi-container Docker compose orchestration, standalone APK compilation, and V1 release verification.

#### Story TZ-E14-S01: Containerization & DevOps Runners
- **Status:** `DONE` | **Owner:** `SHARED` (5 SP)
- **Task `TZ-E14-S01-T01` (DONE, P0, SHARED):** Multi-stage Dockerfiles, `docker-compose.yml`, cross-platform runner scripts (`run-all.sh`, `.bat`, `.ps1`), standalone APK builder. Verified running on ports 5432, 8080, 8081; release APK 61.14 MB.

#### Story TZ-E14-S02: V1 End-to-End Verification & Gate Tagging
- **Status:** `NOT_STARTED` | **Owner:** `SHARED` (5 SP)
- **Task `TZ-E14-S02-T01` (NOT_STARTED, P0, SHARED):** Full automated test run across backend, mobile, and tokens; live Docker end-to-end journey verification; tag release commit `v1.0.0-rc1`.

