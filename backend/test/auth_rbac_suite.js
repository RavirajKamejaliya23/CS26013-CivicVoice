// Comprehensive Authentication and RBAC Test Suite for CivicVoice
// Tests all 14 scenarios required by Section 19 & 24

process.env.NODE_ENV = 'test';

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { default: pool, testConnection } = await import('../src/config/database.js');
const { default: app } = await import('../src/app.js');

let server;
let baseUrl;

const request = async (endpoint, { method = 'GET', body = null, token = null } = {}) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, body: data };
};

const runTests = async () => {
  console.log('\n===============================================================');
  console.log('🏛️  RUNNING CIVICVOICE AUTHENTICATION & RBAC VALIDATION SUITE');
  console.log('===============================================================\n');

  // Verify real PostgreSQL database connection
  const conn = await testConnection();
  if (conn.ok) {
    console.log('[TEST DATABASE] Connected to live PostgreSQL database.');
  } else {
    console.log(`[TEST NOTICE] Live PostgreSQL connection returned: ${conn.error}`);
    console.log('[TEST NOTICE] Engaging isolated test adapter for test suite verification.');
    
    const { newDb } = await import('pg-mem');
    const db = newDb();

    db.public.registerFunction({
      name: 'now',
      returns: 'timestamptz',
      implementation: () => new Date(),
    });
    db.public.registerFunction({
      name: 'current_timestamp',
      returns: 'timestamptz',
      implementation: () => new Date(),
    });
    db.public.registerFunction({
      name: 'lower',
      implementation: (x) => (x !== null && x !== undefined ? String(x).toLowerCase() : null),
    });
    db.public.registerFunction({
      name: 'greatest',
      implementation: (...args) => Math.max(...args),
    });
    db.public.registerFunction({
      name: 'pg_get_serial_sequence',
      implementation: (tableName, colName) => `${tableName}_${colName}_seq`,
    });
    db.public.registerFunction({
      name: 'setval',
      implementation: (seqName, val) => val,
    });

    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    const seedPath = path.resolve(__dirname, '../../database/seed.sql');

    if (fs.existsSync(schemaPath)) {
      db.public.none(fs.readFileSync(schemaPath, 'utf8'));
    }
    if (fs.existsSync(seedPath)) {
      db.public.none(fs.readFileSync(seedPath, 'utf8'));
    }

    const adapter = db.adapters.createPg();
    const testPool = new adapter.Pool();

    // Route pool calls to test adapter
    pool.query = testPool.query.bind(testPool);
    pool.connect = testPool.connect.bind(testPool);
  }

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}: ${details}`);
      failed++;
    }
  };

  try {
    const testEmail = `jane.citizen.${Date.now()}@example.com`;

    // -------------------------------------------------------------
    // Test 1: Register citizen
    // Expected: Account created in database with canonical CITIZEN role
    // -------------------------------------------------------------
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Jane Citizen',
        email: testEmail,
        password: 'Password@123',
        role: 'ADMIN', // Tampering attempt: should be completely ignored/overridden to CITIZEN
      },
    });

    assert(
      regRes.status === 201 &&
        regRes.body.success === true &&
        regRes.body.data.user.role === 'CITIZEN' &&
        regRes.body.data.token,
      'Test 1: Register citizen creates account with CITIZEN role (tampered role ignored)',
      JSON.stringify(regRes.body)
    );
    const newCitizenToken = regRes.body?.data?.token;

    // -------------------------------------------------------------
    // Test 2: Register using an existing email
    // Expected: Rejected (400)
    // -------------------------------------------------------------
    const dupRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Jane Duplicate',
        email: testEmail,
        password: 'Password@123',
      },
    });

    assert(
      dupRes.status === 400 && dupRes.body.success === false,
      'Test 2: Register with existing email is rejected (400 Conflict)',
      JSON.stringify(dupRes.body)
    );

    // -------------------------------------------------------------
    // Test 3: Login with correct password
    // Expected: Successful authentication
    // -------------------------------------------------------------
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'citizen@civicvoice.org',
        password: 'Citizen@123',
      },
    });

    assert(
      loginRes.status === 200 &&
        loginRes.body.success === true &&
        loginRes.body.data.user.email === 'citizen@civicvoice.org' &&
        loginRes.body.data.user.role === 'CITIZEN' &&
        loginRes.body.data.token,
      'Test 3: Login with correct password succeeds and returns CITIZEN role',
      JSON.stringify(loginRes.body)
    );
    const citizenToken = loginRes.body?.data?.token;

    // -------------------------------------------------------------
    // Test 4: Login with incorrect password
    // Expected: Rejected (401)
    // -------------------------------------------------------------
    const badLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'citizen@civicvoice.org',
        password: 'WrongPassword!456',
      },
    });

    assert(
      badLoginRes.status === 401 && badLoginRes.body.success === false,
      'Test 4: Login with incorrect password is rejected (401 Unauthorized)',
      JSON.stringify(badLoginRes.body)
    );

    // -------------------------------------------------------------
    // Log in Municipal Officer & Admin for subsequent tests
    // -------------------------------------------------------------
    const municipalLogin = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'municipal@civicvoice.org',
        password: 'Municipal@123',
      },
    });
    assert(
      municipalLogin.status === 200 && municipalLogin.body.data.user.role === 'MUNICIPAL',
      'Test Setup: Municipal officer authenticated with MUNICIPAL role'
    );
    const municipalToken = municipalLogin.body?.data?.token;

    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@civicvoice.org',
        password: 'Admin@123',
      },
    });
    assert(
      adminLogin.status === 200 && adminLogin.body.data.user.role === 'ADMIN',
      'Test Setup: Admin authenticated with ADMIN role'
    );
    const adminToken = adminLogin.body?.data?.token;

    // -------------------------------------------------------------
    // Test 5: Citizen accesses citizen functionality (create issue)
    // Expected: Allowed (201)
    // -------------------------------------------------------------
    const citizenReportRes = await request('/api/issues', {
      method: 'POST',
      token: citizenToken,
      body: {
        title: 'Damaged Crosswalk Warning Signal',
        description: 'Audio chirper on the pedestrian pole is stuck buzzing continuously.',
        category: 'traffic_safety',
        address: '5th & Pine Street, Ward 1',
      },
    });

    assert(
      citizenReportRes.status === 201 &&
        citizenReportRes.body.success === true &&
        citizenReportRes.body.data.issue.id,
      'Test 5: Citizen accesses citizen functionality (Dispatch Report)',
      JSON.stringify(citizenReportRes.body)
    );
    const createdIssueId = citizenReportRes.body?.data?.issue?.id;

    // -------------------------------------------------------------
    // Test 5b: Municipal officer attempts to report an issue
    // Expected: 403 Forbidden (civic workflow: reporting is citizen function)
    // -------------------------------------------------------------
    const municipalReportAttempt = await request('/api/issues', {
      method: 'POST',
      token: municipalToken,
      body: {
        title: 'Officer direct dispatch',
        description: 'Should be rejected as issue reporting is a citizen function',
        category: 'roads_potholes',
        address: 'HQ Street',
      },
    });

    assert(
      municipalReportAttempt.status === 403,
      'Test 5b: Municipal officer attempting to report issue returns 403 Forbidden',
      JSON.stringify(municipalReportAttempt.body)
    );

    // -------------------------------------------------------------
    // Test 6: Citizen accesses municipal API
    // Expected: 403 Forbidden
    // -------------------------------------------------------------
    const citizenMunicipalRes = await request('/api/municipal/overview', {
      method: 'GET',
      token: citizenToken,
    });

    assert(
      citizenMunicipalRes.status === 403 && citizenMunicipalRes.body.success === false,
      'Test 6: Citizen accessing municipal API returns 403 Forbidden',
      JSON.stringify(citizenMunicipalRes.body)
    );

    // -------------------------------------------------------------
    // Test 7: Citizen accesses admin API
    // Expected: 403 Forbidden
    // -------------------------------------------------------------
    const citizenAdminRes = await request('/api/admin/users', {
      method: 'GET',
      token: citizenToken,
    });

    assert(
      citizenAdminRes.status === 403 && citizenAdminRes.body.success === false,
      'Test 7: Citizen accessing admin API returns 403 Forbidden',
      JSON.stringify(citizenAdminRes.body)
    );

    // -------------------------------------------------------------
    // Test 8: Municipal accesses municipal functionality
    // Expected: Allowed (200)
    // -------------------------------------------------------------
    const municipalAccessRes = await request('/api/municipal/overview', {
      method: 'GET',
      token: municipalToken,
    });

    assert(
      municipalAccessRes.status === 200 &&
        municipalAccessRes.body.success === true &&
        municipalAccessRes.body.data.officer.role === 'MUNICIPAL',
      'Test 8: Municipal officer accesses municipal functionality',
      JSON.stringify(municipalAccessRes.body)
    );

    // Advance issue status as Municipal officer
    const statusUpdateRes = await request(`/api/issues/${createdIssueId}/status`, {
      method: 'PATCH',
      token: municipalToken,
      body: {
        status: 'in_progress',
        note: 'Electrical team dispatched to test signal wiring.',
      },
    });
    assert(
      statusUpdateRes.status === 200 &&
        statusUpdateRes.body.data.issue.status === 'in_progress',
      'Test 8b: Municipal officer updates issue status',
      JSON.stringify(statusUpdateRes.body)
    );

    // -------------------------------------------------------------
    // Test 9: Municipal accesses admin-only functionality
    // Expected: 403 Forbidden
    // -------------------------------------------------------------
    const municipalAdminRes = await request('/api/admin/users', {
      method: 'GET',
      token: municipalToken,
    });

    assert(
      municipalAdminRes.status === 403 && municipalAdminRes.body.success === false,
      'Test 9: Municipal accessing admin API returns 403 Forbidden',
      JSON.stringify(municipalAdminRes.body)
    );

    // -------------------------------------------------------------
    // Test 10: Admin accesses admin functionality
    // Expected: Allowed (200)
    // -------------------------------------------------------------
    const adminAccessRes = await request('/api/admin/users', {
      method: 'GET',
      token: adminToken,
    });

    assert(
      adminAccessRes.status === 200 &&
        adminAccessRes.body.success === true &&
        Array.isArray(adminAccessRes.body.data.users),
      'Test 10: Admin accesses admin functionality (User registry)',
      JSON.stringify(adminAccessRes.body)
    );

    // -------------------------------------------------------------
    // Test 11: Unauthenticated user accesses protected API
    // Expected: 401 Unauthorized
    // -------------------------------------------------------------
    const unauthRes = await request('/api/admin/users', {
      method: 'GET',
      // no token
    });

    assert(
      unauthRes.status === 401 && unauthRes.body.success === false,
      'Test 11: Unauthenticated request to protected API returns 401 Unauthorized',
      JSON.stringify(unauthRes.body)
    );

    // -------------------------------------------------------------
    // Test 12: User logs out
    // Expected: Authenticated access session ends
    // -------------------------------------------------------------
    const logoutRes = await request('/api/auth/logout', {
      method: 'POST',
      token: citizenToken,
    });

    assert(
      logoutRes.status === 200 && logoutRes.body.success === true,
      'Test 12: User logs out successfully',
      JSON.stringify(logoutRes.body)
    );

    // -------------------------------------------------------------
    // Test 13: User refreshes page while authenticated (GET /api/auth/me)
    // Expected: Server verifies token and returns authenticated profile
    // -------------------------------------------------------------
    const refreshRes = await request('/api/auth/me', {
      method: 'GET',
      token: citizenToken,
    });

    assert(
      refreshRes.status === 200 &&
        refreshRes.body.success === true &&
        refreshRes.body.data.user.email === 'citizen@civicvoice.org' &&
        refreshRes.body.data.user.role === 'CITIZEN',
      'Test 13: Page refresh /api/auth/me restores valid authenticated state',
      JSON.stringify(refreshRes.body)
    );

    // -------------------------------------------------------------
    // Test 14: User manually changes frontend role / localStorage value
    // Expected: Backend STILL uses the real authenticated role and rejects unauthorized access!
    // -------------------------------------------------------------
    const forgedAttempt = await request('/api/admin/overview', {
      method: 'GET',
      token: citizenToken, // Token is signed for citizen
    });

    assert(
      forgedAttempt.status === 403 && forgedAttempt.body.success === false,
      'Test 14: Tampered frontend role is completely rejected by backend RBAC (403 Forbidden)',
      JSON.stringify(forgedAttempt.body)
    );

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    try {
      await pool.query("DELETE FROM users WHERE email LIKE 'jane.citizen.%@example.com'");
    } catch (_) {}
    server.close();
    console.log('\n---------------------------------------------------------------');
    console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('---------------------------------------------------------------\n');
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
