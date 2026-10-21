# TutorZen Complete V1 Rehaul — Repository-Aware Execution Prompt

## Mission

You are the Principal Engineer, Product Architect, and AI Coding Agent responsible for evolving the existing TutorZen repository into the agreed TutorZen V1.

Repository: https://github.com/kavinash09/TutorZen

This is an existing project, not a greenfield application. The repository README currently describes a starter with a Java 21 / Spring Boot backend, PostgreSQL with Flyway, React Native + TypeScript + Expo, Docker-based local development, design tokens, and an AI-assisted project-memory setup. Treat these as initial observations only; verify them against the actual code before relying on them.

The objective is a **complete, controlled rehaul of product scope, domain architecture, user experience, engineering workflow, and implementation**. Do not interpret “complete rehaul” as permission to delete the repository and rebuild blindly.

Preserve correct, working functionality. Refactor or replace components only when evidence shows they do not meet V1 requirements. Do not change the technology stack without a written technical case and migration plan.

---

## 1. Non-negotiable execution principles

1. Inspect before modifying.
2. Establish the current baseline before making changes.
3. Treat the repository as the source of truth; README claims are not proof of implementation.
4. Reuse sound code and infrastructure; avoid parallel/duplicate systems.
5. Never remove working features or data without a documented reason and migration/rollback plan.
6. Do not silently change the technology stack, dependencies, deployment approach, or public contracts.
7. Enforce authorization in the backend; hiding UI elements is not security.
8. Preserve historical attendance, enrollment, and financial records.
9. Do not claim a test passed unless it was actually run.
10. Do not mark work complete without acceptance evidence.
11. Keep documentation, `AGENTS.md`, `.ai/` context, backlog, and code synchronized.
12. Work in small, reviewable increments; do not implement the whole system in one giant change.
13. If a product decision is unresolved, record the options and impact. Continue independent work without silently choosing irreversible behavior.
14. Do not commit secrets, credentials, generated local data, or machine-specific configuration.
15. Do not make destructive changes to the default branch. Use a dedicated branch and reviewable commits/PRs according to the repository's existing workflow.

## 2. Phase 0 — Repository and baseline audit

Before substantial implementation, inspect the full repository, including:

- `AGENTS.md`, `CLAUDE.md`, `.ai/`, `docs/`, templates, and design-token packages.
- Root package/workspace configuration, scripts, lockfiles, and build tooling.
- `apps/backend`, `apps/mobile`, and all actual modules/packages.
- Spring configuration, controllers, services, repositories, DTOs, validation, security, and error handling.
- PostgreSQL schema, Flyway migrations, constraints, seed/demo data, and relationships.
- Frontend routes/navigation, screens, state management, API clients, forms, loading/error/empty states, and responsive behavior.
- Docker Compose, container definitions, local run scripts, CI workflows, and deployment configuration.
- Attendance implementation, including the recent teacher/student attendance work.
- Existing automated tests and their actual coverage.

Run existing build, test, lint, type-check, and startup commands when feasible. Record exact commands, results, environment limitations, and pre-existing failures.

### Required audit artifacts

Create or update existing documents rather than duplicating them:

1. Current architecture and module map.
2. Current feature inventory and route/screen inventory.
3. Data model and migration inventory.
4. API and integration inventory.
5. Role/permission and tenant-boundary audit.
6. UX/design-system audit.
7. Build/test/deployment baseline.
8. V1 gap matrix.
9. Technical debt and risk register.
10. Recommended migration and implementation sequence.

For every feature, choose one status:
- `EXISTS_AND_VERIFIED`
- `PARTIALLY_IMPLEMENTED`
- `MISSING`
- `NEEDS_REFACTOR`
- `BLOCKED_BY_DECISION`
- `OUT_OF_SCOPE_FOR_V1`

A feature is verified only when its implementation and relevant tests/evidence support that status.

**Audit checkpoint:** First report findings, high-risk gaps, and proposed migration. Then continue with safe documentation/backlog changes and dependency-ready implementation. Do not stop at a report if work can safely proceed; do not make broad destructive changes before the audit.

---

## 3. Finalized V1 product scope

### A. Platform Admin and institute onboarding

- Create an institute with name and required details.
- Create one or multiple branches with separate addresses.
- Create/invite the initial Institute Admin.
- List, search, view, and edit institutes.
- Manage institute lifecycle and administrative audit history.
- Manage platform-level admin account lifecycle.

### B. Institute Admin

- Manage institute profile/settings.
- Create, edit, list, activate, and deactivate branches.
- Enable/disable branch availability.
- Create/manage moderators and assign them to branches.
- Grant/revoke supported moderator permissions.
- Manage staff and teacher lifecycle.
- View branch-wise God Mode dashboard.
- Delegate dashboard and financial-report permissions independently.

### C. Moderator

- View assigned branches.
- Enable/disable branches only when explicitly permitted.
- Manage staff/teachers only when explicitly permitted.
- View dashboard metrics only when permitted.
- Never receive implicit institute-wide access.

### D. God Mode dashboard

Branch-wise metrics:
- Fees billed, collected, and outstanding.
- Teachers and staff.
- Students/enrollments.
- Classes/sessions.
- Active, upcoming, and completed batches.
- Attendance summaries.
- Date filters and branch drill-down.

Define every metric precisely. Financial metrics require separate permissions and must reconcile with source records.

### E. Staff and teacher management

- Create/invite, edit, list, view, activate, suspend, and deactivate.
- Assign multiple branches when authorized.
- Assign teachers to batches.
- Preserve historical teaching and attendance records after reassignment or deactivation.

### F. Batch and academic management

- Batch CRUDL and lifecycle.
- Associate batches with institutes and branches.
- Assign teachers.
- Schedule class sessions and define attendance windows.
- Validate batch availability and enrollment eligibility.
- Preserve completed/cancelled batch history.

### G. Attendance — teacher and student paths

- Teachers/authorized staff record present, absent, or late for a session roster.
- Students can check themselves in through a verified, time-limited teacher-controlled code or QR flow, subject to session and enrollment validation.
- Prevent duplicate check-ins.
- Authorized attendance corrections retain audit history.
- Students view only their own attendance history and percentage.
- Define the percentage calculation and session eligibility rules.

### H. Offline fees only

- Configure fee obligations and due dates.
- Record offline payments, such as cash, bank transfer, UPI, or cheque where configured.
- Support partial payments if enabled by the approved fee rules.
- Show balances, payment history, receipts, and outstanding dues.
- Correct errors using auditable reversal/adjustment rather than deleting financial history.
- Trigger fee reminders based on current outstanding balances.
- **No online payment gateway in V1.**

### I. Notes and assignments — publishing only

- Create drafts with title, description, metadata, attachments, subject/topic, publication date, and deadline where applicable.
- Target one or more eligible batches.
- Publish, edit, unpublish, and archive.
- Student board displays only published content available to the student's active enrollments.
- Trigger in-app/push notifications.
- **Assignment submissions, grading, and feedback are out of scope for V1.**

### J. Announcements and notifications

- Announcement CRUDL, immediate publication, scheduling, cancellation, and archival.
- Target eligible branches, batches, or audiences.
- Student notice board shows relevant announcements.
- Shared notification subsystem for in-app, push, and WhatsApp delivery.
- WhatsApp is for **critical notifications only**, such as fee reminders and explicitly designated important announcements.
- Routine notes and assignment publication use in-app/push by default.
- Track attempts, delivery outcomes, retries, failures, consent/preferences, and duplicate prevention.
- Publication success must be independent of notification delivery success.

### K. Student identity and enrollment lifecycle

- Maintain student profile/account separately from enrollment.
- Enroll in institute/branch/batch.
- Support multi-branch membership.
- Transfer students between branches/batches.
- Suspend, withdraw, complete, or deactivate as appropriate.
- Preserve prior enrollment, attendance, and financial history.
- Revoke current resource access when enrollment is no longer active while retaining authorized historical access.

### L. Student experience and Explore

- Student profile.
- Personal attendance board.
- Fees board and receipts/history.
- Notes/assignment board.
- Notice board.
- In-app/push notifications.
- Explore other eligible batches and teacher profiles **only for authenticated students already enrolled in the institute scope permitted to them**.
- No public marketplace or anonymous discovery in V1.
- Do not expose private student data, fees, internal metrics, or private teacher information.
- Enrollment from Explore must obey availability, eligibility, capacity, and approval rules.

### M. Cross-cutting V1 requirements

- Authentication, invitations, and account recovery appropriate to the existing auth model.
- Multi-tenant and branch-level data isolation.
- Centralized backend authorization.
- Audit logs for sensitive actions.
- Input validation and consistent error handling.
- Safe file/attachment access.
- Safe database migrations and preservation of historical records.
- Automated tests, CI, structured logs, operational diagnostics, backups, and recovery validation.

---

## 4. Domain model and architecture direction

Inspect the current models first. Reuse or evolve existing entities where they correctly represent the domain; do not create duplicates solely to match this list.

Conceptual entities to validate:

- Institute
- Branch
- User/Account
- Role and Permission
- User/role permission grant
- Branch assignment
- Staff/Teacher profile
- Student profile
- Batch
- Subject
- Teacher-batch assignment
- Class session
- Enrollment
- Attendance record
- Fee structure/obligation
- Payment transaction
- Receipt
- Learning material
- Announcement
- Notification
- Notification delivery attempt
- Audit event

### Architecture principles

- Prefer a modular monolith with clear package-by-feature boundaries unless the audit demonstrates a compelling reason otherwise.
- Keep domain rules in services/domain logic rather than scattering them through controllers or frontend components.
- Keep API contracts explicit and validated.
- Separate account identity from role-specific profiles.
- Separate student identity from enrollment.
- Keep payments auditable and immutable where appropriate.
- Treat notification delivery as an asynchronous side effect with retries/idempotency.
- Do not add distributed services or infrastructure without a demonstrated requirement.
- Maintain API compatibility where needed and document intentional breaking changes.
- Confirm existing Java/Spring Boot, PostgreSQL/Flyway, and React Native/TypeScript/Expo setup before changing versions or architecture.

### Data invariants

- Every institute-owned resource has a reliable tenant ownership path.
- Branch-owned resources have a reliable branch ownership path.
- Institute and branch relationships cannot conflict.
- Cross-institute access is denied by default.
- Cross-branch access requires assignment and permission.
- Deactivation does not erase required financial, attendance, enrollment, or audit history.
- Payment reversal is an auditable compensating transaction, not deletion.
- Background jobs can be retried without duplicate business actions.

---

## 5. Authorization foundation

Reconcile with the existing model and introduce explicit permissions where needed. Example permission keys:

- `INSTITUTE_MANAGE`
- `BRANCH_MANAGE`
- `BRANCH_AVAILABILITY_MANAGE`
- `MODERATOR_MANAGE`
- `STAFF_LIFECYCLE_MANAGE`
- `TEACHER_LIFECYCLE_MANAGE`
- `STUDENT_LIFECYCLE_MANAGE`
- `BATCH_MANAGE`
- `ATTENDANCE_MANAGE`
- `ATTENDANCE_VIEW`
- `FEES_MANAGE`
- `FEES_REPORT_VIEW`
- `LEARNING_MATERIAL_MANAGE`
- `ANNOUNCEMENT_MANAGE`
- `DASHBOARD_VIEW`
- `DASHBOARD_FEES_VIEW`
- `ENROLLMENT_MANAGE`

For each permission, document allowed actions, eligible roles, resource scope, branch requirements, audit requirements, and revocation behavior.

Effective access is constrained by account status, institute status, branch assignment, explicit permissions, and resource ownership. Permission changes must be enforced on subsequent backend authorization checks. Test cross-tenant access, cross-branch access, privilege escalation, suspended accounts, and permission revocation.

---

## 6. Lifecycle rules to formalize

Treat these as proposed states; map them to the current schema and define legal transitions before migration.

| Entity | Proposed lifecycle | Rule |
|---|---|---|
| Institute | `PENDING_SETUP`, `ACTIVE`, `SUSPENDED`, `DEACTIVATED` | Deactivation terminal by default; recovery policy must be explicit |
| Branch | `ACTIVE`, `INACTIVE` | Inactive branch cannot accept new enrollments |
| Account | `INVITED`, `ACTIVE`, `SUSPENDED`, `DEACTIVATED` | Suspended/deactivated accounts lose normal access |
| Moderator permission | `GRANTED`, `REVOKED` | Revocation enforced on subsequent checks |
| Teacher assignment | `ASSIGNED`, `UNASSIGNED` | History preserved |
| Batch | `DRAFT`, `UPCOMING`, `ACTIVE`, `COMPLETED`, `CANCELLED` | Completed/cancelled batch cannot receive unintended new work |
| Enrollment | `PENDING`, `ACTIVE`, `COMPLETED`, `WITHDRAWN` | Transfer preserves history |
| Attendance | `OPEN`, `RECORDED`, `CORRECTED` | Corrections auditable |
| Fee obligation | `PENDING`, `PARTIALLY_PAID`, `PAID`; overdue may be derived | Do not overwrite payment history |
| Payment | `RECORDED`, `REVERSED` where applicable | Reversal is auditable |
| Learning material | `DRAFT`, `PUBLISHED`, `UNPUBLISHED`, `ARCHIVED` | Only eligible published material is visible |
| Announcement | `DRAFT`, `SCHEDULED`, `PUBLISHED`, `CANCELLED`, `ARCHIVED` | Delivery failure does not undo publication |
| Notification | `PENDING`, `PROCESSING`, `SENT`, `FAILED` | Retryable failures tracked; duplicate effects prevented |

Implement transitions in the backend/domain layer and test invalid transitions. Do not implement lifecycle behavior as UI-only status changes.

---

## 7. Required backlog and tracking

Create or update the repository's existing backlog format. Use:

- Epic: `TZ-E01`
- Story: `TZ-E01-S01`
- Task: `TZ-E01-S01-T01`

Statuses:
- `NOT_STARTED`
- `IN_PROGRESS`
- `BLOCKED`
- `IN_REVIEW`
- `DONE`
- Optional: `CANCELLED`, `DEFERRED`

Every task must include:
- Stable ID, title, parent epic/story
- Owner (`DEV-A`, `DEV-B`, `SHARED`)
- Priority (`P0`, `P1`, `P2`)
- Dependencies
- User outcome/problem
- Acceptance criteria (prefer Given/When/Then)
- API/data/UI implications
- Authorization and security requirements
- Test requirements
- Documentation requirements
- Actual start time when claimed
- Blocker and next action if blocked
- Test/completion evidence
- Review status

A task is `DONE` only after implementation, acceptance criteria, relevant tests, review, and necessary documentation updates. Do not fabricate timestamps or test results.

### Proposed developer split

**DEV-A — platform/backend/governance**
- Identity, tenancy, authorization
- Institute/branch lifecycle and moderator permissions
- Domain models, migrations, APIs
- Financial domain/reporting
- Notification subsystem
- Audit and operational infrastructure

**DEV-B — academic workflows/frontend**
- Role-based navigation and workspaces
- Teacher/student profiles, batches, enrollment UI
- Attendance and check-in UX
- Student boards and learning content
- Explore and announcement UI
- Responsive/accessibility and frontend integration

**SHARED**
- API contracts and domain invariants
- Cross-tenant and cross-branch tests
- End-to-end workflows
- Integration reviews and release readiness

Adjust the split based on actual module boundaries and developer skills. Avoid concurrent edits to the same central files without coordination.

---

## 8. Required epic plan

Create a repository-specific Epic → Story → Task backlog covering:

- **E01:** Repository audit and AI development workflow
- **E02:** Authentication and tenant isolation
- **E03:** Institute onboarding and lifecycle
- **E04:** Branch administration and lifecycle
- **E05:** Moderator, staff, and teacher lifecycle
- **E06:** God Mode dashboard and reporting
- **E07:** Academic structure, batches, and schedules
- **E08:** Student profile and enrollment lifecycle
- **E09:** Attendance management
- **E10:** Offline fees management
- **E11:** Notes and assignment publishing
- **E12:** Announcements and notification infrastructure
- **E13:** Enrolled-student Explore
- **E14:** Security, quality, and release readiness

For each epic, inspect the actual codebase and create detailed stories and implementation tasks with acceptance criteria, dependencies, owner, priority, and verification. Do not assume every story is missing; map it to current implementation.

### Suggested dependency order

1. E01 — audit and workflow foundation.
2. E02 — identity, authorization, tenant isolation.
3. E03–E05 — institute, branch, moderator, staff foundations.
4. E07–E08 — batches, sessions, student identity, enrollment.
5. E09–E11 — attendance, fees, learning material.
6. E12 — notifications/announcements; begin notification contracts earlier in parallel.
7. E06 and E13 — dashboard and Explore once data contracts are stable.
8. E14 — continuous validation throughout, final release gates at the end.

This order is a default, not a rigid sequence. Start independent work in parallel once contracts are agreed.

---

## 9. AI coding and project-memory overhaul

The repository already has `AGENTS.md`, `CLAUDE.md`, and `.ai/` context files. Inspect and improve them rather than generating a competing instruction system.

### Root `AGENTS.md`

Ensure it accurately documents:
- Product/V1 boundaries
- Repository structure and module responsibilities
- Actual build/test/lint commands
- Coding and naming conventions
- API and migration rules
- Authorization/tenant isolation requirements
- Test and review expectations
- Documentation/ADR updates
- Task claiming, blockers, and completion evidence

### `.ai/` project context

Inspect current files (including `PROJECT_CONTEXT.md`, `PROJECT_STATE.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `CURRENT_TASK.md`, `EVENT_LOG.md`, and retrieval guidance if present).

Establish a clear separation between:
1. Durable product requirements
2. Architecture decisions
3. Current implementation state
4. Active task/ownership
5. Known issues and blockers
6. Chronological implementation events

Update context only when facts change. Keep it concise and consistent with code. Never claim persistent context was updated unless the file was actually changed.

### ADRs

Record significant decisions with context, alternatives, decision, and consequences. At minimum, assess ADRs for tenancy, permissions, branch assignments, lifecycle rules, enrollment modeling, fee/payment semantics, notifications, and migration/API compatibility.

---

## 10. UX and design-system direction

Audit the current design-token package and UX documents before changing screens.

Retain the established TutorZen design direction unless a clear usability issue warrants an adjustment:
- Selective Claymorphism, not excessive decorative effects.
- Warm neutral surfaces and restrained forest-green accents.
- EB Garamond for prominent/editorial headings.
- Barlow for operational UI, navigation, tables, forms, and buttons.
- Accessible contrast, focus states, touch targets, readable data density, and responsive layouts.

Create role-aware workspaces:
- Platform Admin
- Institute Admin
- Moderator
- Teacher
- Student

Prioritize workflows and information architecture over visual polish. Each screen must represent real permissions and states. Include loading, empty, error, disabled, and unauthorized states. Do not use hardcoded mock data to disguise missing backend functionality in a claimed completed flow.

---

## 11. Verification and release gates

### Functional
- Institute onboarding and branch lifecycle work.
- Permissions and branch assignments behave correctly.
- Multi-branch teachers/students are supported.
- Enrollment transfers preserve history.
- Teacher attendance and verified student check-in work.
- Offline fee balances, receipts, and corrections reconcile.
- Learning material and announcements target the correct audience.
- WhatsApp is limited to approved critical events.
- Dashboard metrics reconcile with source records.
- Explore is restricted to eligible authenticated students.

### Security
- Cross-institute requests are denied.
- Cross-branch requests require explicit authorization.
- Suspended/deactivated accounts are blocked.
- Revoked permissions take effect.
- Attachments and private records are access-controlled.
- Secrets and sensitive data are not exposed.

### Reliability and operations
- Background notifications can be retried safely.
- Duplicate processing is prevented.
- Migrations preserve data and support a rollback strategy.
- Logs/health checks allow failure diagnosis.
- Backups and restoration are validated.
- Deployment and rollback procedures are documented.

### Quality
- Unit tests cover domain rules.
- Integration tests cover API/persistence.
- Authorization tests cover allowed/denied paths.
- End-to-end tests cover critical user journeys.
- CI executes required checks.
- Relevant accessibility and responsive behavior is verified.

Distinguish `IMPLEMENTED` from `VERIFIED`. A local build alone does not establish production readiness.

---

## 12. Execution protocol

Proceed in this order:

1. Audit repository structure, implementation, docs, data model, and tests.
2. Run and record baseline commands/results.
3. Produce a concise current-state and V1 gap report.
4. Map all epics/stories to actual files/modules and classify their current status.
5. Identify high-risk architectural and migration concerns.
6. Propose the target domain model, permission model, lifecycle transitions, and API contracts.
7. Update existing product docs, `AGENTS.md`, `.ai/` context, ADRs, and task tracking.
8. Produce the repository-specific backlog and dependency/ownership plan.
9. Implement the highest-priority dependency-ready vertical slice.
10. Add tests and verify each increment before moving on.
11. Keep the task ledger, project state, and documentation synchronized.
12. Report exact changes, commands run, test results, known limitations, and next tasks.

At each checkpoint, report:
- What was inspected or changed
- What was preserved versus refactored/replaced, and why
- Tests/commands actually run and their results
- Migration/security risks
- Updated task IDs and owners
- Blockers and next actions

Do not stop at documentation if safe implementation work can proceed. Do not attempt an unreviewed all-at-once rewrite.

## Definition of success

The existing TutorZen repository becomes a coherent, maintainable, testable V1 implementation with:
- The agreed multi-institute, multi-branch product scope
- Reliable role- and branch-scoped authorization
- Correct academic, attendance, fee, and publishing workflows
- Critical-only WhatsApp notifications
- Consistent role-aware UX
- A traceable Epic → Story → Task plan for two developers
- Accurate AI agent instructions and project memory
- Evidence-backed tests and a documented path to production

**Final caution:** This prompt authorizes a controlled rehaul, not destructive replacement. Inspect the repository, preserve sound work, document migration choices, and prove each increment before marking it complete.
