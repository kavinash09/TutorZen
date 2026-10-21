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

Always verify actual status against [`.ai/PROJECT_STATE.md`](file:///.ai/PROJECT_STATE.md) and [`docs/audits/V1_REHAUL_AUDIT_REPORT.md`](file:///Users/avinash/avinash/tutorzen/docs/audits/V1_REHAUL_AUDIT_REPORT.md) before starting any task. Do not treat prototype code as production-ready.

| Layer / Area | Current Status | Notes |
| :--- | :--- | :--- |
| **Authentication & Security** | **Implemented & Verified** | Spring Security `SecurityFilterChain`, stateless JWT (15m expiry), rotating refresh token (7d), BCrypt passwords, 401 JSON entry point, 34 tests passing. |
| **Tenant Isolation** | **Implemented & Verified** | `TenantFilter` derives tenant context strictly from verified JWT claims; unauthenticated `X-Tenant-ID` header spoofing is rejected. |
| **Database Migrations** | **`V1` – `V4` Applied** | `tenants`, `attendance_records`, `users`, `user_credentials`, `refresh_tokens`, `subjects`, `batches`, `students`, `batch_enrollments`, `class_sessions`, `learning_materials`. Seed demo accounts exist. |
| **Teacher Attendance Flow** | **Implemented & Verified** | `TeacherSessionController` reads active sessions and commits marked rosters to `attendance_records` table. 20 mobile unit tests passing. |
| **Student Attendance Flow** | **Active Implementation** | Endpoints exist in prototype (`StudentAttendanceController`); wiring live database persistence (`POST /submit`) and summary aggregation (`GET /summary`) in progress. |
| **Learning Materials** | **Implemented & Verified** | `V4__materials_schema.sql`, `TeacherMaterialsController`, `UploadNotesScreen.tsx` with dropzone and required field highlight validation. 6 backend tests, 5 mobile tests passing. |
| **Mobile Authentication** | **Implemented & Verified** | `AuthScreen.tsx`, `AuthContext.tsx`, `apiClient.ts` with transparent 401 refresh queue, 1-tap demo logins for Teacher (`teacher@demo.com`) and Student (`student@demo.com`). |
| **Mobile Navigation** | **Active Implementation** | Uses manual `useState` screen switching in `App.tsx`. React Navigation (`@react-navigation/native`) installation is active. |
| **Multi-Service DevOps** | **Implemented & Verified** | Turnkey multi-container `docker-compose.yml`, cross-platform scripts (`run-all.*`, `build-apk.*`, `build-ios.*`), standalone 61.14 MB release APK compiled. |

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

- **Institute & Multi-Branch Hierarchy:** Institutes can have multiple physical branches. Branches own batches, class sessions, and local rosters. Teachers and students can be assigned to multiple branches (ADR-0013).
- **Branch-Scoped God Mode Dashboard:** Institute Admins view branch-wise operational and financial metrics. Financial metrics require independent permission delegation (`DASHBOARD_FEES_VIEW`) and reconcile with source transaction records (ADR-0012).
- **Attendance Strategy Pattern:** Attendance marking uses a Strategy Pattern for supported marking methods: bulk, QR, and six-digit code (ADR-0002).
- **Verified Student Check-In:** Students mark attendance via time-limited PIN/QR codes. Prevent duplicate submissions (`409 Conflict`). Auditable corrections retain history.
- **Offline Fees Only (No Online Gateway):** Configure fee obligations, record offline payments (Cash, UPI, Cheque, Bank Transfer), issue receipts, and support partial payments. Payment reversals are auditable compensating transactions, never row deletions (ADR-0014).
- **Notes & Assignments (Publishing Only):** Teachers create drafts and publish notes/assignments with deadlines and batch targeting. Students view published materials. 1-level nested discussion comments supported. Student submissions, grading, and feedback are OUT OF SCOPE for V1 (ADR-0015).
- **Dual-Channel Notifications:** In-app/push for routine announcements and class updates. WhatsApp Business Cloud API is strictly reserved for **critical alerts** (student absence, fee payment receipts, overdue reminders, urgent schedule changes) (ADR-0016).
- **Enrolled-Student Explore:** Authenticated students can explore active batches and teacher profiles strictly within their permitted institute scope. No public marketplace, no anonymous browsing.
- **Tenant-Configurable Policy:** QR and six-digit-code validity, and supported attendance policies, are tenant-configurable (ADR-0004).
- **JWT & Permissions Invariants:** Short-lived access tokens (15m) + 7-day rotating refresh tokens (ADR-0009); base archetype on `users.role` supplemented by granular permissions in `user_permissions` (ADR-0013).

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

# Mobile unit tests
cd apps/mobile && npm test

# Mobile typecheck
cd apps/mobile && npx tsc --noEmit

# Shared design token package unit tests
cd packages/design-tokens && npx tsx --test

# Turnkey multi-container stack status
./scripts/run-all.sh --status

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

