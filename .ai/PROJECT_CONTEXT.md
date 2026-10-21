# Project Context — TutorZen

## Product summary

TutorZen is a multi-tenant coaching management system intended to help coaching centers manage academic operations, learners, staff, attendance, learning materials, assessments, fees, communication, and reporting.

## User roles

- **Student:** View active schedule, topic history, verified self-check-in via PIN/QR, personal attendance percentage and history, offline fee balance and receipts, published lecture notes/assignments, 1-level nested discussion threads, notice board, and enrolled-student batch explore.
- **Teacher:** View assigned batches/schedule, start class sessions with topic/syllabus notes, mark attendance (Bulk, QR, 6-digit PIN), upload subject-scoped lecture notes/assignments, and view enrolled student rosters.
- **Moderator:** Branch-scoped operational staff; access restricted strictly to explicitly assigned branches and delegated permissions (e.g. `BRANCH_MANAGE`, `FEES_MANAGE`, `STAFF_LIFECYCLE_MANAGE`). Zero implicit institute-wide access.
- **Institute Admin:** Manage institute profile, branches, moderators with delegated permissions, staff/teacher lifecycles, and view branch-wise God Mode dashboard with independent financial report delegation (`DASHBOARD_FEES_VIEW`).
- **Platform Admin:** Provision institutes, manage initial institute admin onboarding, and oversee platform administrative audit history. Global end-user "God View" across institutes is deferred; institute-level branch God Mode is in-scope.

Roles and permissions must be verified against current product requirements; this list is a planning baseline, not a complete authorization matrix.

## Product principles

1. Tenant and branch isolation are fundamental security invariants.
2. Mobile flows optimize frequent, time-sensitive tasks such as checking today's classes and marking attendance.
3. The UI should feel calm, approachable, modern, and consistent (restrained Claymorphism).
4. Offline attendance must be explicit about pending synchronization and conflicts.
5. Business rules must be testable independently from UI and infrastructure.
6. The repository and its project memory are the durable source of truth for AI-assisted work.

## UX direction

- Claymorphism with restraint: warm neutral surfaces, rounded cards, subtle layered shadows/highlights, forest-green primary accents.
- EB Garamond for prominent headings; Barlow for body and functional UI.
- Accessibility and task completion take precedence over decoration.
- See `docs/design-system/DESIGN_SYSTEM.md` and `docs/ux/MOBILE_FLOWS.md`.

## Technical baseline (verified in code)

- Java 21
- Spring Boot 3.4.3 (`apps/backend/pom.xml`)
- PostgreSQL 16 (`infrastructure/docker/docker-compose.yml`)
- Flyway migrations applied: `V1` (tenants, attendance), `V2` (identity, credentials, refresh tokens), `V3` (subjects, batches, students, sessions), `V4` (materials)
- React Native 0.76 + TypeScript 5.8 + Expo SDK 52 (managed workflow)
- Multi-container Docker orchestration (`docker-compose.yml`) running Postgres, API, and Web UI
- Modular monolith architecture

## V1 scope boundary (authoritative Rehaul Edition)

V1 is the initial production release across multi-institute and multi-branch operations. It includes:

1. **Authentication & Identity** — Stateless JWT, 7d rotating refresh tokens, BCrypt, 401 transparent interceptor, and role-aware workspaces.
2. **Multi-Branch Hierarchy & Tenancy** — Institute onboarding, branch administration (`ACTIVE`/`INACTIVE`), and branch-scoped data isolation.
3. **Academic & Batch Management** — Batch CRUDL, weekly class timings, and session topic/syllabus tracking.
4. **Attendance Management** — Teacher roster marking (Bulk, QR, PIN), verified student PIN/QR check-in with duplicate submission defense (`409 Conflict`), and live summary statistics.
5. **Offline Fees Only (No Gateway)** — Configure fee plans, record offline payments (Cash, UPI, Cheque, Bank Transfer), issue receipts, and auditable compensating reversals. No online payment gateways in V1.
6. **Notes & Assignments (Publishing Only)** — Teachers publish notes and assignments with deadlines and batch targeting; students view materials; 1-level nested discussion comments. No student submissions or grading in V1.
7. **Dual-Channel Notifications** — In-App/Push for routine notices; WhatsApp strictly for critical alerts (student absence, fee receipts/reminders, urgent schedule changes).
8. **Enrolled-Student Explore** — Authenticated students explore other active batches/teachers within permitted institute scope only. No public marketplace.

Deferred to post-V1:
- Online payment gateways (Stripe/Razorpay)
- Student assignment submissions, grading, and plagiarism checks
- Dedicated Guardian/Parent mobile portal
- Assessment and percentile ranking engine
- Public marketplace / anonymous browsing
- Offline sync queue (manual attendance marking acceptable for V1)

## Out of scope until explicitly approved

- Platform Super Admin / global God View UI.
- Splitting the modular monolith into microservices.
- Unrequested technology migrations or wholesale rewrites.
