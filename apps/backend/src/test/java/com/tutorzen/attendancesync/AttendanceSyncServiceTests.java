package com.tutorzen.attendancesync;

import com.tutorzen.attendance.domain.AttendanceMethod;
import com.tutorzen.attendance.domain.AttendanceStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AttendanceSyncServiceTests {

    private AttendanceSyncService syncService;

    @BeforeEach
    void setUp() {
        syncService = new AttendanceSyncService();
        syncService.clearStoresForTesting();
    }

    @Test
    void syncAppliesFirstSubmissionAndIgnoresDuplicateIdempotently() {
        SyncSubmission sub1 = new SyncSubmission(
            "idemp-101",
            "tenant-1",
            "session-201",
            "student-01",
            AttendanceStatus.PRESENT,
            AttendanceMethod.QR,
            "teacher-1",
            Instant.now()
        );

        List<SyncItemOutcome> firstPass = syncService.processBatch(List.of(sub1));
        assertEquals(1, firstPass.size());
        assertEquals(SyncItemStatus.APPLIED, firstPass.getFirst().status());

        // Second pass with same idempotency key
        List<SyncItemOutcome> secondPass = syncService.processBatch(List.of(sub1));
        assertEquals(1, secondPass.size());
        assertEquals(SyncItemStatus.DUPLICATE_IGNORED, secondPass.getFirst().status());
    }

    @Test
    void syncDetectsConflictWhenServerStateDiffers() {
        // Teacher A marked student present via QR
        SyncSubmission subA = new SyncSubmission(
            "idemp-A",
            "tenant-1",
            "session-201",
            "student-01",
            AttendanceStatus.PRESENT,
            AttendanceMethod.QR,
            "teacher-A",
            Instant.now()
        );
        syncService.processBatch(List.of(subA));

        // Teacher B later syncs student as ABSENT
        SyncSubmission subB = new SyncSubmission(
            "idemp-B",
            "tenant-1",
            "session-201",
            "student-01",
            AttendanceStatus.ABSENT,
            AttendanceMethod.BULK,
            "teacher-B",
            Instant.now()
        );

        List<SyncItemOutcome> secondBatch = syncService.processBatch(List.of(subB));
        assertEquals(1, secondBatch.size());
        assertEquals(SyncItemStatus.CONFLICT_DETECTED, secondBatch.getFirst().status());
        assertTrue(secondBatch.getFirst().message().contains("Manual review required"));
    }

    @Test
    void syncRejectsStaleSubmissionsOlderThan48Hours() {
        Instant staleTime = Instant.now().minus(72, ChronoUnit.HOURS);
        SyncSubmission staleSub = new SyncSubmission(
            "idemp-stale",
            "tenant-1",
            "session-201",
            "student-01",
            AttendanceStatus.PRESENT,
            AttendanceMethod.BULK,
            "teacher-1",
            staleTime
        );

        List<SyncItemOutcome> outcome = syncService.processBatch(List.of(staleSub));
        assertEquals(1, outcome.size());
        assertEquals(SyncItemStatus.REJECTED_STALE_SESSION, outcome.getFirst().status());
    }
}

