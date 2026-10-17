# Implementation Roadmap

> Dependency-ordered plan from current prototype state to V1. Each phase defines what it produces, what it depends on, and how to verify it.
> 
> This document is a planning guide, not a commit log. Update `.ai/PROJECT_STATE.md` as phases are completed; do not edit this roadmap to claim completion.

Last updated: 2026-10-18  
Current state: **Prototype** — all business data is hardcoded or in-memory.  
V1 gate definition: `docs/product/V1_SCOPE.md`

---

## Phase 0 — Prerequisites (DONE)

| Deliverable | Evidence |
|-------------|---------|
| Monorepo workspace (`pnpm-workspace.yaml`) | Exists |
| Design tokens package (`@tutorzen/design-tokens`) | 6 tests passing |
| Spring Boot 3.4.3 skeleton | 24 tests passing (mock logic) |
| Expo + React Native app shell | Typecheck passing |
| Docker Compose for PostgreSQL | `infrastructure/docker/docker-compose.yml` exists |
| AI project memory (`.ai/`) | AGENTS.md, CLAUDE.md, `.ai/*.md` |

---

## Phase 1 — Authentication Foundation ⬅ ACTIVE

**Depends on:** Phase 0

**Goal:** Establish secure sign-in so every subsequent feature can be protected.

### Backend tasks

- [ ] **B1.1** Create `V2__identity_schema.sql` Flyway migration: `users (id, tenant_id, email, role, created_at)` and `user_credentials (user_id, password_hash, updated_at)`.
- [ ] **B1.2** Create `identity` module: `User` entity, `UserCredentialRepository`, `UserRepository`.
- [ ] **B1.3** Implement `POST /api/v1/auth/sign-in` — validates credentials, issues JWT (access token, ~1h; refresh strategy to be decided via ADR).
- [ ] **B1.4** Configure `SecurityFilterChain`: stateless, JWT filter on all routes except `/api/v1/auth/**`.
- [ ] **B1.5** Update `TenantFilter` to extract `tenantId` from JWT claims, not from `X-Tenant-ID` header.
- [ ] **B1.6** Seed at least one test tenant and teacher user via `V2_*` migration or `data.sql` for dev.
- [ ] **B1.7** Integration tests: 401 on missing token, 401 on expired token, 200 on valid sign-in, tenant isolation via JWT.

### Verification gate

```bash
cd apps/backend && ./mvnw test
# All new tests must pass; no regressions in existing 24.
curl -X POST http://localhost:8080/api/v1/teacher/sessions  # → 401 Unauthorized (no token)
curl -X POST http://localhost:8080/api/v1/auth/sign-in -d '{"email":"teacher@demo.com","password":"..."}' # → JWT
```

---

## Phase 2 — Academics Foundation

**Depends on:** Phase 1 (must have tenant + user identity before associating sessions)

**Goal:** Establish minimal academic structure so teacher can own and create real class sessions.

### Backend tasks

- [ ] **B2.1** `V3__academics_schema.sql`: `subjects (id, tenant_id, name)`, `batches (id, tenant_id, name, subject_id)`, `class_sessions (id, tenant_id, batch_id, teacher_id, scheduled_at, status, session_code, qr_token, expires_at)`.
- [ ] **B2.2** `academics` module: entities, repositories, minimal seeding.
- [ ] **B2.3** `POST /api/v1/teacher/sessions` → creates a real `class_sessions` row (replaces current hardcoded mock).
- [ ] **B2.4** `GET /api/v1/teacher/sessions/active` → reads from DB.
- [ ] **B2.5** Session code/QR generation tied to `class_sessions.expires_at` (tenant-configurable via ADR-0004).
- [ ] **B2.6** Integration tests covering session creation, expiry, and tenant isolation.

---

## Phase 3 — Real Attendance Persistence

**Depends on:** Phase 2 (needs real session IDs to reference)

**Goal:** Replace hardcoded attendance logic with real DB reads/writes.

### Backend tasks

- [ ] **B3.1** `V4__students_schema.sql`: `students (id, tenant_id, user_id, name, enrollment_no)`.
- [ ] **B3.2** `students` module: entity, repository.
- [ ] **B3.3** `POST /api/v1/students/attendance/submit` → validates code/QR against `class_sessions`, writes `attendance_records` row (replaces in-memory mock).
- [ ] **B3.4** `GET /api/v1/students/{studentId}/attendance/summary` → reads from `attendance_records` (replaces hardcoded 92%).
- [ ] **B3.5** Fix `attendancesync` boundary violation: replace direct `AttendanceRecord` import with a public port interface.
- [ ] **B3.6** Integration tests for attendance submission: valid code, expired code, duplicate submission (idempotency).

---

## Phase 4 — Mobile Authentication + Navigation

**Depends on:** Phase 1 backend (needs a real sign-in endpoint)

**Goal:** Replace manual `useState` routing with React Navigation and add a real auth flow.

### Mobile tasks

- [ ] **M4.1** Install `@react-navigation/native`, `@react-navigation/stack`, `@react-navigation/bottom-tabs`, and Expo dependencies.
- [ ] **M4.2** Create `AppNavigator`: unauthenticated stack (`AuthScreen`) and authenticated stack (Teacher tab + Student tab).
- [ ] **M4.3** Implement `AuthScreen`: email + password form, calls `POST /api/v1/auth/sign-in`, stores JWT in `expo-secure-store`.
- [ ] **M4.4** Implement `ApiClient`: Axios/Fetch wrapper that injects `Authorization: Bearer` from stored token; handles 401 by redirecting to `AuthScreen`.
- [ ] **M4.5** Remove `RoleSwitcherPill` from `App.tsx` (roles must be derived from JWT, not toggled manually).
- [ ] **M4.6** Typecheck must pass (`npx tsc --noEmit`).

---

## Phase 5 — Wire Mobile to Real APIs

**Depends on:** Phase 3 + Phase 4 (real endpoints + navigation)

**Goal:** Replace all hardcoded mock data in mobile screens with real API calls.

### Mobile tasks

- [ ] **M5.1** `TeacherHomeScreen`: fetch active sessions from `GET /api/v1/teacher/sessions/active`.
- [ ] **M5.2** `MarkAttendanceScreen`: session code and QR from DB session; refresh uses real session data.
- [ ] **M5.3** `StudentAttendanceEntryScreen`: submit to real `POST /api/v1/students/attendance/submit`.
- [ ] **M5.4** `StudentAttendanceSummaryScreen`: load from real `GET /api/v1/students/{id}/attendance/summary`.
- [ ] **M5.5** Show loading states, error states, and empty states for all async operations.
- [ ] **M5.6** Remove all hardcoded mock data from screen components.

---

## Phase 6 — V1 Gate Verification

**Depends on:** Phases 1–5

**Goal:** Verify all V1 gate criteria from `docs/product/V1_SCOPE.md` before any deployment.

- [ ] Run backend test suite with no regressions.
- [ ] Run mobile typecheck with 0 errors.
- [ ] Manually trace both teacher and student journeys end-to-end against the real backend with PostgreSQL.
- [ ] Confirm no hardcoded credentials or JWT secrets in source.
- [ ] Confirm all endpoints return 401 without a valid token.
- [ ] Tag the V1 release commit.
- [ ] Update `PROJECT_STATE.md` with verified evidence (commands run + results).

---

## Post-V1 backlog (do not implement until V1 gate is closed)

| Feature | Phase |
|---------|-------|
| Guardian/Parent flow (Screens 10, 11) | Post-V1 |
| Offline sync queue (SQLite/WatermelonDB) | Post-V1 |
| Push notifications | Post-V1 |
| Fees module | Post-V1 |
| Learning materials | Post-V1 |
| Assignments | Post-V1 |
| Assessments | Post-V1 |
| Reports and exports | Post-V1 |
| Coaching Admin onboarding UI | Post-V1 |
| OCI production deployment | Parallel to V1 gate |

---

## Open questions requiring owner decisions

1. **JWT refresh strategy:** Short-lived access token + refresh token, or single long-lived token? Decision affects B1.3.
2. **Role model:** Flat role enum per user (`TEACHER`, `STUDENT`, `ADMIN`), or a separate permissions table? Decision affects identity module design and mobile navigation guards.
3. **Session code rotation:** Is the current "regenerate on demand" design sufficient, or must codes rotate automatically every N minutes independently? (Affects B2.5.)
4. **Test data seeding:** Dev seed via `V2_*` migration, a separate `seed.sql`, or an admin API endpoint? Affects how quickly the team can test locally.

