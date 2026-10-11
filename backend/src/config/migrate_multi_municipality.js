import pool, { query } from './database.js';

export async function runMultiMunicipalityMigration() {
  console.log('[MIGRATION] Starting multi-municipality database migration...');

  try {
    // 1. Create municipal_bodies table
    await query(`
      CREATE TABLE IF NOT EXISTS municipal_bodies (
        id VARCHAR(50) PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        state VARCHAR(100) NOT NULL DEFAULT 'Gujarat',
        city VARCHAR(100) NOT NULL,
        authority_type VARCHAR(50) NOT NULL DEFAULT 'MUNICIPAL_CORPORATION',
        official_website VARCHAR(255),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        jurisdiction_bounds JSONB,
        status VARCHAR(30) NOT NULL DEFAULT 'active',
        logo_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Add columns to users table
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS municipality_id VARCHAR(50) REFERENCES municipal_bodies(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS municipal_role VARCHAR(50) DEFAULT 'OFFICER';
    `);

    // 3. Add columns to issues table
    await query(`
      ALTER TABLE issues 
      ADD COLUMN IF NOT EXISTS municipality_id VARCHAR(50) REFERENCES municipal_bodies(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS jurisdiction_status VARCHAR(50) DEFAULT 'MATCHED';
    `);

    // 4. Add columns to departments table
    await query(`
      ALTER TABLE departments 
      ADD COLUMN IF NOT EXISTS municipality_id VARCHAR(50) REFERENCES municipal_bodies(id) ON DELETE CASCADE;
    `);

    // 5. Create municipal_applications table
    await query(`
      CREATE TABLE IF NOT EXISTS municipal_applications (
        id SERIAL PRIMARY KEY,
        application_no VARCHAR(50) UNIQUE NOT NULL,
        applicant_name VARCHAR(150) NOT NULL,
        applicant_email VARCHAR(255) NOT NULL,
        applicant_role VARCHAR(100) NOT NULL,
        applicant_phone VARCHAR(50),
        municipality_name VARCHAR(255) NOT NULL,
        authority_type VARCHAR(50) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        official_website VARCHAR(255),
        office_address TEXT,
        jurisdiction_details TEXT,
        supporting_documents TEXT,
        declaration_confirmed BOOLEAN DEFAULT TRUE,
        status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_INFORMATION')),
        admin_notes TEXT,
        rejection_reason TEXT,
        reviewed_by INT REFERENCES users(id),
        reviewed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Create municipal_application_reviews table
    await query(`
      CREATE TABLE IF NOT EXISTS municipal_application_reviews (
        id SERIAL PRIMARY KEY,
        application_id INT NOT NULL REFERENCES municipal_applications(id) ON DELETE CASCADE,
        reviewer_id INT REFERENCES users(id),
        reviewer_name VARCHAR(150),
        from_status VARCHAR(30),
        to_status VARCHAR(30),
        action VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Create municipal_invitations table
    await query(`
      CREATE TABLE IF NOT EXISTS municipal_invitations (
        id SERIAL PRIMARY KEY,
        municipality_id VARCHAR(50) REFERENCES municipal_bodies(id) ON DELETE CASCADE,
        application_id INT REFERENCES municipal_applications(id) ON DELETE SET NULL,
        email VARCHAR(255) NOT NULL,
        invited_name VARCHAR(150),
        role VARCHAR(50) DEFAULT 'MUNICIPAL',
        municipal_role VARCHAR(50) DEFAULT 'ADMIN',
        department VARCHAR(150),
        invitation_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        accepted_at TIMESTAMP WITH TIME ZONE,
        created_by INT REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Create audit_logs table
    await query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        user_email VARCHAR(255),
        user_role VARCHAR(50),
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50),
        resource_id VARCHAR(100),
        details JSONB,
        ip_address VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. Seed demo municipal bodies: VMC (Vadodara) and AMC (Ahmedabad)
    await query(`
      INSERT INTO municipal_bodies (id, code, name, state, city, authority_type, official_website, contact_email, contact_phone, jurisdiction_bounds, status)
      VALUES 
      (
        'vmc',
        'VMC',
        'Vadodara Municipal Corporation',
        'Gujarat',
        'Vadodara',
        'MUNICIPAL_CORPORATION',
        'https://vmc.gov.in',
        'support@vmc.gov.in',
        '+91 265 2433111',
        '{"minLat": 22.20, "maxLat": 22.42, "minLng": 73.10, "maxLng": 73.28, "center": {"lat": 22.3072, "lng": 73.1812}}'::jsonb,
        'active'
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        jurisdiction_bounds = EXCLUDED.jurisdiction_bounds;

      INSERT INTO municipal_bodies (id, code, name, state, city, authority_type, official_website, contact_email, contact_phone, jurisdiction_bounds, status)
      VALUES 
      (
        'amc',
        'AMC',
        'Ahmedabad Municipal Corporation',
        'Gujarat',
        'Ahmedabad',
        'MUNICIPAL_CORPORATION',
        'https://ahmedabadcity.gov.in',
        'info@ahmedabadcity.gov.in',
        '+91 79 25391811',
        '{"minLat": 22.92, "maxLat": 23.18, "minLng": 72.45, "maxLng": 72.72, "center": {"lat": 23.0225, "lng": 72.5714}}'::jsonb,
        'active'
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        jurisdiction_bounds = EXCLUDED.jurisdiction_bounds;
    `);

    // 10. Associate existing municipal demo user with VMC
    await query(`
      UPDATE users 
      SET municipality_id = 'vmc', municipal_role = 'ADMIN'
      WHERE role = 'MUNICIPAL' AND municipality_id IS NULL;
    `);

    // 11. Associate existing issues with VMC if in Vadodara coordinates or null
    await query(`
      UPDATE issues
      SET municipality_id = 'vmc', jurisdiction_status = 'MATCHED'
      WHERE municipality_id IS NULL;
    `);

    // 12. Add custom_category column to issues table for "Other" category workflow
    await query(`
      ALTER TABLE issues ADD COLUMN IF NOT EXISTS custom_category VARCHAR(255) DEFAULT NULL;
    `);

    // 13. Seed 'other' category record into categories table
    await query(`
      INSERT INTO categories (id, name, icon, color, description)
      VALUES ('other', 'Other', 'HelpCircle', 'purple', 'Unlisted civic infrastructure or neighborhood maintenance issues')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 14. Seed dedicated AMC Municipal Admin demo user for seamless multi-municipality demonstrations
    await query(`
      INSERT INTO users (name, email, password_hash, role, municipal_role, municipality_id, department, badge)
      SELECT 'AMC Municipal Admin', 'municipal.amc@civicvoice.org', u.password_hash, 'MUNICIPAL', 'ADMIN', 'amc', 'Department of Public Works', 'Municipal Authority'
      FROM users u WHERE u.email = 'municipal@civicvoice.org'
      ON CONFLICT (email) DO UPDATE SET municipality_id = 'amc', municipal_role = 'ADMIN';
    `);

    console.log('[MIGRATION] Multi-municipality database migration completed successfully.');
    return true;
  } catch (err) {
    console.error('[MIGRATION] Migration error:', err);
    throw err;
  }
}

// Run if called directly
if (process.argv[1]?.endsWith('migrate_multi_municipality.js')) {
  runMultiMunicipalityMigration()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error(e);
      await pool.end();
      process.exit(1);
    });
}
