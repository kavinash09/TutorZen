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
