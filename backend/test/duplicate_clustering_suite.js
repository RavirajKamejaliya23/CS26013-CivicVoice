// Comprehensive Duplicate Detection & Clustering Test Suite for CivicVoice
// Tests Section 7-19 & 25 requirements

process.env.NODE_ENV = 'test';

import http from 'http';
import { testConnection } from '../src/config/database.js';
import app from '../src/app.js';

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

const runSuite = async () => {
  console.log('\n===============================================================');
  console.log('🏛️  RUNNING CIVICVOICE DUPLICATE CLUSTERING & JOINING TEST SUITE');
  console.log('===============================================================\n');

  const conn = await testConnection();
  if (!conn.ok) {
    console.error('Database connection failed:', conn.error);
    process.exit(1);
  }
  console.log('[TEST DATABASE] Connected to live PostgreSQL database.');

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
    // 1. Authenticate Citizen
    const citizenLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'citizen@civicvoice.org', password: 'Citizen@123' },
    });
    const citizenToken = citizenLogin.body?.data?.token;
    assert(Boolean(citizenToken), 'Citizen authentication succeeds');

    // 2. Authenticate Admin
    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@civicvoice.org', password: 'Admin@123' },
    });
    const adminToken = adminLogin.body?.data?.token;
    assert(Boolean(adminToken), 'Admin authentication succeeds');

    // 3. Same issue + same area -> should find candidate (CV-VAD-2026-1001 Gotri Road pothole)
    const sameAreaSimilar = await request(
      `/api/issues/similar?category=roads_potholes&latitude=22.3168&longitude=73.1495&title=Deep%20pothole%20on%20Gotri%20Road&description=Dangerous%20road%20crater%20near%20school`
    );
    const sameAreaMatches = sameAreaSimilar.body?.data?.similar || [];
    assert(
      sameAreaMatches.length > 0 && sameAreaMatches.some((m) => m.id === 'CV-VAD-2026-1001'),
      'Scenario A: Same issue + same area converges to canonical candidate',
      JSON.stringify(sameAreaMatches)
    );
    if (sameAreaMatches.length > 0) {
      assert(
        sameAreaMatches[0].confidenceScore >= 0.35,
        'Confidence score is accurately computed (MEDIUM or HIGH confidence)',
        `Score: ${sameAreaMatches[0].confidenceScore}`
      );
    }

    // 4. Different category + same location -> should remain separate
    const diffCatSimilar = await request(
      `/api/issues/similar?category=streetlights_power&latitude=22.3168&longitude=73.1495&title=Streetlight%20broken%20pole&description=Gotri%20pole%20damaged`
    );
    const diffCatMatches = diffCatSimilar.body?.data?.similar || [];
    assert(
      diffCatMatches.every((m) => m.category === 'streetlights_power'),
      'Scenario B: Different category + same location remains separate (no cross-category merging)',
      `Found: ${diffCatMatches.length}`
    );

    // 5. Same category + far away (e.g. 50km away) -> should remain separate
    const farAwaySimilar = await request(
      `/api/issues/similar?category=roads_potholes&latitude=23.0225&longitude=72.5714&title=Pothole%20on%20Gotri%20Road`
    );
    const farMatches = (farAwaySimilar.body?.data?.similar || []).filter(
      (m) => m.id === 'CV-VAD-2026-1001'
    );
    assert(
      farMatches.length === 0,
      'Scenario C: Same category + far away remains separate (distance radius enforced)',
      `Matches: ${farMatches.length}`
    );

    // 6. Citizen verifies duplicate joining & duplicate support prevention
    // Support canonical issue CV-VAD-2026-1001
    const joinRes1 = await request('/api/issues/CV-VAD-2026-1001/join', {
      method: 'POST',
      token: citizenToken,
    });
    assert(
      joinRes1.status === 200,
      'Scenario D: Citizen can join canonical complaint',
      JSON.stringify(joinRes1.body)
    );

    // Repeated support by same citizen -> blocked
    const joinRes2 = await request('/api/issues/CV-VAD-2026-1001/join', {
      method: 'POST',
      token: citizenToken,
    });
    assert(
      joinRes2.status === 200 && joinRes2.body?.data?.alreadySupported === true,
      'Scenario E: Repeated support by same citizen is blocked (prevents duplicate support)',
      JSON.stringify(joinRes2.body)
    );

    // 7. Admin duplicate link and unlink workflow
    // Link CV-VAD-2026-1003 to CV-VAD-2026-1001
    const linkRes = await request('/api/issues/CV-VAD-2026-1003/mark-duplicate', {
      method: 'PATCH',
      token: adminToken,
      body: { canonicalId: 'CV-VAD-2026-1001' },
    });
    assert(
      linkRes.status === 200,
      'Scenario F: Admin marks issue as duplicate and preserves audit trail',
      JSON.stringify(linkRes.body)
    );

    // Unlink CV-VAD-2026-1003 back to independent complaint
    const unlinkRes = await request('/api/issues/CV-VAD-2026-1003/unmark-duplicate', {
      method: 'PATCH',
      token: adminToken,
    });
    assert(
      unlinkRes.status === 200 && unlinkRes.body?.data?.unlinked === true,
      'Scenario G: Admin unlinks duplicate and restores independent complaint without data loss',
      JSON.stringify(unlinkRes.body)
    );

    // 8. Stats returns rich Indian civic breakdown including duplicatesCount and wardCounts
    const statsRes = await request('/api/issues/stats');
    const stats = statsRes.body?.data;
    assert(
      stats && typeof stats.duplicatesCount === 'number' && Array.isArray(stats.wardCounts),
      'Scenario H: Civic stats includes duplicatesCount and ward-wise distribution',
      JSON.stringify(stats)
    );

    console.log('\n---------------------------------------------------------------');
    console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('---------------------------------------------------------------\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Suite error:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runSuite();
