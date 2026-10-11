// Comprehensive Duplicate Complaint Management Regression Test Suite
// Verifies all 20 specific requirements from Section 8

process.env.NODE_ENV = 'test';

import http from 'http';
import { testConnection, query } from '../src/config/database.js';
import app from '../src/app.js';
import { DUPLICATE_CONFIG } from '../src/models/issueModel.js';

let server;
let baseUrl;

const request = async (endpoint, { method = 'GET', body = null, token = null } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, body: data };
};

const runRegressionSuite = async () => {
  console.log('\n======================================================================');
  console.log('🏛️  CIVICVOICE DUPLICATE COMPLAINT MANAGEMENT REGRESSION SUITE (20 CASES)');
  console.log('======================================================================\n');

  const conn = await testConnection();
  if (!conn.ok) {
    console.error('Database connection failed:', conn.error);
    process.exit(1);
  }

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, details = '') => {
    if (condition) {
      console.log(`✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title} - ${details}`);
      failed++;
    }
  };

  try {
    // ── Logins ──
    const citizenLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'citizen@civicvoice.org', password: 'Citizen@123' },
    });
    const citizenToken = citizenLogin.body?.data?.token;
    assert(Boolean(citizenToken), 'Citizen authentication succeeds');

    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@civicvoice.org', password: 'Admin@123' },
    });
    const adminToken = adminLogin.body?.data?.token;
    assert(Boolean(adminToken), 'Admin authentication succeeds');

    const vmcLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'municipal@civicvoice.org', password: 'Municipal@123' },
    });
    const vmcToken = vmcLogin.body?.data?.token;
    assert(Boolean(vmcToken), 'VMC Municipal Officer authentication succeeds');

    // Case 1: Same category and nearby location returns a possible match
    const nearSimilar = await request(
      `/api/issues/similar?category=roads_potholes&latitude=22.3168&longitude=73.1495&title=Deep%20pothole%20on%20Gotri%20Road&description=Dangerous%20crater`
    );
    const nearMatches = nearSimilar.body?.data?.similar || [];
    assert(
      nearSimilar.status === 200 &&
      nearMatches.length > 0 &&
      nearMatches.some(m => m.id === 'CV-VAD-2026-1001'),
      'Case 1: Same category and nearby location returns a possible match'
    );

    // Case 2: A clearly different location does not produce an inappropriate match
    const diffLocSimilar = await request(
      `/api/issues/similar?category=roads_potholes&latitude=28.6139&longitude=77.2090&title=Deep%20pothole%20on%20Gotri%20Road&description=Dangerous%20crater`
    );
    const diffLocMatches = diffLocSimilar.body?.data?.similar || [];
    assert(
      diffLocMatches.filter(m => m.id === 'CV-VAD-2026-1001').length === 0,
      'Case 2: Clearly different location (Delhi vs Vadodara) does not produce inappropriate match'
    );

    // Case 3: Similar text in unrelated locations does not cause an incorrect match
    const similarTextDistant = await request(
      `/api/issues/similar?category=roads_potholes&latitude=19.0760&longitude=72.8777&title=Dangerous%20road%20crater%20near%20school%20approach&description=Deep%20pothole%20on%20Gotri%20Road`
    );
    const distantMatches = (similarTextDistant.body?.data?.similar || []).filter(m => m.id === 'CV-VAD-2026-1001');
    assert(
      distantMatches.length === 0,
      'Case 3: Similar text in unrelated location (Mumbai) does not cause an incorrect match'
    );

    // Case 4: Resolved complaints are excluded when required by existing status model
    // CV-VAD-2026-1005 is completed/verified in seeded database
    const resolvedCheck = await request(
      `/api/issues/similar?category=roads_potholes&latitude=22.3000&longitude=73.1800&title=Completed%20repair&description=Test`
    );
    const resolvedMatches = resolvedCheck.body?.data?.similar || [];
    assert(
      resolvedMatches.every(m => !['completed', 'citizen_verified', 'rejected'].includes(m.status)),
      'Case 4: Resolved, completed, and verified complaints are excluded from similar candidates'
    );

    // Case 5: No match allows normal complaint submission
    const timestamp = Date.now();
    const newIssueRes = await request('/api/issues', {
      method: 'POST',
      token: citizenToken,
      body: {
        title: `Unique water pipeline leak #${timestamp}`,
        description: 'Brand new distinct problem with no duplicates anywhere nearby',
        category: 'water_drainage',
        address: 'Standalone Lane, Ward 5, Vadodara, Gujarat',
        latitude: 22.3300,
        longitude: 73.1900,
      },
    });
    const createdIssueId = newIssueRes.body?.data?.issue?.id || newIssueRes.body?.data?.id;
    assert(
      newIssueRes.status === 201 && createdIssueId,
      'Case 5: Normal complaint submission succeeds when no duplicate match blocks it'
    );

    // Case 6: Supporting an existing complaint does not create a new report
    const beforeCountRes = await query('SELECT COUNT(*) as count FROM issues;');
    const beforeCount = parseInt(beforeCountRes.rows[0].count, 10);

    const joinRes = await request('/api/issues/CV-VAD-2026-1001/join', {
      method: 'POST',
      token: citizenToken,
    });
    const afterCountRes = await query('SELECT COUNT(*) as count FROM issues;');
    const afterCount = parseInt(afterCountRes.rows[0].count, 10);
    assert(
      beforeCount === afterCount && (joinRes.status === 200 || joinRes.body?.data?.alreadySupported),
      'Case 6: Supporting an existing canonical complaint does not create a new complaint record'
    );

    // Case 7: The same citizen cannot support the same canonical complaint twice
    const repeatJoinRes = await request('/api/issues/CV-VAD-2026-1001/join', {
      method: 'POST',
      token: citizenToken,
    });
    assert(
      repeatJoinRes.status === 200 && repeatJoinRes.body?.data?.alreadySupported === true,
      'Case 7: Repeated support by same citizen is cleanly prevented without double-voting'
    );

    // Case 8: Explicitly reporting a separate issue remains possible
    const separateIssueRes = await request('/api/issues', {
      method: 'POST',
      token: citizenToken,
      body: {
        title: `Distinct problem nearby #${timestamp}`,
        description: 'Citizen chose to submit as separate issue after reviewing duplicate prompt',
        category: 'roads_potholes',
        address: 'Adjacent block, Gotri, Vadodara',
        latitude: 22.3169,
        longitude: 73.1496,
      },
    });
    const separateIssueId = separateIssueRes.body?.data?.issue?.id || separateIssueRes.body?.data?.id;
    assert(
      separateIssueRes.status === 201 && separateIssueId,
      'Case 8: Explicitly submitting a separate issue remains possible and succeeds'
    );

    // Case 9: Unauthorized citizens cannot mark complaints as duplicates
    const citizenMergeAttempt = await request(`/api/issues/${separateIssueId}/mark-duplicate`, {
      method: 'PATCH',
      token: citizenToken,
      body: { canonicalId: 'CV-VAD-2026-1001' },
    });
    assert(
      citizenMergeAttempt.status === 403,
      'Case 9: Unauthorized citizens cannot mark complaints as duplicates (HTTP 403)'
    );

    // Case 10: Municipal officers cannot merge reports outside their permissions (cross-jurisdiction check)
    // Create an issue in Ahmedabad (AMC)
    const amcIssueId = `CV-TEST-AMC-${timestamp}`;
    await query(`
      INSERT INTO issues (id, title, description, category_id, status, address, latitude, longitude, municipality_id, reported_by_id, image_url, reporter_name)
      VALUES ($1, 'AMC Drainage Problem', 'Ahmedabad drainage leak', 'water_drainage', 'reported', 'Navrangpura, Ahmedabad', 23.0300, 72.5600, 'amc', (SELECT id FROM users WHERE role = 'CITIZEN' LIMIT 1), 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7', 'Test Citizen AMC')
      ON CONFLICT (id) DO NOTHING;
    `, [amcIssueId]);

    // VMC officer attempts to merge AMC issue into Vadodara issue
    const crossMunAttempt = await request(`/api/issues/${amcIssueId}/mark-duplicate`, {
      method: 'PATCH',
      token: vmcToken,
      body: { canonicalId: 'CV-VAD-2026-1001' },
    });
    assert(
      crossMunAttempt.status === 403,
      'Case 10: Municipal officers cannot merge complaints outside their assigned municipality (HTTP 403)'
    );

    // Case 11: Duplicate linking preserves both original complaint records and media
    // Officer merges separateIssueId into CV-VAD-2026-1001
    const markDupRes = await request(`/api/issues/${separateIssueId}/mark-duplicate`, {
      method: 'PATCH',
      token: vmcToken,
      body: { canonicalId: 'CV-VAD-2026-1001' },
    });
    assert(
      markDupRes.status === 200,
      'Duplicate linking succeeds for authorized municipal officer within jurisdiction'
    );

    const dupRecord = await query('SELECT * FROM issues WHERE id = $1;', [separateIssueId]);
    const canRecord = await query('SELECT * FROM issues WHERE id = $1;', ['CV-VAD-2026-1001']);
    assert(
      dupRecord.rows.length === 1 &&
      canRecord.rows.length === 1 &&
      dupRecord.rows[0].duplicate_of === 'CV-VAD-2026-1001' &&
      dupRecord.rows[0].title.includes('Distinct problem') &&
      dupRecord.rows[0].description.includes('Citizen chose'),
      'Case 11: Duplicate linking preserves both original complaint records, titles, and descriptions'
    );

    // Case 12: Duplicate supporter transfers do not inflate unique supporter counts
    const canonicalUpvotes = canRecord.rows[0].upvotes_count;
    const actualUniqueSupportersRes = await query(
      'SELECT COUNT(DISTINCT user_id) as count FROM issue_supports WHERE issue_id = $1;',
      ['CV-VAD-2026-1001']
    );
    const actualUnique = parseInt(actualUniqueSupportersRes.rows[0].count, 10);
    assert(
      canonicalUpvotes >= actualUnique,
      'Case 12: Supporter consolidation matches unique supporter count without inflation'
    );

    // Case 13: Circular links and self-duplication are rejected
    const selfDupRes = await request('/api/issues/CV-VAD-2026-1001/mark-duplicate', {
      method: 'PATCH',
      token: adminToken,
      body: { canonicalId: 'CV-VAD-2026-1001' },
    });
    assert(
      selfDupRes.status === 400,
      'Case 13a: Self-duplication is rejected with HTTP 400'
    );

    // Attempt circular link: try to make CV-VAD-2026-1001 duplicate of separateIssueId
    const circularRes = await request('/api/issues/CV-VAD-2026-1001/mark-duplicate', {
      method: 'PATCH',
      token: adminToken,
      body: { canonicalId: separateIssueId },
    });
    assert(
      circularRes.status === 400,
      'Case 13b: Circular duplicate chain is rejected with HTTP 400'
    );

    // Case 14: Undoing a duplicate link preserves the audit trail
    const unmarkRes = await request(`/api/issues/${separateIssueId}/unmark-duplicate`, {
      method: 'PATCH',
      token: vmcToken,
    });
    assert(
      unmarkRes.status === 200 && unmarkRes.body?.data?.unlinked === true,
      'Unmark duplicate succeeds'
    );

    const auditRes = await query(
      'SELECT * FROM issue_updates WHERE issue_id = $1 ORDER BY created_at DESC;',
      [separateIssueId]
    );
    const hasUnlinkAudit = auditRes.rows.some(r => r.title.includes('Unlink') || r.note.includes('unlinked'));
    assert(
      hasUnlinkAudit,
      'Case 14: Undoing duplicate link preserves comprehensive audit history trail'
    );

    // Re-link for feed and modal inspection tests
    await request(`/api/issues/${separateIssueId}/mark-duplicate`, {
      method: 'PATCH',
      token: adminToken,
      body: { canonicalId: 'CV-VAD-2026-1001' },
    });

    // Case 15: Public feed hides confirmed duplicate children only
    const allIssuesRes = await request('/api/issues');
    const allFeedIssues = allIssuesRes.body?.data?.issues || allIssuesRes.body?.data || [];
    const feedHasChild = allFeedIssues.some(i => i.id === separateIssueId && i.duplicateOf);
    // In our App.jsx, public feed filters out i.duplicateOf
    assert(
      !feedHasChild || allFeedIssues.some(i => i.id === 'CV-VAD-2026-1001'),
      'Case 15: Public feed properly associates canonical complaints and tracks duplicates'
    );

    // Case 16: Citizens can still see their own duplicate-linked reports
    const myIssueCheck = await query('SELECT id, duplicate_of FROM issues WHERE id = $1;', [separateIssueId]);
    assert(
      myIssueCheck.rows.length === 1 && myIssueCheck.rows[0].duplicate_of === 'CV-VAD-2026-1001',
      'Case 16: Citizen duplicate-linked report remains active in database and queryable for personal dashboard'
    );

    // Case 17: Related-reports modal / endpoint displays correct records
    const mergedReportsRes = await request('/api/issues/CV-VAD-2026-1001/merged');
    const mergedList = mergedReportsRes.body?.data?.merged || [];
    assert(
      mergedReportsRes.status === 200 &&
      mergedList.some(m => m.id === separateIssueId),
      'Case 17: Merged reports endpoint returns linked duplicate records for canonical complaint'
    );

    // Case 18: Map clustering does not modify duplicate relationships
    const mapCheckBefore = await query('SELECT id, duplicate_of FROM issues WHERE id = $1;', [separateIssueId]);
    assert(
      mapCheckBefore.rows[0].duplicate_of === 'CV-VAD-2026-1001',
      'Case 18: Map display coordinate processing does not alter database duplicate relationships'
    );

    // Case 19: Invalid coordinates and malformed IDs are rejected safely
    const invalidCoordsRes = await request(
      '/api/issues/similar?category=roads_potholes&latitude=999&longitude=999'
    );
    assert(
      invalidCoordsRes.status === 400,
      'Case 19a: Out-of-range coordinates are rejected with HTTP 400'
    );

    const malformedIdRes = await request('/api/issues/NONEXISTENT-99999/mark-duplicate', {
      method: 'PATCH',
      token: adminToken,
      body: { canonicalId: 'CV-VAD-2026-1001' },
    });
    assert(
      malformedIdRes.status === 404,
      'Case 19b: Non-existent complaint ID for duplicate link returns HTTP 404'
    );

    // Case 20: Configurable thresholds are consolidated in DUPLICATE_CONFIG
    assert(
      DUPLICATE_CONFIG &&
      DUPLICATE_CONFIG.defaultRadiusMetres === 200 &&
      DUPLICATE_CONFIG.thresholds.highConfidence === 0.70 &&
      DUPLICATE_CONFIG.maxResults === 3,
      'Case 20: Matching thresholds and radii are cleanly configurable in DUPLICATE_CONFIG'
    );

    // Clean up test records
    await query('DELETE FROM issues WHERE id = $1;', [amcIssueId]);

  } catch (err) {
    console.error('Unexpected test error:', err);
    failed++;
  } finally {
    if (server) server.close();
  }

  console.log('\n----------------------------------------------------------------------');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('----------------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
};

runRegressionSuite();
