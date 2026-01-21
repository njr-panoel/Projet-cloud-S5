-- V1__Initial_schema.sql
-- Initial database schema for Road Issues API

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    blocked_until TIMESTAMP,
    attempt_count INTEGER DEFAULT 0,
    firebase_uid VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indices for users table
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_role ON users(role);

-- Create signalements table
CREATE TABLE IF NOT EXISTS signalements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    description TEXT,
    photo_url VARCHAR(500),
    statut VARCHAR(50) NOT NULL DEFAULT 'NOUVEAU',
    surface_m2 DOUBLE PRECISION,
    budget DOUBLE PRECISION DEFAULT 0.0,
    entreprise VARCHAR(200) DEFAULT '',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    date_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted BOOLEAN DEFAULT FALSE,
    sync_timestamp BIGINT DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT * 1000,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indices for signalements table
CREATE INDEX idx_user_id ON signalements(user_id);
CREATE INDEX idx_statut ON signalements(statut);
CREATE INDEX idx_date_creation ON signalements(date_creation);
CREATE INDEX idx_coordinates ON signalements(latitude, longitude);

-- Create historiques table
CREATE TABLE IF NOT EXISTS historiques (
    id BIGSERIAL PRIMARY KEY,
    signalement_id BIGINT NOT NULL,
    manager_id BIGINT NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (signalement_id) REFERENCES signalements(id) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Create indices for historiques table
CREATE INDEX idx_signalement_id ON historiques(signalement_id);
CREATE INDEX idx_manager_id ON historiques(manager_id);
CREATE INDEX idx_date ON historiques(date);

-- Insert default manager user
-- Password: defaultpass (hashed with BCrypt)
-- $2a$10$Z5.Z5Z5Z5Z5Z5Z5Z5Z5Z5 is a valid BCrypt hash for testing
-- In production, change this to a proper hashed password
INSERT INTO users (nom, email, password_hash, role, created_at, updated_at)
VALUES (
    'Default Manager',
    'manager@roadissues.mg',
    '$2a$10$fZ5Y.VqV8V5Y.VqV8V5Y.V5Y.VqV8V5Y.VqV8V5Y.VqV8V5Y.VqV8V5Y', -- This is a BCrypt hash placeholder
    'MANAGER',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;
