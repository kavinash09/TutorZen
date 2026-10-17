# Architectural Decision Records

This file is append-only. Do not rewrite history to make a past decision look different. If a decision changes, add a superseding ADR and link the prior record.

---

## ADR-0001 — Use a modular monolith as the initial architecture

- **Status:** Accepted as planning baseline; verify against current repository.
- **Context:** The product has multiple related coaching workflows and requires clear boundaries without unnecessary distributed-system complexity.
- **Decision:** Prefer a modular monolith with feature-owned business rules and explicit module contracts.
- **Consequences:** Easier local development and transactions; requires dependency rules and architecture tests to prevent coupling.
- **Revisit when:** Independent scaling, deployment, ownership, or reliability requirements justify service extraction.

## ADR-0002 — Strategy Pattern for attendance marking methods

- **Status:** Accepted from product discussion.
- **Context:** Attendance supports distinct marking methods with method-specific validation.
- **Decision:** Use a strategy abstraction for bulk marking, QR, and six-digit-code marking.
- **Consequences:** New methods can be introduced without scattering conditional logic; shared authorization and session validation must remain consistent.
- **Related:** `.ai/ARCHITECTURE.md`

## ADR-0003 — Separate offline attendance synchronization

- **Status:** Accepted from product discussion.
- **Context:** Offline capture and server synchronization have lifecycle, retry, idempotency, and conflict concerns distinct from interactive marking.
- **Decision:** Keep offline synchronization as a separate component.
- **Consequences:** Sync outcomes and queue state can be tested independently; server remains authoritative.
- **Open questions:** Exact duplicate and conflict policies, retry limits, retention, and stale-session behavior.

## ADR-0004 — Tenant-configurable attendance validity and policy

- **Status:** Accepted from product discussion.
- **Context:** Coaching tenants may need different attendance settings.
- **Decision:** Configure QR/six-digit-code validity and related supported policies per tenant.
- **Consequences:** Configuration needs validation, safe defaults, auditability, and tests proving one tenant cannot affect another.
- **Open questions:** Exact default durations, allowed ranges, rotation behavior, and expiry semantics.

## ADR-0005 — Defer Platform Super Admin / God View UI

- **Status:** Deferred.
- **Context:** Platform-wide oversight is not part of the initial implementation scope.
- **Decision:** Do not implement the global UI now. Preserve tenant isolation, RBAC, policy enforcement, and audit foundations.
- **Consequences:** Avoids premature global workflows while keeping future extension possible.
- **Revisit when:** A separately scoped platform-administration task is approved.

## ADR-0006 — Use restrained Claymorphism and TableDiner-inspired typography

- **Status:** Accepted as UX direction.
- **Context:** The product should have a recognizable, consistent visual system without compromising operational usability.
- **Decision:** Use soft tactile surfaces, rounded corners, subtle layered shadows/highlights, warm neutrals, restrained forest-green accents, EB Garamond headings, and Barlow functional UI.
- **Consequences:** Centralized design tokens and reusable components are required; accessibility and task completion outrank decorative effects.
- **Revisit when:** Usability research or an explicit design decision indicates a better direction.

## ADR-0007 — Define V1 scope boundary

- **Status:** Accepted (2026-10-18, project audit).
- **Context:** The project has an extensive planned feature set (15+ modules). Without a defined V1 gate, AI agents and human developers lack a clear criterion to stop adding features and start shipping. The prototype implementation (prior to this ADR) has zero real DB persistence, no authentication, and no React Navigation — none of which are safe to ship.
- **Decision:** V1 is defined as the release that satisfies ALL of: (1) JWT authentication with server-enforced tenant isolation, (2) at least one end-to-end user journey with real DB persistence (teacher sign-in → session creation → attendance mark → attendance record retrievable), and (3) React Navigation library in place. See `PROJECT_CONTEXT.md` for the full V1 scope checklist.
- **Features deferred to post-V1:** Guardian/Parent flow, reports/exports, offline sync queue, notifications (beyond basic), learning materials, assignments, fees module, Platform Super Admin.
- **Consequences:** Provides a clear stopping point; prevents scope creep; ensures the first real user interaction is on a secure, persistent system. May disappoint stakeholders expecting a richer V1 feature set.
- **Revisit when:** A user research finding or business constraint justifies expanding or contracting the V1 scope.

## ADR-0008 — Spring Security must be configured before any deployment

- **Status:** Accepted (2026-10-18, project audit).
- **Context:** `spring-boot-starter-security` is in `pom.xml` but no `SecurityFilterChain` bean or `WebSecurityConfigurerAdapter` exists. With no configuration, Spring Boot Security applies HTTP Basic authentication by default in development, but this is not a safe production posture. Additionally, `TenantFilter` trusts the `X-Tenant-ID` HTTP header from any unauthenticated client, which allows any caller to impersonate any tenant.
- **Decision:** Before any endpoint is exposed to a real user, a `SecurityFilterChain` must be configured that: (1) requires a valid JWT on all API endpoints except the sign-in endpoint, (2) extracts tenant from the JWT payload (not from `X-Tenant-ID`), and (3) has been covered by integration tests verifying 401 responses on missing/invalid tokens.
- **Consequences:** Authentication is now a prerequisite — not an optional future task — for any deployment. This blocks deployment until ADR-0008 acceptance criteria are met.
- **Revisit when:** The authentication mechanism changes (e.g., switching to OAuth2/OIDC).

## ADR-0009 — JWT strategy: short-lived access token + refresh token

- **Status:** Accepted (2026-10-18, owner decision).
- **Context:** Authentication requires a token strategy. Two options: (a) single long-lived token (simpler but harder to revoke), (b) short-lived access token + refresh token (more secure; access token expiry limits exposure window).
- **Decision:** Use short-lived access tokens (15 minutes) + refresh tokens (7 days, stored server-side in `refresh_tokens` table for revocability). Sign-in returns both. Access token is sent in `Authorization: Bearer` header. Refresh token is used at `POST /api/v1/auth/refresh` to obtain a new access token.
- **Consequences:** Requires a `refresh_tokens` table in the DB. Mobile client must handle 401 by attempting a refresh before redirecting to sign-in. Token rotation (invalidate old refresh token on use) is recommended.
- **Revisit when:** OAuth2/OIDC delegation is required.

## ADR-0010 — Role model: flat enum in users table

- **Status:** Accepted (2026-10-18, owner decision).
- **Context:** Authorization requires knowing a user's role. Two options: (a) flat enum column on the `users` table (simple, no joins), (b) separate permissions table (flexible, complex). For V1 with known roles (TEACHER, STUDENT, ADMIN), the simple approach is correct.
- **Decision:** Store role as a single enum column on the `users` table: `role ENUM('STUDENT', 'TEACHER', 'ADMIN') NOT NULL`. No separate permissions table for V1. Authorization checks compare JWT claim `role` against required roles in `SecurityFilterChain`.
- **Consequences:** Adding a new role requires a migration. Fine-grained per-resource permissions are not supported in V1 (acceptable). Role is encoded in the JWT at sign-in; changing a user's role requires token refresh to take effect.
- **Revisit when:** Coaching Admin role requires per-batch or per-subject permission scoping.

