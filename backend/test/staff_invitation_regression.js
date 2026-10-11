// Regression test for api.municipalStaff.inviteStaff and staff management
process.env.NODE_ENV = 'test';

import http from 'http';
import { default as app } from '../src/app.js';
import { query } from '../src/config/database.js';

let server;
let baseUrl;

const runTest = async () => {
  console.log('\n===============================================================');
  console.log('🧪 STAFF INVITATION WORKFLOW REGRESSION TEST');
  console.log('===============================================================\n');

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;

  let passed = 0;
  let failed = 0;

  const assert = (cond, msg) => {
    if (cond) {
      console.log(`✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${msg}`);
      failed++;
    }
  };

  try {
    // 1. Authenticate Municipal Admin (VMC)
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'municipal@civicvoice.org', password: 'Municipal@123' }),
    });
    const loginData = await loginRes.json();
    const vmcToken = loginData.data?.token;
    assert(loginRes.ok && vmcToken, '1. VMC Municipal Admin authenticated');

    // 2. Mirror api.municipalStaff client methods
    const municipalStaffClient = {
      getStaff: async (token) => {
        const res = await fetch(`${baseUrl}/api/municipalities/staff`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = await res.json();
        return d.data?.officers || [];
      },
      inviteStaff: async (token, officerData) => {
        const res = await fetch(`${baseUrl}/api/municipalities/staff/invite`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(officerData),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.message || 'Invitation failed');
        return d.data?.officer || d.data;
      },
    };

    // 3. Test getStaff
    const initialStaff = await municipalStaffClient.getStaff(vmcToken);
    assert(Array.isArray(initialStaff) && initialStaff.length > 0, '2. municipalStaff.getStaff returns array of officers');

    // 4. Test inviteStaff with valid payload
    const testOfficerEmail = `test_officer_${Date.now()}@vmc.gov.in`;
    const invitePayload = {
      name: 'Rohan Joshi',
      email: testOfficerEmail,
      department: 'Department of Public Works',
      municipal_role: 'OFFICER',
    };
    const createdOfficer = await municipalStaffClient.inviteStaff(vmcToken, invitePayload);
    assert(
      createdOfficer && createdOfficer.email === testOfficerEmail.toLowerCase(),
      '3. municipalStaff.inviteStaff creates new officer successfully'
    );

    // 5. Verify the officer now appears in getStaff
    const updatedStaff = await municipalStaffClient.getStaff(vmcToken);
    assert(
      updatedStaff.some((u) => u.email === testOfficerEmail.toLowerCase()),
      '4. Newly invited officer appears in staff roster'
    );

    // 6. Test inviteStaff rejection with invalid email
    let errorCaught = false;
    try {
      await municipalStaffClient.inviteStaff(vmcToken, {
        name: 'Invalid Email Person',
        email: 'not-an-email',
      });
    } catch (err) {
      errorCaught = true;
      assert(err.message.includes('valid email'), '5. Invalid email rejected with clear error message');
    }
    assert(errorCaught, '5b. Error thrown for invalid email');

    // 7. Verify invitation record in database
    const invRow = await query('SELECT * FROM municipal_invitations WHERE email = $1', [testOfficerEmail.toLowerCase()]);
    assert(
      invRow.rows.length > 0 && invRow.rows[0].invitation_token.startsWith('inv_'),
      '6. Municipal invitation record with secure token generated in database'
    );

  } catch (err) {
    console.error('Test execution failed:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTest();
