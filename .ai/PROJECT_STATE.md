# Project State

Last verified: 2026-10-15

## Current status

- [VERIFIED] Establish AI instructions and project-memory conventions.
- [VERIFIED] Audit repository, establish monorepo workspace structure, and add root `.gitignore`.
- [VERIFIED] Establish `@tutorzen/design-tokens` package with typography, palette, spacing, radii, and Claymorphism surface tokens (6 tests passing).
- [VERIFIED] Scaffold `@tutorzen/mobile` Expo + React Native + TypeScript app with ThemeProvider, EB Garamond & Barlow fonts, tactile components, and initial home screen (typecheck passing).
- [VERIFIED] Implement Teacher Flow on mobile: TeacherHomeScreen (Screen 5), MarkAttendanceScreen (Screen 14 with Strategy Pattern: Bulk, QR, 6-Digit PIN), TeacherBottomNav, and live screen transitions (typecheck passing).
- [VERIFIED] Scaffold `apps/backend` Spring Boot 3.4.x modular monolith with TenantContext isolation, attendance Strategy Pattern (Bulk, QR, 6-digit PIN), offline synchronization service, Flyway baseline migration, TeacherSessionController, and StudentAttendanceController REST endpoints (24 unit/integration tests passing).
- [VERIFIED] Implement Student Flow on mobile: StudentHomeScreen (Screen 4 with streak banner, active session card, quick actions), StudentAttendanceEntryScreen (Screen 15 with 6 tactile PIN boxes, on-screen keypad, QR scan simulation, and expiry feedback), StudentAttendanceSummaryScreen (Screen 13 with 92% circular metric card, status breakdown, policy notices, and log), StudentBottomNav, and RoleSwitcherPill (typecheck passing).
- [VERIFIED] Establish interactive end-to-end multi-persona loop between Teacher and Student roles with coordinated session PIN, real QR payload, and expiration enforcement.
- [VERIFIED] Establish `infrastructure/docker/docker-compose.yml` for local PostgreSQL database.
- [PLANNED] Implement authentication/session API & JWT exchange for teachers and students.
- [PLANNED] Implement Guardian / Parent Flow (Screen 10 & 11) for linked learner progress and attendance oversight.

## Known product decisions carried into this starter

- Attendance marking uses a Strategy Pattern (ADR-0002).
- Offline attendance synchronization is a separate component (ADR-0003).
- QR and six-digit-code validity/policies are tenant-configurable (ADR-0004).
- Platform Super Admin / God View UI is deferred (ADR-0005).
- The UX direction is restrained Claymorphism with EB Garamond and Barlow (ADR-0006).

## Verification

- `packages/design-tokens`: `npx tsc` and `npx tsx --test` passed 6/6 tests.
- `apps/mobile`: `npx tsc --noEmit` typecheck passed with 0 errors across all screens, components, and navigators.
- `apps/backend`: `./mvnw test` passed 24/24 JUnit unit and integration tests with 0 failures and 0 errors.
- Expo Web Server: Running on `http://localhost:8081` serving interactive Teacher and Student flows with live role toggle.
