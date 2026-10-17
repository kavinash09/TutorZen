package com.tutorzen.attendance.api.dto;

import com.tutorzen.attendance.domain.AttendanceMethod;
import com.tutorzen.attendance.domain.AttendanceStatus;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record MarkAttendanceRequest(
    @NotNull(message = "Attendance method is required")
    AttendanceMethod method,
    Map<String, AttendanceStatus> studentStatuses,
    String singleStudentId,
    String qrToken,
    String sixDigitCode
) {
}

