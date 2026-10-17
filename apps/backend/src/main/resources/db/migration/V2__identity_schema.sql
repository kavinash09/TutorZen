-- V2__identity_schema.sql
-- Identity, user authentication, credentials, and refresh tokens

CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_tenant_user_email UNIQUE (tenant_id, email),
    CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX idx_users_role ON users(role);

CREATE TABLE user_credentials (
    user_id VARCHAR(64) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_credentials_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE refresh_tokens (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

-- Baseline tenant and demo users for local development and initial testing
INSERT INTO tenants (id, slug, name, status, created_at, updated_at)
VALUES ('tenant-default', 'apex-academy', 'Apex Academy', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, tenant_id, email, full_name, role, status, created_at, updated_at)
VALUES 
    ('usr-teacher-01', 'tenant-default', 'teacher@demo.com', 'Principal Teacher', 'TEACHER', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('usr-student-01', 'tenant-default', 'student@demo.com', 'Aditya Kumar', 'STUDENT', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('usr-admin-01', 'tenant-default', 'admin@demo.com', 'Center Administrator', 'ADMIN', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_credentials (user_id, password_hash, updated_at)
VALUES
    ('usr-teacher-01', '$2a$10$oN9v/pHPoNZ/06V/xG3tXuZcUk.6lb.wSaD1V5rdpkERNC2RnZ3oS', CURRENT_TIMESTAMP),
    ('usr-student-01', '$2a$10$oN9v/pHPoNZ/06V/xG3tXuZcUk.6lb.wSaD1V5rdpkERNC2RnZ3oS', CURRENT_TIMESTAMP),
    ('usr-admin-01', '$2a$10$oN9v/pHPoNZ/06V/xG3tXuZcUk.6lb.wSaD1V5rdpkERNC2RnZ3oS', CURRENT_TIMESTAMP)
ON CONFLICT (user_id) DO NOTHING;

