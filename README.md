# TutorZen — AI-Assisted Coaching Management System Starter

This repository starter establishes project memory, AI coding-agent rules, architecture boundaries, UX standards, and decision/event logging for TutorZen.

> This is a documentation and design-system starter, not a fully implemented application. Inspect the existing codebase before applying it to an existing repository. Do not replace working code to match this example tree.

## Product direction

TutorZen is a multi-tenant coaching management system. Its UX uses selective Claymorphism, warm neutral surfaces, restrained forest-green accents, and the TableDiner-inspired font pairing:
- **EB Garamond** for prominent/editorial headings.
- **Barlow** for operational UI, body text, navigation, tables, forms, and buttons.

## Proposed technical baseline

Confirm against the actual repository before changing dependencies:
- Backend: Java 21, Spring Boot 3.5.x, PostgreSQL, Flyway.
- Mobile: React Native, TypeScript, Expo.
- Deployment direction: OCI.
- Architecture: modular monolith, package-by-feature, explicit module contracts.

## Quick Start — Running Services

For complete instructions and local development details, see **[Service Execution & Developer Guide (docs/RUNNING.md)](docs/RUNNING.md)**.

### Run All Services at Once (Docker Compose)
```bash
./scripts/run-all.sh
# or: npm run services:up
```
- **Web Frontend:** [http://localhost:8081](http://localhost:8081)
- **Backend API:** [http://localhost:8080](http://localhost:8080)
- **PostgreSQL Database:** `localhost:5432` (`tutorzen_dev`)

### Run Services Individually (Local Host Development)
1. **Database:** `docker compose up -d postgres`
2. **Backend:** `cd apps/backend && ./mvnw spring-boot:run`
3. **Frontend:** `cd apps/mobile && npm run web`

**Pre-seeded Demo Logins:**
- **Teacher:** `teacher@demo.com` / `Teacher@123`
- **Student:** `student@demo.com` / `Student@123`
- **Admin:** `admin@demo.com` / `Admin@123`

## Start here

1. Read `AGENTS.md`.
2. Read `.ai/RETRIEVAL_GUIDE.md`.
3. Review `.ai/PROJECT_CONTEXT.md`, `.ai/PROJECT_STATE.md`, `.ai/ARCHITECTURE.md`, `.ai/DECISIONS.md`, and `.ai/CURRENT_TASK.md`.
4. Compare documentation to the real repository before implementation.
5. Use `docs/ux/MOBILE_FLOWS.md` and `docs/design-system/` when building screens.
6. Record significant decisions in `.ai/DECISIONS.md`; record chronological implementation events in `.ai/EVENT_LOG.md`.
7. At task completion, update state and task docs only when facts changed, and report tests honestly.

## Directory map

```text
.
├── AGENTS.md
├── README.md
├── .ai/
│   ├── PROJECT_CONTEXT.md
│   ├── ARCHITECTURE.md
│   ├── PROJECT_STATE.md
│   ├── CURRENT_TASK.md
│   ├── DECISIONS.md
│   ├── EVENT_LOG.md
│   └── RETRIEVAL_GUIDE.md
├── docs/
│   ├── architecture/
│   ├── domain/
│   ├── ux/
│   └── design-system/
├── templates/
│   ├── ADR_TEMPLATE.md
│   ├── EVENT_LOG_TEMPLATE.md
│   └── FEATURE_SPEC_TEMPLATE.md
└── assets/
    └── mobile-ux-concept.png  # included if source asset was available
```

## Status vocabulary

Use only:
- `PLANNED`
- `IN_PROGRESS`
- `IMPLEMENTED`
- `VERIFIED`
- `BLOCKED`
- `DEFERRED`

`IMPLEMENTED` means code exists. `VERIFIED` additionally means the stated verification was run and passed.
