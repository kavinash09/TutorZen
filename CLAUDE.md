# CLAUDE.md — TutorZen

> This file mirrors the agent behavior rules in `AGENTS.md`. Both files are authoritative. If they conflict, inspect the source of truth (code and `.ai/` project memory) and flag the discrepancy rather than silently choosing one.

## Quick start for a new session

```
1. Read AGENTS.md                         ← mandatory agent rules
2. Read .ai/RETRIEVAL_GUIDE.md            ← how to navigate project memory
3. Read .ai/PROJECT_CONTEXT.md            ← what this product is and V1 scope
4. Read .ai/PROJECT_STATE.md              ← actual verified implementation state
5. Read .ai/CURRENT_TASK.md              ← active task and acceptance criteria
6. Read .ai/DECISIONS.md (relevant ADRs) ← binding architectural decisions
7. Inspect actual code and tests         ← documentation is not proof of implementation
```

Do not skip step 7. A file existing does not mean a feature is implemented.

## Repository layout

```
apps/
  backend/          # Spring Boot 3.4.3, Java 21, PostgreSQL + Flyway
  mobile/           # React Native + TypeScript + Expo (managed workflow)
packages/
  design-tokens/    # Shared design token package (@tutorzen/design-tokens)
docs/
  architecture/     # MODULE_BOUNDARIES.md
  design-system/    # DESIGN_SYSTEM.md — typography, tokens, Claymorphism rules
  ux/               # MOBILE_FLOWS.md — concept screen inventory
  product/          # V1_SCOPE.md — V1 boundary definition
  roadmap/          # IMPLEMENTATION_ROADMAP.md — dependency-ordered task plan
  audits/           # Audit reports
infrastructure/
  docker/           # docker-compose.yml — local PostgreSQL
.ai/                # Project memory (context, state, decisions, events, architecture)
templates/          # ADR, feature spec, event log templates
```

## Current implementation reality (as of 2026-10-18)

**This project is a UI/documentation prototype — not a working product.**

| Layer | Status |
|-------|--------|
| Mobile screens (Teacher + Student) | Exist with hardcoded mock data. No API calls. |
| Backend REST endpoints | Exist but return hardcoded data. No real DB writes for business entities. |
| Authentication | Implemented: Spring Security `SecurityFilterChain`, stateless JWT (15m) + rotating refresh token (7d), BCrypt passwords. |
| Tenant isolation | Implemented: `TenantFilter` derives tenant context strictly from verified JWT claims; header spoofing rejected. |
| Database | `tenants`, `attendance_records`, `users`, `user_credentials`, `refresh_tokens` tables (`V1` + `V2`). Sessions table pending. |
| Mobile navigation | Manual `useState` routing. React Navigation library NOT installed. |
| Mobile auth | Not connected to backend auth API; uses local state. |
| Offline sync | In-memory `ConcurrentHashMap`. State lost on restart. |

Read `.ai/PROJECT_STATE.md` for the full gap table before implementing any feature.

## Non-negotiable rules (summary — full rules in AGENTS.md)

1. **Never trust documentation over code.** Verify by reading actual files.
2. **Never claim tests passed unless you ran them** and observed results in the current session.
3. **No authentication bypass is acceptable for production.** ADR-0008 is a hard prerequisite.
4. **Tenant ID must come from the authenticated JWT**, not from client-supplied headers.
5. **Append-only DECISIONS.md.** Supersede a decision with a new ADR; never rewrite history.
6. **Do not implement Platform Super Admin / God View UI** without explicit owner approval (ADR-0005).
7. **Do not silently resolve business rule ambiguities.** Flag them and ask.
8. **Do not expand scope** without explaining the reason and getting approval.

## Verification commands

```bash
# Backend unit tests (mock logic — does not test real DB persistence)
cd apps/backend && ./mvnw test

# Mobile typecheck (prototype correctness only)
cd apps/mobile && npx tsc --noEmit

# Design token tests
cd packages/design-tokens && npx tsx --test

# Start local PostgreSQL
cd infrastructure/docker && docker-compose up -d

# Start Expo dev server (serves hardcoded prototype)
cd apps/mobile && npx expo start --web
```

## Key files to read for common tasks

| Task | Read these |
|------|-----------|
| Adding a backend feature | `.ai/ARCHITECTURE.md`, `docs/architecture/MODULE_BOUNDARIES.md`, existing module code |
| Adding a mobile screen | `docs/ux/MOBILE_FLOWS.md`, `docs/design-system/DESIGN_SYSTEM.md`, `apps/mobile/App.tsx` |
| Adding a DB migration | `apps/backend/src/main/resources/db/migration/` — do not edit existing migrations |
| Security/auth work | `AGENTS.md §3`, `.ai/DECISIONS.md ADR-0008`, `TenantFilter.java`, `SecurityFilterChain` (to be created) |
| Reviewing scope | `docs/product/V1_SCOPE.md`, `.ai/PROJECT_CONTEXT.md §V1 scope boundary` |

## Handoff protocol

At the end of any working session:
1. Update `.ai/PROJECT_STATE.md` with actual verified state (not aspirations).
2. Update `.ai/CURRENT_TASK.md` with the next actionable task.
3. Append to `.ai/EVENT_LOG.md` with type, summary, evidence, and outcome.
4. Append new ADRs to `.ai/DECISIONS.md` if architectural decisions were made.
5. Run `git diff` and confirm no unrelated changes, secrets, or generated files.
6. Do NOT leave stale "Next Actionable Task" entries pointing to already-completed work.

