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
- Spring Boot 3.5.x
- PostgreSQL
- Flyway migrations
- React Native + TypeScript + Expo
- OCI deployment direction
- Modular monolith

Do not assume these are present in the current repository until inspected.

## Out of scope until explicitly approved

- Platform Super Admin / global God View UI.
- Splitting the modular monolith into microservices.
- Unrequested technology migrations or wholesale rewrites.
