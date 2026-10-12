# AI Context Retrieval and Memory Update Protocol

## Before a task

1. Read root `AGENTS.md`.
2. Read `.ai/PROJECT_CONTEXT.md` for product intent and constraints.
3. Read `.ai/PROJECT_STATE.md` for verified implementation status.
4. Read `.ai/CURRENT_TASK.md` and clarify scope/acceptance criteria.
5. Read relevant sections of `.ai/ARCHITECTURE.md`.
6. Search `.ai/DECISIONS.md` for decisions affecting the task.
7. Read relevant feature specifications, API contracts, design-system docs, code, tests, migrations, and configuration.
8. Check whether documentation matches reality. If it does not, gather evidence before changing it.
9. Write a short plan for non-trivial work.

## During a task

- Keep changes focused.
- Preserve existing behavior unless change is explicitly required.
- Record new assumptions and unresolved product questions.
- Add tests for new behavior and important failure modes.
- Avoid putting secrets or sensitive user data into memory files.

## At task completion

1. Inspect the diff.
2. Run relevant tests/builds/type checks/static analysis and report exact outcomes.
3. Update `.ai/PROJECT_STATE.md` only for verified status changes.
4. Update `.ai/CURRENT_TASK.md` with remaining work or the next actionable task.
5. Update `.ai/ARCHITECTURE.md` when architecture actually changes.
6. Append an ADR to `.ai/DECISIONS.md` only for a durable architectural/product/technical decision.
7. Append `.ai/EVENT_LOG.md` for material implementation, test, incident, or release events; routine trivial edits do not need entries.
8. Update feature specs and UX docs if behavior or requirements changed.
9. Confirm there are no contradictory docs, accidental secrets, or unverified claims.
10. Report changed files, verification results, limitations, and follow-up.

## Memory update decision table

| Change | Update |
|---|---|
| Verified implementation status changes | `PROJECT_STATE.md` |
| Active task changes or completes | `CURRENT_TASK.md` |
| Durable architectural choice is made | Append `DECISIONS.md` |
| Material work/test/release/incident occurs | Append `EVENT_LOG.md` |
| Module ownership or data flow changes | `ARCHITECTURE.md` |
| Product requirement or scope changes | `PROJECT_CONTEXT.md` and relevant spec |
| UI interaction/design tokens change | Design-system/UX docs |
| No durable fact changed | Do not update memory just to create activity |

## Conflict resolution

- Code/configuration/tests are evidence of current implementation; approved product requirements and ADRs govern intended behavior.
- If code contradicts an approved decision, do not silently choose one. Identify the conflict, assess impact, and resolve it through the task owner.
- A newer ADR may supersede an older ADR but must preserve history.
- Never change `VERIFIED` status to imply success without running the corresponding checks.
