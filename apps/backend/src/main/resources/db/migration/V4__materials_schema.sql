-- V4__materials_schema.sql
-- Learning materials repository metadata: notes, formula sheets, and study documents

CREATE TABLE learning_materials (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    subject_id VARCHAR(64) NOT NULL,
    uploaded_by VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_materials_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_materials_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT fk_materials_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_materials_tenant_subject ON learning_materials(tenant_id, subject_id);
CREATE INDEX idx_materials_uploader ON learning_materials(uploaded_by);

-- Seed initial sample materials for tenant-default
INSERT INTO learning_materials (id, tenant_id, subject_id, uploaded_by, title, description, file_name, file_type, file_size_bytes, file_url, created_at)
VALUES 
    (
        'mat-01',
        'tenant-default',
        'sub-math-11',
        'usr-teacher-01',
        'Calculus: Integration by Parts & Formulas',
        'Comprehensive formula and derivation guide for Chapter 4 with practice questions.',
        'Calculus_Ch4_Integration_Formulas.pdf',
        'application/pdf',
        2411724,
        'https://tutorzen-docs.local/materials/mat-01.pdf',
        CURRENT_TIMESTAMP - INTERVAL '2 days'
    ),
    (
        'mat-02',
        'tenant-default',
        'sub-math-11',
        'usr-teacher-01',
        'Algebra: Matrices & Determinants Summary',
        'Handwritten summary notes and shortcut tricks discussed during morning lecture.',
        'Matrices_Determinants_Summary.pdf',
        'application/pdf',
        4194304,
        'https://tutorzen-docs.local/materials/mat-02.pdf',
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    )
ON CONFLICT (id) DO NOTHING;

