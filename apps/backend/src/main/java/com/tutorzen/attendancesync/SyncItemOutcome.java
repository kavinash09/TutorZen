package com.tutorzen.attendancesync;

public record SyncItemOutcome(
    String idempotencyKey,
    String studentId,
    SyncItemStatus status,
    String message
) {
    public static SyncItemOutcome applied(String idempotencyKey, String studentId) {
        return new SyncItemOutcome(idempotencyKey, studentId, SyncItemStatus.APPLIED, "Successfully applied");
    }

    public static SyncItemOutcome duplicate(String idempotencyKey, String studentId) {
        return new SyncItemOutcome(idempotencyKey, studentId, SyncItemStatus.DUPLICATE_IGNORED, "Duplicate submission safely ignored");
    }

    public static SyncItemOutcome conflict(String idempotencyKey, String studentId, String detail) {
        return new SyncItemOutcome(idempotencyKey, studentId, SyncItemStatus.CONFLICT_DETECTED, detail);
    }

    public static SyncItemOutcome stale(String idempotencyKey, String studentId, String detail) {
        return new SyncItemOutcome(idempotencyKey, studentId, SyncItemStatus.REJECTED_STALE_SESSION, detail);
    }
}

