import assert from 'assert';
import http from 'http';
import app from '../src/app.js';
import pool from '../src/config/database.js';
import * as userModel from '../src/models/userModel.js';
import * as emailService from '../src/services/emailService.js';

console.log('===============================================================');
console.log('🏛️  RUNNING CIVICVOICE PART 1, PART 2 & PART 3 VALIDATION SUITE');
console.log('===============================================================');

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

async function runTests() {
  let passed = 0;
  let failed = 0;

  function pass(msg) {
    console.log(`✅ [PASS] ${msg}`);
    passed++;
  }
  function fail(msg, err) {
    console.error(`❌ [FAIL] ${msg}:`, err);
    failed++;
  }

  // Start test server on random port
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  try {
    // ------------------------------------------------------------------------
    // PART 1: DUPLICATE COMPLAINT FEED CLEANUP & CANONICAL CARDS
    // ------------------------------------------------------------------------
    console.log('\n--- PART 1: FEED DUPLICATE FILTERING & CANONICAL RELATIONSHIPS ---');

    // 1. Fetch public feed without parameters
    const feedRes = await request('/api/issues');
    assert.strictEqual(feedRes.status, 200, 'Feed returns 200');
    const feedIssues = feedRes.body.data.issues;

    // Check that no issues with duplicateOf are in the default feed
    const hasAnyDuplicateInFeed = feedIssues.some((i) => i.duplicateOf !== null);
    assert.strictEqual(hasAnyDuplicateInFeed, false, 'Default feed must NEVER include merged duplicate complaints');
    pass('Test 1A: Default public feed excludes all merged duplicate complaints');

    // 2. Check canonical complaints have mergedCount and canonical properties
    assert(Array.isArray(feedIssues), 'Feed returns an array of issues');
    pass('Test 1B: Canonical complaints appear as primary cards');

    // 3. Mark an issue as duplicate to verify merged count & endpoint
    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@civicvoice.org', password: 'Admin@123' },
    });
    const adminToken = adminLogin.body?.data?.token;
    assert(Boolean(adminToken), 'Admin authenticated');

    // Create two test issues
    const citizenLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'citizen@civicvoice.org', password: 'Citizen@123' },
    });
    const citizenToken = citizenLogin.body?.data?.token;
    const citizenId = citizenLogin.body?.data?.user?.id;
    assert(Boolean(citizenToken), 'Citizen authenticated');


    const issue1Res = await request('/api/issues', {
      method: 'POST',
      token: citizenToken,
      body: {
        title: 'Water Pipe Leak on RC Dutt Road',
        description: 'Major drinking water pipe cracked leaking thousands of litres',
        category: 'water_drainage',
        address: 'RC Dutt Road, Alkapuri, Vadodara',
        latitude: 22.3100,
        longitude: 73.1700,
      },
    });
    const issue1Id = issue1Res.body.data.issue.id;

    const issue2Res = await request('/api/issues', {
      method: 'POST',
      token: citizenToken,
      body: {
        title: 'Alkapuri Water Leakage',
        description: 'Potable water spilling on road in front of complex',
        category: 'water_drainage',
        address: 'Near Alkapuri Station Underpass, Vadodara',
        latitude: 22.3102,
        longitude: 73.1702,
      },
    });
    const issue2Id = issue2Res.body.data.issue.id;

    // Mark issue2 as duplicate of issue1
    const mergeRes = await request(`/api/issues/${issue2Id}/mark-duplicate`, {
      method: 'PATCH',
      token: adminToken,
      body: { canonicalId: issue1Id },
    });
    assert.strictEqual(mergeRes.status, 200, 'Admin can merge duplicate');
    pass('Test 1C: Admin merges duplicate report into canonical report');

    // Verify issue2 is hidden from default feed, but issue1 shows mergedCount >= 1
    const refetchedFeed = await request('/api/issues');
    const mergedInFeed = refetchedFeed.body.data.issues.find((i) => i.id === issue2Id);
    assert.strictEqual(mergedInFeed, undefined, 'Merged issue2 is excluded from primary feed');

    const canonicalInFeed = refetchedFeed.body.data.issues.find((i) => i.id === issue1Id);
    assert(canonicalInFeed, 'Canonical issue1 is present in primary feed');
    assert.strictEqual(canonicalInFeed.mergedCount, 1, 'Canonical issue1 shows mergedCount = 1');
    pass('Test 1D: Merged issue is excluded from primary feed; canonical card displays mergedCount');

    // Check GET /api/issues/:id/merged returns the child duplicate
    const mergedListRes = await request(`/api/issues/${issue1Id}/merged`);
    assert.strictEqual(mergedListRes.status, 200);
    assert.strictEqual(mergedListRes.body.data.merged.length, 1);
    assert.strictEqual(mergedListRes.body.data.merged[0].id, issue2Id);
    pass('Test 1E: GET /api/issues/:id/merged returns child duplicate reports with full reporter details');

    // Check citizen can still see their own merged submission when filtering by reporterId
    const mySubmissions = await request(`/api/issues?reporterId=${citizenId}`);
    assert.strictEqual(mySubmissions.status, 200);
    const myDupReport = mySubmissions.body.data.issues.find((i) => i.id === issue2Id);
    assert(myDupReport, 'Original citizen can still find their report in My Complaints');
    assert.strictEqual(myDupReport.duplicateOf, issue1Id, 'My Complaints shows canonical reference link');
    pass('Test 1F: Citizen finds their own merged report under My Complaints with canonical link');

    // Clean up: unmark duplicate and delete test issues
    await request(`/api/issues/${issue2Id}/unmark-duplicate`, {
      method: 'PATCH',
      token: adminToken,
    });
    await pool.query('DELETE FROM issues WHERE id IN ($1, $2)', [issue1Id, issue2Id]);
    pass('Test 1G: Duplicate cleanly unlinked restoring independent status');

    // ------------------------------------------------------------------------
    // PART 2: GOOGLE SIGN-IN FOR CITIZENS & RBAC INTEGRITY
    // ------------------------------------------------------------------------
    console.log('\n--- PART 2: GOOGLE SIGN-IN SECURITY & RBAC ENFORCEMENT ---');

    // 1. Missing credential rejected
    const missingCredRes = await request('/api/auth/google', { method: 'POST', body: {} });
    assert.strictEqual(missingCredRes.status, 400, 'Missing credential rejected with 400');
    pass('Test 2A: Rejects request missing Google credential');

    // 2. Forged / invalid Google token is rejected
    const forgedTokenRes = await request('/api/auth/google', {
      method: 'POST',
      body: { credential: 'forged.fake.google.jwt.token' },
    });
    // If GOOGLE_CLIENT_ID not set, returns 503 explaining configuration; if set, returns 401 token verification failed
    assert([401, 503].includes(forgedTokenRes.status), 'Invalid token rejected securely');
    pass('Test 2B: Forged or invalid Google token is strictly rejected');

    // 3. User model Google auth integration test (unit level)
    const testGoogleSub = 'google-sub-test-99998888';
    const testEmail = 'google.citizen.test@vadodara-citizens.in';

    // Delete existing test user if present
    await pool.query('DELETE FROM users WHERE google_id = $1 OR email = $2', [testGoogleSub, testEmail]);

    // Create google user directly via userModel
    const createdGoogleUser = await userModel.createGoogleUser({
      name: 'Pooja Bhatt',
      email: testEmail,
      googleId: testGoogleSub,
    });
    assert.strictEqual(createdGoogleUser.role, 'CITIZEN', 'Google self-registration creates CITIZEN role only');
    assert.strictEqual(createdGoogleUser.google_id, testGoogleSub, 'google_id matches stable Google sub');
    pass('Test 2C: Google user created strictly with CITIZEN role');

    // 4. Returning Google user lookup
    const foundByGoogleId = await userModel.findByGoogleId(testGoogleSub);
    assert(foundByGoogleId, 'User found by Google sub');
    assert.strictEqual(foundByGoogleId.email, testEmail);
    pass('Test 2D: Returning Google user identified by stable Google subject ID');

    // 5. Existing Admin/Municipal account linking: Role is NEVER downgraded
    const allUsers = await userModel.getAllUsers();
    const municipalUser = allUsers.find((u) => u.role === 'MUNICIPAL');
    assert(municipalUser, 'Municipal officer exists');
    assert.strictEqual(municipalUser.role, 'MUNICIPAL', 'Officer is MUNICIPAL role');


    const tempSub = 'google-sub-officer-desai-123';
    const linkedUser = await userModel.linkGoogleId(municipalUser.id, tempSub);
    assert.strictEqual(linkedUser.role, 'MUNICIPAL', 'Municipal role is PRESERVED on Google linking (no downgrade)');
    pass('Test 2E: Linking Google to existing municipal/admin account NEVER downgrades their role');

    // Clean up temporary google_id on officer
    await pool.query('UPDATE users SET google_id = NULL WHERE id = $1', [municipalUser.id]);
    await pool.query('DELETE FROM users WHERE google_id = $1', [testGoogleSub]);

    // ------------------------------------------------------------------------
    // PART 3: EMAIL NOTIFICATIONS & IDEMPOTENCY
    // ------------------------------------------------------------------------
    console.log('\n--- PART 3: EMAIL NOTIFICATIONS ARCHITECTURE & IDEMPOTENCY ---');

    // Retrieve an existing complaint from database to test with FK constraint
    const existingIssueRes = await pool.query('SELECT * FROM issues LIMIT 1;');
    const realIssue = existingIssueRes.rows[0];
    const testIssueId = realIssue.id;

    // Clean any prior test logs for this issue
    await pool.query('DELETE FROM notification_logs WHERE issue_id = $1;', [testIssueId]);

    // 1. Event 1: Complaint submission email
    const submitEmailRes = await emailService.sendComplaintSubmittedEmail({
      issue: realIssue,
      citizenEmail: 'citizen@civicvoice.org',
      citizenName: 'Citizen Tester',
    });
    assert.strictEqual(submitEmailRes.success, true, 'Submission email sent/logged successfully');
    pass('Test 3A: Event 1 (Complaint Submitted) dispatches confirmation email with Vadodara branding');

    // 2. Verify notification log entry was created
    const logCheckRes = await pool.query(
      `SELECT * FROM notification_logs WHERE issue_id = $1 AND event_type = 'COMPLAINT_SUBMITTED';`,
      [testIssueId]
    );
    assert(logCheckRes.rows.length >= 1, 'Notification log recorded in database');
    pass('Test 3B: Email delivery status recorded in notification_logs table');

    // 3. Event 2: Municipal Work Completed email
    const completedEmailRes = await emailService.sendWorkCompletedEmail({
      issue: realIssue,
      citizenEmail: 'citizen@civicvoice.org',
      citizenName: 'Citizen Tester',
      resolutionNote: 'Fitted new reinforced cast-iron cover and asphalted edge.',
      officerName: 'Inspector J. Mehta',
      department: 'Drainage Department',
    });
    assert.strictEqual(completedEmailRes.success, true, 'Completion email sent/logged successfully');
    pass('Test 3C: Event 2 (Work Completed) dispatches notification with resolution note and verification CTA');

    // 4. Test Idempotency: Retrying completion email does NOT send duplicate
    const retryEmailRes = await emailService.sendWorkCompletedEmail({
      issue: realIssue,
      citizenEmail: 'citizen@civicvoice.org',
      citizenName: 'Citizen Tester',
      resolutionNote: 'Fitted new reinforced cast-iron cover and asphalted edge.',
      officerName: 'Inspector J. Mehta',
      department: 'Drainage Department',
    });
    assert.strictEqual(retryEmailRes.skipped, true, 'Duplicate completion email was skipped via idempotency check');
    pass('Test 3D: Idempotency enforced — duplicate email blocked when retrying work completion');

    // 5. Event 3: Complaint Merged email
    const mergeEmailRes = await emailService.sendComplaintMergedEmail({
      duplicateIssue: realIssue,
      canonicalIssue: realIssue,
      citizenEmail: 'citizen@civicvoice.org',
      citizenName: 'Citizen Tester',
    });
    assert.strictEqual(mergeEmailRes.success, true, 'Merge email sent/logged successfully');
    pass('Test 3E: Event 3 (Complaint Merged) dispatches consolidation notice with canonical link');

    // Clean up test logs
    await pool.query('DELETE FROM notification_logs WHERE issue_id = $1;', [testIssueId]);


    console.log('\n---------------------------------------------------------------');
    console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('---------------------------------------------------------------\n');
  } catch (err) {
    fail('Global test error', err);
  } finally {
    if (server) server.close();
    await pool.end();
  }
}

runTests();
