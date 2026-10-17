# AGENTS.md — TutorZen Repository Rules & AI Operating System

## 1. Required Context Recovery

Before changing code, every AI agent must execute this recovery sequence:
1. Read this file (`AGENTS.md`).
2. Read `.ai/RETRIEVAL_GUIDE.md` for navigation rules across project memory.
3. Read `.ai/PROJECT_CONTEXT.md`, `.ai/PROJECT_STATE.md`, `.ai/CURRENT_TASK.md`, and the relevant sections of `.ai/ARCHITECTURE.md`.
4. Read relevant entries in `.ai/DECISIONS.md` and feature specifications.
5. **Inspect the actual code, tests, configuration, database migrations, and dependency versions.**

> **CRITICAL RULE:** Documentation is not proof that a feature exists. Inspect the code directly. Never skip step 5. Load only relevant detailed references; do not dump every document into every task.

---

## 2. Repository Layout

```text
apps/
  backend/             # Spring Boot 3.4.3, Java 21, PostgreSQL + Flyway
  mobile/              # React Native + TypeScript + Expo (managed workflow)
packages/
  design-tokens/       # Shared design token package (@tutorzen/design-tokens)
docs/
  architecture/        # MODULE_BOUNDARIES.md — package decomposition
  design-system/       # DESIGN_SYSTEM.md — typography, tokens, Claymorphism rules
  ux/                  # MOBILE_FLOWS.md — concept screen inventory
  product/             # V1_SCOPE.md — authoritative V1 boundary gate definition
  roadmap/             # IMPLEMENTATION_ROADMAP.md — dependency-ordered phase plan
  audits/              # Audit reports
infrastructure/
  docker/              # docker-compose.yml — local PostgreSQL database
.ai/                   # Project memory (context, state, decisions, events, architecture)
templates/             # ADR, feature spec, event log templates
```

---

## 3. Current Implementation Reality

Always verify actual status against [`.ai/PROJECT_STATE.md`](file:///.ai/PROJECT_STATE.md) before starting any task. Do not treat prototype code as production-ready.

| Layer / Area | Current Status | Notes |
| :--- | :--- | :--- |
| **Authentication & Security** | **Implemented** | Spring Security `SecurityFilterChain`, stateless JWT (15m expiry), rotating refresh token (7d), BCrypt passwords, and 401 JSON entry point. |
| **Tenant Isolation** | **Implemented** | `TenantFilter` derives tenant context strictly from verified JWT claims; unauthenticated `X-Tenant-ID` header spoofing is rejected. |
| **Database Migrations** | **`V1` + `V2` Applied** | `tenants`, `attendance_records`, `users`, `user_credentials`, `refresh_tokens`. Seed demo accounts exist. |
| **Sessions & Attendance DB** | **Prototype / Mock** | Endpoints exist (`TeacherSessionController`, `StudentAttendanceController`) but return mock data; real persistence pending (`V3` + `V4`). |
| **Offline Attendance Sync** | **In-Memory** | `AttendanceSyncService` uses `ConcurrentHashMap`; data is lost on restart. |
| **Mobile Navigation** | **Prototype / Manual** | Uses manual `useState` screen switching in `App.tsx`. React Navigation library is NOT yet installed. |
| **Mobile Authentication** | **Prototype / Unwired** | Screens exist; not yet connected to backend `POST /api/v1/auth/sign-in` or secure token storage. |
| **Mobile Screens** | **Prototype** | TeacherHomeScreen, MarkAttendanceScreen, StudentHomeScreen, StudentAttendanceEntryScreen, StudentAttendanceSummaryScreen. |

---

## 4. Scope and Safety

- Implement the smallest coherent change that meets the acceptance criteria.
- Do not silently invent business rules, permissions, tenant behavior, or data-retention requirements.
- Ask a concise question when a missing business decision materially affects correctness or security; otherwise state a conservative assumption in the task plan.
- Do not perform unrelated refactors, broad formatting changes, or dependency upgrades.
- Do not add dependencies, change the architecture, or alter public contracts without explaining the reason and following the user's approval requirements.
- Never claim tests, builds, migrations, or manual checks passed unless they were actually run.
- Never expose secrets, credentials, personal data, or tenant data in logs, fixtures, screenshots, or docs.

---

## 5. Architecture Boundaries

- Prefer a modular monolith unless a concrete requirement justifies distributed services.
- Organize backend code by business feature/module, not only by technical layer.
- Keep transport controllers thin; business decisions belong in application/domain services.
- Keep persistence and framework concerns behind module-owned interfaces where useful.
- Avoid circular dependencies and cross-module access to another module's internal persistence model.
- Share code only when it has a clear owner and more than one legitimate consumer.
- Make cross-module communication explicit through application interfaces, events, or versioned contracts.
- Enforce tenant isolation and authorization on the server, not only in the client.
- Use database constraints and transactions to protect invariants where appropriate.
- Treat auditability, idempotency, retry behavior, and time zones as explicit design concerns.

---

## 6. Domain Constraints to Preserve

- **Attendance Strategy Pattern:** Attendance marking uses a Strategy Pattern for supported marking methods: bulk, QR, and six-digit code (ADR-0002).
- **Independent Offline Sync:** Offline attendance synchronization is a separate component from attendance marking (ADR-0003).
- **Tenant-Configurable Policy:** QR and six-digit-code validity, and supported attendance policies, are tenant-configurable (ADR-0004).
- **Offline Sync Resilience:** Offline synchronization must consider retries, idempotency, duplicate submissions, stale sessions, conflicts, and audit history.
- **God View Deferred:** Platform Super Admin / global “God View” UI is deferred (ADR-0005). Preserve foundations for tenant isolation, RBAC, policy enforcement, and auditing without implementing the deferred interface.
- **V1 Scope Boundary:** V1 gate must be respected (ADR-0007). Do not implement deferred modules (fees, materials, reports, parent flow) before closing the V1 gate.
- **JWT & Role Invariants:** Short-lived access tokens (15m) + 7-day rotating refresh tokens (ADR-0009); flat enum roles (`TEACHER`, `STUDENT`, `ADMIN`) in `users` table (ADR-0010).

---

## 7. UX and Design-System Rules

- Follow `docs/design-system/DESIGN_SYSTEM.md` and its tokens.
- Use EB Garamond for prominent headings and Barlow for functional UI unless an approved design decision says otherwise.
- Use Claymorphism selectively: tactile surfaces, rounded corners, subtle highlights, and restrained shadows.
- Prioritize readability, contrast, keyboard/screen-reader support, responsive layouts, and clear loading/error/empty states over visual effects.
- Avoid low-contrast text, shadow-heavy controls, excessive nesting, ornamental cards around every element, and tiny touch targets.
- Reuse shared tokens/components from `@tutorzen/design-tokens`; do not hardcode one-off colors, radii, or shadow recipes without justification.
- Keep student, parent, teacher, and coaching-admin navigation and permissions distinct.

---

## 8. Verification Commands

Always run these commands to verify changes. Never state that a check passed without executing it:

```bash
# Backend test suite (unit + integration tests)
cd apps/backend && ./mvnw test

# Mobile typecheck
cd apps/mobile && npx tsc --noEmit

# Shared design token package unit tests
cd packages/design-tokens && npx tsx --test

# Local PostgreSQL container management
cd infrastructure/docker && docker-compose up -d

# Start Expo dev server (web preview)
cd apps/mobile && npx expo start --web
```

---

## 9. Key Files for Common Tasks

| Task Category | Primary Files to Consult |
| :--- | :--- |
| **Adding a Backend Feature** | `.ai/ARCHITECTURE.md`, `docs/architecture/MODULE_BOUNDARIES.md`, existing module packages |
| **Adding a Mobile Screen** | `docs/ux/MOBILE_FLOWS.md`, `docs/design-system/DESIGN_SYSTEM.md`, `apps/mobile/App.tsx` |
| **Adding a Database Migration** | `apps/backend/src/main/resources/db/migration/` (never modify applied migrations; create forward `V*__*.sql`) |
| **Security & Authentication** | `SecurityConfig.java`, `JwtService.java`, `TenantFilter.java`, `.ai/DECISIONS.md (ADR-0008, ADR-0009, ADR-0010)` |
| **Reviewing Scope & Gate** | `docs/product/V1_SCOPE.md`, `.ai/PROJECT_CONTEXT.md §V1 scope boundary` |
| **Implementation Plan & Sequence** | `docs/roadmap/IMPLEMENTATION_ROADMAP.md`, `.ai/CURRENT_TASK.md` |

---

## 10. Implementation and Verification Loop

For each task:
1. **Scope & Risks:** Identify scope, affected modules, contracts, risks, and acceptance criteria.
2. **Plan:** Make a small plan before multi-file or architectural work.
3. **Implement & Test:** Implement and test behavior, including relevant negative/error paths.
4. **Run Checks:** Run the relevant formatter, tests, type checks, build, and static checks available in the repository.
5. **Review Boundaries:** Review tenant boundaries, authorization, accessibility, and migration safety where applicable.
6. **Inspect Diff:** Inspect `git diff` for unrelated changes, secrets, generated files, and accidental edits.
7. **Update Memory:** Update affected project memory and append event/decision records when warranted.
8. **Report:** Report files changed, actual commands/results, gaps, and the next useful step.

---

## 11. Project-Memory Integrity & Session Handoff Protocol

### Memory Integrity Rules
- `.ai/PROJECT_STATE.md` records verified current reality, not aspirations.
- `.ai/CURRENT_TASK.md` records the active task and acceptance criteria; do not leave stale task instructions after completion.
- `.ai/DECISIONS.md` is append-only. Supersede decisions with a new entry; do not rewrite history.
- `.ai/EVENT_LOG.md` is a chronological, factual activity log. Do not use it as a substitute for ADRs.
- Update documents only when relevant facts changed. Never fabricate dates, results, or implementation status.
- If code and docs disagree, inspect evidence, fix the source of truth, and document any material discrepancy.

### Handoff Protocol (Mandatory End-of-Session Checklist)
At the end of any working session, the agent must:
1. **Update `.ai/PROJECT_STATE.md`** with actual verified state (including tests passed and remaining gaps).
2. **Update `.ai/CURRENT_TASK.md`** with completed criteria and the immediate next actionable task.
3. **Append to `.ai/EVENT_LOG.md`** with date/time, type (`IMPLEMENTATION`, `TEST`, `DOCS`, etc.), summary, evidence, outcome, and follow-up.
4. **Append new ADRs to `.ai/DECISIONS.md`** if any architectural or product decisions were made.
5. **Run `git diff`** and confirm no secrets, test artifacts, or unrelated edits exist.
6. **Do NOT leave stale "Next Actionable Task" entries** pointing to already-completed work.

### Handoff Protocol (Mandatory End-of-Session Checklist)
At the end of any working session, the agent must:
1. **Update `.ai/PROJECT_STATE.md`** with actual verified state (including tests passed and remaining gaps).
2. **Update `.ai/CURRENT_TASK.md`** with completed criteria and the immediate next actionable task.
3. **Append to `.ai/EVENT_LOG.md`** with date/time, type (`IMPLEMENTATION`, `TEST`, `DOCS`, etc.), summary, evidence, outcome, and follow-up.
4. **Append new ADRs to `.ai/DECISIONS.md`** if any architectural or product decisions were made.
5. **Run `git diff`** and confirm no secrets, test artifacts, or unrelated edits exist.
6. **Do NOT leave stale "Next Actionable Task" entries** pointing to already-completed work.

