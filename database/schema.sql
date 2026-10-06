-- ============================================================================
-- CivicVoice PostgreSQL Database Schema (Authoritative 11-Table Architecture)
-- Location-Based Civic Issue Dispatch & Resolution Platform
-- ============================================================================

-- 1. CLEAN DROP ORDER (Reversible, drops foreign-key dependents first)
DROP TABLE IF EXISTS citizen_verifications CASCADE;
DROP TABLE IF EXISTS issue_reports CASCADE;
DROP TABLE IF EXISTS issue_assignments CASCADE;
DROP TABLE IF EXISTS issue_updates CASCADE;
DROP TABLE IF EXISTS issue_timeline CASCADE; -- Legacy alias cleanup
DROP TABLE IF EXISTS issue_supports CASCADE;
DROP TABLE IF EXISTS issue_upvotes CASCADE;  -- Legacy alias cleanup
DROP TABLE IF EXISTS issue_media CASCADE;
DROP TABLE IF EXISTS issues CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- 1. DEPARTMENTS TABLE
-- ============================================================================
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    code VARCHAR(50) UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_departments_code ON departments(code);

-- ============================================================================
-- 2. USERS TABLE
-- Canonical roles strictly enforced: 'CITIZEN', 'MUNICIPAL', 'ADMIN'
-- ============================================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('CITIZEN', 'MUNICIPAL', 'ADMIN')),
    badge VARCHAR(100) DEFAULT 'Verified Citizen',
    avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    department VARCHAR(150) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department_id ON users(department_id);

-- ============================================================================
-- 3. CATEGORIES TABLE
-- ============================================================================
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT 'Layers',
    color VARCHAR(50) DEFAULT 'amber',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. LOCATIONS TABLE (Structured Ward & GIS Location Entity)
-- ============================================================================
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    address VARCHAR(255) NOT NULL,
    ward VARCHAR(50) DEFAULT 'Ward 1',
    district VARCHAR(100) DEFAULT 'Central District',
    city VARCHAR(100) DEFAULT 'San Francisco',
    pincode VARCHAR(20) DEFAULT NULL,
    latitude DOUBLE PRECISION DEFAULT 37.7749,
    longitude DOUBLE PRECISION DEFAULT -122.4194,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_locations_ward ON locations(ward);

-- ============================================================================
-- 5. ISSUES TABLE
-- ============================================================================
CREATE TABLE issues (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id VARCHAR(50) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'reported' CHECK (
        status IN (
            'reported',
            'under_review',
            'accepted',
            'in_progress',
            'completed',
            'citizen_verified',
            'reopened'
        )
    ),
    location_id INT REFERENCES locations(id) ON DELETE SET NULL,
    address VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION DEFAULT 37.7749,
    longitude DOUBLE PRECISION DEFAULT -122.4194,
    image_url TEXT NOT NULL,
    completion_evidence_url TEXT DEFAULT NULL,
    reported_by_id INT REFERENCES users(id) ON DELETE SET NULL,
    reporter_name VARCHAR(150) NOT NULL,
    reporter_badge VARCHAR(100) DEFAULT 'Civic Steward',
    reporter_avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    upvotes_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_category ON issues(category_id);
CREATE INDEX idx_issues_created_at ON issues(created_at DESC);
CREATE INDEX idx_issues_reporter ON issues(reported_by_id);
CREATE INDEX idx_issues_location ON issues(location_id);

-- ============================================================================
-- 6. ISSUE MEDIA TABLE (Multi-photo support: up to 10 photos per issue)
-- ============================================================================
CREATE TABLE issue_media (
    id SERIAL PRIMARY KEY,
    issue_id VARCHAR(50) NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    uploaded_by_id INT REFERENCES users(id) ON DELETE SET NULL,
    media_url TEXT NOT NULL,
    media_type VARCHAR(50) DEFAULT 'image',
    caption VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_issue_id ON issue_media(issue_id);

-- ============================================================================
-- 7. ISSUE UPDATES TABLE (Unified Lifecycle Audit Trail & Timeline History)
-- ============================================================================
CREATE TABLE issue_updates (
    id SERIAL PRIMARY KEY,
    issue_id VARCHAR(50) NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    title VARCHAR(255) NOT NULL,
    author_id INT REFERENCES users(id) ON DELETE SET NULL,
    author VARCHAR(150) NOT NULL,
    role VARCHAR(150) NOT NULL,
    note TEXT DEFAULT NULL,
    evidence_image TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_updates_issue_id ON issue_updates(issue_id);

-- ============================================================================
-- 8. ISSUE ASSIGNMENTS TABLE (Municipal Officer & Department Routing)
-- ============================================================================
CREATE TABLE issue_assignments (
    id SERIAL PRIMARY KEY,
    issue_id VARCHAR(50) NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    assigned_to_user_id INT REFERENCES users(id) ON DELETE SET NULL,
    assigned_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'assigned',
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assignments_issue_id ON issue_assignments(issue_id);
CREATE INDEX idx_assignments_dept ON issue_assignments(department_id);

-- ============================================================================
-- 9. ISSUE REPORTS TABLE (Citizen Flagging & Content Moderation)
-- ============================================================================
CREATE TABLE issue_reports (
    id SERIAL PRIMARY KEY,
    issue_id VARCHAR(50) NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    reported_by_id INT REFERENCES users(id) ON DELETE SET NULL,
    reason VARCHAR(100) NOT NULL,
    details TEXT DEFAULT NULL,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_issue_id ON issue_reports(issue_id);

-- ============================================================================
-- 10. ISSUE SUPPORTS TABLE (Community Co-Signing, 1 support per user enforced)
-- ============================================================================
CREATE TABLE issue_supports (
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    issue_id VARCHAR(50) NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, issue_id)
);

CREATE INDEX idx_supports_user ON issue_supports(user_id);
CREATE INDEX idx_supports_issue ON issue_supports(issue_id);

-- ============================================================================
-- 11. CITIZEN VERIFICATIONS TABLE (Resolution Audit & Certification History)
-- ============================================================================
CREATE TABLE citizen_verifications (
    id SERIAL PRIMARY KEY,
    issue_id VARCHAR(50) NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(150) NOT NULL,
    is_resolved BOOLEAN NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verifications_issue ON citizen_verifications(issue_id);
