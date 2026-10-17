package com.tutorzen.attendance.api.dto;

import com.tutorzen.attendance.domain.AttendanceMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record StudentAttendanceSubmitRequest(
    @NotBlank(message = "Student ID is required")
    String studentId,

    @NotBlank(message = "Session ID is required")
    String sessionId,

    @NotNull(message = "Attendance method is required")
    AttendanceMethod method,

    String sixDigitCode,

    String qrToken
) {
}

