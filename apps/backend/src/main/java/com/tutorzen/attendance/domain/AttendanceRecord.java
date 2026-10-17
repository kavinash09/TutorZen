package com.tutorzen.attendance.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(
    name = "attendance_records",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_tenant_session_student",
            columnNames = {"tenant_id", "session_id", "student_id"}
        )
    }
)
public class AttendanceRecord {

    @Id
    @Column(nullable = false, updatable = false)
    private String id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private String tenantId;

    @Column(name = "session_id", nullable = false, updatable = false)
    private String sessionId;

    @Column(name = "student_id", nullable = false, updatable = false)
    private String studentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AttendanceStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AttendanceMethod method;

    @Column(name = "marked_by", nullable = false)
    private String markedBy;

    @Column(name = "marked_at", nullable = false)
    private Instant markedAt;

    public AttendanceRecord() {
    }

    public AttendanceRecord(String id, String tenantId, String sessionId, String studentId,
                            AttendanceStatus status, AttendanceMethod method,
                            String markedBy, Instant markedAt) {
        this.id = id != null ? id : UUID.randomUUID().toString();
        this.tenantId = tenantId;
        this.sessionId = sessionId;
        this.studentId = studentId;
        this.status = status;
        this.method = method;
        this.markedBy = markedBy;
        this.markedAt = markedAt != null ? markedAt : Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.markedAt == null) {
            this.markedAt = Instant.now();
        }
    }

    public String getId() {
        return id;
    }

    public String getTenantId() {
        return tenantId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public String getStudentId() {
        return studentId;
    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }

    public AttendanceMethod getMethod() {
        return method;
    }

    public String getMarkedBy() {
        return markedBy;
    }

    public Instant getMarkedAt() {
        return markedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AttendanceRecord that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}

