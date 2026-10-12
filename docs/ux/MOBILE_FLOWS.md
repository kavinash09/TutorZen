# Mobile Application — Flow Inventory

This is a planning inventory based on discussed product scope and the generated visual concept. It is not proof that every flow is approved or implemented. Validate against requirements and role/permission rules before coding.

## A. Entry and identity

1. Splash / app initialization
2. Welcome and sign-in
3. Account recovery
4. Account creation or invitation acceptance (if supported)
5. Role-aware landing/navigation
6. Session expiry and sign-out

## B. Student

1. Home: today's classes, pending work, notices
2. My classes and class detail
3. Study materials: browse, search, view/download
4. Assignments: list, detail, submission, status
5. Tests/exams: schedule, instructions, attempt (if online attempts are supported)
6. Results and subject-wise performance
7. Attendance summary and history
8. Fees: dues, history, payment status, payment provider handoff if enabled
9. Notifications and announcements
10. Profile, linked guardian, preferences, support

## C. Parent

1. Parent home and linked learner selection (if multiple learners are supported)
2. Learner schedule and class details
3. Attendance and absence history
4. Materials, assignments, tests, results
5. Fee status and payment workflow
6. Notices and notifications
7. Profile and support

## D. Teacher

1. Teacher home and today's schedule
2. Assigned classes/batches and session details
3. Mark attendance: bulk
4. Mark attendance: QR
5. Mark attendance: six-digit code
6. Attendance review, validation and save confirmation
7. Offline attendance queue and sync status
8. Sync failure/conflict details and retry
9. Upload/manage materials
10. Create/manage assignments and assessments (subject to approved scope)
11. Notices and profile

## E. Coaching / Center Admin

1. Admin home and operational summary
2. Student search, profile, enrollment and status
3. Staff/teacher management
4. Batch, subject, schedule and class-session management
5. Tenant attendance policy configuration
6. Fee plans, dues, payment records and reconciliation
7. Materials and announcements management
8. Reports and exports
9. Tenant settings, role/permission management and audit view as approved

## F. Shared/system states

- Loading, empty, offline, syncing, retrying, error, and success states
- Session expired / unauthorized
- Tenant disabled or unavailable
- Permission denied
- Stale QR/code or expired attendance session
- Duplicate attendance submission
- Conflicting offline and server-side attendance records
- Payment pending, failed, cancelled, and successful (depending on provider)
- Notification permission unavailable
- App update or network failure

## G. Attendance flow requirements

- Method selection is explicit: bulk, QR, or six-digit code.
- QR/code validity is driven by tenant configuration and validated server-side.
- Do not display or log reusable secrets beyond the intended UI.
- Offline capture shows pending sync status.
- Sync operations are idempotent and return per-record outcomes.
- Retry does not create duplicate attendance.
- Conflicts are surfaced with understandable next steps; do not silently overwrite server truth.
- Exact policy for stale sessions, duplicate submissions, late sync, and conflicts needs approved product decisions.

## H. Platform Super Admin

Global God View UI is deferred. Do not add screens to this flow inventory as implemented. Revisit only when a separate approved task defines scope and authorization.

## UX design handoff checklist per screen

- User role and required permission
- Entry point and exit/back behavior
- Primary and secondary actions
- Data loading and empty state
- Validation and error behavior
- Offline behavior and retry
- Accessibility labels/focus order
- Analytics/audit events if required
- API contract and tenant scoping
- Acceptance criteria and tests
