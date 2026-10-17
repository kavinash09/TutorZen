package com.tutorzen.attendance.api;

import com.tutorzen.attendance.api.dto.GeneratedPinResponse;
import com.tutorzen.attendance.api.dto.MarkAttendanceRequest;
import com.tutorzen.attendance.api.dto.RosterStudentDto;
import com.tutorzen.attendance.api.dto.SessionSummaryDto;
import com.tutorzen.attendance.domain.AttendanceStatus;
import com.tutorzen.attendance.strategy.AttendanceCommand;
import com.tutorzen.attendance.strategy.AttendanceMarkingStrategy;
import com.tutorzen.attendance.strategy.AttendanceResult;
import com.tutorzen.attendance.strategy.AttendanceStrategyRegistry;
import com.tutorzen.attendancesync.AttendanceSyncService;
import com.tutorzen.attendancesync.SyncItemOutcome;
import com.tutorzen.attendancesync.SyncSubmission;
import com.tutorzen.common.tenancy.TenantContext;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/v1/teacher/sessions")
public class TeacherSessionController {

    private final AttendanceStrategyRegistry strategyRegistry;
    private final AttendanceSyncService syncService;
    private final Random random = new Random();

    public TeacherSessionController(AttendanceStrategyRegistry strategyRegistry,
                                    AttendanceSyncService syncService) {
        this.strategyRegistry = strategyRegistry;
        this.syncService = syncService;
    }

    @GetMapping("/today")
    public ResponseEntity<List<SessionSummaryDto>> getTodaySessions() {
        // Enforce or resolve tenant context
        String tenantId = TenantContext.getTenantId().orElse("default-tenant");

        List<SessionSummaryDto> sessions = List.of(
            new SessionSummaryDto("session-math-a", "Mathematics", "Batch A", "10:00 AM – 11:00 AM", "Room A1", 42, "UPCOMING"),
            new SessionSummaryDto("session-math-b", "Mathematics", "Batch B", "12:00 PM – 1:00 PM", "Room A2", 38, "UPCOMING"),
            new SessionSummaryDto("session-doubt", "Doubt Session", "Class 11 & 12", "4:00 PM – 5:00 PM", "Room B1", 12, "UPCOMING")
        );

        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/{sessionId}/roster")
    public ResponseEntity<List<RosterStudentDto>> getSessionRoster(@PathVariable String sessionId) {
        List<RosterStudentDto> roster = List.of(
            new RosterStudentDto("std-01", "Aditya Kumar", "Roll #101", "AK", AttendanceStatus.PRESENT),
            new RosterStudentDto("std-02", "Ananya Verma", "Roll #102", "AV", AttendanceStatus.PRESENT),
            new RosterStudentDto("std-03", "Rohan Sharma", "Roll #103", "RS", AttendanceStatus.ABSENT),
            new RosterStudentDto("std-04", "Neha Singh", "Roll #104", "NS", AttendanceStatus.PRESENT),
            new RosterStudentDto("std-05", "Aryan Shah", "Roll #105", "AS", AttendanceStatus.PRESENT),
            new RosterStudentDto("std-06", "Kavya Patel", "Roll #106", "KP", AttendanceStatus.PRESENT),
            new RosterStudentDto("std-07", "Tanvi Joshi", "Roll #107", "TJ", AttendanceStatus.ABSENT),
            new RosterStudentDto("std-08", "Vikram Reddy", "Roll #108", "VR", AttendanceStatus.PRESENT)
        );

        return ResponseEntity.ok(roster);
    }

    @PostMapping("/{sessionId}/attendance")
    public ResponseEntity<AttendanceResult> markAttendance(
            @PathVariable String sessionId,
            @Valid @RequestBody MarkAttendanceRequest request) {

        String tenantId = TenantContext.getTenantId().orElse("default-tenant");
        AttendanceMarkingStrategy strategy = strategyRegistry.getStrategy(request.method());

        AttendanceCommand command = new AttendanceCommand(
            tenantId,
            sessionId,
            request.method(),
            "teacher-principal",
            request.studentStatuses(),
            request.singleStudentId(),
            request.qrToken(),
            request.sixDigitCode(),
            Instant.now()
        );

        AttendanceResult result = strategy.markAttendance(command);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{sessionId}/attendance/code")
    public ResponseEntity<GeneratedPinResponse> generateSessionCode(@PathVariable String sessionId) {
        String code = String.format("%06d", random.nextInt(1_000_000));
        long ttlSeconds = 300; // 5 minutes tenant validity
        String qrPayload = "tutorzen://session/" + sessionId + "?code=" + code + "&exp=" + (Instant.now().getEpochSecond() + ttlSeconds);

        return ResponseEntity.ok(new GeneratedPinResponse(sessionId, code, ttlSeconds, qrPayload));
    }

    @PostMapping("/{sessionId}/attendance/sync")
    public ResponseEntity<List<SyncItemOutcome>> syncOfflineSubmissions(
            @PathVariable String sessionId,
            @RequestBody List<SyncSubmission> submissions) {

        List<SyncItemOutcome> outcomes = syncService.processBatch(submissions);
        return ResponseEntity.ok(outcomes);
    }
}

