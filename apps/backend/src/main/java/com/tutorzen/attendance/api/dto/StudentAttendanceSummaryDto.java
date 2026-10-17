package com.tutorzen.attendance.api.dto;

import java.util.List;

public record StudentAttendanceSummaryDto(
    String studentId,
    String studentName,
    double overallPercentage,
    double minimumRequiredPercentage,
    int totalClasses,
    int presentCount,
    int absentCount,
    int lateCount,
    List<StudentAttendanceHistoryItemDto> recentHistory
) {
}

