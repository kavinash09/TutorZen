-- V1__init_schema.sql
-- Initial baseline schema for TutorZen multi-tenant foundation

CREATE TABLE tenants (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenants_slug ON tenants(slug);

CREATE TABLE attendance_records (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    session_id VARCHAR(64) NOT NULL,
    student_id VARCHAR(64) NOT NULL,
    status VARCHAR(20) NOT NULL,
    method VARCHAR(30) NOT NULL,
    marked_by VARCHAR(64) NOT NULL,
    marked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_tenant_session_student UNIQUE (tenant_id, session_id, student_id),
    CONSTRAINT fk_attendance_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_attendance_tenant_session ON attendance_records(tenant_id, session_id);
CREATE INDEX idx_attendance_student ON attendance_records(tenant_id, student_id);

