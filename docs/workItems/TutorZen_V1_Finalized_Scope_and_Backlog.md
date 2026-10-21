# TutorZen V1 — Finalized Scope & Development Backlog

> **Purpose:** Evolve the existing TutorZen repository into the agreed V1. This is a repository-aware implementation plan, not a greenfield rewrite. Audit existing code first, preserve valid work, and implement incrementally.

## 1. Confirmed V1 Product Decisions

| Area | V1 decision |
|---|---|
| Attendance | Both teacher-recorded attendance and verified student check-in |
| Fees | Offline payments only; no payment gateway in V1 |
| Explore | Available to authenticated students already enrolled in an institute |
| Branch model | Teachers and students may belong to multiple branches |
| Assignments | Publish notes and assignments; submissions, grading, and feedback are out of scope |
| WhatsApp | Critical notifications only |
| Institute onboarding | Platform Admin creates institutes, branches, and the initial Institute Admin |
| Administration | Institute Admin manages branches, moderators, permissions, staff, and reporting |
| Moderator access | Assigned branches plus explicitly granted permissions |
| Dashboard | Branch-wise fees, teachers, students, classes, and batches, with permission-controlled drill-down |
| Notifications | Shared notification subsystem for in-app, push, and critical WhatsApp delivery |

### Additional V1 boundaries

- Platform Admin manages institute onboarding and platform-level lifecycle.
- Institute Admin controls their institute and delegates supported permissions.
- Moderators operate only within assigned branches and granted permissions.
- Teachers operate on assigned batches and teaching responsibilities.
- Students access their own records and content associated with active enrollments.
- Authentication, tenant isolation, audit logging, testing, observability, and safe migrations are cross-cutting V1 requirements.
- Public marketplace discovery is out of scope.
- Online payments are out of scope.
- Assignment submissions and grading are out of scope.
- Routine notes and assignment notifications use in-app/push by default. WhatsApp is reserved for critical events such as fee reminders and designated important announcements.

### Attendance check-in decision

Support teacher-recorded attendance and student self-check-in. The proposed default for student check-in is a teacher-controlled, time-limited session code or QR code, with a configurable attendance window. The mechanism must validate the student’s enrollment and session, prevent duplicate check-ins, and reject expired or unauthorized requests.

---

## 2. Backlog Structure and Conventions

This backlog tracks development of TutorZen itself; it is not a feature to build inside the TutorZen product.

### Identifier format

- Epic: `TZ-E01`
- Story: `TZ-E01-S01`
- Task: `TZ-E01-S01-T01`

### Priority

- `P0` — critical foundation/security
- `P1` — core V1
- `P2` — polish or lower-priority enhancement

### Status

- `NOT_STARTED`
- `IN_PROGRESS`
- `BLOCKED`
- `IN_REVIEW`
- `DONE`
- Optional: `CANCELLED`, `DEFERRED`

### Required fields on every task

| Field | Requirement |
|---|---|
| Task ID | Stable identifier |
| Title | Clear action and outcome |
| Parent | Story and epic |
| Owner | `DEV-A`, `DEV-B`, or `SHARED` |
| Status | One of the agreed status values |
| Priority | P0/P1/P2 |
| Dependencies | Explicit task/story IDs |
| Acceptance criteria | Testable outcomes |
| Started at | Actual timestamp when claimed |
| Blocker | Reason, dependency, and next action if blocked |
| Test evidence | Commands, test results, or test references |
| Review status | Pending, approved, or changes requested |
| Completion evidence | Commit/PR/test references |

**Definition of Done:** acceptance criteria satisfied, relevant tests actually run, review completed, implementation and documentation updated where needed, and evidence recorded. Never mark a task done based only on code presence.

---

## 3. Proposed Ownership for Two Developers

Adjust this split after inspecting the actual repository and developer strengths.

### DEV-A — Platform, backend, and governance

- Tenant isolation and authorization foundation
- Institute and branch lifecycle
- Moderator permissions
- Staff lifecycle APIs
- Audit infrastructure
- Financial domain foundations and reporting APIs
- Notification subsystem and provider integration
- API contracts and data integrity

### DEV-B — Academic workflows and user experience

- Teacher/student workflows
- Batch and enrollment screens
- Attendance UI and student check-in experience
- Notes and assignment publishing
- Student boards and Explore
- Notification preferences and frontend integration
- Responsive and accessible UI

### SHARED — Contracts, integration, and release

- Agree on domain invariants and API contracts
- Review each other’s changes
- Run cross-role and end-to-end tests
- Validate tenant/branch isolation
- Coordinate shared-file changes
- Verify release readiness

Do not let both developers independently redefine shared domain models or API contracts. Avoid concurrent edits to central files without explicit coordination.

---

# 4. Detailed Epic → Story → Task Backlog

The following is the canonical V1 backlog. First inspect the repository and map each story to existing implementation. Verify existing features instead of rebuilding them.

## E01 — Repository Audit and AI Development Workflow

**Priority:** P0  
**Goal:** Establish a reliable baseline and make AI-assisted implementation traceable.

### S01 — Audit existing implementation
**Tasks**
- `TZ-E01-S01-T01`: Inventory modules, routes, services, repositories, UI screens, integrations, and deployment assets.
- `TZ-E01-S01-T02`: Map current functionality to each V1 epic and story.
- `TZ-E01-S01-T03`: Run existing build, lint, type-check, and test commands where feasible.
- `TZ-E01-S01-T04`: Document architecture, data model, APIs, technical debt, and risks.

**Acceptance criteria**
- Every planned feature has an evidence-backed status: `EXISTS_AND_VERIFIED`, `PARTIALLY_IMPLEMENTED`, `MISSING`, `NEEDS_REFACTOR`, `BLOCKED_BY_DECISION`, or `OUT_OF_SCOPE_FOR_V1`.
- Pre-existing failures are recorded separately from failures introduced by future changes.
- No duplicate architecture or documentation system is introduced without a reason.

**Owner:** SHARED  
**Dependencies:** None

### S02 — Standardize repository instructions
**Tasks**
- `TZ-E01-S02-T01`: Audit root and nested `AGENTS.md` files.
- `TZ-E01-S02-T02`: Document actual build, test, lint, and validation commands.
- `TZ-E01-S02-T03`: Add coding, authorization, migration, testing, and documentation rules.
- `TZ-E01-S02-T04`: Resolve contradictory or duplicated agent instructions.

**Acceptance criteria**
- AI agents have clear repository guidance consistent with actual architecture and commands.
- Instructions describe how to verify changes and update project tracking.

**Owner:** DEV-A  
**Dependencies:** S01

### S03 — Establish task and decision tracking
**Tasks**
- `TZ-E01-S03-T01`: Define backlog/task record format and status transitions.
- `TZ-E01-S03-T02`: Define work-claim, ownership, blocker, review, and completion evidence conventions.
- `TZ-E01-S03-T03`: Establish concise architecture decision records (ADRs).
- `TZ-E01-S03-T04`: Establish durable project context and implementation-state documentation.

**Acceptance criteria**
- Tasks have stable IDs, owners, dependencies, acceptance criteria, status, and evidence fields.
- Significant decisions are recorded with context, alternatives, decision, and consequences.
- Project state is not dependent solely on conversational memory.

**Owner:** SHARED  
**Dependencies:** S01

---

## E02 — Authentication and Tenant Isolation

**Priority:** P0  
**Goal:** Ensure users access only authorized institutes, branches, and resources.

### S01 — Audit and normalize identity
**Tasks**
- `TZ-E02-S01-T01`: Inspect current account, role, and profile models.
- `TZ-E02-S01-T02`: Separate account identity from role-specific profiles where needed.
- `TZ-E02-S01-T03`: Define and enforce account lifecycle states.

**Acceptance criteria**
- Existing identity data is preserved.
- Account status is consistently enforced across relevant endpoints.
- Any schema changes have safe migrations.

**Owner:** DEV-A  
**Dependencies:** E01

### S02 — Implement authorization foundation
**Tasks**
- `TZ-E02-S02-T01`: Define permission catalog and resource scopes.
- `TZ-E02-S02-T02`: Implement centralized policy/service checks.
- `TZ-E02-S02-T03`: Add resource ownership and branch-scope checks.
- `TZ-E02-S02-T04`: Integrate authorization into sensitive backend routes.

**Acceptance criteria**
- Direct API requests cannot bypass permissions.
- Frontend visibility is treated as usability, not a security boundary.
- Authorization behavior is tested for allowed and denied requests.

**Owner:** DEV-A  
**Dependencies:** E01

### S03 — Enforce tenant and branch boundaries
**Tasks**
- `TZ-E02-S03-T01`: Define institute and branch ownership invariants.
- `TZ-E02-S03-T02`: Scope repository/database queries by authorized context.
- `TZ-E02-S03-T03`: Validate ownership and relationships on writes.
- `TZ-E02-S03-T04`: Add cross-tenant and cross-branch regression tests.

**Acceptance criteria**
- Cross-institute access is denied.
- Cross-branch access is limited to explicit assignments and permissions.
- A resource’s institute and branch associations cannot conflict.

**Owner:** DEV-A + SHARED  
**Dependencies:** S01, S02

### S04 — Account recovery and invitations
**Tasks**
- `TZ-E02-S04-T01`: Implement or adapt secure invitation flow.
- `TZ-E02-S04-T02`: Implement password reset/session handling according to the existing auth approach.
- `TZ-E02-S04-T03`: Enforce suspended/deactivated account restrictions.

**Acceptance criteria**
- Invitations and recovery follow the existing authentication strategy.
- Retries do not create duplicate accounts.
- Disabled accounts cannot continue normal operations.

**Owner:** DEV-A  
**Dependencies:** S01, S02

---

## E03 — Institute Onboarding and Lifecycle

**Priority:** P0  
**Goal:** Allow Platform Admin to onboard and manage institutes.

### S01 — Create institute
**Tasks**
- `TZ-E03-S01-T01`: Define required institute fields and validation.
- `TZ-E03-S01-T02`: Implement service/API.
- `TZ-E03-S01-T03`: Build or adapt onboarding UI.
- `TZ-E03-S01-T04`: Add validation and authorization tests.

**Acceptance criteria**
- A valid institute can be created with required details and an initial state.
- Only authorized Platform Admins can create institutes.
- Duplicate or invalid requests are handled safely.

**Owner:** DEV-A (API), DEV-B (UI)  
**Dependencies:** E02

### S02 — Create branches during or after onboarding
**Tasks**
- `TZ-E03-S02-T01`: Implement branch model and institute relationship.
- `TZ-E03-S02-T02`: Store separate address details for each branch.
- `TZ-E03-S02-T03`: Support multiple branches per institute.
- `TZ-E03-S02-T04`: Test ownership and validation.

**Acceptance criteria**
- An institute supports multiple branches.
- Each branch belongs to exactly one institute.
- Branch addresses are independent.

**Owner:** DEV-A  
**Dependencies:** S01

### S03 — Create initial Institute Admin
**Tasks**
- `TZ-E03-S03-T01`: Implement account invitation/provisioning.
- `TZ-E03-S03-T02`: Associate admin with the correct institute.
- `TZ-E03-S03-T03`: Handle failed invitations and safe retries.

**Acceptance criteria**
- The initial admin receives access only to the correct institute.
- Retrying provisioning does not create duplicate accounts or privilege grants.

**Owner:** DEV-A  
**Dependencies:** S01, E02

### S04 — Institute CRUDL and lifecycle
**Tasks**
- `TZ-E03-S04-T01`: Implement list, search, detail, and edit operations.
- `TZ-E03-S04-T02`: Implement activate, suspend, and deactivate transitions.
- `TZ-E03-S04-T03`: Add lifecycle audit events.
- `TZ-E03-S04-T04`: Test transition restrictions and recovery policy.

**Acceptance criteria**
- Only Platform Admin can perform platform-level lifecycle actions.
- Transitions follow documented rules.
- Deactivation does not silently delete historical records.

**Owner:** DEV-A + DEV-B  
**Dependencies:** S01–S03

---

## E04 — Branch Administration and Lifecycle

**Priority:** P0  
**Goal:** Manage branches independently while preserving historical data.

### S01 — Branch CRUDL
**Tasks**
- `TZ-E04-S01-T01`: Implement create, edit, list, and view operations.
- `TZ-E04-S01-T02`: Validate branch address details.
- `TZ-E04-S01-T03`: Add branch search/filtering where useful.

**Acceptance criteria**
- Branches are managed within the correct institute.
- Address changes do not alter unrelated records.

**Owner:** DEV-A + DEV-B  
**Dependencies:** E03

### S02 — Branch availability
**Tasks**
- `TZ-E04-S02-T01`: Implement active/inactive status.
- `TZ-E04-S02-T02`: Enforce branch status in relevant operations.
- `TZ-E04-S02-T03`: Display branch availability in the UI.

**Acceptance criteria**
- Inactive branches cannot accept new enrollments or normal new operations.
- Authorized historical access remains available.

**Owner:** DEV-A  
**Dependencies:** S01, E02

### S03 — Safe branch transitions
**Tasks**
- `TZ-E04-S03-T01`: Define effects on active batches and sessions.
- `TZ-E04-S03-T02`: Define student/staff behavior when a branch is disabled.
- `TZ-E04-S03-T03`: Test deactivation and reactivation.

**Acceptance criteria**
- Deactivation does not silently delete data.
- Reactivation follows documented policy.

**Owner:** SHARED  
**Dependencies:** S02, E07, E08

---

## E05 — Moderator, Staff, and Teacher Lifecycle

**Priority:** P0/P1  
**Goal:** Support delegated institute administration.

### S01 — Moderator CRUDL
**Tasks**
- `TZ-E05-S01-T01`: Create/invite moderator.
- `TZ-E05-S01-T02`: Edit moderator profile.
- `TZ-E05-S01-T03`: Suspend/deactivate moderator.
- `TZ-E05-S01-T04`: Audit administrative changes.

**Acceptance criteria**
- Only authorized Institute Admins can manage moderators in their institute.
- Account status and permissions are enforced on requests.

**Owner:** DEV-A + DEV-B  
**Dependencies:** E02, E03

### S02 — Branch assignments
**Tasks**
- `TZ-E05-S02-T01`: Assign multiple branches to a moderator.
- `TZ-E05-S02-T02`: Revoke branch assignments.
- `TZ-E05-S02-T03`: Enforce scope on all relevant requests.

**Acceptance criteria**
- Moderators operate only on assigned branches.
- Revocation takes effect on subsequent authorization checks.

**Owner:** DEV-A  
**Dependencies:** S01, E02

### S03 — Delegated permissions
**Tasks**
- `TZ-E05-S03-T01`: Define supported moderator permissions.
- `TZ-E05-S03-T02`: Implement grant/revoke APIs.
- `TZ-E05-S03-T03`: Build permission management UI.
- `TZ-E05-S03-T04`: Test privilege escalation and unauthorized changes.

**Acceptance criteria**
- Admins can grant only supported permissions.
- Moderators cannot grant themselves privileges.
- Dashboard and financial permissions can be controlled separately.

**Owner:** DEV-A + DEV-B  
**Dependencies:** E02, S01

### S04 — Staff and teacher lifecycle
**Tasks**
- `TZ-E05-S04-T01`: Create/invite staff and teacher profiles.
- `TZ-E05-S04-T02`: Edit profiles.
- `TZ-E05-S04-T03`: Assign branches.
- `TZ-E05-S04-T04`: Activate, suspend, and deactivate accounts.

**Acceptance criteria**
- Account and profile states are handled consistently.
- Historical teaching and attendance records are preserved.

**Owner:** DEV-A + DEV-B  
**Dependencies:** E02–E04

### S05 — Teacher multi-branch assignment
**Tasks**
- `TZ-E05-S05-T01`: Support multiple branch assignments.
- `TZ-E05-S05-T02`: Assign batches per branch.
- `TZ-E05-S05-T03`: Test teacher access boundaries.

**Acceptance criteria**
- A teacher can teach across assigned branches without gaining access to unrelated branches.

**Owner:** SHARED  
**Dependencies:** S04, E07

---

## E06 — God Mode Dashboard and Reporting

**Priority:** P1  
**Goal:** Provide authorized branch-wise operational visibility.

### S01 — Dashboard permission controls
**Tasks**
- `TZ-E06-S01-T01`: Define dashboard and financial metric permissions.
- `TZ-E06-S01-T02`: Enforce backend checks.
- `TZ-E06-S01-T03`: Add UI gating.

**Acceptance criteria**
- Dashboard access and financial visibility are separately authorized.

**Owner:** DEV-A  
**Dependencies:** E02, E05

### S02 — Institute and branch overview
**Tasks**
- `TZ-E06-S02-T01`: Implement branch selector.
- `TZ-E06-S02-T02`: Add date filters.
- `TZ-E06-S02-T03`: Build metric cards and summary views.
- `TZ-E06-S02-T04`: Connect dashboard UI to reporting APIs.

**Acceptance criteria**
- Authorized admins can view institute totals and drill down by branch.
- Every displayed metric has a documented definition.

**Owner:** DEV-A (APIs), DEV-B (UI)  
**Dependencies:** E04, E07–E11

### S03 — Financial reporting
**Tasks**
- `TZ-E06-S03-T01`: Define billed, collected, and outstanding semantics.
- `TZ-E06-S03-T02`: Aggregate fee and payment data.
- `TZ-E06-S03-T03`: Test partial payments and date boundaries.

**Acceptance criteria**
- Reports reconcile with underlying records.
- Collected fees are not confused with fees billed.

**Owner:** DEV-A  
**Dependencies:** E10

### S04 — Academic reporting
**Tasks**
- `TZ-E06-S04-T01`: Implement teacher/student counts.
- `TZ-E06-S04-T02`: Implement active/upcoming batch counts.
- `TZ-E06-S04-T03`: Implement class and attendance summaries.

**Acceptance criteria**
- Counts use documented definitions and respect branch permissions.

**Owner:** DEV-A + DEV-B  
**Dependencies:** E07–E09

---

## E07 — Academic Structure, Batches, and Schedules

**Priority:** P1  
**Goal:** Establish the operational foundation for teaching.

### S01 — Batch CRUDL
**Tasks**
- `TZ-E07-S01-T01`: Define batch fields and lifecycle.
- `TZ-E07-S01-T02`: Implement APIs and persistence.
- `TZ-E07-S01-T03`: Build batch screens.
- `TZ-E07-S01-T04`: Validate transitions and ownership.

**Acceptance criteria**
- Authorized users can manage batches belonging to the correct institute and branch.

**Owner:** DEV-A + DEV-B  
**Dependencies:** E02–E04

### S02 — Teacher-batch assignment
**Tasks**
- `TZ-E07-S02-T01`: Assign teachers to batches.
- `TZ-E07-S02-T02`: Validate branch membership and authorization.
- `TZ-E07-S02-T03`: Handle teacher reassignment.

**Acceptance criteria**
- Only eligible teachers can be assigned.
- Reassignment preserves historical sessions.

**Owner:** SHARED  
**Dependencies:** S01, E05

### S03 — Session scheduling
**Tasks**
- `TZ-E07-S03-T01`: Define class/session model.
- `TZ-E07-S03-T02`: Associate sessions with batches.
- `TZ-E07-S03-T03`: Handle dates, timezones, and attendance windows.
- `TZ-E07-S03-T04`: Validate scheduling rules.

**Acceptance criteria**
- Sessions have valid times, correct ownership, and a defined attendance window.

**Owner:** DEV-A + DEV-B  
**Dependencies:** S01

### S04 — Batch lifecycle
**Tasks**
- `TZ-E07-S04-T01`: Implement draft/upcoming/active/completed/cancelled states.
- `TZ-E07-S04-T02`: Define enrollment eligibility.
- `TZ-E07-S04-T03`: Preserve completed batch history.

**Acceptance criteria**
- Completed or cancelled batches cannot receive unintended new sessions or enrollments.

**Owner:** SHARED  
**Dependencies:** S01–S03

---

## E08 — Student Profile and Enrollment Lifecycle

**Priority:** P1  
**Goal:** Manage students independently from their enrollments.

### S01 — Student identity and profile
**Tasks**
- `TZ-E08-S01-T01`: Create/adapt student profile.
- `TZ-E08-S01-T02`: Implement invitation and activation.
- `TZ-E08-S01-T03`: Support profile editing.
- `TZ-E08-S01-T04`: Validate privacy boundaries.

**Acceptance criteria**
- Student identity is separate from enrollment.
- Access is tied to authenticated identity.

**Owner:** DEV-A + DEV-B  
**Dependencies:** E02

### S02 — Enrollment creation
**Tasks**
- `TZ-E08-S02-T01`: Create enrollment records.
- `TZ-E08-S02-T02`: Associate enrollment with institute, branch, and batch.
- `TZ-E08-S02-T03`: Enforce availability and capacity rules where configured.

**Acceptance criteria**
- Only eligible students can enroll in available batches.
- Institute and branch relationships are consistent.

**Owner:** DEV-A + DEV-B  
**Dependencies:** E04, E07

### S03 — Enrollment transfers
**Tasks**
- `TZ-E08-S03-T01`: Transfer student between batches/branches.
- `TZ-E08-S03-T02`: End or supersede prior enrollment as appropriate.
- `TZ-E08-S03-T03`: Preserve history.
- `TZ-E08-S03-T04`: Test concurrent updates.

**Acceptance criteria**
- Transfers do not erase prior attendance, fee, or enrollment history.

**Owner:** DEV-A  
**Dependencies:** S02, E09, E10

### S04 — Enrollment lifecycle
**Tasks**
- `TZ-E08-S04-T01`: Define pending/active/completed/withdrawn states.
- `TZ-E08-S04-T02`: Implement allowed transitions.
- `TZ-E08-S04-T03`: Enforce student access based on enrollment status.

**Acceptance criteria**
- Inactive enrollment no longer grants current batch access, while permitted historical records remain available.

**Owner:** SHARED  
**Dependencies:** S02

### S05 — Student CRUDL and admin operations
**Tasks**
- `TZ-E08-S05-T01`: List and search students.
- `TZ-E08-S05-T02`: View and edit profiles.
- `TZ-E08-S05-T03`: Suspend/deactivate accounts.
- `TZ-E08-S05-T04`: Audit sensitive changes.

**Acceptance criteria**
- Authorized staff can manage students without bypassing account or enrollment rules.

**Owner:** DEV-A + DEV-B  
**Dependencies:** S01–S04

---

## E09 — Attendance Management

**Priority:** P1  
**Goal:** Support teacher-recorded attendance and verified student check-in.

### S01 — Teacher attendance
**Tasks**
- `TZ-E09-S01-T01`: Load eligible batch roster for a session.
- `TZ-E09-S01-T02`: Mark present/absent/late.
- `TZ-E09-S01-T03`: Submit attendance.
- `TZ-E09-S01-T04`: Validate teacher assignment and session state.

**Acceptance criteria**
- Only authorized teachers/staff can record attendance for an eligible session.
- Duplicate submissions are handled safely.

**Owner:** DEV-A (APIs), DEV-B (UI)  
**Dependencies:** E07, E08

### S02 — Verified student check-in
**Tasks**
- `TZ-E09-S02-T01`: Generate time-limited code/QR for an eligible session.
- `TZ-E09-S02-T02`: Validate session, enrollment, and check-in window.
- `TZ-E09-S02-T03`: Prevent duplicate check-ins.
- `TZ-E09-S02-T04`: Handle expiry and unauthorized requests.

**Acceptance criteria**
- Only enrolled students can check in for the correct session during the permitted window.
- Expired or unauthorized requests are rejected.
- Repeated requests are idempotent.

**Owner:** SHARED  
**Dependencies:** E07, E08

### S03 — Corrections and audit
**Tasks**
- `TZ-E09-S03-T01`: Implement authorized attendance edits.
- `TZ-E09-S03-T02`: Record actor, time, and reason where required.
- `TZ-E09-S03-T03`: Test audit history.

**Acceptance criteria**
- Corrections retain an audit trail and identify the authorized actor.

**Owner:** DEV-A  
**Dependencies:** S01

### S04 — Student attendance board
**Tasks**
- `TZ-E09-S04-T01`: Implement attendance history API.
- `TZ-E09-S04-T02`: Calculate attendance percentage using a documented formula.
- `TZ-E09-S04-T03`: Build session status UI.
- `TZ-E09-S04-T04`: Test privacy boundaries.

**Acceptance criteria**
- Students see only their own attendance records.

**Owner:** DEV-A + DEV-B  
**Dependencies:** S01–S03

### S05 — Attendance reports
**Tasks**
- `TZ-E09-S05-T01`: Implement batch summaries.
- `TZ-E09-S05-T02`: Implement branch summaries.
- `TZ-E09-S05-T03`: Add filters and reconciliation tests.

**Acceptance criteria**
- Authorized reports reconcile with session-level records.

**Owner:** DEV-A  
**Dependencies:** S01–S04

---

## E10 — Offline Fees Management

**Priority:** P1  
**Goal:** Track fee obligations and offline payments with a reliable audit trail.

### S01 — Fee structures and obligations
**Tasks**
- `TZ-E10-S01-T01`: Define fee configuration and due-date rules.
- `TZ-E10-S01-T02`: Assign fees to students/batches.
- `TZ-E10-S01-T03`: Compute balances and overdue state.

**Acceptance criteria**
- Each fee obligation has a clear amount, due date, student association, and lifecycle.

**Owner:** DEV-A  
**Dependencies:** E08

### S02 — Record offline payments
**Tasks**
- `TZ-E10-S02-T01`: Support configured methods such as cash, bank transfer, UPI, or cheque.
- `TZ-E10-S02-T02`: Validate amount and reference details.
- `TZ-E10-S02-T03`: Prevent duplicate payment requests.
- `TZ-E10-S02-T04`: Persist transactions and update balances safely.

**Acceptance criteria**
- Payments update outstanding balances correctly and remain traceable.
- No online payment gateway is required in V1.
- Partial payments are supported if enabled by the approved fee rules.

**Owner:** DEV-A + DEV-B  
**Dependencies:** S01

### S03 — Receipts and history
**Tasks**
- `TZ-E10-S03-T01`: Generate a unique receipt reference.
- `TZ-E10-S03-T02`: Display payment history.
- `TZ-E10-S03-T03`: Correct errors through controlled reversal/adjustment.
- `TZ-E10-S03-T04`: Test financial reconciliation.

**Acceptance criteria**
- Payment history is retained.
- Corrections do not silently overwrite original financial events.

**Owner:** DEV-A + DEV-B  
**Dependencies:** S02

### S04 — Student fee board
**Tasks**
- `TZ-E10-S04-T01`: Implement summary API.
- `TZ-E10-S04-T02`: Display paid, due, and outstanding amounts.
- `TZ-E10-S04-T03`: Show receipts and history.

**Acceptance criteria**
- Students see only their own permitted financial information.
- Displayed values reconcile with payment records.

**Owner:** DEV-A + DEV-B  
**Dependencies:** S01–S03

### S05 — Fee reminders
**Tasks**
- `TZ-E10-S05-T01`: Identify due and overdue obligations.
- `TZ-E10-S05-T02`: Schedule reminders.
- `TZ-E10-S05-T03`: Prevent duplicate reminders.
- `TZ-E10-S05-T04`: Record delivery outcomes.

**Acceptance criteria**
- Reminders use current outstanding balances.
- Fully paid obligations do not continue to trigger payment reminders.

**Owner:** DEV-A  
**Dependencies:** S01–S02, E12

---

## E11 — Notes and Assignment Publishing

**Priority:** P1  
**Goal:** Publish batch-targeted learning material without submission or grading workflows.

### S01 — Create learning material
**Tasks**
- `TZ-E11-S01-T01`: Define title, description, metadata, and relevant dates.
- `TZ-E11-S01-T02`: Support allowed attachment types and size limits.
- `TZ-E11-S01-T03`: Validate teacher/batch authorization.

**Acceptance criteria**
- Authorized teachers can create drafts for eligible batches.
- Attachments are access-controlled.

**Owner:** DEV-A + DEV-B  
**Dependencies:** E07

### S02 — Publish and manage content
**Tasks**
- `TZ-E11-S02-T01`: Implement publish, edit, unpublish, and archive actions.
- `TZ-E11-S02-T02`: Validate publication state transitions.
- `TZ-E11-S02-T03`: Audit sensitive content changes.

**Acceptance criteria**
- Only authorized users can publish to eligible batches.
- Unpublished content is not visible as active material.

**Owner:** SHARED  
**Dependencies:** S01

### S03 — Student notes/assignment board
**Tasks**
- `TZ-E11-S03-T01`: List published content.
- `TZ-E11-S03-T02`: Filter by batch, subject, and date.
- `TZ-E11-S03-T03`: Display metadata and attachments.

**Acceptance criteria**
- Students can see only material available to their active enrollments.

**Owner:** DEV-A + DEV-B  
**Dependencies:** S02, E08

### S04 — Publication notifications
**Tasks**
- `TZ-E11-S04-T01`: Emit publication event.
- `TZ-E11-S04-T02`: Dispatch in-app/push notifications.
- `TZ-E11-S04-T03`: Handle retries and duplicate events.

**Acceptance criteria**
- Eligible students receive supported notifications.
- Notification failure does not undo successful content publication.
- Routine learning-material notifications do not use WhatsApp by default.

**Owner:** DEV-A  
**Dependencies:** S02, E12

---

## E12 — Announcements and Notification Infrastructure

**Priority:** P1  
**Goal:** Provide a shared notification pipeline; reserve WhatsApp for critical communication.

### S01 — Notification subsystem
**Tasks**
- `TZ-E12-S01-T01`: Define notification/event contracts.
- `TZ-E12-S01-T02`: Implement channel dispatch interfaces.
- `TZ-E12-S01-T03`: Track delivery attempts and statuses.
- `TZ-E12-S01-T04`: Implement retry and idempotency behavior.

**Acceptance criteria**
- Events can be retried without duplicating business actions.
- Failures are observable and diagnosable.

**Owner:** DEV-A  
**Dependencies:** E01, E02

### S02 — In-app and push delivery
**Tasks**
- `TZ-E12-S02-T01`: Implement in-app notification inbox.
- `TZ-E12-S02-T02`: Integrate the chosen push provider where supported.
- `TZ-E12-S02-T03`: Track delivery status.
- `TZ-E12-S02-T04`: Handle invalid/revoked endpoints.

**Acceptance criteria**
- Supported channels deliver to eligible recipients.
- Invalid endpoints are handled safely.

**Owner:** DEV-A + DEV-B  
**Dependencies:** S01

### S03 — Critical WhatsApp delivery
**Tasks**
- `TZ-E12-S03-T01`: Define critical event categories.
- `TZ-E12-S03-T02`: Integrate an approved WhatsApp provider and templates.
- `TZ-E12-S03-T03`: Manage consent and recipient preferences.
- `TZ-E12-S03-T04`: Test provider failures and retries.

**Acceptance criteria**
- Only approved critical events trigger WhatsApp.
- Delivery failures are tracked and retried according to policy.
- Provider/template requirements and opt-out rules are respected.

**Owner:** DEV-A  
**Dependencies:** S01

### S04 — Announcement CRUDL
**Tasks**
- `TZ-E12-S04-T01`: Implement create/edit/list/archive.
- `TZ-E12-S04-T02`: Target branch, batch, or permitted audience.
- `TZ-E12-S04-T03`: Publish immediately.
- `TZ-E12-S04-T04`: Audit actions and validate audience membership.

**Acceptance criteria**
- Only authorized users can publish to eligible audiences.

**Owner:** DEV-A + DEV-B  
**Dependencies:** E04, E07, E08, S01

### S05 — Scheduled announcements
**Tasks**
- `TZ-E12-S05-T01`: Implement scheduling and cancellation.
- `TZ-E12-S05-T02`: Implement or adapt background worker.
- `TZ-E12-S05-T03`: Handle timezones and retries.
- `TZ-E12-S05-T04`: Prevent duplicate publication.

**Acceptance criteria**
- Scheduled announcements publish once at the intended local time or report a visible failure.

**Owner:** DEV-A  
**Dependencies:** S04

### S06 — Student notice board
**Tasks**
- `TZ-E12-S06-T01`: Fetch relevant announcements.
- `TZ-E12-S06-T02`: Implement read state if included.
- `TZ-E12-S06-T03`: Filter by relevance.
- `TZ-E12-S06-T04`: Enforce access boundaries.

**Acceptance criteria**
- Students see only announcements relevant to their eligible branch/batch or audience.

**Owner:** DEV-A + DEV-B  
**Dependencies:** S04

### S07 — Notification policy
**Tasks**
- `TZ-E12-S07-T01`: Define critical-event catalog.
- `TZ-E12-S07-T02`: Map channel preferences.
- `TZ-E12-S07-T03`: Document retry and fallback behavior.
- `TZ-E12-S07-T04`: Test recipient selection.

**Acceptance criteria**
- Fee reminders and designated critical announcements may use WhatsApp.
- Routine notes and assignment publications use in-app/push by default.
- Publication status is independent of delivery status.

**Owner:** SHARED  
**Dependencies:** S02–S05

---

## E13 — Enrolled-Student Explore

**Priority:** P1/P2  
**Goal:** Let existing students discover other eligible batches and teachers without public marketplace access.

### S01 — Explore API and filters
**Tasks**
- `TZ-E13-S01-T01`: Query eligible available batches.
- `TZ-E13-S01-T02`: Filter by branch, subject, or teacher.
- `TZ-E13-S01-T03`: Enforce authenticated institute membership and visibility.

**Acceptance criteria**
- Only eligible authenticated students can use Explore.
- Public anonymous discovery is not exposed.
- Private student, financial, and administrative data is not returned.

**Owner:** DEV-A  
**Dependencies:** E02, E07, E08

### S02 — Teacher and batch profiles
**Tasks**
- `TZ-E13-S02-T01`: Implement permitted profile/detail APIs.
- `TZ-E13-S02-T02`: Build Explore UI.
- `TZ-E13-S02-T03`: Restrict private data.

**Acceptance criteria**
- Students can view permitted teacher and batch information only.

**Owner:** DEV-A + DEV-B  
**Dependencies:** S01

### S03 — Request or initiate enrollment
**Tasks**
- `TZ-E13-S03-T01`: Define enrollment eligibility.
- `TZ-E13-S03-T02`: Integrate the approved enrollment flow.
- `TZ-E13-S03-T03`: Prevent duplicates and unauthorized branch changes.

**Acceptance criteria**
- Explore never bypasses enrollment policy, branch availability, or required approval.

**Owner:** SHARED  
**Dependencies:** S01, E04, E08

---

## E14 — Security, Quality, and Release Readiness

**Priority:** P0/P1  
**Goal:** Make V1 releasable, testable, and maintainable.

### S01 — Automated quality gates
**Tasks**
- `TZ-E14-S01-T01`: Add/update unit tests.
- `TZ-E14-S01-T02`: Add/update integration tests.
- `TZ-E14-S01-T03`: Configure lint, type-check, and build checks.
- `TZ-E14-S01-T04`: Integrate required checks into CI.

**Acceptance criteria**
- Required checks run consistently.
- Failures are not hidden or reported as successful without evidence.

**Owner:** SHARED  
**Dependencies:** E01 and ongoing implementation

### S02 — Authorization regression suite
**Tasks**
- `TZ-E14-S02-T01`: Cross-tenant access tests.
- `TZ-E14-S02-T02`: Cross-branch access tests.
- `TZ-E14-S02-T03`: Suspended-account tests.
- `TZ-E14-S02-T04`: Permission revocation and escalation tests.

**Acceptance criteria**
- Sensitive access paths have automated allow/deny coverage.

**Owner:** DEV-A  
**Dependencies:** E02 onward

### S03 — Operational visibility
**Tasks**
- `TZ-E14-S03-T01`: Add structured logs.
- `TZ-E14-S03-T02`: Add health checks where appropriate.
- `TZ-E14-S03-T03`: Add notification failure metrics.
- `TZ-E14-S03-T04`: Document error diagnosis.

**Acceptance criteria**
- Critical failures can be investigated without exposing secrets or sensitive data.

**Owner:** DEV-A  
**Dependencies:** E12

### S04 — Backup and recovery
**Tasks**
- `TZ-E14-S04-T01`: Document backup strategy.
- `TZ-E14-S04-T02`: Validate restoration in a suitable environment.
- `TZ-E14-S04-T03`: Document rollback and migration safety.

**Acceptance criteria**
- Recovery steps are documented and tested.

**Owner:** SHARED  
**Dependencies:** Database baseline and deployment setup

### S05 — End-to-end V1 validation
**Tasks**
- `TZ-E14-S05-T01`: Test institute onboarding through student enrollment.
- `TZ-E14-S05-T02`: Test attendance and fees.
- `TZ-E14-S05-T03`: Test content publishing and notifications.
- `TZ-E14-S05-T04`: Test dashboards, roles, and branch permissions.

**Acceptance criteria**
- Critical user journeys work across roles and branch boundaries.
- Remaining limitations are documented.

**Owner:** SHARED  
**Dependencies:** All critical epics

### S06 — Release checklist
**Tasks**
- `TZ-E14-S06-T01`: Verify configuration and secrets.
- `TZ-E14-S06-T02`: Review database migrations.
- `TZ-E14-S06-T03`: Verify deployment and rollback procedures.
- `TZ-E14-S06-T04`: Record release sign-off and known limitations.

**Acceptance criteria**
- Release decisions are evidence-based, not based solely on a successful local build.

**Owner:** SHARED  
**Dependencies:** S01–S05

---

# 5. Canonical Lifecycle Rules

These state machines are proposed defaults. Reconcile them with the current repository before changing persisted states.

| Entity | Proposed lifecycle | Rules |
|---|---|---|
| Institute | `PENDING_SETUP → ACTIVE → SUSPENDED ↔ ACTIVE → DEACTIVATED` | Deactivation is terminal by default; recovery requires explicit policy |
| Branch | `ACTIVE ↔ INACTIVE` | Inactive branches cannot accept new enrollments; historical records remain available to authorized users |
| Account | `INVITED → ACTIVE ↔ SUSPENDED → DEACTIVATED` | Deactivated accounts cannot authenticate; suspension blocks normal access |
| Moderator permission | `GRANTED ↔ REVOKED` | Revocation takes effect on subsequent authorization checks |
| Teacher assignment | `ASSIGNED ↔ UNASSIGNED` | Removing an assignment does not delete past classes or attendance |
| Batch | `DRAFT → UPCOMING → ACTIVE → COMPLETED` or `CANCELLED` | Terminal batches cannot accept new sessions/enrollments unless a documented exception applies |
| Enrollment | `PENDING → ACTIVE → COMPLETED` or `WITHDRAWN` | Transfers preserve prior enrollment history |
| Attendance | `OPEN → RECORDED → CORRECTED` | Corrections retain audit history; check-in requires an eligible session |
| Fee obligation | `PENDING → PARTIALLY_PAID → PAID`, with `OVERDUE` derived where appropriate | Overdue status must not overwrite payment history |
| Payment | `RECORDED → REVERSED` where applicable | Reversal is an auditable compensating transaction, not deletion |
| Learning material | `DRAFT → PUBLISHED → UNPUBLISHED/ARCHIVED` | Only published eligible content is visible to students |
| Announcement | `DRAFT → SCHEDULED → PUBLISHED` or `CANCELLED` | Delivery failure does not undo publication |
| Notification | `PENDING → PROCESSING → SENT/FAILED` | Retryable failures are tracked; duplicate processing must not duplicate business actions |

Do not implement lifecycle transitions as unrelated UI-only status changes. Enforce them in the domain/service layer and test invalid transitions.

---

# 6. Permission Catalog

Use the existing authorization model if it is sound; otherwise, evolve it toward explicit permissions such as:

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
- `ASSIGNMENT_MANAGE`
- `ANNOUNCEMENT_MANAGE`
- `DASHBOARD_VIEW`
- `DASHBOARD_FEES_VIEW`
- `ENROLLMENT_MANAGE`

For every permission, document the allowed action, eligible roles, resource scope, branch-assignment requirement, audit requirement, and revocation behavior.

A moderator's effective access must be constrained by account status, institute status, assigned branches, explicit permissions, and resource ownership. Do not grant institute-wide access implicitly.

---

# 7. Dependency and Execution Plan

Recommended order:

1. **Foundation:** E01 audit, repository instructions, backlog, and task tracking.
2. **Security and organization:** E02 identity/tenant isolation, E03 institutes, E04 branches, E05 moderator/staff lifecycle.
3. **Academic foundation:** E07 batches/sessions and E08 students/enrollment.
4. **Teaching workflows:** E09 attendance and E11 learning material.
5. **Financial workflow:** E10 offline fees.
6. **Communications and visibility:** E12 notifications/announcements, E06 dashboard, E13 Explore.
7. **Release validation:** E14 security regression, integration tests, recovery, and production readiness.

This is not strictly sequential. E12 notification infrastructure can be developed alongside academic workflows after event contracts are agreed. Dashboard UI can be built against agreed API contracts before all reporting endpoints are complete.

## Suggested parallel work

| Stage | DEV-A | DEV-B | Shared integration |
|---|---|---|---|
| Foundation | Audit backend, identity, authorization | Audit frontend, routes, screens, tests | Baseline and backlog |
| Organization | Institute/branch APIs and permissions | Onboarding and admin UI | Contracts and access tests |
| Academic foundation | Domain models and APIs | Batch/student/teacher screens | Enrollment and branch invariants |
| Core workflows | Fees and attendance APIs | Attendance UI and student boards | Cross-role tests |
| Content/comms | Notification worker and provider adapters | Notes, announcements, Explore UI | Event contracts and delivery tests |
| Release | Security, logs, migrations | UX/accessibility and E2E flows | Release gates |

Adjust ownership after inspecting the actual modules. Tasks with unmet dependencies must not be claimed for active implementation unless they are explicitly independent.

---

# 8. Work-Claim and Progress Tracking Rules

1. A developer claims a task before modifying its implementation.
2. A task with unmet dependencies cannot enter active implementation unless explicitly approved as independent work.
3. A task already claimed by the other developer cannot be claimed again without coordination.
4. Shared files and API contracts require explicit coordination before concurrent changes.
5. A blocked task records the reason, blocking dependency, and next action.
6. A reviewer verifies acceptance criteria and relevant tests before completion.
7. `DONE` requires implementation, verification, review, and documentation updates where needed.
8. Scope changes update the story, dependencies, and affected tasks instead of silently changing expectations.
9. Record actual timestamps and evidence; never fabricate progress or test results.
10. Keep the tracker in the existing project tracker or repository format rather than creating a duplicate system.

### Suggested daily coordination

- **Start of day:** Each developer claims dependency-ready work.
- **During implementation:** Update status when work starts or becomes blocked.
- **Before integration:** Verify API contracts and run targeted tests.
- **End of day:** Record completed work, test evidence, blockers, and the next actionable task.

Do not measure progress only by task count. Completing a critical security foundation is more valuable than completing several disconnected screens.

---

# 9. V1 Release Acceptance Gates

Use this checklist as a manual release tracker. Checking an item is not proof of success; evidence must come from tests, reviews, and environment validation.

- [ ] **Institute and branch isolation:** Onboarding, branch lifecycle, moderator scope, and tenant-isolation tests pass.
- [ ] **Identity and enrollment:** Multi-branch users, batch assignments, and transfers preserve history.
- [ ] **Attendance:** Teacher recording and verified student check-in work with session/enrollment validation.
- [ ] **Offline fees:** Payments, balances, receipts, corrections, and reminders reconcile correctly.
- [ ] **Learning content:** Authorized teachers publish content; students see only eligible published material.
- [ ] **Notifications:** In-app/push delivery works; critical WhatsApp delivery is tracked, retryable, and preference-aware.
- [ ] **Administration and Explore:** Dashboard metrics respect permissions; Explore is restricted to authenticated eligible students.
- [ ] **Production verification:** CI checks, authorization tests, migration safety, monitoring, backup, and recovery procedures are verified.

---

# 10. Vibe-Coding and AI Agent Workflow Requirements

Inspect existing AI coding setup before introducing files or rules.

## Root `AGENTS.md`

Create or improve the root `AGENTS.md` as the canonical repository guidance. It should document:

- Product overview and V1 boundaries.
- Repository architecture and module responsibilities.
- Coding and naming conventions.
- Build, test, lint, and validation commands.
- Database migration and API contract rules.
- Authorization and tenant-isolation requirements.
- Testing and documentation expectations.
- How to update ADRs and project context.
- Work-claim, blocker, review, and completion rules.
- Verification and reporting requirements.

Nested agent instructions may be added where needed, but their scope must be clear and they must not contradict the root guidance.

## Architecture decision records

Record significant choices such as:

- Multi-tenant data isolation.
- Role and permission design.
- Branch assignment rules.
- Lifecycle transitions.
- Student identity vs enrollment modeling.
- Fee/payment record semantics.
- Notification architecture.
- API compatibility and migration strategy.

An ADR should capture context, decision, alternatives considered, and consequences. Do not create ADRs for every minor code change.

## Durable project context

Keep distinct, concise sources of truth for:

1. Product requirements.
2. Architecture and design decisions.
3. Current implementation state.
4. Active tasks and ownership.
5. Known issues and blockers.
6. Temporary investigation notes.

Update the relevant documentation when architecture, workflow, API contracts, or product decisions change. Do not rely solely on conversational memory or a single ever-growing context file.

---

# 11. Production-Readiness Requirements

## Functional correctness
- End-to-end flows work across relevant roles.
- Lifecycle transitions behave correctly.
- Permissions are enforced on every sensitive backend operation.
- Historical records remain consistent after transfers or deactivation.

## Security
- Cross-institute access is denied.
- Cross-branch access follows explicit permissions.
- Secrets are not committed.
- Attachments are access-controlled.
- Administrative operations are auditable.
- Input is validated and sensitive data is not exposed in logs/errors.

## Reliability
- Notification failures do not corrupt the underlying business operation.
- Background jobs can be retried safely.
- Duplicate processing is handled.
- Database migrations are safe.
- Failure recovery is documented.

## Quality
- Unit tests cover domain behavior.
- Integration tests cover API and persistence behavior.
- Authorization tests cover allowed and denied access.
- End-to-end tests cover critical journeys.
- CI validates required checks.
- Accessibility and responsive behavior are checked on relevant screens.

## Operations
- Health checks and structured logs exist where appropriate.
- Failures can be diagnosed.
- Backups and restoration are validated.
- Environment configuration is documented.
- Deployment and rollback procedures are documented.

Distinguish between implemented, tested, and production-validated capabilities. A successful local build alone does not establish production readiness.

---

# 12. Required Deliverables

By the end of the revamp, the repository should contain or have updated equivalents for:

1. Current-state architecture and implementation audit.
2. V1 product requirements and scope boundaries.
3. Feature coverage matrix.
4. Domain model and relationship documentation.
5. Role-permission matrix.
6. Lifecycle and state-transition documentation.
7. API and integration contracts.
8. Epic → Story → Task backlog.
9. Developer ownership and dependency plan.
10. Task ledger and status conventions.
11. Root `AGENTS.md` and any necessary scoped instructions.
12. Architecture decision records.
13. Testing and verification strategy.
14. V1 implementation roadmap.
15. Production-readiness checklist.
16. Updated implementation code and tests for approved dependency-ready work.

Follow existing directory conventions. Improve existing documents rather than creating duplicates.

---

# 13. Execution Protocol for the Coding Agent

1. Audit the repository and run baseline checks.
2. Present current-state findings and the V1 gap analysis.
3. Map every epic/story to actual modules and files where possible.
4. Identify architectural risks and required corrections.
5. Propose the domain model, authorization strategy, and lifecycle transitions.
6. Create or update the backlog and developer work plan.
7. Update AI instructions and project tracking.
8. Start implementation with the highest-priority dependency-ready work.
9. Verify each increment and update the task ledger.
10. Report what changed, what was tested, what remains, and what is blocked.

## Execution rules

- Inspect before modifying.
- Reuse correct existing code.
- Prefer incremental refactoring over wholesale rewrites.
- Do not silently change the technology stack.
- Do not remove existing features without a documented reason.
- Do not add dependencies without evaluating their necessity.
- Do not expose secrets or sensitive user data.
- Do not treat frontend role checks as backend authorization.
- Do not claim tests passed unless they were actually run.
- Do not mark tasks complete without verification evidence.
- Do not introduce migrations that silently discard historical data.
- Do not expand V1 with unrelated features.
- Keep documentation synchronized with implementation.
- Preserve backward compatibility where required and document intentional breaking changes.
- Make assumptions explicit and track unresolved product decisions.
- If blocked, record the blocker and continue with independent work where possible.

**Definition of success:** The existing TutorZen repository evolves into a coherent, testable, maintainable V1 implementation with clearly defined product boundaries, enforceable permissions, reliable workflows, traceable development progress, and a documented path to production deployment.

**Important:** This document defines the agreed V1 scope and proposed backlog. It does not claim that the repository has already been audited, tasks imported into a tracker, or features implemented. The next concrete step is to map this backlog to the actual codebase and update statuses based on evidence.
