-- =====================================================
-- Schema SQL - Travaux Routiers API
-- PostgreSQL 15
-- =====================================================

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    telephone VARCHAR(20),
    password VARCHAR(255),
    firebase_uid VARCHAR(255) UNIQUE,
    role VARCHAR(50) NOT NULL,
    auth_provider VARCHAR(20) NOT NULL,
    active BOOLEAN DEFAULT true,
    account_locked BOOLEAN DEFAULT false,
    locked_until TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

-- =====================================================
-- SIGNALEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS signalements (
    id BIGSERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    type_travaux VARCHAR(50) NOT NULL,
    statut VARCHAR(50) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    adresse VARCHAR(500),
    photos TEXT,
    surface_m2 DOUBLE PRECISION,
    budget DOUBLE PRECISION,
    entreprise VARCHAR(255),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    synced BOOLEAN DEFAULT false,
    firebase_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_signalements_statut ON signalements(statut);
CREATE INDEX IF NOT EXISTS idx_signalements_user_id ON signalements(user_id);
CREATE INDEX IF NOT EXISTS idx_signalements_created_at ON signalements(created_at);
CREATE INDEX IF NOT EXISTS idx_signalements_type_travaux ON signalements(type_travaux);

-- =====================================================
-- SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(500) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    active BOOLEAN DEFAULT true,
    device_info VARCHAR(500),
    ip_address VARCHAR(45)
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- =====================================================
-- SYNC_LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sync_logs (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    firebase_id VARCHAR(255),
    success BOOLEAN NOT NULL,
    error_message TEXT,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- DATA SAMPLE (Optional - Comment if not needed)
-- =====================================================

-- Insert sample users
-- Password for all: "password123" (BCrypt: $2a$10$...)
-- Use: https://www.bcryptcalculator.com/ to generate hashes if needed

INSERT INTO users (email, nom, prenom, telephone, password, role, auth_provider, active, account_locked, login_attempts)
VALUES 
    ('visiteur@test.com', 'Rakoto', 'Jean', '034 12 345 67', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVm', 'VISITEUR', 'LOCAL', true, false, 0),
    ('mobile@test.com', 'Razafi', 'Marie', '034 98 765 43', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVm', 'UTILISATEUR_MOBILE', 'LOCAL', true, false, 0),
    ('manager@test.com', 'Dupont', 'Paul', '034 55 666 77', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVm', 'MANAGER', 'LOCAL', true, false, 0)
ON CONFLICT (email) DO NOTHING;

-- Insert sample signalements
INSERT INTO signalements (titre, description, type_travaux, statut, latitude, longitude, adresse, user_id, synced)
SELECT 
    'Nid de poule Avenue de l''Indépendance',
    'Important nid de poule dangereux pour les véhicules',
    'NIDS_DE_POULE',
    'NOUVEAU',
    -18.8792,
    47.5079,
    'Avenue de l''Indépendance, Antananarivo',
    id,
    false
FROM users WHERE email = 'mobile@test.com' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO signalements (titre, description, type_travaux, statut, latitude, longitude, adresse, user_id, synced)
SELECT 
    'Fissure Route Nationale 5',
    'Fissure importante sur la chaussée',
    'FISSURE',
    'EN_COURS',
    -18.8650,
    47.5200,
    'Route Nationale 5, Antananarivo',
    id,
    false
FROM users WHERE email = 'mobile@test.com' LIMIT 1
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Use these to verify data:
--
-- SELECT COUNT(*) FROM users;
-- SELECT * FROM users;
-- SELECT * FROM signalements;
-- SELECT * FROM sessions;
-- SELECT * FROM sync_logs;
