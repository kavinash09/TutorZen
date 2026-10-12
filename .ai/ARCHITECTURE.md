# Architecture Overview

## Architecture style

Target: modular monolith with explicit feature boundaries. Keep deployment and data management simple while preventing the codebase from becoming a tightly coupled monolith.

## Suggested repository layout

```text
apps/
  backend/             # Java/Spring Boot API and application runtime
  mobile/              # React Native + TypeScript + Expo
packages/
  api-contracts/       # Only if contracts can be shared safely
  design-tokens/       # Shared design tokens if supported by chosen toolchain
docs/
  architecture/
  domain/
  ux/
  design-system/
infrastructure/
  docker/
  database/
.ai/
```

Adapt to existing repository conventions rather than forcing this layout onto working code.

## Backend module candidates

- `identity`: authentication and identity lifecycle.
- `tenancy`: tenant context, tenant lifecycle, tenant configuration.
- `authorization`: roles, permissions, policy enforcement.
- `students`: learner profiles and enrollment.
- `staff`: teachers and staff profiles.
- `academics`: subjects, courses, batches, class schedules and sessions.
- `attendance`: attendance methods, records, attendance policies.
- `attendance-sync`: offline submission queue processing, idempotency and conflict resolution.
- `materials`: learning materials and distribution.
- `assignments`: assignment creation and submissions.
- `assessments`: tests, marks and results.
- `fees`: fee plans, invoices, payment records and reconciliation.
- `notifications`: in-app and external notification delivery.
- `reports`: tenant-scoped reporting and exports.
- `audit`: security-sensitive and business audit records.

These are candidate boundaries. Confirm ownership and split modules based on actual requirements and code, not folder count alone.

## Dependency rules

- UI depends on API contracts, not backend implementation details.
- Controllers/adapters call application use cases.
- Application use cases orchestrate domain behavior and ports.
- Domain logic should not depend on web frameworks or database clients.
- Persistence adapters implement module-owned ports.
- Cross-module access goes through explicit public interfaces/events.
- Avoid cycles; shared packages must not become a home for arbitrary business logic.

## Attendance design

- A strategy interface selects a marking method such as `BULK`, `QR`, or `SIX_DIGIT_CODE`.
- Each strategy validates method-specific input and delegates common authorization/session checks to the appropriate application service.
- Tenant settings configure enabled methods and QR/code validity.
- Offline synchronization is a separate component responsible for queued submissions, retry policy, idempotency keys, conflict handling, and sync outcomes.
- Server validation remains authoritative. Offline clients must not be able to bypass tenant or session authorization.
- Exact expiry, duplicate, late-submission, and conflict policies require explicit product decisions and tests.

## Multi-tenancy and security

- Resolve tenant context through a trusted authentication/routing mechanism; never trust an arbitrary client-supplied tenant ID alone.
- Scope reads and writes to the authenticated tenant.
- Enforce object-level authorization and tenant scoping in application/data access paths.
- Consider database constraints, indexes, and tests that detect cross-tenant access.
- Avoid tenant-specific sensitive data in logs and analytics.
- Platform-wide administration remains deferred; foundations must be explicit without creating the deferred UI.

## Database and migrations

- Use versioned migrations (Flyway in the proposed stack).
- Never edit an already-applied migration as a routine change; add a forward migration.
- Review destructive changes, lock impact, backfills, rollback/recovery, and tenant data impact.
- Test migration behavior against a disposable database or established integration-test environment.

## Mobile architecture

- Organize by user-facing feature and shared infrastructure.
- Separate navigation, API client, authentication/session, offline queue, design system, and feature screens.
- Keep role-specific routes protected by authorization-aware navigation; server remains the authority.
- Represent loading, empty, error, offline, syncing, and conflict states explicitly.
- Keep offline attendance queue behavior separate from the attendance screen's UI.
