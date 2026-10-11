import { query } from '../config/database.js';

export const findByEmail = async (email) => {
  const sql = `
    SELECT 
      u.id, u.name, u.email, u.password_hash, u.role, u.badge, u.avatar, 
      u.department_id, u.department, u.municipality_id, u.municipal_role,
      m.name AS municipality_name, m.code AS municipality_code, m.city AS municipality_city,
      u.created_at, u.updated_at
    FROM users u
    LEFT JOIN municipal_bodies m ON m.id = u.municipality_id
    WHERE LOWER(u.email) = LOWER($1)
    LIMIT 1;
  `;
  const result = await query(sql, [email.trim()]);
  return result.rows[0] || null;
};

export const findById = async (id) => {
  const sql = `
    SELECT 
      u.id, u.name, u.email, u.role, u.badge, u.avatar, 
      u.department_id, u.department, u.municipality_id, u.municipal_role,
      m.name AS municipality_name, m.code AS municipality_code, m.city AS municipality_city,
      u.created_at, u.updated_at
    FROM users u
    LEFT JOIN municipal_bodies m ON m.id = u.municipality_id
    WHERE u.id = $1
    LIMIT 1;
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

export const createUser = async ({
  name,
  email,
  passwordHash,
  role = 'CITIZEN',
  badge = 'Verified Citizen',
  avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
  departmentId = null,
  department = null,
  municipalityId = null,
  municipalRole = 'OFFICER',
}) => {
  const sql = `
    INSERT INTO users (name, email, password_hash, role, badge, avatar, department_id, department, municipality_id, municipal_role)
    VALUES ($1, LOWER($2), $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id, name, email, role, badge, avatar, department_id, department, municipality_id, municipal_role, created_at;
  `;
  const result = await query(sql, [
    name.trim(),
    email.trim(),
    passwordHash,
    role,
    badge,
    avatar,
    departmentId,
    department,
    municipalityId,
    municipalRole,
  ]);
  return result.rows[0];
};

export const getAllUsers = async ({ municipalityId = null } = {}) => {
  let sql = `
    SELECT 
      u.id, u.name, u.email, u.role, u.badge, u.avatar, 
      u.department_id, u.department, u.municipality_id, u.municipal_role,
      m.name AS municipality_name, m.code AS municipality_code,
      u.created_at
    FROM users u
    LEFT JOIN municipal_bodies m ON m.id = u.municipality_id
  `;
  const params = [];
  if (municipalityId) {
    sql += ` WHERE u.municipality_id = $1 `;
    params.push(municipalityId);
  }
  sql += ` ORDER BY u.id ASC; `;
  const result = await query(sql, params);
  return result.rows;
};

export const getOfficersByMunicipality = async (municipalityId) => {
  const sql = `
    SELECT 
      u.id, u.name, u.email, u.role, u.badge, u.avatar, 
      u.department_id, u.department, u.municipality_id, u.municipal_role,
      u.created_at
    FROM users u
    WHERE u.municipality_id = $1 AND u.role = 'MUNICIPAL'
    ORDER BY u.created_at ASC;
  `;
  const result = await query(sql, [municipalityId]);
  return result.rows;
};

export const updateUserRole = async (id, role, { municipalityId = null, municipalRole = null } = {}) => {
  let sql = `
    UPDATE users
    SET role = $1, updated_at = CURRENT_TIMESTAMP
  `;
  const params = [role, id];
  let pIdx = 3;

  if (municipalityId !== undefined && municipalityId !== null) {
    sql += `, municipality_id = $${pIdx++} `;
    params.push(municipalityId);
  }
  if (municipalRole !== undefined && municipalRole !== null) {
    sql += `, municipal_role = $${pIdx++} `;
    params.push(municipalRole);
  }

  sql += `
    WHERE id = $2
    RETURNING id, name, email, role, badge, avatar, department_id, department, municipality_id, municipal_role, updated_at;
  `;
  const result = await query(sql, params);
  return result.rows[0] || null;
};

export const findByGoogleId = async (googleId) => {
  const sql = `
    SELECT 
      u.id, u.name, u.email, u.google_id, u.role, u.badge, u.avatar, 
      u.department_id, u.department, u.municipality_id, u.municipal_role,
      m.name AS municipality_name,
      u.created_at, u.updated_at
    FROM users u
    LEFT JOIN municipal_bodies m ON m.id = u.municipality_id
    WHERE u.google_id = $1
    LIMIT 1;
  `;
  const result = await query(sql, [googleId]);
  return result.rows[0] || null;
};

export const linkGoogleId = async (userId, googleId, avatar = null) => {
  const sql = `
    UPDATE users
    SET google_id = $1,
        avatar = COALESCE(avatar, $2),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING id, name, email, google_id, role, badge, avatar, department_id, department, municipality_id, municipal_role, updated_at;
  `;
  const result = await query(sql, [googleId, avatar, userId]);
  return result.rows[0] || null;
};

export const createGoogleUser = async ({
  name,
  email,
  googleId,
  avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
}) => {
  const sql = `
    INSERT INTO users (name, email, google_id, role, badge, avatar)
    VALUES ($1, LOWER($2), $3, 'CITIZEN', 'Verified Citizen', $4)
    RETURNING id, name, email, google_id, role, badge, avatar, created_at;
  `;
  const result = await query(sql, [name.trim(), email.trim(), googleId, avatar]);
  return result.rows[0];
};

export const countUsers = async () => {
  const sql = `
    SELECT 
      COUNT(*) AS total,
      COUNT(CASE WHEN role = 'CITIZEN' THEN 1 END) AS citizens,
      COUNT(CASE WHEN role = 'MUNICIPAL' THEN 1 END) AS municipal,
      COUNT(CASE WHEN role = 'ADMIN' THEN 1 END) AS admins
    FROM users;
  `;
  const result = await query(sql);
  return result.rows[0];
};
