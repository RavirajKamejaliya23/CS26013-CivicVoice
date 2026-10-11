import { query } from '../config/database.js';

// ============================================================================
// 1. MUNICIPAL BODIES
// ============================================================================

export const getAllMunicipalities = async ({ status = 'active' } = {}) => {
  let sql = `
    SELECT 
      m.id, m.code, m.name, m.state, m.city, m.authority_type AS "authorityType",
      m.official_website AS "officialWebsite", m.contact_email AS "contactEmail",
      m.contact_phone AS "contactPhone", m.jurisdiction_bounds AS "jurisdictionBounds",
      m.status, m.logo_url AS "logoUrl", m.created_at AS "createdAt",
      (SELECT COUNT(*) FROM issues i WHERE i.municipality_id = m.id) AS "issuesCount",
      (SELECT COUNT(*) FROM users u WHERE u.municipality_id = m.id AND u.role = 'MUNICIPAL') AS "officersCount"
    FROM municipal_bodies m
  `;
  const params = [];
  if (status && status !== 'all') {
    sql += ` WHERE m.status = $1 `;
    params.push(status);
  }
  sql += ` ORDER BY m.name ASC; `;

  const result = await query(sql, params);
  return result.rows.map((row) => ({
    ...row,
    issuesCount: parseInt(row.issuesCount || 0, 10),
    officersCount: parseInt(row.officersCount || 0, 10),
  }));
};

export const getMunicipalityById = async (id) => {
  const sql = `
    SELECT 
      m.id, m.code, m.name, m.state, m.city, m.authority_type AS "authorityType",
      m.official_website AS "officialWebsite", m.contact_email AS "contactEmail",
      m.contact_phone AS "contactPhone", m.jurisdiction_bounds AS "jurisdictionBounds",
      m.status, m.logo_url AS "logoUrl", m.created_at AS "createdAt",
      (SELECT COUNT(*) FROM issues i WHERE i.municipality_id = m.id) AS "issuesCount",
      (SELECT COUNT(*) FROM users u WHERE u.municipality_id = m.id AND u.role = 'MUNICIPAL') AS "officersCount"
    FROM municipal_bodies m
    WHERE m.id = $1
    LIMIT 1;
  `;
  const result = await query(sql, [id]);
  if (!result.rows[0]) return null;
  const row = result.rows[0];
  return {
    ...row,
    issuesCount: parseInt(row.issuesCount || 0, 10),
    officersCount: parseInt(row.officersCount || 0, 10),
  };
};

export const createMunicipality = async ({
  id,
  code,
  name,
  state,
  city,
  authorityType = 'MUNICIPAL_CORPORATION',
  officialWebsite = null,
  contactEmail = null,
  contactPhone = null,
  jurisdictionBounds = null,
  status = 'active',
  logoUrl = null,
}) => {
  const sql = `
    INSERT INTO municipal_bodies (
      id, code, name, state, city, authority_type, official_website,
      contact_email, contact_phone, jurisdiction_bounds, status, logo_url
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING 
      id, code, name, state, city, authority_type AS "authorityType",
      official_website AS "officialWebsite", status, created_at AS "createdAt";
  `;
  const result = await query(sql, [
    id.toLowerCase().trim(),
    code.toUpperCase().trim(),
    name.trim(),
    state.trim(),
    city.trim(),
    authorityType,
    officialWebsite,
    contactEmail,
    contactPhone,
    jurisdictionBounds ? JSON.stringify(jurisdictionBounds) : null,
    status,
    logoUrl,
  ]);
  return result.rows[0];
};

// ============================================================================
// 2. MUNICIPAL APPLICATIONS
// ============================================================================

export const createApplication = async ({
  applicantName,
  applicantEmail,
  applicantRole,
  applicantPhone = null,
  municipalityName,
  authorityType,
  city,
  state,
  officialWebsite = null,
  officeAddress = null,
  jurisdictionDetails = null,
  supportingDocuments = null,
}) => {
  const applicationNo = `MAP-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  const sql = `
    INSERT INTO municipal_applications (
      application_no, applicant_name, applicant_email, applicant_role,
      applicant_phone, municipality_name, authority_type, city, state,
      official_website, office_address, jurisdiction_details,
      supporting_documents, declaration_confirmed, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, TRUE, 'PENDING')
    RETURNING 
      id, application_no AS "applicationNo", applicant_name AS "applicantName",
      applicant_email AS "applicantEmail", applicant_role AS "applicantRole",
      municipality_name AS "municipalityName", authority_type AS "authorityType",
      city, state, official_website AS "officialWebsite", status, created_at AS "createdAt";
  `;

  const result = await query(sql, [
    applicationNo,
    applicantName.trim(),
    applicantEmail.toLowerCase().trim(),
    applicantRole.trim(),
    applicantPhone,
    municipalityName.trim(),
    authorityType,
    city.trim(),
    state.trim(),
    officialWebsite,
    officeAddress,
    jurisdictionDetails,
    supportingDocuments,
  ]);

  return result.rows[0];
};

export const getAllApplications = async ({ status = null } = {}) => {
  let sql = `
    SELECT 
      a.id, a.application_no AS "applicationNo", a.applicant_name AS "applicantName",
      a.applicant_email AS "applicantEmail", a.applicant_role AS "applicantRole",
      a.applicant_phone AS "applicantPhone", a.municipality_name AS "municipalityName",
      a.authority_type AS "authorityType", a.city, a.state,
      a.official_website AS "officialWebsite", a.office_address AS "officeAddress",
      a.jurisdiction_details AS "jurisdictionDetails", a.supporting_documents AS "supportingDocuments",
      a.declaration_confirmed AS "declarationConfirmed", a.status,
      a.admin_notes AS "adminNotes", a.rejection_reason AS "rejectionReason",
      a.reviewed_by AS "reviewedBy", a.reviewed_at AS "reviewedAt",
      u.name AS "reviewerName",
      a.created_at AS "createdAt", a.updated_at AS "updatedAt"
    FROM municipal_applications a
    LEFT JOIN users u ON u.id = a.reviewed_by
  `;
  const params = [];
  if (status && status !== 'ALL') {
    sql += ` WHERE a.status = $1 `;
    params.push(status);
  }
  sql += ` ORDER BY a.created_at DESC; `;

  const result = await query(sql, params);
  return result.rows;
};

export const getApplicationById = async (id) => {
  const sql = `
    SELECT 
      a.id, a.application_no AS "applicationNo", a.applicant_name AS "applicantName",
      a.applicant_email AS "applicantEmail", a.applicant_role AS "applicantRole",
      a.applicant_phone AS "applicantPhone", a.municipality_name AS "municipalityName",
      a.authority_type AS "authorityType", a.city, a.state,
      a.official_website AS "officialWebsite", a.office_address AS "officeAddress",
      a.jurisdiction_details AS "jurisdictionDetails", a.supporting_documents AS "supportingDocuments",
      a.declaration_confirmed AS "declarationConfirmed", a.status,
      a.admin_notes AS "adminNotes", a.rejection_reason AS "rejectionReason",
      a.reviewed_by AS "reviewedBy", a.reviewed_at AS "reviewedAt",
      u.name AS "reviewerName",
      a.created_at AS "createdAt", a.updated_at AS "updatedAt"
    FROM municipal_applications a
    LEFT JOIN users u ON u.id = a.reviewed_by
    WHERE a.id::text = $1::text OR a.application_no = $1::text
    LIMIT 1;
  `;
  const result = await query(sql, [id]);
  if (!result.rows[0]) return null;

  const app = result.rows[0];

  // Fetch reviews audit history
  const reviewsSql = `
    SELECT 
      r.id, r.reviewer_id AS "reviewerId", r.reviewer_name AS "reviewerName",
      r.from_status AS "fromStatus", r.to_status AS "toStatus",
      r.action, r.notes, r.created_at AS "createdAt"
    FROM municipal_application_reviews r
    WHERE r.application_id = $1
    ORDER BY r.created_at ASC;
  `;
  const reviewsRes = await query(reviewsSql, [app.id]);
  app.reviews = reviewsRes.rows;

  return app;
};

export const updateApplicationStatus = async (
  id,
  { status, adminNotes = null, rejectionReason = null, reviewedBy = null, reviewerName = 'Platform Admin', action = 'STATUS_CHANGE' }
) => {
  // Get current status for audit history
  const current = await query('SELECT status FROM municipal_applications WHERE id = $1;', [id]);
  if (current.rows.length === 0) return null;
  const fromStatus = current.rows[0].status;

  const sql = `
    UPDATE municipal_applications
    SET 
      status = $1,
      admin_notes = COALESCE($2, admin_notes),
      rejection_reason = COALESCE($3, rejection_reason),
      reviewed_by = $4,
      reviewed_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING 
      id, application_no AS "applicationNo", status,
      admin_notes AS "adminNotes", rejection_reason AS "rejectionReason",
      reviewed_at AS "reviewedAt";
  `;
  const result = await query(sql, [status, adminNotes, rejectionReason, reviewedBy, id]);

  // Insert review record in audit history
  await query(
    `INSERT INTO municipal_application_reviews (application_id, reviewer_id, reviewer_name, from_status, to_status, action, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7);`,
    [id, reviewedBy, reviewerName, fromStatus, status, action, adminNotes || rejectionReason || 'Status changed']
  );

  return result.rows[0];
};

// ============================================================================
// 3. MUNICIPAL INVITATIONS
// ============================================================================

export const createInvitation = async ({
  municipalityId,
  applicationId = null,
  email,
  invitedName,
  role = 'MUNICIPAL',
  municipalRole = 'ADMIN',
  department = null,
  createdBy = null,
}) => {
  const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

  const sql = `
    INSERT INTO municipal_invitations (
      municipality_id, application_id, email, invited_name, role,
      municipal_role, department, invitation_token, expires_at, created_by
    )
    VALUES ($1, $2, LOWER($3), $4, $5, $6, $7, $8, $9, $10)
    RETURNING 
      id, municipality_id AS "municipalityId", email, invited_name AS "invitedName",
      municipal_role AS "municipalRole", invitation_token AS "invitationToken",
      expires_at AS "expiresAt", created_at AS "createdAt";
  `;
  const result = await query(sql, [
    municipalityId,
    applicationId,
    email.trim(),
    invitedName.trim(),
    role,
    municipalRole,
    department,
    token,
    expiresAt,
    createdBy,
  ]);
  return result.rows[0];
};

export const getInvitationsByMunicipality = async (municipalityId) => {
  const sql = `
    SELECT 
      id, municipality_id AS "municipalityId", email, invited_name AS "invitedName",
      municipal_role AS "municipalRole", department, expires_at AS "expiresAt",
      accepted_at AS "acceptedAt", created_at AS "createdAt"
    FROM municipal_invitations
    WHERE municipality_id = $1
    ORDER BY created_at DESC;
  `;
  const result = await query(sql, [municipalityId]);
  return result.rows;
};

// ============================================================================
// 4. AUDIT LOGS
// ============================================================================

export const recordAuditLog = async ({
  userId = null,
  userEmail = null,
  userRole = null,
  action,
  resourceType,
  resourceId = null,
  details = null,
  ipAddress = null,
}) => {
  try {
    const sql = `
      INSERT INTO audit_logs (
        user_id, user_email, user_role, action, resource_type, resource_id, details, ip_address
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id;
    `;
    const result = await query(sql, [
      userId,
      userEmail,
      userRole,
      action,
      resourceType,
      resourceId ? String(resourceId) : null,
      details ? JSON.stringify(details) : null,
      ipAddress,
    ]);
    return result.rows[0]?.id;
  } catch (err) {
    console.warn('[AUDIT LOG ERROR]', err.message);
    return null;
  }
};

export const getAuditLogs = async ({ resourceType = null, limit = 50 } = {}) => {
  let sql = `
    SELECT 
      id, user_id AS "userId", user_email AS "userEmail", user_role AS "userRole",
      action, resource_type AS "resourceType", resource_id AS "resourceId",
      details, ip_address AS "ipAddress", created_at AS "createdAt"
    FROM audit_logs
  `;
  const params = [];
  if (resourceType) {
    sql += ` WHERE resource_type = $1 `;
    params.push(resourceType);
  }
  sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1}; `;
  params.push(limit);

  const result = await query(sql, params);
  return result.rows;
};
