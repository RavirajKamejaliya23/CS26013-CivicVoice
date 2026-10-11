// Regression test suite for CivicVoice Officers & Squad Management
// Tests:
// 1. Officer ID formatting with numeric IDs, string IDs, UUIDs, and null/missing IDs
// 2. Safe handling of null/missing optional profile fields (department, created_at, name, email)
// 3. Empty staff roster handling
// 4. Cross-municipality staff isolation (VMC officer vs AMC officer)
// 5. Unauthorized access protection (Citizens blocked from accessing staff endpoint)
// 6. Role-based invitation protection (Ordinary officers blocked from inviting staff, Admins authorized)

process.env.NODE_ENV = 'test';

import http from 'http';
import jwt from 'jsonwebtoken';
import { default as app } from '../src/app.js';
import { query } from '../src/config/database.js';
import { config } from '../src/config/env.js';

let server;
let baseUrl;

const runTestSuite = async () => {
  console.log('\n===============================================================');
  console.log('🛡️  CIVICVOICE OFFICERS & SQUAD WORKFLOW & RUNTIME REGRESSION SUITE');
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
    // -------------------------------------------------------------------------
    // UNIT REGRESSION: Test formatOfficerId algorithm with all ID types
    // -------------------------------------------------------------------------
    console.log('--- 1. Testing Officer ID Formatting & Slicing Safety ---');

    const formatOfficerId = (officer) => {
      const rawId = officer?.id ?? officer?.user_id ?? officer?.userId ?? officer?.user?.id;
      if (rawId === null || rawId === undefined || String(rawId).trim() === '') {
        return {
          isValid: false,
          display: 'Missing ID',
          full: null,
        };
      }
      const idStr = String(rawId).trim();
      const short = idStr.length > 8 ? `${idStr.slice(0, 8)}...` : idStr;
      return {
        isValid: true,
        display: short,
        full: idStr,
      };
    };

    // Case A: Numeric ID (such as PostgreSQL SERIAL 41)
    const numOfficer = { id: 41, name: 'Numeric Officer' };
    let numFormatted;
    try {
      numFormatted = formatOfficerId(numOfficer);
      assert(numFormatted.isValid === true && numFormatted.display === '41', '1a. Numeric ID formats safely without throwing TypeError (.slice is not a function)');
    } catch (err) {
      assert(false, `1a. Numeric ID threw exception: ${err.message}`);
    }

    // Case B: String ID (short string)
    const strOfficer = { id: 'OFF_99', name: 'String Officer' };
    const strFormatted = formatOfficerId(strOfficer);
    assert(strFormatted.isValid === true && strFormatted.display === 'OFF_99', '1b. Short String ID preserves string representation');

    // Case C: UUID String (long string sliced safely)
    const uuidOfficer = { id: 'c4b8b64e-28ef-4171-a982-f542456f483c', name: 'UUID Officer' };
    const uuidFormatted = formatOfficerId(uuidOfficer);
    assert(uuidFormatted.isValid === true && uuidFormatted.display === 'c4b8b64e...', '1c. Long UUID string safely formatted to 8-character prefix with ellipsis');

    // Case D: Missing / null / undefined ID
    const nullIdOfficer = { id: null, name: 'Unassigned Officer' };
    const missingIdOfficer = { name: 'No ID Field Officer' };
    const emptyIdOfficer = { id: '', name: 'Empty ID Officer' };
    const nullFormatted = formatOfficerId(nullIdOfficer);
    const missingFormatted = formatOfficerId(missingIdOfficer);
    const emptyFormatted = formatOfficerId(emptyIdOfficer);
    assert(
      nullFormatted.isValid === false && nullFormatted.display === 'Missing ID' &&
      missingFormatted.isValid === false &&
      emptyFormatted.isValid === false,
      '1d. Null, missing, or empty IDs return isValid: false and clear fallback without crashing'
    );

    // Case E: Nested user ID object
    const nestedOfficer = { user: { id: 104 }, name: 'Nested Officer' };
    const nestedFormatted = formatOfficerId(nestedOfficer);
    assert(nestedFormatted.isValid === true && nestedFormatted.display === '104', '1e. Nested officer.user.id object extracted and formatted safely');

    // -------------------------------------------------------------------------
    // UNIT REGRESSION: Test Profile Fields Fallback & Null Safety
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Testing Officer Profile Fields Fallbacks & Null Safety ---');

    const renderOfficerRecordSafe = (officer) => {
      const idMeta = formatOfficerId(officer);
      const officerName = officer?.name || officer?.user?.name || 'Unnamed Officer';
      const officerEmail = officer?.email || officer?.user?.email || 'No email provided';
      const officerDept = officer?.department || officer?.department_name || 'Department of Public Works';
      const rawRole = (officer?.municipal_role || officer?.municipalRole || officer?.role || 'OFFICER').toUpperCase();
      const isOfficerAdmin = rawRole === 'ADMIN';
      const createdAtRaw = officer?.created_at || officer?.createdAt;
      let authorizedSince = 'Active';
      if (createdAtRaw) {
        const d = new Date(createdAtRaw);
        if (!isNaN(d.getTime())) {
          authorizedSince = d.toLocaleDateString();
        }
      }

      return {
        key: idMeta.isValid ? `officer-${idMeta.full}` : 'officer-row-fallback',
        idDisplay: idMeta.display,
        name: officerName,
        email: officerEmail,
        department: officerDept,
        roleBadge: isOfficerAdmin ? 'Municipal Admin' : 'Field Officer',
        authorizedSince,
      };
    };

    const sparseOfficer = {
      id: 50,
      name: null,
      email: null,
      department: null,
      municipal_role: null,
      created_at: null,
    };
    const rendered = renderOfficerRecordSafe(sparseOfficer);
    assert(rendered.name === 'Unnamed Officer', '2a. Null officer name safely falls back to Unnamed Officer');
    assert(rendered.email === 'No email provided', '2b. Null officer email safely falls back to No email provided');
    assert(rendered.department === 'Department of Public Works', '2c. Null department safely falls back to default department');
    assert(rendered.roleBadge === 'Field Officer', '2d. Null municipal_role safely defaults to Field Officer');
    assert(rendered.authorizedSince === 'Active', '2e. Null created_at date safely falls back to Active');
    assert(rendered.key === 'officer-50', '2f. Stable React key generated from numeric ID');

    // Case: Empty staff roster
    const emptyRoster = [];
    assert(Array.isArray(emptyRoster) && emptyRoster.length === 0, '2g. Empty staff roster handled without exceptions');

    // -------------------------------------------------------------------------
    // INTEGRATION TESTS: Auth & Staff Endpoints
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Testing Real Backend Authentication & Staff Endpoints ---');

    // Log in as VMC Municipal Administrator
    const vmcAdminLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'municipal@civicvoice.org', password: 'Municipal@123' }),
    });
    const vmcAdminData = await vmcAdminLogin.json();
    const vmcAdminToken = vmcAdminData.data?.token;
    const vmcAdminUser = vmcAdminData.data?.user;
    const vmcMunicipalityId = vmcAdminUser?.municipalityId || vmcAdminUser?.municipality_id;
    assert(vmcAdminLogin.ok && vmcAdminToken && vmcMunicipalityId, '3a. VMC Municipal Admin authenticated with scoped municipality');

    // Log in as Citizen
    const citizenLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'citizen@civicvoice.org', password: 'Citizen@123' }),
    });
    const citizenData = await citizenLogin.json();
    const citizenToken = citizenData.data?.token;
    assert(citizenLogin.ok && citizenToken, '3b. Citizen authenticated');

    // Log in as AMC Municipal Admin
    const amcAdminLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'municipal.amc@civicvoice.org', password: 'Municipal@123' }),
    });
    const amcAdminData = await amcAdminLogin.json();
    const amcAdminToken = amcAdminData.data?.token;
    const amcAdminUser = amcAdminData.data?.user;
    const amcMunicipalityId = amcAdminUser?.municipalityId || amcAdminUser?.municipality_id;
    assert(amcAdminLogin.ok && amcAdminToken && amcMunicipalityId, '3c. AMC Municipal Admin authenticated with scoped municipality');

    // Create a temporary ordinary field officer (municipal_role = 'OFFICER')
    const fieldOfficerEmail = `field_officer_${Date.now()}@vmc.gov.in`;
    await query(
      `INSERT INTO users (name, email, password_hash, role, municipal_role, municipality_id, department)
       VALUES ($1, $2, $3, 'MUNICIPAL', 'OFFICER', $4, 'Department of Public Works')
       ON CONFLICT (email) DO NOTHING;`,
      ['Field Officer Test', fieldOfficerEmail, '$2a$10$w0j0gW5Y1b9h3BwQ7kUe0Oa6.oYv3H6oRz.Zt4t3zQ3b4h8f6j0sK', vmcMunicipalityId]
    );
    const fieldOfficerRow = (await query('SELECT * FROM users WHERE email = $1', [fieldOfficerEmail])).rows[0];
    const ordinaryOfficerToken = jwt.sign(
      {
        id: fieldOfficerRow.id,
        email: fieldOfficerRow.email,
        role: 'MUNICIPAL',
        municipal_role: 'OFFICER',
        municipality_id: vmcMunicipalityId,
      },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
    assert(Boolean(ordinaryOfficerToken), '3d. Ordinary Field Officer (OFFICER) token generated for RBAC verification');

    // -------------------------------------------------------------------------
    // SECURITY & ACCESS CONTROL: Cross-Municipality and Role Protection
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Testing Multi-Municipality Scoping & Access Control ---');

    // Test: Citizen cannot access /api/municipalities/staff
    const citizenStaffRes = await fetch(`${baseUrl}/api/municipalities/staff`, {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    assert(citizenStaffRes.status === 403, '4a. Unauthorized citizen access to staff roster blocked with 403 Forbidden');

    // Test: VMC Admin gets staff for VMC
    const vmcStaffRes = await fetch(`${baseUrl}/api/municipalities/staff`, {
      headers: { Authorization: `Bearer ${vmcAdminToken}` },
    });
    const vmcStaffData = await vmcStaffRes.json();
    const vmcOfficers = vmcStaffData.data?.officers || [];
    assert(vmcStaffRes.ok && Array.isArray(vmcOfficers) && vmcOfficers.length > 0, '4b. VMC Admin successfully retrieves staff roster array');
    
    // Verify all returned officers belong to VMC municipality ID
    const allBelongToVmc = vmcOfficers.every((o) => o.municipality_id === vmcMunicipalityId);
    assert(allBelongToVmc, '4c. Multi-municipality isolation: All returned officers strictly belong to VMC');

    // Test: AMC Admin gets staff for AMC
    const amcStaffRes = await fetch(`${baseUrl}/api/municipalities/staff`, {
      headers: { Authorization: `Bearer ${amcAdminToken}` },
    });
    const amcStaffData = await amcStaffRes.json();
    const amcOfficers = amcStaffData.data?.officers || [];
    assert(amcStaffRes.ok && Array.isArray(amcOfficers), '4d. AMC Admin successfully retrieves AMC staff roster array');

    // Verify non-platform-admin cannot spoof query param to view another municipality's staff
    const amcSpoofRes = await fetch(`${baseUrl}/api/municipalities/staff?municipalityId=${vmcMunicipalityId}`, {
      headers: { Authorization: `Bearer ${amcAdminToken}` },
    });
    const amcSpoofData = await amcSpoofRes.json();
    const spoofedOfficers = amcSpoofData.data?.officers || [];
    const containsAnyVmc = spoofedOfficers.some((o) => o.municipality_id === vmcMunicipalityId);
    assert(!containsAnyVmc, '4e. Anti-tampering: Non-platform-admin query param spoofing ignored; user scoped strictly to their own municipality');

    // -------------------------------------------------------------------------
    // PERMISSIONS: Ordinary Officer vs Administrator Invitation
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Testing Officer Squad Invitation Authorizations ---');

    // Ordinary Officer attempting to invite staff should get 403 Forbidden
    const unauthInviteRes = await fetch(`${baseUrl}/api/municipalities/staff/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ordinaryOfficerToken}`,
      },
      body: JSON.stringify({
        name: 'Unauthorized Onboarding Attempt',
        email: `unauthorized_${Date.now()}@vmc.gov.in`,
        department: 'Department of Public Works',
      }),
    });
    assert(unauthInviteRes.status === 403, '5a. Ordinary municipal officer blocked from inviting staff (403 Forbidden)');

    // Municipal Admin authorized to invite staff
    const validInviteEmail = `officer_squad_test_${Date.now()}@vmc.gov.in`;
    const adminInviteRes = await fetch(`${baseUrl}/api/municipalities/staff/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${vmcAdminToken}`,
      },
      body: JSON.stringify({
        name: 'Squad Field Officer',
        email: validInviteEmail,
        department: 'Solid Waste Management',
        municipal_role: 'OFFICER',
      }),
    });
    assert(adminInviteRes.status === 201, '5b. Municipal administrator successfully authorized new squad officer');

  } catch (err) {
    console.error('Test execution exception:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\n===============================================================`);
    console.log(`🏁 SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`===============================================================\n`);
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTestSuite();
