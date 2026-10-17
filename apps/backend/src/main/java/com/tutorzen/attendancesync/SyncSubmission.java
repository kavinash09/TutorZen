package com.tutorzen.attendancesync;

import com.tutorzen.attendance.domain.AttendanceMethod;
import com.tutorzen.attendance.domain.AttendanceStatus;

import java.time.Instant;

/**
 * Encapsulates an offline-captured attendance item submitted for server synchronization.
 */
public record SyncSubmission(
    String idempotencyKey,
    String tenantId,
    String sessionId,
    String studentId,
    AttendanceStatus status,
    AttendanceMethod method,
    String markedBy,
    Instant deviceTimestamp
) {
    public SyncSubmission {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new IllegalArgumentException("Idempotency key is required for offline sync submission");
        }
        if (tenantId == null || tenantId.isBlank()) {
            throw new IllegalArgumentException("Tenant ID is required for sync submission");
        }
        if (sessionId == null || sessionId.isBlank()) {
            throw new IllegalArgumentException("Session ID is required for sync submission");
        }
        if (studentId == null || studentId.isBlank()) {
            throw new IllegalArgumentException("Student ID is required for sync submission");
        }
    }
}

