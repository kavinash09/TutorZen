package com.tutorzen.attendance.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, String> {

    List<AttendanceRecord> findByTenantIdAndSessionId(String tenantId, String sessionId);

    List<AttendanceRecord> findByTenantIdAndStudentId(String tenantId, String studentId);

    Optional<AttendanceRecord> findByTenantIdAndSessionIdAndStudentId(String tenantId, String sessionId, String studentId);
}

