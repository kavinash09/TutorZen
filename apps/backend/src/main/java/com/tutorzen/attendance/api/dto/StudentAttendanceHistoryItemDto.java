package com.tutorzen.attendance.api.dto;

import com.tutorzen.attendance.domain.AttendanceMethod;
import com.tutorzen.attendance.domain.AttendanceStatus;

import java.time.Instant;

public record StudentAttendanceHistoryItemDto(
    String recordId,
    String sessionId,
    String subject,
    Instant timestamp,
    AttendanceStatus status,
    AttendanceMethod method
) {
}

