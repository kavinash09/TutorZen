package com.tutorzen.attendance.api;

import com.tutorzen.attendance.api.dto.StudentAttendanceHistoryItemDto;
import com.tutorzen.attendance.api.dto.StudentAttendanceSubmitRequest;
import com.tutorzen.attendance.api.dto.StudentAttendanceSummaryDto;
import com.tutorzen.attendance.domain.AttendanceMethod;
import com.tutorzen.attendance.domain.AttendanceStatus;
import com.tutorzen.attendance.strategy.AttendanceCommand;
import com.tutorzen.attendance.strategy.AttendanceMarkingStrategy;
import com.tutorzen.attendance.strategy.AttendanceResult;
import com.tutorzen.attendance.strategy.AttendanceStrategyRegistry;
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
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/v1/students")
public class StudentAttendanceController {

    private final AttendanceStrategyRegistry strategyRegistry;

    public StudentAttendanceController(AttendanceStrategyRegistry strategyRegistry) {
        this.strategyRegistry = strategyRegistry;
    }

    @PostMapping("/attendance/submit")
    public ResponseEntity<AttendanceResult> submitAttendance(
            @Valid @RequestBody StudentAttendanceSubmitRequest request) {

        String tenantId = TenantContext.getTenantId().orElse("default-tenant");
        AttendanceMarkingStrategy strategy = strategyRegistry.getStrategy(request.method());

        AttendanceCommand command = new AttendanceCommand(
            tenantId,
            request.sessionId(),
            request.method(),
            "student-" + request.studentId(),
            null,
            request.studentId(),
            request.qrToken(),
            request.sixDigitCode(),
            Instant.now()
        );

        AttendanceResult result = strategy.markAttendance(command);
        if (!result.success()) {
            return ResponseEntity.badRequest().body(result);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{studentId}/attendance/summary")
    public ResponseEntity<StudentAttendanceSummaryDto> getStudentAttendanceSummary(
            @PathVariable String studentId) {

        // Validate or resolve tenant context
        String tenantId = TenantContext.getTenantId().orElse("default-tenant");

        Instant now = Instant.now();
        List<StudentAttendanceHistoryItemDto> history = List.of(
            new StudentAttendanceHistoryItemDto("rec-101", "session-math-a", "Calculus & Vectors", now.minus(1, ChronoUnit.DAYS), AttendanceStatus.PRESENT, AttendanceMethod.QR),
            new StudentAttendanceHistoryItemDto("rec-102", "session-phys-b", "Mechanics & Heat", now.minus(2, ChronoUnit.DAYS), AttendanceStatus.PRESENT, AttendanceMethod.SIX_DIGIT_CODE),
            new StudentAttendanceHistoryItemDto("rec-103", "session-chem-a", "Organic Chemistry", now.minus(4, ChronoUnit.DAYS), AttendanceStatus.ABSENT, AttendanceMethod.BULK),
            new StudentAttendanceHistoryItemDto("rec-104", "session-math-a", "Differential Calculus", now.minus(5, ChronoUnit.DAYS), AttendanceStatus.PRESENT, AttendanceMethod.SIX_DIGIT_CODE)
        );

        StudentAttendanceSummaryDto summary = new StudentAttendanceSummaryDto(
            studentId,
            "Aditya Kumar",
            92.0,
            75.0,
            50,
            46,
            4,
            2,
            history
        );

        return ResponseEntity.ok(summary);
    }
}
