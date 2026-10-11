import { query } from '../config/database.js';
import * as municipalityModel from '../models/municipalityModel.js';
import { sendSuccess } from '../utils/response.js';

export const getAnalyticsOverview = async (req, res, next) => {
  try {
    let { municipalityId, days } = req.query;

    // If municipal user, strictly enforce their own municipality scope
    if (req.user && req.user.role === 'MUNICIPAL' && req.user.municipality_id) {
      municipalityId = req.user.municipality_id;
    }

    const whereClauses = [];
    const params = [];
    let pIdx = 1;

    if (municipalityId && municipalityId !== 'all') {
      whereClauses.push(`i.municipality_id = $${pIdx++}`);
      params.push(municipalityId);
    }

    if (days && !isNaN(parseInt(days, 10))) {
      whereClauses.push(`i.created_at >= NOW() - INTERVAL '${parseInt(days, 10)} days'`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // 1. KPI COUNTS & RESOLUTION TIME
    const kpiSql = `
      SELECT 
        COUNT(*) AS total,
        COUNT(CASE WHEN status IN ('reported', 'under_review', 'accepted', 'in_progress', 'reopened') THEN 1 END) AS open,
        COUNT(CASE WHEN status IN ('completed', 'citizen_verified') THEN 1 END) AS resolved,
        COUNT(CASE WHEN status IN ('reported', 'under_review', 'accepted', 'in_progress', 'reopened') 
                   AND created_at < NOW() - INTERVAL '7 days' THEN 1 END) AS overdue,
        AVG(CASE WHEN status IN ('completed', 'citizen_verified') 
                 THEN EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600.0 END) AS avg_resolution_hours
      FROM issues i
      ${whereSql};
    `;
    const kpiRes = await query(kpiSql, params);
    const kpiRow = kpiRes.rows[0];

    const total = parseInt(kpiRow.total || 0, 10);
    const open = parseInt(kpiRow.open || 0, 10);
    const resolved = parseInt(kpiRow.resolved || 0, 10);
    const overdue = parseInt(kpiRow.overdue || 0, 10);
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const avgResolutionHours = kpiRow.avg_resolution_hours ? Math.round(parseFloat(kpiRow.avg_resolution_hours) * 10) / 10 : null;

    // 2. LINE CHART: SUBMITTED VS RESOLVED OVER TIME (by date)
    const timeSql = `
      SELECT 
        TO_CHAR(d.day, 'YYYY-MM-DD') AS date,
        COUNT(i.id) AS submitted,
        COUNT(CASE WHEN i.status IN ('completed', 'citizen_verified') THEN 1 END) AS resolved
      FROM (
        SELECT GENERATE_SERIES(
          NOW() - INTERVAL '14 days',
          NOW(),
          '1 day'::interval
        )::date AS day
      ) d
      LEFT JOIN issues i ON DATE(i.created_at) = d.day ${whereClauses.length > 0 ? `AND ${whereClauses.join(' AND ')}` : ''}
      GROUP BY d.day
      ORDER BY d.day ASC;
    `;
    const timeRes = await query(timeSql, params);

    // 3. HORIZONTAL BAR CHART: CATEGORY DISTRIBUTION
    const catSql = `
      SELECT 
        c.id, c.name,
        COUNT(i.id) AS count,
        COUNT(CASE WHEN i.status IN ('completed', 'citizen_verified') THEN 1 END) AS resolved,
        COUNT(CASE WHEN i.status NOT IN ('completed', 'citizen_verified') THEN 1 END) AS open
      FROM categories c
      LEFT JOIN issues i ON i.category_id = c.id ${whereClauses.length > 0 ? `AND ${whereClauses.join(' AND ')}` : ''}
      GROUP BY c.id, c.name
      ORDER BY count DESC;
    `;
    const catRes = await query(catSql, params);

    // 4. DONUT CHART: CURRENT ISSUE STATUS DISTRIBUTION
    const statusSql = `
      SELECT 
        status, COUNT(*) AS count
      FROM issues i
      ${whereSql}
      GROUP BY status
      ORDER BY count DESC;
    `;
    const statusRes = await query(statusSql, params);

    // 5. STACKED BAR CHART: BY MUNICIPALITY / DEPARTMENT
    const muniStackedSql = `
      SELECT 
        COALESCE(m.name, 'Unassigned / Outside Scope') AS label,
        COALESCE(m.id, 'unassigned') AS "municipalityId",
        COUNT(CASE WHEN i.status IN ('reported', 'under_review') THEN 1 END) AS pending,
        COUNT(CASE WHEN i.status IN ('accepted', 'in_progress', 'reopened') THEN 1 END) AS "inProgress",
        COUNT(CASE WHEN i.status IN ('completed', 'citizen_verified') THEN 1 END) AS resolved,
        COUNT(*) AS total
      FROM issues i
      LEFT JOIN municipal_bodies m ON m.id = i.municipality_id
      GROUP BY m.id, m.name
      ORDER BY total DESC;
    `;
    const muniStackedRes = await query(muniStackedSql);

    // 6. RESOLUTION TIME COMPARISON ACROSS MUNICIPAL BODIES
    const resolutionComparisonSql = `
      SELECT 
        m.id, m.name, m.code,
        COUNT(i.id) AS total,
        COUNT(CASE WHEN i.status IN ('completed', 'citizen_verified') THEN 1 END) AS resolved,
        ROUND(AVG(CASE WHEN i.status IN ('completed', 'citizen_verified') 
                       THEN EXTRACT(EPOCH FROM (i.updated_at - i.created_at)) / 3600.0 END)::numeric, 1) AS "avgResolutionHours"
      FROM municipal_bodies m
      LEFT JOIN issues i ON i.municipality_id = m.id
      GROUP BY m.id, m.name, m.code
      ORDER BY total DESC;
    `;
    const resolutionComparisonRes = await query(resolutionComparisonSql);

    // 7. GEOGRAPHIC HOTSPOTS & REPORT LOCATIONS
    const geoSql = `
      SELECT 
        i.id, i.title, i.latitude, i.longitude, i.address, i.status, i.category_id AS category,
        i.municipality_id AS "municipalityId", i.jurisdiction_status AS "jurisdictionStatus",
        CASE WHEN i.status IN ('completed', 'citizen_verified') THEN FALSE ELSE TRUE END AS "isUnresolved"
      FROM issues i
      ${whereSql}
      LIMIT 100;
    `;
    const geoRes = await query(geoSql, params);

    // List of active municipalities for filter dropdown
    const municipalitiesList = await municipalityModel.getAllMunicipalities({ status: 'active' });

    return sendSuccess(
      res,
      {
        kpis: {
          totalGenuineReports: total,
          openIssues: open,
          resolvedIssues: resolved,
          overdueIssues: overdue,
          resolutionRate,
          avgResolutionHours: avgResolutionHours !== null ? avgResolutionHours : 0,
        },
        timeSeries: timeRes.rows,
        categoryBreakdown: catRes.rows.map((r) => ({
          ...r,
          count: parseInt(r.count, 10),
          resolved: parseInt(r.resolved, 10),
          open: parseInt(r.open, 10),
        })),
        statusDistribution: statusRes.rows.map((r) => ({
          status: r.status,
          count: parseInt(r.count, 10),
        })),
        stackedByMunicipality: muniStackedRes.rows.map((r) => ({
          ...r,
          pending: parseInt(r.pending, 10),
          inProgress: parseInt(r.inProgress, 10),
          resolved: parseInt(r.resolved, 10),
          total: parseInt(r.total, 10),
        })),
        resolutionComparison: resolutionComparisonRes.rows.map((r) => ({
          ...r,
          total: parseInt(r.total, 10),
          resolved: parseInt(r.resolved, 10),
          avgResolutionHours: r.avgResolutionHours ? parseFloat(r.avgResolutionHours) : 0,
        })),
        geoHotspots: geoRes.rows,
        municipalities: municipalitiesList,
        activeFilter: {
          municipalityId: municipalityId || 'all',
          days: days || 'all',
        },
      },
      'Analytics overview retrieved successfully.'
    );
  } catch (error) {
    next(error);
  }
};
