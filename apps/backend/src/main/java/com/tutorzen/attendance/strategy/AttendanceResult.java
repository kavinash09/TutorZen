package com.tutorzen.attendance.strategy;

import com.tutorzen.attendance.domain.AttendanceRecord;

import java.util.Collections;
import java.util.List;

public record AttendanceResult(
    boolean success,
    int totalMarked,
    List<AttendanceRecord> records,
    List<String> errors
) {
    public static AttendanceResult success(List<AttendanceRecord> records) {
        return new AttendanceResult(true, records.size(), records, Collections.emptyList());
    }

    public static AttendanceResult failure(String errorMessage) {
        return new AttendanceResult(false, 0, Collections.emptyList(), List.of(errorMessage));
    }

    public static AttendanceResult failure(List<String> errors) {
        return new AttendanceResult(false, 0, Collections.emptyList(), errors);
    }
}

