import { query } from '../config/database.js';

export const findByEmail = async (email) => {
  const sql = `
    SELECT id, name, email, password_hash, role, badge, avatar, department_id, department, created_at, updated_at
    FROM users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1;
  `;
  const result = await query(sql, [email.trim()]);
  return result.rows[0] || null;
};

export const findById = async (id) => {
  const sql = `
    SELECT id, name, email, role, badge, avatar, department_id, department, created_at, updated_at
    FROM users
    WHERE id = $1
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
}) => {
  const sql = `
    INSERT INTO users (name, email, password_hash, role, badge, avatar, department_id, department)
    VALUES ($1, LOWER($2), $3, $4, $5, $6, $7, $8)
    RETURNING id, name, email, role, badge, avatar, department_id, department, created_at;
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
  ]);
  return result.rows[0];
};

export const getAllUsers = async () => {
  const sql = `
    SELECT id, name, email, role, badge, avatar, department_id, department, created_at
    FROM users
    ORDER BY id ASC;
  `;
  const result = await query(sql);
  return result.rows;
};

export const updateUserRole = async (id, role) => {
  const sql = `
    UPDATE users
    SET role = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, name, email, role, badge, avatar, department_id, department, updated_at;
  `;
  const result = await query(sql, [role, id]);
  return result.rows[0] || null;
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
