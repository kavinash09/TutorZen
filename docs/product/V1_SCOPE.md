# V1 Scope Definition

> **Authoritative document.** This defines what "V1" means for TutorZen. Do not shrink or expand V1 scope without appending a new ADR to `.ai/DECISIONS.md` and updating this file.

Last updated: 2026-10-18

---

## What V1 is

V1 is the **first release to real users**. It must enable at least one user (a teacher at a coaching center) to sign in with real credentials, create a class session, allow a student to mark attendance, and retrieve a verified attendance record — all persisted in the database and protected by tenant isolation.

V1 is **not** the full product. It is the minimum that is secure enough, reliable enough, and complete enough for real users to trust it with real data.

---

## V1 Gate — all items must be TRUE before any V1 deployment

### Security prerequisites (ADR-0008)

- [ ] JWT-based authentication is implemented and enforced server-side.
- [ ] A `SecurityFilterChain` bean exists; all endpoints require a valid JWT except `POST /api/v1/auth/sign-in`.
- [ ] Tenant ID is extracted from the JWT — not from a client-supplied HTTP header.
- [ ] Passwords are stored with bcrypt. No plaintext passwords in DB, logs, or API responses.
- [ ] JWT secret is externalized via environment variable, not hardcoded.
- [ ] Integration tests verify 401 on missing/invalid tokens.

### Data integrity prerequisites

- [ ] A Flyway migration establishes the `users`, `user_credentials`, and `class_sessions` tables.
- [ ] `attendance_records` is written to by real application code (not just defined in DDL).
- [ ] All reads and writes are scoped to `tenant_id` from the authenticated session.
- [ ] No hardcoded business data remains in any REST controller for production code paths.

### Core user journeys (end-to-end, real DB)

**Teacher journey (required):**
1. Teacher signs in with email + password → receives JWT.
2. Teacher creates a class session → session record written to DB.
3. Teacher views the session code/QR → generated from DB session.
4. Student marks attendance with the code → `attendance_records` row written.
5. Teacher can view attendance summary → read from DB.

**Student journey (required):**
1. Student signs in → receives JWT.
2. Student views active session → fetched from DB.
3. Student marks attendance → `attendance_records` row written.
4. Student views their attendance summary → read from DB.

### Mobile prerequisites

- [ ] React Navigation library is installed and replaces manual `useState` routing.
- [ ] Auth screen (sign-in form) calls the real backend `sign-in` endpoint.
- [ ] JWT is stored securely (e.g., `expo-secure-store`, not `AsyncStorage`).
- [ ] All API calls include `Authorization: Bearer <token>`.
- [ ] Token expiry redirects to the sign-in screen.
- [ ] Loading, error, and empty states are shown for all async operations.

### Operational prerequisites

- [ ] Local dev environment is documented and reproducible (Docker Compose for PostgreSQL).
- [ ] Environment variables for JWT secret and DB credentials are documented (not committed).
- [ ] Application starts cleanly from scratch with `docker-compose up` + `./mvnw spring-boot:run`.

---

## What V1 is NOT required to include

These are explicitly deferred to post-V1:

| Feature | Reason for deferral |
|---------|---------------------|
| Guardian/Parent flow | No parent journey is on the critical path for initial coaching center use |
| Reports and exports | Attendance records exist in DB; exports are additive |
| Notifications (push/email) | Manual attendance flow works without push notifications |
| Learning materials module | Not required for attendance-first use case |
| Assignments module | Not required for V1 |
| Assessments module | Not required for V1 |
| Fees module | Coaches can manage fees out-of-band for first users |
| Offline sync queue (SQLite/WatermelonDB) | Manual online marking is acceptable for V1 |
| Platform Super Admin / God View | Deferred indefinitely (ADR-0005) |
| OCI production deployment | Required before real users; can follow immediately after V1 gate |
| Coaching Admin onboarding UI | First tenants can be seeded manually via SQL |

---

## V1 module priority order

Implement in this order (each unblocks the next):

1. **Identity** — User + credential table, sign-in endpoint, JWT issue/verify
2. **Tenancy** (harden existing) — Derive tenant from JWT; remove header trust
3. **Academics** — Subjects, batches, class sessions (minimal: teacher assigns sessions)
4. **Attendance** (harden existing) — Write real records; link to sessions and users
5. **Mobile auth** — Install React Navigation, add sign-in screen, integrate JWT
6. **Mobile attendance** — Replace mock data with real API calls

See `docs/roadmap/IMPLEMENTATION_ROADMAP.md` for the detailed implementation sequence.

