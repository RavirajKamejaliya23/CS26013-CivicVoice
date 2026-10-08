import pool, { query } from '../config/database.js';

export const getAllIssues = async ({ category, status, search, userId } = {}) => {
  let whereClauses = [];
  let params = [];
  let paramIndex = 1;

  let upvoteJoin = '';
  let upvoteSelect = 'FALSE AS has_upvoted';

  if (userId) {
    upvoteJoin = `LEFT JOIN issue_supports u ON u.issue_id = i.id AND u.user_id = $${paramIndex}`;
    upvoteSelect = 'CASE WHEN u.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS has_upvoted';
    params.push(userId);
    paramIndex++;
  }

  if (category && category !== 'all') {
    whereClauses.push(`i.category_id = $${paramIndex++}`);
    params.push(category);
  }

  if (status && status !== 'all') {
    whereClauses.push(`i.status = $${paramIndex++}`);
    params.push(status);
  }

  if (search && search.trim() !== '') {
    whereClauses.push(`(
      i.title ILIKE $${paramIndex} OR
      i.description ILIKE $${paramIndex} OR
      i.id ILIKE $${paramIndex} OR
      i.address ILIKE $${paramIndex}
    )`);
    params.push(`%${search.trim()}%`);
    paramIndex++;
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const sql = `
    SELECT 
      i.id,
      i.title,
      i.description,
      i.category_id AS category,
      c.name AS "categoryName",
      i.status,
      i.address,
      i.latitude,
      i.longitude,
      i.image_url AS "imageUrl",
      i.completion_evidence_url AS "completionEvidenceUrl",
      i.reported_by_id AS "reportedById",
      i.reporter_name AS "reporterName",
      i.reporter_badge AS "reporterBadge",
      i.reporter_avatar AS "reporterAvatar",
      i.upvotes_count AS "upvotes",
      i.duplicate_of AS "duplicateOf",
      (SELECT COUNT(*) FROM issues d WHERE d.duplicate_of = i.id) AS "mergedCount",
      i.created_at AS "createdAt",
      i.updated_at AS "updatedAt",
      ${upvoteSelect}
    FROM issues i
    JOIN categories c ON c.id = i.category_id
    ${upvoteJoin}
    ${whereSql}
    ORDER BY i.created_at DESC;
  `;

  const result = await query(sql, params);

  return result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    categoryName: row.categoryName,
    status: row.status,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    imageUrl: row.imageUrl,
    completionEvidenceUrl: row.completionEvidenceUrl,
    duplicateOf: row.duplicateOf || null,
    mergedCount: parseInt(row.mergedCount || 0, 10),
    reportedBy: {
      name: row.reporterName,
      badge: row.reporterBadge,
      avatar: row.reporterAvatar,
    },
    reportedAt: new Date(row.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    upvotes: row.upvotes,
    hasUpvoted: Boolean(row.has_upvoted),
  }));
};

export const getIssueById = async (id, userId = null) => {
  let upvoteJoin = '';
  let upvoteSelect = 'FALSE AS has_upvoted';
  const params = [id];

  if (userId) {
    upvoteJoin = 'LEFT JOIN issue_supports u ON u.issue_id = i.id AND u.user_id = $2';
    upvoteSelect = 'CASE WHEN u.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS has_upvoted';
    params.push(userId);
  }

  const issueSql = `
    SELECT 
      i.id,
      i.title,
      i.description,
      i.category_id AS category,
      c.name AS "categoryName",
      i.status,
      i.address,
      i.latitude,
      i.longitude,
      i.image_url AS "imageUrl",
      i.completion_evidence_url AS "completionEvidenceUrl",
      i.reported_by_id AS "reportedById",
      i.reporter_name AS "reporterName",
      i.reporter_badge AS "reporterBadge",
      i.reporter_avatar AS "reporterAvatar",
      i.upvotes_count AS "upvotes",
      i.duplicate_of AS "duplicateOf",
      (SELECT COUNT(*) FROM issues d WHERE d.duplicate_of = i.id) AS "mergedCount",
      i.created_at AS "createdAt",
      i.updated_at AS "updatedAt",
      ${upvoteSelect}
    FROM issues i
    JOIN categories c ON c.id = i.category_id
    ${upvoteJoin}
    WHERE i.id = $1
    LIMIT 1;
  `;

  const issueRes = await query(issueSql, params);
  if (issueRes.rows.length === 0) return null;
  const row = issueRes.rows[0];

  // Fetch photos from issue_media (max 10)
  const mediaSql = `
    SELECT id, media_url AS "mediaUrl", media_type AS "mediaType", caption
    FROM issue_media
    WHERE issue_id = $1
    ORDER BY id ASC;
  `;
  const mediaRes = await query(mediaSql, [id]);

  // Fetch updates from issue_updates
  const updatesSql = `
    SELECT 
      id,
      status,
      title,
      author,
      role,
      note,
      evidence_image AS "evidenceImage",
      created_at AS "createdAt"
    FROM issue_updates
    WHERE issue_id = $1
    ORDER BY created_at ASC;
  `;
  const updatesRes = await query(updatesSql, [id]);

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    categoryName: row.categoryName,
    status: row.status,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    imageUrl: row.imageUrl,
    completionEvidenceUrl: row.completionEvidenceUrl,
    duplicateOf: row.duplicateOf || null,
    mergedCount: parseInt(row.mergedCount || 0, 10),
    media: mediaRes.rows.map((m) => m.mediaUrl),
    mediaItems: mediaRes.rows,
    reportedBy: {
      name: row.reporterName,
      badge: row.reporterBadge,
      avatar: row.reporterAvatar,
    },
    reportedAt: new Date(row.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    upvotes: row.upvotes,
    hasUpvoted: Boolean(row.has_upvoted),
    timeline: updatesRes.rows.map((t) => ({
      status: t.status,
      title: t.title,
      author: t.author,
      role: t.role,
      note: t.note,
      evidenceImage: t.evidenceImage,
      date: new Date(t.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    })),
  };
};

export const createIssue = async ({
  id,
  title,
  description,
  category,
  address,
  latitude = 37.7749,
  longitude = -122.4194,
  imageUrl,
  mediaUrls = [],
  reportedById,
  reporterName,
  reporterBadge = 'Verified Citizen',
  reporterAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
}) => {
  // Validate maximum 10 photos limit
  const photos = Array.isArray(mediaUrls) && mediaUrls.length > 0 ? mediaUrls : (imageUrl ? [imageUrl] : []);
  if (photos.length > 10) {
    throw new Error('Maximum of 10 photos permitted per issue.');
  }

  const primaryPhoto = photos[0] || imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create or link location in locations table
    const locationRes = await client.query(
      `INSERT INTO locations (address, latitude, longitude) VALUES ($1, $2, $3) RETURNING id;`,
      [address, latitude, longitude]
    );
    const locationId = locationRes.rows[0]?.id || null;

    // 2. Insert into issues table
    const issueSql = `
      INSERT INTO issues (
        id, title, description, category_id, status, location_id, address,
        latitude, longitude, image_url, reported_by_id,
        reporter_name, reporter_badge, reporter_avatar, upvotes_count
      )
      VALUES ($1, $2, $3, $4, 'reported', $5, $6, $7, $8, $9, $10, $11, $12, $13, 1)
      RETURNING *;
    `;
    const issueRes = await client.query(issueSql, [
      id,
      title,
      description,
      category,
      locationId,
      address,
      latitude,
      longitude,
      primaryPhoto,
      reportedById,
      reporterName,
      reporterBadge,
      reporterAvatar,
    ]);

    // 3. Insert each photo into issue_media (enforced max 10)
    for (const photoUrl of photos.slice(0, 10)) {
      await client.query(
        `INSERT INTO issue_media (issue_id, uploaded_by_id, media_url, media_type)
         VALUES ($1, $2, $3, 'image');`,
        [id, reportedById, photoUrl]
      );
    }

    // 4. Initial status update in issue_updates
    const updateSql = `
      INSERT INTO issue_updates (issue_id, status, title, author_id, author, role, note)
      VALUES ($1, 'reported', 'Citizen Dispatch Created', $2, $3, 'Citizen Reporter', 'Ticket queued for automated municipal dispatch & ward triage.');
    `;
    await client.query(updateSql, [id, reportedById, reporterName]);

    // 5. Co-sign support by reporter in issue_supports
    if (reportedById) {
      await client.query(
        'INSERT INTO issue_supports (user_id, issue_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;',
        [reportedById, id]
      );
    }

    await client.query('COMMIT');
    return issueRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const updateIssueStatus = async (id, { status, authorId, author, role, note, evidenceUrl }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let updateSql = `
      UPDATE issues
      SET status = $1, updated_at = CURRENT_TIMESTAMP
    `;
    const updateParams = [status, id];

    if (evidenceUrl) {
      updateSql += `, completion_evidence_url = $3 WHERE id = $2 RETURNING *;`;
      updateParams.splice(2, 0, evidenceUrl);
    } else {
      updateSql += ` WHERE id = $2 RETURNING *;`;
    }

    const updateRes = await client.query(updateSql, updateParams);
    if (updateRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    // Add completion evidence photo to issue_media if provided
    if (evidenceUrl) {
      await client.query(
        `INSERT INTO issue_media (issue_id, uploaded_by_id, media_url, media_type, caption)
         VALUES ($1, $2, $3, 'image', 'Completion Resolution Proof');`,
        [id, authorId || null, evidenceUrl]
      );
    }

    // Insert timeline record in issue_updates
    const statusLabels = {
      under_review: 'Under Review',
      accepted: 'Accepted',
      in_progress: 'In Progress',
      completed: 'Completed (Pending Verification)',
      citizen_verified: 'Citizen Verified',
      reopened: 'Reopened',
    };
    const title = `Status Advanced to ${statusLabels[status] || status}`;

    const updateHistorySql = `
      INSERT INTO issue_updates (issue_id, status, title, author_id, author, role, note, evidence_image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `;
    await client.query(updateHistorySql, [
      id,
      status,
      title,
      authorId || null,
      author || 'Municipal Officer',
      role || 'Dept of Public Works',
      note || '',
      evidenceUrl || null,
    ]);

    await client.query('COMMIT');
    return updateRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const verifyIssue = async (id, { isResolved, comment, userId, userName }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const nextStatus = isResolved ? 'citizen_verified' : 'reopened';
    const updateRes = await client.query(
      `UPDATE issues SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *;`,
      [nextStatus, id]
    );

    if (updateRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    // Record verification in citizen_verifications
    await client.query(
      `INSERT INTO citizen_verifications (issue_id, user_id, user_name, is_resolved, comment)
       VALUES ($1, $2, $3, $4, $5);`,
      [id, userId || null, userName || 'Citizen Verifier', isResolved, comment]
    );

    // Record status update in issue_updates
    const timelineTitle = isResolved
      ? 'Citizen Certified Resolution'
      : 'Reopened by Citizen Inspection';

    await client.query(
      `INSERT INTO issue_updates (issue_id, status, title, author_id, author, role, note)
       VALUES ($1, $2, $3, $4, $5, 'Community Verifier', $6);`,
      [id, nextStatus, timelineTitle, userId || null, userName || 'Citizen Verifier', comment]
    );

    await client.query('COMMIT');
    return updateRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const toggleUpvote = async (userId, issueId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const checkSql = `SELECT 1 FROM issue_supports WHERE user_id = $1 AND issue_id = $2;`;
    const checkRes = await client.query(checkSql, [userId, issueId]);

    let hasUpvoted = false;
    if (checkRes.rows.length > 0) {
      await client.query(`DELETE FROM issue_supports WHERE user_id = $1 AND issue_id = $2;`, [
        userId,
        issueId,
      ]);
      await client.query(
        `UPDATE issues SET upvotes_count = GREATEST(0, upvotes_count - 1) WHERE id = $1;`,
        [issueId]
      );
      hasUpvoted = false;
    } else {
      await client.query(
        `INSERT INTO issue_supports (user_id, issue_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
        [userId, issueId]
      );
      await client.query(`UPDATE issues SET upvotes_count = upvotes_count + 1 WHERE id = $1;`, [
        issueId,
      ]);
      hasUpvoted = true;
    }

    const countRes = await client.query(`SELECT upvotes_count FROM issues WHERE id = $1;`, [
      issueId,
    ]);
    const upvotes = countRes.rows[0]?.upvotes_count || 0;

    await client.query('COMMIT');
    return { hasUpvoted, upvotes };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const reportIssue = async ({ issueId, reportedById, reason, details }) => {
  const sql = `
    INSERT INTO issue_reports (issue_id, reported_by_id, reason, details, status)
    VALUES ($1, $2, $3, $4, 'pending')
    RETURNING *;
  `;
  const result = await query(sql, [issueId, reportedById, reason, details]);
  return result.rows[0];
};

export const getStats = async () => {
  const statsSql = `
    SELECT 
      COUNT(*) AS total,
      COUNT(CASE WHEN status = 'reported' THEN 1 END) AS reported,
      COUNT(CASE WHEN status = 'under_review' THEN 1 END) AS under_review,
      COUNT(CASE WHEN status = 'in_progress' THEN 1 END) AS in_progress,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed,
      COUNT(CASE WHEN status = 'citizen_verified' THEN 1 END) AS verified,
      COUNT(CASE WHEN status = 'reopened' THEN 1 END) AS reopened,
      COUNT(CASE WHEN duplicate_of IS NOT NULL THEN 1 END) AS duplicates
    FROM issues;
  `;
  const statsRes = await query(statsSql);
  const counts = statsRes.rows[0];

  const categorySql = `
    SELECT c.id, c.name, COUNT(i.id) AS count
    FROM categories c
    LEFT JOIN issues i ON i.category_id = c.id
    GROUP BY c.id, c.name
    ORDER BY count DESC;
  `;
  const catRes = await query(categorySql);

  const wardSql = `
    SELECT COALESCE(l.ward, 'Ward General') AS ward, COUNT(i.id) AS count,
           COUNT(CASE WHEN i.status IN ('reported', 'under_review', 'accepted', 'in_progress', 'reopened') THEN 1 END) AS unresolved
    FROM issues i
    LEFT JOIN locations l ON l.id = i.location_id
    GROUP BY COALESCE(l.ward, 'Ward General')
    ORDER BY count DESC;
  `;
  const wardRes = await query(wardSql);

  const total = parseInt(counts.total, 10);
  const verified = parseInt(counts.verified, 10);
  const completed = parseInt(counts.completed, 10);

  return {
    total,
    reported: parseInt(counts.reported, 10),
    underReview: parseInt(counts.under_review, 10),
    inProgress: parseInt(counts.in_progress, 10),
    completed,
    verified,
    reopened: parseInt(counts.reopened, 10),
    duplicatesCount: parseInt(counts.duplicates, 10),
    active: Math.max(0, total - (verified + completed)),
    categoryCounts: catRes.rows,
    wardCounts: wardRes.rows,
  };
};

export const deleteIssue = async (id) => {
  const result = await query(`DELETE FROM issues WHERE id = $1 RETURNING id;`, [id]);
  return result.rows[0] || null;
};

// Category-tailored proximity radii in metres for realistic Indian civic issues
const CATEGORY_RADII_METRES = {
  roads_potholes: 150,        // Pothole: small radius
  garbage_sanitation: 300,    // Garbage dumping: small/medium radius
  water_drainage: 350,        // Drainage blockage: small/medium radius
  streetlights_power: 150,    // Streetlight: smaller radius
  public_infrastructure: 400, // Road/footpath/park damage: medium radius
  traffic_safety: 200,        // Traffic safety: 200m
};

// Common Indian civic stop words to strip during description/title normalization
const CIVIC_STOP_WORDS = new Set([
  'the', 'near', 'at', 'in', 'on', 'road', 'street', 'lane', 'and', 'a', 'an',
  'is', 'of', 'to', 'for', 'opposite', 'behind', 'next', 'area', 'chowk', 'circle',
  'crossroad', 'rasta', 'nagar', 'society', 'marg', 'side', 'by', 'with', 'from',
  'problem', 'issue', 'complaint', 'reported', 'please', 'front', 'ward'
]);

function extractCivicTokens(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !CIVIC_STOP_WORDS.has(w));
}

function calculateTokenSimilarity(tokensA, tokensB) {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0;
}

/**
 * Smart Complaint Merging / Civic Issue Identity & Clustering System
 * Uses:
 * 1. Category Match (compatible categories only)
 * 2. Category-tailored geographic radius & Haversine distance
 * 3. Normalized Title/Description Jaccard text similarity
 * 4. Active unresolved status filter (never matches completed/verified)
 * 5. Multi-factor duplicate confidence score (HIGH / MEDIUM / LOW)
 */
export const getSimilarIssues = async ({
  category,
  latitude,
  longitude,
  title = '',
  description = '',
  radiusMetres = null,
}) => {
  if (!latitude || !longitude || !category) return [];

  const maxRadius = radiusMetres || CATEGORY_RADII_METRES[category] || 250;
  const inputTokens = extractCivicTokens(`${title} ${description}`);

  // Earth radius in metres; Haversine approximation inside PostgreSQL
  // Only search active unresolved issues (excludes completed and citizen_verified)
  const sql = `
    SELECT
      i.id,
      i.title,
      i.description,
      i.category_id AS category,
      c.name AS "categoryName",
      i.status,
      i.address,
      i.latitude,
      i.longitude,
      i.image_url AS "imageUrl",
      i.upvotes_count AS upvotes,
      i.duplicate_of AS "duplicateOf",
      (SELECT COUNT(*) FROM issues d WHERE d.duplicate_of = i.id) AS "mergedCount",
      i.created_at AS "createdAt",
      (
        6371000 * 2 * ASIN(SQRT(
          POWER(SIN((RADIANS($1) - RADIANS(i.latitude)) / 2), 2) +
          COS(RADIANS($1)) * COS(RADIANS(i.latitude)) *
          POWER(SIN((RADIANS($2) - RADIANS(i.longitude)) / 2), 2)
        ))
      ) AS distance_metres
    FROM issues i
    JOIN categories c ON c.id = i.category_id
    WHERE
      i.category_id = $3
      AND i.status IN ('reported', 'under_review', 'accepted', 'in_progress', 'reopened')
      AND i.duplicate_of IS NULL
      AND (
        6371000 * 2 * ASIN(SQRT(
          POWER(SIN((RADIANS($1) - RADIANS(i.latitude)) / 2), 2) +
          COS(RADIANS($1)) * COS(RADIANS(i.latitude)) *
          POWER(SIN((RADIANS($2) - RADIANS(i.longitude)) / 2), 2)
        ))
      ) <= $4
    ORDER BY distance_metres ASC
    LIMIT 6;
  `;

  try {
    const result = await query(sql, [latitude, longitude, category, maxRadius]);
    const candidates = result.rows.map((row) => {
      const distance = Math.round(parseFloat(row.distance_metres));
      const candTokens = extractCivicTokens(`${row.title} ${row.description}`);
      const textSimilarity = calculateTokenSimilarity(inputTokens, candTokens);

      // Proximity score: 1.0 at 0m down to 0.0 at maxRadius
      const proximityScore = Math.max(0, 1 - distance / maxRadius);

      // Domain keyword boosts (e.g. both mentioning pothole/crater, garbage/waste, etc.)
      let keywordBoost = 0;
      const combinedInput = `${title} ${description}`.toLowerCase();
      const combinedCand = `${row.title} ${row.description}`.toLowerCase();
      if (
        (combinedInput.includes('pothole') && combinedCand.includes('pothole')) ||
        (combinedInput.includes('crater') && combinedCand.includes('pothole')) ||
        (combinedInput.includes('garbage') && combinedCand.includes('waste')) ||
        (combinedInput.includes('drainage') && combinedCand.includes('waterlogging')) ||
        (combinedInput.includes('leakage') && combinedCand.includes('pipeline'))
      ) {
        keywordBoost = 0.25;
      }

      const rawScore = 0.45 * proximityScore + 0.45 * textSimilarity + keywordBoost;
      const confidenceScore = Math.min(1.0, Math.round(rawScore * 100) / 100);

      // Classify confidence level
      let confidenceLevel = 'LOW';
      if (confidenceScore >= 0.70 || (distance <= 40 && textSimilarity >= 0.25)) {
        confidenceLevel = 'HIGH';
      } else if (confidenceScore >= 0.35 || distance <= 80) {
        confidenceLevel = 'MEDIUM';
      }

      return {
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        categoryName: row.categoryName,
        status: row.status,
        address: row.address,
        latitude: row.latitude,
        longitude: row.longitude,
        imageUrl: row.imageUrl,
        upvotes: row.upvotes,
        duplicateOf: row.duplicateOf || null,
        mergedCount: parseInt(row.mergedCount || 0, 10),
        distanceMetres: distance,
        confidenceScore,
        confidenceLevel,
        reportedAt: new Date(row.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };
    });

    // Sort by confidenceScore descending, then distance ascending
    return candidates.sort((a, b) => b.confidenceScore - a.confidenceScore || a.distanceMetres - b.distanceMetres);
  } catch (err) {
    console.error('[getSimilarIssues] Query error:', err.message);
    return [];
  }
};

/**
 * Join / Co-sign an existing canonical complaint.
 * Enforces strictly 1 support per citizen in issue_supports table.
 * If already supported, returns clear feedback without duplicating.
 */
export const joinCanonicalIssue = async (userId, userName, canonicalId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verify canonical issue exists
    const checkRes = await client.query(
      `SELECT id, title, status, upvotes_count FROM issues WHERE id = $1;`,
      [canonicalId]
    );
    if (checkRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return { error: `Complaint ${canonicalId} not found.`, notFound: true };
    }

    const issue = checkRes.rows[0];

    // 2. Prevent duplicate support (Section 16 requirement)
    const supportCheck = await client.query(
      `SELECT 1 FROM issue_supports WHERE user_id = $1 AND issue_id = $2;`,
      [userId, canonicalId]
    );

    if (supportCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return {
        alreadySupported: true,
        message: 'You have already supported this complaint.',
        upvotes: issue.upvotes_count,
        canonicalId,
      };
    }

    // 3. Record unique support in database
    await client.query(
      `INSERT INTO issue_supports (user_id, issue_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
      [userId, canonicalId]
    );

    // 4. Increment canonical complaint supporter count
    await client.query(
      `UPDATE issues SET upvotes_count = upvotes_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1;`,
      [canonicalId]
    );

    // 5. Audit trail history
    await client.query(
      `INSERT INTO issue_updates (issue_id, status, title, author_id, author, role, note)
       VALUES ($1, $2, 'Citizen Joined Complaint', $3, $4, 'Community Supporter', $5);`,
      [
        canonicalId,
        issue.status,
        userId,
        userName || 'Citizen Supporter',
        `Citizen ${userName || 'Citizen'} joined and supported this canonical complaint.`
      ]
    );

    const countRes = await client.query(
      `SELECT upvotes_count FROM issues WHERE id = $1;`,
      [canonicalId]
    );
    const updatedUpvotes = countRes.rows[0]?.upvotes_count || issue.upvotes_count + 1;

    await client.query('COMMIT');
    return {
      alreadySupported: false,
      success: true,
      upvotes: updatedUpvotes,
      canonicalId,
      message: `Successfully supported canonical complaint ${canonicalId}.`,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Mark an issue as a duplicate of another canonical issue.
 * Preserves original reporter, timestamp, description, and supporters.
 * Consolidates all co-signers to the canonical complaint.
 */
export const markAsDuplicate = async (duplicateId, canonicalId, adminUserId, adminName) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify both issues exist
    const checkRes = await client.query(
      `SELECT id, title FROM issues WHERE id = ANY($1);`,
      [[duplicateId, canonicalId]]
    );
    if (checkRes.rows.length < 2) {
      await client.query('ROLLBACK');
      return null;
    }

    // Link duplicate issue to canonical issue
    await client.query(
      `UPDATE issues SET duplicate_of = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;`,
      [canonicalId, duplicateId]
    );

    // Consolidate supporters from duplicate to canonical complaint
    await client.query(
      `INSERT INTO issue_supports (user_id, issue_id)
       SELECT user_id, $1 FROM issue_supports WHERE issue_id = $2
       ON CONFLICT (user_id, issue_id) DO NOTHING;`,
      [canonicalId, duplicateId]
    );

    // Recompute upvotes_count for canonical complaint
    await client.query(
      `UPDATE issues SET upvotes_count = (SELECT COUNT(*) FROM issue_supports WHERE issue_id = $1)
       WHERE id = $1;`,
      [canonicalId]
    );

    const canonicalTitle = checkRes.rows.find((r) => r.id === canonicalId)?.title || canonicalId;
    const duplicateTitle = checkRes.rows.find((r) => r.id === duplicateId)?.title || duplicateId;

    // Add audit history note to duplicate issue
    await client.query(
      `INSERT INTO issue_updates (issue_id, status, title, author_id, author, role, note)
       SELECT id, status, 'Marked as Duplicate by Administrator',
         $2, $3, 'Admin Moderation',
         $4
       FROM issues WHERE id = $1;`,
      [
        duplicateId,
        adminUserId,
        adminName,
        `This complaint has been identified as a duplicate of ${canonicalId}: "${canonicalTitle}". Supporters have been consolidated into the canonical complaint.`,
      ]
    );

    // Add audit history note to canonical issue
    await client.query(
      `INSERT INTO issue_updates (issue_id, status, title, author_id, author, role, note)
       SELECT id, status, 'Duplicate Complaint Merged',
         $2, $3, 'Admin Moderation',
         $4
       FROM issues WHERE id = $1;`,
      [
        canonicalId,
        adminUserId,
        adminName,
        `Complaint ${duplicateId}: "${duplicateTitle}" has been verified as a duplicate and merged here.`,
      ]
    );

    await client.query('COMMIT');
    return { duplicateId, canonicalId };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const unlinkDuplicate = async (duplicateId, adminUserId, adminName) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const checkRes = await client.query(
      `SELECT id, title, duplicate_of FROM issues WHERE id = $1;`,
      [duplicateId]
    );

    if (checkRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const prevCanonicalId = checkRes.rows[0].duplicate_of;
    if (!prevCanonicalId) {
      await client.query('ROLLBACK');
      return { duplicateId, unlinked: false, message: 'Issue is not marked as a duplicate.' };
    }

    await client.query(
      `UPDATE issues SET duplicate_of = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1;`,
      [duplicateId]
    );

    // Recompute upvotes_count on previous canonical issue
    await client.query(
      `UPDATE issues SET upvotes_count = (SELECT COUNT(*) FROM issue_supports WHERE issue_id = $1) WHERE id = $1;`,
      [prevCanonicalId]
    );

    // Add audit history note on duplicate issue
    await client.query(
      `INSERT INTO issue_updates (issue_id, status, title, author_id, author, role, note)
       SELECT id, status, 'Duplicate Status Unlinked by Administrator',
         $2, $3, 'Admin Moderation',
         $4
       FROM issues WHERE id = $1;`,
      [
        duplicateId,
        adminUserId,
        adminName,
        `Duplicate status unlinked from ${prevCanonicalId}. Issue restored as independent complaint.`,
      ]
    );

    await client.query('COMMIT');
    return { duplicateId, prevCanonicalId, unlinked: true };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

