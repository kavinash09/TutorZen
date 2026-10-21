# TutorZen V1 Scope Definition (Rehaul Edition)

> **Authoritative document.** Defines the approved V1 scope for the TutorZen coaching management ERP.  
> **Last updated:** October 22, 2026 (V1 Rehaul Mandate)  
> **Associated ADRs:** ADR-0001 to ADR-0016 in `.ai/DECISIONS.md`  

---

## 1. What V1 Is

TutorZen V1 is the **production-ready initial version** of the coaching management ERP supporting multi-institute and multi-branch operations. It provides reliable role- and branch-scoped authorization across Platform Admins, Institute Admins, Moderators, Teachers, and Students.

V1 delivers the core operational loop: institute and branch onboarding, batch schedules with timing and topics, teacher attendance marking, verified student self check-in, offline fee ledgering with receipts, notes and assignment publishing with 1-level nested discussion threads, dual-channel notifications (in-app + critical WhatsApp), and an enrolled-student batch explore board.

---

## 2. In-Scope Modules & Acceptance Boundaries

### A. Platform Admin & Institute Onboarding
- Create an institute with legal details and status (`PENDING_SETUP`, `ACTIVE`, `SUSPENDED`, `DEACTIVATED`).
- Provision one or multiple branches with distinct physical addresses.
- Invite and provision initial Institute Admin credentials.
- Platform Admin account lifecycle and administrative audit history.

### B. Institute Admin & Branch Governance
- Institute profile settings and branch administration (`ACTIVE`, `INACTIVE`, availability toggle).
- Create and manage Moderators with explicit, branch-scoped delegated permissions (e.g., `BRANCH_MANAGE`, `FEES_MANAGE`, `STAFF_LIFECYCLE_MANAGE`).
- Staff and teacher lifecycle management.
- Branch-wise **God Mode dashboard** with independent financial report delegation (`DASHBOARD_VIEW`, `DASHBOARD_FEES_VIEW`) (ADR-0012).

### C. Moderator Experience
- View assigned branches only; zero implicit institute-wide access.
- Execute actions strictly within explicitly granted permissions.

### D. Staff & Teacher Management
- Invite, edit, list, activate, suspend, and deactivate staff and teachers.
- Assign teachers to multiple branches and batches.
- Immutable history: prior teaching and attendance records remain preserved upon reassignment or deactivation.

### E. Batch & Academic Scheduling
- Batch CRUDL with lifecycle: `DRAFT`, `UPCOMING`, `ACTIVE`, `COMPLETED`, `CANCELLED`.
- Class timing configuration (`start_time`, `end_time`, `days_of_week`, `room`).
- Session topic and syllabus tracking (e.g. "Math: Calculus - Integration by Parts").
- Schedule class sessions with attendance verification windows.

### F. Attendance (Teacher & Student)
- Teachers mark Present, Absent, or Late on live rosters (Bulk, QR, 6-digit PIN).
- Enrolled students self-check-in via verified, time-limited PIN/QR code.
- Idempotency guard: prevent duplicate check-ins (`409 Conflict`).
- Live student summary metrics (total sessions, attended, percentage, history).

### G. Offline Fees Only (No Gateway) (ADR-0014)
- Configure fee obligations, installment schedules, and due dates.
- Record offline payments: Cash, UPI direct transfer, Cheque, Bank Transfer.
- Support partial payments and display outstanding balances.
- Downloadable/printable payment receipts.
- **Strictly auditable reversals:** Errors are corrected via compensating reversal transactions (`RECORDED`, `REVERSED`), never by deleting database rows.
- **Explicit boundary: NO online payment gateway (Stripe/Razorpay) in V1.**

### H. Notes & Assignment Publishing Only (ADR-0015)
- Teachers create drafts, attach PDFs/notes, assign subjects/batches, set deadlines, and publish.
- Students view published notes and assignments filtered to their active batch enrollments.
- **1-Level Nested Discussion Comments:** Interactive discussion thread on notes/assignments supporting top-level comments and direct replies (nesting beyond 1 level rejected).
- **Explicit boundary: Assignment submissions, grading, and feedback are OUT OF SCOPE for V1.**

### I. Announcements & Notifications (ADR-0016)
- Announcement CRUDL targeting branches, batches, or audiences.
- Student notice board.
- Shared notification subsystem:
  - **In-App / Push (Expo/FCM):** Default channel for routine notices, new notes, and class reminders.
  - **WhatsApp Business Cloud API:** Strictly reserved for **critical notifications only** (student absence alerts, fee payment receipts, overdue reminders, urgent schedule changes).
- Publication success is decoupled from notification delivery outcomes.

### J. Student Identity & Enrollment Lifecycle
- Student account/profile separate from batch enrollment.
- Multi-branch membership and batch transfers with historical data preservation.
- Enrollment states: `PENDING`, `ACTIVE`, `COMPLETED`, `WITHDRAWN`.

### K. Student Experience & Enrolled Explore
- Personal attendance summary, fee balance, notes/notice boards, in-app notifications.
- **Enrolled-Student Explore:** Authenticated students can explore other active batches and teacher profiles within their permitted institute scope.
- **Explicit boundary: No public marketplace, no anonymous discovery, no exposure of private teacher/fee metrics.**

---

## 3. Explicitly Out of Scope for V1

The following capabilities are formally deferred to post-V1:

| Deferred Capability | Reason for Deferral |
| :--- | :--- |
| **Online Payment Gateways** | V1 uses offline fee logging (Cash/UPI/Cheque). Gateways require merchant KYC and fee settlement overhead. |
| **Student Assignment Submissions & Grading** | V1 is publishing-only for assignments and study notes. Submissions, student upload workflows, and grading matrices belong in V2. |
| **Public Marketplace / Anonymous Discovery** | Explore is strictly for already-enrolled, authenticated students. No public marketing pages. |
| **Dedicated Guardian / Parent App Portal** | Parents receive critical WhatsApp alerts; dedicated multi-child parent app portal is deferred. |
| **Assessment & Percentile Ranking Engine** | Exam scheduling and class percentile calculations are deferred. |
| **Global Platform Super Admin UI** | Platform Admin operations are API-driven; institute-level God Mode is in-scope. |

---

## 4. V1 Release Gate Verification Checklist

All items must be verified TRUE before cutting the `v1.0.0` release:

- [ ] Multi-branch schema migration applied cleanly with zero regressions (`V5`).
- [ ] Institute Admin can manage branches and delegate moderator permissions.
- [ ] Teacher live session marking and student verified PIN check-in persist to DB.
- [ ] Offline fee payments generate receipts and reflect partial/paid balances.
- [ ] Payment reversals create compensating transactions without row deletion.
- [ ] Notes and assignments publish to batches with 1-level nested comment threads.
- [ ] Critical events dispatch WhatsApp template messages (or mock outbox in dev).
- [ ] React Navigation multi-stacks (`AuthStack`, `TeacherTabs`, `StudentTabs`, `AdminTabs`) replace manual routing.
- [ ] Cross-tenant access returns 401/403; cross-branch access requires assignment.
- [ ] Backend test suite passes 100% (`./mvnw test`).
- [ ] Mobile unit tests pass 100% (`npm test`); TypeScript compiles with 0 errors (`npx tsc --noEmit`).
- [ ] Multi-container Docker Compose boots cleanly (`docker compose up`).
