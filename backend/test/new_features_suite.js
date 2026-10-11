process.env.NODE_ENV = 'test';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { default: pool, query } = await import('../src/config/database.js');
const { default: app } = await import('../src/app.js');

let server;
let baseUrl;

const request = async (endpoint, { method = 'GET', body = null, token = null, isFormData = false } = {}) => {
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers,
    body: isFormData ? body : (body ? JSON.stringify(body) : null),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  return {
    status: res.status,
    body: data,
  };
};

async function runTests() {
  console.log('\n===============================================================');
  console.log('🏛️  RUNNING CIVICVOICE NEW FEATURES & RBAC VALIDATION SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, msg) => {
    if (condition) {
      console.log(`✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${msg}`);
      failed++;
    }
  };

  try {
    // Start ephemeral server
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        console.log(`[TEST SERVER] Running on ${baseUrl}`);
        resolve();
      });
    });

    // 1. Authenticate Municipal Officer with demo credentials
    const municipalLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'municipal@civicvoice.org', password: 'Municipal@123' },
    });
    
    assert(municipalLogin.status === 200, 'Municipal login succeeds with credentials (200 OK)');
    assert(municipalLogin.body?.data?.user?.role === 'MUNICIPAL', 'Municipal login returns MUNICIPAL role');
    const municipalToken = municipalLogin.body?.data?.token;

    // 2. Authenticate Admin
    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@civicvoice.org', password: 'Admin@123' },
    });
    
    assert(adminLogin.status === 200, 'Admin login succeeds (200 OK)');
    const adminToken = adminLogin.body?.data?.token;

    // 3. Authenticate Citizen
    const citizenLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'citizen@civicvoice.org', password: 'Citizen@123' },
    });
    
    assert(citizenLogin.status === 200, 'Citizen login succeeds (200 OK)');
    const citizenToken = citizenLogin.body?.data?.token;

    // 4. Test GET /api/auth/me for Municipal Officer
    const meRes = await request('/api/auth/me', { token: municipalToken });
    assert(meRes.status === 200 && meRes.body?.data?.user?.role === 'MUNICIPAL', 'GET /api/auth/me restores MUNICIPAL role');

    // 5. Test Municipal access to Municipal Overview
    const muniOverview = await request('/api/municipal/overview', { token: municipalToken });
    assert(muniOverview.status === 200, 'Municipal officer can access GET /api/municipal/overview');

    // 6. Test Citizen access to Municipal Overview (Should be 403 Forbidden)
    const citizenMuniOverview = await request('/api/municipal/overview', { token: citizenToken });
    assert(citizenMuniOverview.status === 403, 'Citizen blocked from GET /api/municipal/overview (403 Forbidden)');

    // 7. Test Admin User Profile endpoint: GET /api/admin/users/:id
    const userRow = await query('SELECT id, email, role FROM users LIMIT 1');
    const targetUserId = userRow.rows[0].id;

    const adminUserRes = await request(`/api/admin/users/${targetUserId}`, { token: adminToken });
    
    assert(adminUserRes.status === 200, 'Admin can access GET /api/admin/users/:id (200 OK)');
    assert(adminUserRes.body?.data?.user?.email !== undefined, 'Admin user profile contains user account details');
    assert(adminUserRes.body?.data?.stats !== undefined, 'Admin user profile contains stats breakdown');
    assert(Array.isArray(adminUserRes.body?.data?.reports), 'Admin user profile includes list of submitted reports');
    assert(adminUserRes.body?.data?.user?.password_hash === undefined, 'Admin user profile does NOT expose password_hash');
    assert(adminUserRes.body?.data?.user?.password === undefined, 'Admin user profile does NOT expose password');

    // 8. Test Citizen access to Admin User Profile (Should be 403 Forbidden)
    const citizenAdminUser = await request(`/api/admin/users/${targetUserId}`, { token: citizenToken });
    assert(citizenAdminUser.status === 403, 'Citizen blocked from GET /api/admin/users/:id (403 Forbidden)');

    // 9. Test Evidence upload authorization:
    const pngBuffer = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2d040000000049454e44ae426082', 'hex');
    const issueRow = await query('SELECT id FROM issues LIMIT 1');
    const testIssueId = issueRow.rows[0].id;

    // Citizen attempting to upload evidence -> 403
    const citizenFormData = new FormData();
    citizenFormData.append('photo', new Blob([pngBuffer], { type: 'image/png' }), 'proof.png');

    const citizenUpload = await request(`/api/issues/${testIssueId}/evidence`, {
      method: 'POST',
      body: citizenFormData,
      token: citizenToken,
      isFormData: true,
    });
    assert(citizenUpload.status === 403, 'Citizen blocked from uploading official completion evidence (403 Forbidden)');

    // Municipal officer uploading evidence -> 200
    const municipalFormData = new FormData();
    municipalFormData.append('photo', new Blob([pngBuffer], { type: 'image/png' }), 'proof.png');
    municipalFormData.append('caption', 'Completed patch work verified');

    const municipalUpload = await request(`/api/issues/${testIssueId}/evidence`, {
      method: 'POST',
      body: municipalFormData,
      token: municipalToken,
      isFormData: true,
    });
    
    assert(municipalUpload.status === 200, 'Municipal officer can upload completion evidence (200 OK)');
    assert(municipalUpload.body?.data?.evidenceUrl !== undefined || municipalUpload.body?.data?.url !== undefined, 'Evidence upload returns saved file URL');

    // 10. Verify evidence saved in issue_media table
    const mediaCheck = await query('SELECT * FROM issue_media WHERE issue_id = $1 ORDER BY created_at DESC LIMIT 1', [testIssueId]);
    assert(mediaCheck.rows.length > 0, 'Completion evidence record successfully saved in issue_media table');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    console.log('\n---------------------------------------------------------------');
    console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('---------------------------------------------------------------\n');
    await pool.end();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
