-- V5__branches_and_permissions.sql
-- Multi-Branch Hierarchy, Granular Delegated Permissions, and Branch Assignments (ADR-0012, ADR-0013 / TZ-E04-S01)

-- 1. Branches Table
CREATE TABLE branches (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL,
    address VARCHAR(500),
    phone VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_tenant_branch_code UNIQUE (tenant_id, code),
    CONSTRAINT fk_branches_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_branches_tenant ON branches(tenant_id);

-- Seed default branch for existing tenant
INSERT INTO branches (id, tenant_id, name, code, address, phone, status, created_at, updated_at)
VALUES ('branch-default-main', 'tenant-default', 'Main Campus', 'MAIN', '123 Education Hub, Knowledge City', '+91 98765 43210', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 2. Associate Batches with Branches
ALTER TABLE batches ADD COLUMN branch_id VARCHAR(64);

UPDATE batches 
SET branch_id = 'branch-default-main' 
WHERE tenant_id = 'tenant-default' AND branch_id IS NULL;

ALTER TABLE batches 
ADD CONSTRAINT fk_batches_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;

CREATE INDEX idx_batches_branch ON batches(branch_id);

-- 3. System Permissions Definition
CREATE TABLE permissions (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO permissions (id, code, category, description)
VALUES
    ('perm-fin-view', 'VIEW_FINANCES', 'FINANCE', 'View offline fee transactions and ledger summaries'),
    ('perm-fin-record', 'RECORD_FINANCES', 'FINANCE', 'Record offline fee collections and issue receipts'),
    ('perm-staff-manage', 'MANAGE_STAFF', 'STAFF', 'Invite and manage teachers and moderators'),
    ('perm-branch-manage', 'MANAGE_BRANCHES', 'SYSTEM', 'Configure branch details and rooms'),
    ('perm-batch-manage', 'MANAGE_BATCHES', 'ACADEMICS', 'Create and manage batch schedules'),
    ('perm-att-mark', 'MARK_ATTENDANCE', 'ACADEMICS', 'Mark and verify student attendance'),
    ('perm-mat-manage', 'MANAGE_MATERIALS', 'ACADEMICS', 'Publish study notes and assignments')
ON CONFLICT (id) DO NOTHING;

-- 4. User Delegated Permissions (Granular, optionally branch-scoped)
CREATE TABLE user_permissions (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    permission_id VARCHAR(64) NOT NULL,
    branch_id VARCHAR(64),
    granted_by VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_permission_branch UNIQUE (tenant_id, user_id, permission_id, branch_id),
    CONSTRAINT fk_user_perms_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_perms_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_perms_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_perms_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_perms_tenant_user ON user_permissions(tenant_id, user_id);
CREATE INDEX idx_user_perms_branch ON user_permissions(branch_id);

-- 5. Branch Assignments (Staff and Teacher branch affiliations)
CREATE TABLE branch_assignments (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    branch_id VARCHAR(64) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_tenant_user_branch UNIQUE (tenant_id, user_id, branch_id),
    CONSTRAINT fk_branch_assign_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_branch_assign_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_branch_assign_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

CREATE INDEX idx_branch_assign_tenant_user ON branch_assignments(tenant_id, user_id);
CREATE INDEX idx_branch_assign_branch ON branch_assignments(branch_id);

-- Seed initial branch assignments for demo users
INSERT INTO branch_assignments (id, tenant_id, user_id, branch_id, is_primary)
VALUES
    ('ba-01', 'tenant-default', 'usr-teacher-01', 'branch-default-main', TRUE),
    ('ba-02', 'tenant-default', 'usr-admin-01', 'branch-default-main', TRUE)
ON CONFLICT (id) DO NOTHING;

