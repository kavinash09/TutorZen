package com.tutorzen.attendancesync;

import com.tutorzen.attendance.domain.AttendanceRecord;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service orchestrating offline attendance synchronization.
 * Handles idempotency, duplicate submissions, stale sessions, and conflict detection.
 * Adheres to ADR-0003 and domain rules.
 */
@Service
public class AttendanceSyncService {

    // Retention duration for stale session detection (e.g. submissions older than 48 hours)
    private static final Duration MAX_OFFLINE_AGE = Duration.ofHours(48);

    // In-memory idempotency tracking (in production, backed by persistent idempotency store)
    private final Set<String> processedIdempotencyKeys = ConcurrentHashMap.newKeySet();

    // Simulated existing server attendance state: Key = "tenant:session:student"
    private final Map<String, AttendanceRecord> serverAttendanceStore = new ConcurrentHashMap<>();

    public List<SyncItemOutcome> processBatch(List<SyncSubmission> submissions) {
        if (submissions == null || submissions.isEmpty()) {
            return Collections.emptyList();
        }

        List<SyncItemOutcome> outcomes = new ArrayList<>();
        Instant now = Instant.now();

        for (SyncSubmission submission : submissions) {
            outcomes.add(processSingleSubmission(submission, now));
        }

        return outcomes;
    }

    private SyncItemOutcome processSingleSubmission(SyncSubmission sub, Instant now) {
        // 1. Check idempotency: If this key has already been processed, return duplicate ignored
        if (!processedIdempotencyKeys.add(sub.idempotencyKey())) {
            return SyncItemOutcome.duplicate(sub.idempotencyKey(), sub.studentId());
        }

        // 2. Check stale session age
        if (sub.deviceTimestamp() != null && Duration.between(sub.deviceTimestamp(), now).compareTo(MAX_OFFLINE_AGE) > 0) {
            return SyncItemOutcome.stale(
                sub.idempotencyKey(),
                sub.studentId(),
                "Offline submission is older than maximum allowed sync window (48 hours)"
            );
        }

        // 3. Check for existing server record conflict
        String recordKey = sub.tenantId() + ":" + sub.sessionId() + ":" + sub.studentId();
        AttendanceRecord existing = serverAttendanceStore.get(recordKey);

        if (existing != null) {
            if (existing.getStatus() != sub.status()) {
                return SyncItemOutcome.conflict(
                    sub.idempotencyKey(),
                    sub.studentId(),
                    "Server attendance is already recorded as " + existing.getStatus() +
                    " via " + existing.getMethod() + ". Manual review required."
                );
            }
            // Same status already on server
            return SyncItemOutcome.duplicate(sub.idempotencyKey(), sub.studentId());
        }

        // 4. Apply record safely
        AttendanceRecord newRecord = new AttendanceRecord(
            UUID.randomUUID().toString(),
            sub.tenantId(),
            sub.sessionId(),
            sub.studentId(),
            sub.status(),
            sub.method(),
            sub.markedBy(),
            sub.deviceTimestamp() != null ? sub.deviceTimestamp() : now
        );
        serverAttendanceStore.put(recordKey, newRecord);

        return SyncItemOutcome.applied(sub.idempotencyKey(), sub.studentId());
    }

    public void clearStoresForTesting() {
        processedIdempotencyKeys.clear();
        serverAttendanceStore.clear();
    }
}

