package com.tutorzen.attendance.strategy;

import com.tutorzen.attendance.domain.AttendanceMethod;
import com.tutorzen.attendance.domain.AttendanceStatus;

import java.time.Instant;
import java.util.Map;

/**
 * Command carrying parameters for marking attendance via any supported strategy.
 */
public record AttendanceCommand(
    String tenantId,
    String sessionId,
    AttendanceMethod method,
    String markedBy,
    Map<String, AttendanceStatus> studentStatuses, // Used for Bulk marking
    String singleStudentId,                        // Used for QR / Code marking
    String qrToken,                               // Used for QR validation
    String sixDigitCode,                          // Used for Code validation
    Instant timestamp
) {
    public static AttendanceCommand forBulk(String tenantId, String sessionId, String markedBy,
                                            Map<String, AttendanceStatus> studentStatuses) {
        return new AttendanceCommand(
            tenantId, sessionId, AttendanceMethod.BULK, markedBy,
            studentStatuses, null, null, null, Instant.now()
        );
    }

    public static AttendanceCommand forQr(String tenantId, String sessionId, String markedBy,
                                         String studentId, String qrToken) {
        return new AttendanceCommand(
            tenantId, sessionId, AttendanceMethod.QR, markedBy,
            null, studentId, qrToken, null, Instant.now()
        );
    }

    public static AttendanceCommand forSixDigitCode(String tenantId, String sessionId, String markedBy,
                                                   String studentId, String sixDigitCode) {
        return new AttendanceCommand(
            tenantId, sessionId, AttendanceMethod.SIX_DIGIT_CODE, markedBy,
            null, studentId, null, sixDigitCode, Instant.now()
        );
    }
}

