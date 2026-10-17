package com.tutorzen.attendance.strategy;

import com.tutorzen.attendance.domain.AttendanceMethod;

/**
 * Strategy interface for marking attendance across distinct methods (Bulk, QR, Six-Digit Code).
 * Adheres to ADR-0002 and domain constraints.
 */
public interface AttendanceMarkingStrategy {

    AttendanceMethod getSupportedMethod();

    AttendanceResult markAttendance(AttendanceCommand command);
}

