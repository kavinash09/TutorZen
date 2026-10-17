package com.tutorzen.attendance.api.dto;

import com.tutorzen.attendance.domain.AttendanceStatus;

public record RosterStudentDto(
    String id,
    String studentId,
    String name,
    String rollNumber,
    String initials,
    AttendanceStatus status,
    AttendanceStatus defaultStatus
) {
    public RosterStudentDto(String id, String name, String rollNumber, String initials, AttendanceStatus status) {
        this(id, id, name, rollNumber, initials, status, status);
    }
}


