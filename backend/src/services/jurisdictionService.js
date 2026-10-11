import * as municipalityModel from '../models/municipalityModel.js';
import { query } from '../config/database.js';

/**
 * Calculates Haversine distance in kilometers between two lat/lng points
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Checks if a coordinate point falls inside a municipality's jurisdiction bounds
 */
export function isPointInsideJurisdiction(lat, lng, bounds) {
  if (!bounds) return false;

  // 1. Bounding box check
  if (
    bounds.minLat !== undefined &&
    bounds.maxLat !== undefined &&
    bounds.minLng !== undefined &&
    bounds.maxLng !== undefined
  ) {
    if (
      lat >= bounds.minLat &&
      lat <= bounds.maxLat &&
      lng >= bounds.minLng &&
      lng <= bounds.maxLng
    ) {
      return true;
    }
  }

  // 2. Center + Radius check (default 18km if radius not specified)
  if (bounds.center?.lat && bounds.center?.lng) {
    const radius = bounds.radiusKm || 18;
    const dist = calculateDistanceKm(lat, lng, bounds.center.lat, bounds.center.lng);
    if (dist <= radius) {
      return true;
    }
  }

  // 3. Polygon coordinates check (GeoJSON / array of [lat, lng] rings)
  if (Array.isArray(bounds.polygon) && bounds.polygon.length >= 3) {
    let inside = false;
    const poly = bounds.polygon;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1];
      const xj = poly[j][0], yj = poly[j][1];
      const intersect =
        yi > lng !== yj > lng &&
        lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    if (inside) return true;
  }

  return false;
}

/**
 * Route an issue's coordinates to the appropriate municipal jurisdiction.
 * Returns { matched, municipalityId, municipalityName, jurisdictionStatus }
 */
export async function routeCoordinatesToMunicipality(latitude, longitude) {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return {
      matched: false,
      municipalityId: null,
      municipalityName: null,
      jurisdictionStatus: 'AUTHORITY_NOT_ONBOARDED',
      notice: 'Coordinates not provided for jurisdiction matching.',
    };
  }

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lng)) {
    return {
      matched: false,
      municipalityId: null,
      municipalityName: null,
      jurisdictionStatus: 'AUTHORITY_NOT_ONBOARDED',
      notice: 'Invalid coordinates.',
    };
  }

  const activeBodies = await municipalityModel.getAllMunicipalities({ status: 'active' });

  for (const body of activeBodies) {
    const bounds = typeof body.jurisdictionBounds === 'string'
      ? JSON.parse(body.jurisdictionBounds)
      : body.jurisdictionBounds;

    if (isPointInsideJurisdiction(lat, lng, bounds)) {
      return {
        matched: true,
        municipalityId: body.id,
        municipalityCode: body.code,
        municipalityName: body.name,
        jurisdictionStatus: 'MATCHED',
        notice: `Dispatched to ${body.name}`,
      };
    }
  }

  // No active municipality matches coordinates
  return {
    matched: false,
    municipalityId: null,
    municipalityName: null,
    jurisdictionStatus: 'AUTHORITY_NOT_ONBOARDED',
    notice:
      'This location is outside onboarded municipal corporations. Your report is securely registered on the public civic ledger and will be assigned once the local authority joins CivicVoice.',
  };
}

/**
 * Reassign an issue to a municipality manually (Admin only)
 */
export async function reassignIssueMunicipality(issueId, newMunicipalityId, adminUser, reason = null) {
  const municipality = await municipalityModel.getMunicipalityById(newMunicipalityId);
  if (!municipality) {
    throw new Error(`Municipal body '${newMunicipalityId}' not found.`);
  }

  const sql = `
    UPDATE issues
    SET 
      municipality_id = $1,
      jurisdiction_status = 'MANUALLY_ASSIGNED',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, title, municipality_id, jurisdiction_status;
  `;
  const result = await query(sql, [newMunicipalityId, issueId]);

  if (result.rows.length === 0) {
    throw new Error(`Issue '${issueId}' not found.`);
  }

  // Add timeline note
  await query(
    `INSERT INTO issue_updates (issue_id, status, title, author_id, author, role, note)
     VALUES ($1, 'under_review', 'Jurisdiction Reassigned', $2, $3, 'Platform Administration', $4);`,
    [
      issueId,
      adminUser.id,
      adminUser.name,
      `Manually reassigned to ${municipality.name}. Reason: ${reason || 'Administrative routing adjustment'}`,
    ]
  );

  // Record audit log
  await municipalityModel.recordAuditLog({
    userId: adminUser.id,
    userEmail: adminUser.email,
    userRole: adminUser.role,
    action: 'JURISDICTION_REASSIGNED',
    resourceType: 'ISSUE',
    resourceId: issueId,
    details: {
      oldMunicipalityId: result.rows[0].municipality_id,
      newMunicipalityId,
      municipalityName: municipality.name,
      reason,
    },
  });

  return result.rows[0];
}
