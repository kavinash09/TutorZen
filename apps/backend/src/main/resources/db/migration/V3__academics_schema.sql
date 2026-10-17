-- V3__academics_schema.sql
-- Academic structure: subjects, batches, students, enrollments, and class sessions

CREATE TABLE subjects (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_tenant_subject_code UNIQUE (tenant_id, code),
    CONSTRAINT fk_subjects_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE batches (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    subject_id VARCHAR(64) NOT NULL,
    name VARCHAR(200) NOT NULL,
    room VARCHAR(100) NOT NULL,
    enrolled_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_batches_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_batches_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE students (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64),
    name VARCHAR(200) NOT NULL,
    roll_number VARCHAR(50) NOT NULL,
    initials VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_tenant_student_roll UNIQUE (tenant_id, roll_number),
    CONSTRAINT fk_students_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE batch_enrollments (
    tenant_id VARCHAR(64) NOT NULL,
    batch_id VARCHAR(64) NOT NULL,
    student_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (batch_id, student_id),
    CONSTRAINT fk_enrollments_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollments_batch FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollments_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE class_sessions (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    batch_id VARCHAR(64) NOT NULL,
    teacher_id VARCHAR(64) NOT NULL,
    subject_name VARCHAR(200) NOT NULL,
    batch_name VARCHAR(200) NOT NULL,
    time_slot VARCHAR(100) NOT NULL,
    room VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'UPCOMING',
    session_code VARCHAR(10),
    qr_payload TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sessions_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_sessions_batch FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    CONSTRAINT fk_sessions_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_tenant_teacher ON class_sessions(tenant_id, teacher_id);
CREATE INDEX idx_sessions_batch ON class_sessions(batch_id);

-- Baseline Seed Data for tenant-default
INSERT INTO subjects (id, tenant_id, name, code)
VALUES 
    ('sub-math-11', 'tenant-default', 'Mathematics', 'MATH-11'),
    ('sub-phy-11', 'tenant-default', 'Physics', 'PHY-11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO batches (id, tenant_id, subject_id, name, room, enrolled_count)
VALUES 
    ('batch-math-a', 'tenant-default', 'sub-math-11', 'Batch A', 'Room A1', 42),
    ('batch-math-b', 'tenant-default', 'sub-math-11', 'Batch B', 'Room A2', 38),
    ('batch-doubt', 'tenant-default', 'sub-math-11', 'Class 11 & 12', 'Room B1', 12)
ON CONFLICT (id) DO NOTHING;

INSERT INTO students (id, tenant_id, user_id, name, roll_number, initials)
VALUES 
    ('std-01', 'tenant-default', 'usr-student-01', 'Aditya Kumar', 'Roll #101', 'AK'),
    ('std-02', 'tenant-default', NULL, 'Ananya Verma', 'Roll #102', 'AV'),
    ('std-03', 'tenant-default', NULL, 'Rohan Sharma', 'Roll #103', 'RS'),
    ('std-04', 'tenant-default', NULL, 'Neha Singh', 'Roll #104', 'NS'),
    ('std-05', 'tenant-default', NULL, 'Aryan Shah', 'Roll #105', 'AS'),
    ('std-06', 'tenant-default', NULL, 'Kavya Patel', 'Roll #106', 'KP'),
    ('std-07', 'tenant-default', NULL, 'Tanvi Joshi', 'Roll #107', 'TJ'),
    ('std-08', 'tenant-default', NULL, 'Vikram Reddy', 'Roll #108', 'VR')
ON CONFLICT (id) DO NOTHING;

INSERT INTO batch_enrollments (tenant_id, batch_id, student_id)
VALUES 
    ('tenant-default', 'batch-math-a', 'std-01'),
    ('tenant-default', 'batch-math-a', 'std-02'),
    ('tenant-default', 'batch-math-a', 'std-03'),
    ('tenant-default', 'batch-math-a', 'std-04'),
    ('tenant-default', 'batch-math-a', 'std-05'),
    ('tenant-default', 'batch-math-a', 'std-06'),
    ('tenant-default', 'batch-math-a', 'std-07'),
    ('tenant-default', 'batch-math-a', 'std-08')
ON CONFLICT (batch_id, student_id) DO NOTHING;

INSERT INTO class_sessions (id, tenant_id, batch_id, teacher_id, subject_name, batch_name, time_slot, room, status, session_code, qr_payload, expires_at)
VALUES 
    ('session-math-a', 'tenant-default', 'batch-math-a', 'usr-teacher-01', 'Mathematics', 'Batch A', '10:00 AM – 11:00 AM', 'Room A1', 'UPCOMING', '742916', 'tutorzen://attendance/session/session-math-a?code=742916&exp=1792195200', CURRENT_TIMESTAMP + INTERVAL '1 day'),
    ('session-math-b', 'tenant-default', 'batch-math-b', 'usr-teacher-01', 'Mathematics', 'Batch B', '12:00 PM – 1:00 PM', 'Room A2', 'UPCOMING', '839104', 'tutorzen://attendance/session/session-math-b?code=839104&exp=1792195200', CURRENT_TIMESTAMP + INTERVAL '1 day'),
    ('session-doubt', 'tenant-default', 'batch-doubt', 'usr-teacher-01', 'Doubt Session', 'Class 11 & 12', '4:00 PM – 5:00 PM', 'Room B1', 'UPCOMING', '124982', 'tutorzen://attendance/session/session-doubt?code=124982&exp=1792195200', CURRENT_TIMESTAMP + INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

