package com.tutorzen.attendance.strategy;

import com.tutorzen.attendance.domain.AttendanceMethod;
import com.tutorzen.attendance.domain.AttendanceRecord;
import com.tutorzen.attendance.domain.AttendanceStatus;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Component
public class SixDigitCodeAttendanceStrategy implements AttendanceMarkingStrategy {

    private static final Pattern SIX_DIGIT_PATTERN = Pattern.compile("^\\d{6}$");

    @Override
    public AttendanceMethod getSupportedMethod() {
        return AttendanceMethod.SIX_DIGIT_CODE;
    }

    @Override
    public AttendanceResult markAttendance(AttendanceCommand command) {
        if (command == null) {
            return AttendanceResult.failure("Attendance command cannot be null");
        }
        if (command.singleStudentId() == null || command.singleStudentId().isBlank()) {
            return AttendanceResult.failure("Code attendance requires a valid student ID");
        }
        if (command.sixDigitCode() == null || !SIX_DIGIT_PATTERN.matcher(command.sixDigitCode()).matches()) {
            return AttendanceResult.failure("Invalid six-digit code. Code must contain exactly 6 numeric digits");
        }

        Instant markedAt = command.timestamp() != null ? command.timestamp() : Instant.now();
        AttendanceRecord record = new AttendanceRecord(
            UUID.randomUUID().toString(),
            command.tenantId(),
            command.sessionId(),
            command.singleStudentId(),
            AttendanceStatus.PRESENT,
            AttendanceMethod.SIX_DIGIT_CODE,
            command.markedBy(),
            markedAt
        );

        return AttendanceResult.success(List.of(record));
    }
}

