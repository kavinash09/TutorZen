# Module Boundary Catalogue

Use as a candidate catalogue; reconcile with existing source packages before moving code.

| Module | Owns | Avoids owning |
|---|---|---|
| Identity | Authentication/session identity | Business-specific permissions in UI |
| Tenancy | Tenant lifecycle/context/configuration | Arbitrary cross-tenant queries |
| Authorization | Role/permission/policy evaluation | Frontend-only security |
| Students | Student profile/enrollment lifecycle | Payment gateway implementation |
| Staff | Staff and teacher profiles | Attendance synchronization queue |
| Academics | Subjects, batches, schedules, sessions | Notification provider internals |
| Attendance | Attendance records and marking strategies | Offline retry orchestration |
| Attendance Sync | Offline queue ingestion, idempotency, retries, conflicts | UI presentation state |
| Materials | Learning content metadata/access rules | Assessment grading |
| Assignments | Assignment lifecycle and submissions | General file-storage internals |
| Assessments | Tests, marks, result calculations | Fee invoices |
| Fees | Fee plans, dues, payments and reconciliation | Client payment UI |
| Notifications | Notification lifecycle and delivery adapters | Owning academic source data |
| Reports | Tenant-scoped read models and exports | Unrestricted direct database access |
| Audit | Audit event persistence and query policy | Secrets or excessive personal data |

## Boundary rules

- A module exposes a small public application interface.
- Internal entities/repositories should not be imported by other modules.
- Cross-module writes should be explicit and transactional where needed.
- Events are for decoupling; do not use an event bus for every simple in-process call.
- Shared DTOs should be stable, minimal, and owned intentionally.
- Add architecture tests where practical to prevent cycles and forbidden dependencies.
