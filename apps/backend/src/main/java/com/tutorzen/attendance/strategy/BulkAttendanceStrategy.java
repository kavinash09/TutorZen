package com.tutorzen.attendance.strategy;

import com.tutorzen.attendance.domain.AttendanceMethod;
import com.tutorzen.attendance.domain.AttendanceRecord;
import com.tutorzen.attendance.domain.AttendanceStatus;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class BulkAttendanceStrategy implements AttendanceMarkingStrategy {

    @Override
    public AttendanceMethod getSupportedMethod() {
        return AttendanceMethod.BULK;
    }

    @Override
    public AttendanceResult markAttendance(AttendanceCommand command) {
        if (command == null) {
            return AttendanceResult.failure("Attendance command cannot be null");
        }
        if (command.studentStatuses() == null || command.studentStatuses().isEmpty()) {
            return AttendanceResult.failure("Bulk attendance requires a non-empty student statuses map");
        }

        List<AttendanceRecord> records = new ArrayList<>();
        Instant markedAt = command.timestamp() != null ? command.timestamp() : Instant.now();

        for (Map.Entry<String, AttendanceStatus> entry : command.studentStatuses().entrySet()) {
            String studentId = entry.getKey();
            AttendanceStatus status = entry.getValue() != null ? entry.getValue() : AttendanceStatus.PRESENT;

            records.add(new AttendanceRecord(
                UUID.randomUUID().toString(),
                command.tenantId(),
                command.sessionId(),
                studentId,
                status,
                AttendanceMethod.BULK,
                command.markedBy(),
                markedAt
            ));
        }

        return AttendanceResult.success(records);
    }
}

