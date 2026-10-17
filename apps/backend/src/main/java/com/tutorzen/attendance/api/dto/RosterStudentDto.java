package com.tutorzen.attendance.api.dto;

import com.tutorzen.attendance.domain.AttendanceStatus;

public record RosterStudentDto(
    String id,
    String name,
    String rollNumber,
    String initials,
    AttendanceStatus defaultStatus
) {
}

