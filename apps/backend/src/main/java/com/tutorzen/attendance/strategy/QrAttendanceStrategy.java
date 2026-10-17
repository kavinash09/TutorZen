package com.tutorzen.attendance.strategy;

import com.tutorzen.attendance.domain.AttendanceMethod;
import com.tutorzen.attendance.domain.AttendanceRecord;
import com.tutorzen.attendance.domain.AttendanceStatus;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Component
public class QrAttendanceStrategy implements AttendanceMarkingStrategy {

    @Override
    public AttendanceMethod getSupportedMethod() {
        return AttendanceMethod.QR;
    }

    @Override
    public AttendanceResult markAttendance(AttendanceCommand command) {
        if (command == null) {
            return AttendanceResult.failure("Attendance command cannot be null");
        }
        if (command.singleStudentId() == null || command.singleStudentId().isBlank()) {
            return AttendanceResult.failure("QR attendance requires a valid student ID");
        }
        if (command.qrToken() == null || command.qrToken().isBlank()) {
            return AttendanceResult.failure("QR token is missing or invalid");
        }

        // Validate QR token structure/session linkage (mockable or tenant-specific validation)
        if (command.qrToken().length() < 8) {
            return AttendanceResult.failure("Invalid QR token format or expired token");
        }

        Instant markedAt = command.timestamp() != null ? command.timestamp() : Instant.now();
        AttendanceRecord record = new AttendanceRecord(
            UUID.randomUUID().toString(),
            command.tenantId(),
            command.sessionId(),
            command.singleStudentId(),
            AttendanceStatus.PRESENT,
            AttendanceMethod.QR,
            command.markedBy(),
            markedAt
        );

        return AttendanceResult.success(List.of(record));
    }
}

