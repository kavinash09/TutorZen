# Project Context — TutorZen

## Product summary

TutorZen is a multi-tenant coaching management system intended to help coaching centers manage academic operations, learners, staff, attendance, learning materials, assessments, fees, communication, and reporting.

## User roles

- **Student:** view schedule, attendance, materials, assignments, tests, results, fee status, and notices.
- **Parent:** view linked learner progress, attendance, notices, and fee information according to permissions.
- **Teacher:** view assigned classes, manage academic content, and mark attendance for authorized sessions.
- **Coaching/Center Admin:** manage the tenant's operational setup, users, batches, schedules, fee workflows, and reports within granted permissions.
- **Platform Super Admin:** global God View interface is explicitly deferred. Do not implement it without a new approved task.

Roles and permissions must be verified against current product requirements; this list is a planning baseline, not a complete authorization matrix.

## Product principles

1. Tenant isolation is a security invariant.
2. Mobile flows should optimize frequent, time-sensitive tasks such as checking today's classes and marking attendance.
3. The UI should feel calm, approachable, modern, and consistent.
4. Offline attendance must be explicit about pending synchronization and conflicts.
5. Business rules must be testable independently from UI and infrastructure.
6. The repository and its project memory are the durable source of truth for AI-assisted work.

## UX direction

- Claymorphism with restraint: warm neutral surfaces, rounded cards, subtle layered shadows/highlights, forest-green primary accents.
- EB Garamond for prominent headings; Barlow for body and functional UI.
- Accessibility and task completion take precedence over decoration.
- See `docs/design-system/DESIGN_SYSTEM.md` and `docs/ux/MOBILE_FLOWS.md`.

## Technical baseline (verify before changing)

- Java 21
- Spring Boot 3.4.x (actual: **3.4.3** — verified in `apps/backend/pom.xml`; do not assume 3.5.x)
- PostgreSQL (local: `infrastructure/docker/docker-compose.yml`)
- Flyway migrations (one migration applied: `V1__init_schema.sql`)
- React Native + TypeScript + Expo (managed workflow)
- OCI deployment direction (SSH key at `oraclemachine/ssh-key-2026-10-17.key`)
- Modular monolith

Do not assume these are present in the current repository until inspected.

## V1 scope boundary (authoritative)

V1 is the first release to real users. It must include:

1. **Authentication and session management** — JWT-based, server-enforced. Currently missing; Spring Security dependency exists but is not configured.
2. **Real persistence** — At minimum: identity, tenant, and attendance records read/written through the database. Currently all business data is hardcoded or in-memory.
3. **Tenant isolation** — Tenant ID must be derived from authenticated session, not a client-supplied HTTP header (`X-Tenant-ID`). Currently the `TenantFilter` trusts any header value.
4. **At least one complete end-to-end user journey** — Teacher marks attendance for a real session; record is persisted and retrievable. Currently all data is mocked.
5. **React Navigation library** — Manual `useState` screen switching is not production-ready for a multi-screen app.

Features that can be deferred beyond V1:
- Guardian/Parent flow
- Reports and exports
- Notifications (beyond basic)
- Learning materials and assignments
- Fees module
- Offline sync queue (manual attendance marking acceptable for V1)

## Out of scope until explicitly approved

- Platform Super Admin / global God View UI.
- Splitting the modular monolith into microservices.
- Unrequested technology migrations or wholesale rewrites.
