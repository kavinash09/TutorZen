# AGENTS.md — TutorZen Repository Rules

## 1. Required context recovery

Before changing code:
1. Read this file.
2. Read `.ai/RETRIEVAL_GUIDE.md`.
3. Read `.ai/PROJECT_CONTEXT.md`, `.ai/PROJECT_STATE.md`, `.ai/CURRENT_TASK.md`, and the relevant sections of `.ai/ARCHITECTURE.md`.
4. Read relevant entries in `.ai/DECISIONS.md` and relevant feature specifications.
5. Inspect the actual code, tests, configuration, database migrations, and dependency versions. Documentation is not proof that a feature exists.

Load only relevant detailed references; do not dump every document into every task.

## 2. Scope and safety

- Implement the smallest coherent change that meets the acceptance criteria.
- Do not silently invent business rules, permissions, tenant behavior, or data-retention requirements.
- Ask a concise question when a missing business decision materially affects correctness or security; otherwise state a conservative assumption in the task plan.
- Do not perform unrelated refactors, broad formatting changes, or dependency upgrades.
- Do not add dependencies, change the architecture, or alter public contracts without explaining the reason and following the user's approval requirements.
- Never claim tests, builds, migrations, or manual checks passed unless they were actually run.
- Never expose secrets, credentials, personal data, or tenant data in logs, fixtures, screenshots, or docs.

## 3. Architecture boundaries

- Prefer a modular monolith unless a concrete requirement justifies distributed services.
- Organize backend code by business feature/module, not only by technical layer.
- Keep transport controllers thin; business decisions belong in application/domain services.
- Keep persistence and framework concerns behind module-owned interfaces where useful.
- Avoid circular dependencies and cross-module access to another module's internal persistence model.
- Share code only when it has a clear owner and more than one legitimate consumer.
- Make cross-module communication explicit through application interfaces, events, or versioned contracts.
- Enforce tenant isolation and authorization on the server, not only in the client.
- Use database constraints and transactions to protect invariants where appropriate.
- Treat auditability, idempotency, retry behavior, and time zones as explicit design concerns.

## 4. Domain constraints to preserve

- Attendance marking uses a Strategy Pattern for supported marking methods: bulk, QR, and six-digit code.
- Offline attendance synchronization is a separate component from attendance marking.
- QR and six-digit-code validity, and supported attendance policies, are tenant-configurable.
- Offline synchronization must consider retries, idempotency, duplicate submissions, stale sessions, conflicts, and audit history.
- Platform Super Admin / global “God View” UI is deferred. Preserve foundations for tenant isolation, RBAC, policy enforcement, and auditing without implementing the deferred interface.
- Do not treat these notes as a complete domain specification; inspect approved requirements and ask when business behavior is unclear.

## 5. UX and design-system rules

- Follow `docs/design-system/DESIGN_SYSTEM.md` and its tokens.
- Use EB Garamond for prominent headings and Barlow for functional UI unless an approved design decision says otherwise.
- Use Claymorphism selectively: tactile surfaces, rounded corners, subtle highlights and restrained shadows.
- Prioritize readability, contrast, keyboard/screen-reader support, responsive layouts, and clear loading/error/empty states over visual effects.
- Avoid low-contrast text, shadow-heavy controls, excessive nesting, ornamental cards around every element, and tiny touch targets.
- Reuse shared tokens/components; do not hardcode one-off colors, radii, or shadow recipes without justification.
- Keep student, parent, teacher, and coaching-admin navigation and permissions distinct.

## 6. Implementation and verification

For each task:
1. Identify scope, affected modules, contracts, risks, and acceptance criteria.
2. Make a small plan before multi-file or architectural work.
3. Implement and test behavior, including relevant negative/error paths.
4. Run the relevant formatter, tests, type checks, build, and static checks available in the repository.
5. Review tenant boundaries, authorization, accessibility, and migration safety where applicable.
6. Inspect `git diff` for unrelated changes, secrets, generated files, and accidental edits.
7. Update affected project memory and append event/decision records when warranted.
8. Report files changed, actual commands/results, gaps, and the next useful step.

## 7. Project-memory integrity

- `.ai/PROJECT_STATE.md` records verified current reality, not aspirations.
- `.ai/CURRENT_TASK.md` records the active task and acceptance criteria; do not leave stale task instructions after completion.
- `.ai/DECISIONS.md` is append-only. Supersede decisions with a new entry; do not rewrite history.
- `.ai/EVENT_LOG.md` is a chronological, factual activity log. Do not use it as a substitute for ADRs.
- Update documents only when relevant facts changed. Never fabricate dates, results, or implementation status.
- If code and docs disagree, inspect evidence, fix the source of truth, and document any material discrepancy.
