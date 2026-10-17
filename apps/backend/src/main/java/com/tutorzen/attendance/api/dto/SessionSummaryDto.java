package com.tutorzen.attendance.api.dto;

public record SessionSummaryDto(
    String id,
    String subject,
    String batchName,
    String timeSlot,
    String room,
    int enrolledStudentsCount,
    String status
) {
}

