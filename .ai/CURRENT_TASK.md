# Current Task: Foundation Hardening — Authentication & Real Persistence

## Goal

Transition TutorZen from a UI/documentation prototype to a V1-ready foundation. Implement authentication (JWT-based identity with refresh token rotation), replace hardcoded mock data with real database persistence, and connect the mobile client with proper navigation and authentication.

## Acceptance Criteria

### Backend Authentication & Security (COMPLETED)

- [x] `identity` module: User entity, credential storage (BCrypt), RefreshToken entity with SHA-256 token hashing, `AuthService`, and endpoints (`POST /api/v1/auth/sign-in`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/sign-out`).
- [x] `SecurityFilterChain` configured: stateless JWT filter chain, role-based authorization (`TEACHER`, `STUDENT`, `ADMIN`), 401 unauthenticated JSON responses, and BCryptPasswordEncoder.
- [x] `TenantFilter` updated to derive tenant strictly from verified JWT claims; unauthenticated `X-Tenant-ID` header spoofing ignored for authenticated requests.
- [x] `V2__identity_schema.sql` Flyway migration: `users`, `user_credentials`, and `refresh_tokens` tables with foreign keys and index scoping, plus seed demo users.
- [x] 34 backend unit and integration tests passing (`./mvnw test`) covering sign-in, token rotation, sign-out, 401 unauthenticated, 403 unauthorized, and tenant spoofing rejection.

### Real Academics & Teacher Session Persistence (COMPLETED)

- [x] `V3__academics_schema.sql` migration: `subjects`, `batches`, `students`, `batch_enrollments`, and `class_sessions` with seed data.
- [x] JPA entities (`ClassSession`, `Student`, `Batch`, `AttendanceRecordRepository`) in `com.tutorzen.academics` and `com.tutorzen.attendance.domain`.
- [x] `TeacherSessionController` connected to repositories: reads real sessions from DB, generates real session codes, and persists marked attendance records to `attendance_records` table.
- [x] Integration tests: `TeacherSessionPersistenceTests` (37/37 backend tests passing).

### Mobile Authentication & Teacher Flow Integration (COMPLETED)

- [x] `apiClient.ts` handles JWT access token + refresh token, automatic 401 refresh, and authenticated API calls.
- [x] `AuthContext.tsx` and `AuthScreen.tsx` implemented with 1-tap demo credentials (`teacher@demo.com`, `student@demo.com`).
- [x] `TeacherHomeScreen.tsx` fetching today's sessions from backend with visual online indicator.
- [x] `MarkAttendanceScreen.tsx` loading batch roster from backend, syncing session codes with backend DB, and submitting bulk attendance.
- [x] `App.tsx` wired with `AuthProvider` and sign-out header action.

### Learning Materials & Upload Notes (COMPLETED)

- [x] ADR-0011: Subject-scoped learning materials metadata repository.
- [x] `V4__materials_schema.sql` migration: `learning_materials` table with indexes and seed data.
- [x] JPA entities (`Subject`, `LearningMaterial`) and repositories in `com.tutorzen.academics` and `com.tutorzen.materials`.
- [x] `TeacherMaterialsController`: `GET /api/v1/teacher/materials`, `POST`, `DELETE`, and `GET /subjects`.
- [x] 6 integration tests in `TeacherMaterialsPersistenceTests.java` (46/46 total backend tests passing).
- [x] Mobile `apiClient.ts` methods for materials (`getMaterials`, `uploadMaterial`, `deleteMaterial`, `getSubjects`).
- [x] `UploadNotesScreen.tsx` with Claymorphic aesthetic, subject pills, interactive file upload dropzone, native OS file picker, and published notes list with delete action.
- [x] UI field validation: Clicking publish without required title or attached file highlights inputs in red with "Required" indicators, warning captions, and auto-clears on input/upload.
- [x] Unit tests in `materials.test.ts` (20/20 total mobile unit tests passing).


### Student Attendance Real Persistence & Mobile Integration (ACTIVE / NEXT)

- [ ] Update `StudentAttendanceController` to validate session PIN/QR against `ClassSessionRepository` and persist attendance to `AttendanceRecordRepository`.
- [ ] Implement dynamic attendance summary calculation in `StudentAttendanceController.getStudentAttendanceSummary` from database records.
- [ ] Wire `StudentAttendanceEntryScreen.tsx` to `apiClient.submitAttendance()` via authenticated student JWT.
- [ ] Wire `StudentAttendanceSummaryScreen.tsx` to `apiClient` to fetch live student attendance stats.
- [ ] Add integration tests in `apps/backend` verifying student submission persistence and summary metrics.

### React Navigation (UPCOMING)

- [ ] Install `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`.
- [ ] Replace manual `useState` routing in `App.tsx` with proper navigation stacks for Auth, Teacher, and Student.

### Security checklist (Verified)

- [x] No tenant ID is trusted from an unauthenticated source for authenticated requests.
- [x] Passwords are never logged or returned in any response (BCrypt hashed).
- [x] JWT secret externalized via environment variable with fallback for dev.
- [x] All protected endpoints return 401 when JWT is missing or invalid.
- [x] Token rotation on refresh: used refresh tokens are immediately revoked.

## Out of scope for this task

- Guardian/Parent flow (deferred to post-V1)
- Offline sync queue persistence with WatermelonDB (deferred to post-V1)
- Fees, materials, assignments, assessments
- Platform Super Admin

