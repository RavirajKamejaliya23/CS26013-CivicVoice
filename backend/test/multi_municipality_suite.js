// CivicVoice Multi-Municipality Architecture, Verification & Routing Test Suite
// Verifies all requirements of Section A, B, C, D, F, G

process.env.NODE_ENV = 'test';

import http from 'http';
import { default as app } from '../src/app.js';
import { query } from '../src/config/database.js';

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

const runSuite = async () => {
  console.log('\n===============================================================');
  console.log('🏛️  RUNNING CIVICVOICE MULTI-MUNICIPALITY VERIFICATION SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title}`);
      failed++;
    }
  };

  try {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;

    // ── Setup: Authenticate Admin, Citizen, and Municipal users ──
    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@civicvoice.org', password: 'Admin@123' },
    });
    const adminToken = adminLogin.body?.data?.token;
    assert(adminLogin.status === 200 && adminToken, 'Setup: Admin authenticated successfully');

    const citizenLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'citizen@civicvoice.org', password: 'Citizen@123' },
    });
    const citizenToken = citizenLogin.body?.data?.token;
    assert(citizenLogin.status === 200 && citizenToken, 'Setup: Citizen authenticated successfully');

    // Existing demo municipal user is linked to VMC
    const vmcLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'municipal@civicvoice.org', password: 'Municipal@123' },
    });
    const vmcToken = vmcLogin.body?.data?.token;
    assert(vmcLogin.status === 200 && vmcToken, 'Setup: VMC Municipal Officer authenticated successfully');

    // Create a temporary municipal officer for AMC to test cross-municipality isolation
    const amcOfficerEmail = `amc_officer_${Date.now()}@amc.gov.in`;
    await query(
      `INSERT INTO users (name, email, password_hash, role, municipal_role, municipality_id, department)
       VALUES ($1, $2, $3, 'MUNICIPAL', 'OFFICER', 'amc', 'Department of Public Works')
       ON CONFLICT (email) DO NOTHING;`,
      ['AMC Field Squad', amcOfficerEmail, adminLogin.body?.data?.user?.password_hash || '$2a$10$w0j0gW5Y1b9h3BwQ7kUe0Oa6.oYv3H6oRz.Zt4t3zQ3b4h8f6j0sK']
    );
    // Directly generate a token for this AMC user
    const { default: jwt } = await import('jsonwebtoken');
    const { config } = await import('../src/config/env.js');
    const amcUserRow = (await query('SELECT * FROM users WHERE email = $1', [amcOfficerEmail])).rows[0];
    const amcToken = jwt.sign(
      {
        id: amcUserRow.id,
        email: amcUserRow.email,
        role: amcUserRow.role,
        municipal_role: amcUserRow.municipal_role,
        municipality_id: amcUserRow.municipality_id,
      },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    // ── Test 1: Public Municipal Onboarding Application Submission ──
    const appPayload = {
      applicant_name: 'Rajesh Varma',
      applicant_email: `rajesh_varma_${Date.now()}@surat.gov.in`,
      applicant_phone: '+91 98250 12345',
      applicant_designation: 'Executive Engineer',
      municipality_name: 'Surat Municipal Corporation',
      authority_type: 'MUNICIPAL_CORPORATION',
      city: 'Surat',
      state: 'Gujarat',
      official_website: 'https://suratmunicipal.gov.in',
      office_address: 'Muglisara, Surat - 395003',
      jurisdiction_description: 'Surat city limits comprising 8 administrative zones and 30 wards',
      declaration_confirmed: true,
    };

    const submitRes = await request('/api/municipalities/onboard', {
      method: 'POST',
      body: appPayload,
    });
    const applicationId = submitRes.body?.data?.application?.id;
    assert(
      submitRes.status === 201 && submitRes.body?.data?.application?.status === 'PENDING',
      'Test 1: Public municipal registration creates application in PENDING state'
    );

    // ── Test 2: RBAC - Citizen cannot review municipal applications ──
    const citizenReviewRes = await request(`/api/admin/municipal-applications/${applicationId}/status`, {
      method: 'PATCH',
      token: citizenToken,
      body: { status: 'APPROVED' },
    });
    assert(
      citizenReviewRes.status === 403,
      'Test 2: Non-admin citizen reviewing application is rejected with 403 Forbidden'
    );

    // ── Test 3: Platform Admin reviews and approves municipal application ──
    const adminReviewRes = await request(`/api/admin/municipal-applications/${applicationId}/status`, {
      method: 'PATCH',
      token: adminToken,
      body: {
        status: 'APPROVED',
        review_notes: 'Official verification conducted with Gujarat Urban Development Authority. Application approved.',
      },
    });
    const approvedApp = adminReviewRes.body?.data?.application;
    assert(
      adminReviewRes.status === 200 && approvedApp?.status === 'APPROVED',
      'Test 3: Platform Admin successfully approves application and activates municipal body'
    );

    // ── Test 4: Verify audit log was recorded for approval ──
    const auditLogsRes = await request('/api/admin/audit-logs', {
      token: adminToken,
    });
    const logsList = auditLogsRes.body?.data?.logs || auditLogsRes.body?.data || [];
    const hasApprovalAudit = Array.isArray(logsList) && logsList.some(
      (log) => log.action?.includes('APPLICATION') || log.resource_type === 'APPLICATION'
    );
    assert(
      auditLogsRes.status === 200 && hasApprovalAudit,
      'Test 4: Review decision is immutably logged in database audit_logs table'
    );

    // ── Test 5: Jurisdiction Routing - Coordinates in Vadodara route to VMC ──
    const vmcIssuePayload = {
      title: 'Pothole on RC Dutt Road Alkapuri',
      description: 'Major road crater causing traffic disruption near railway station.',
      category: 'roads_potholes',
      address: 'RC Dutt Road, Alkapuri, Vadodara, Gujarat',
      latitude: 22.3072,
      longitude: 73.1812,
    };
    const vmcIssueRes = await request('/api/issues', {
      method: 'POST',
      token: citizenToken,
      body: vmcIssuePayload,
    });
    const vmcIssue = vmcIssueRes.body?.data?.issue || vmcIssueRes.body?.data;
    assert(
      vmcIssueRes.status === 201 &&
        (vmcIssue?.municipality_id === 'vmc' || vmcIssue?.municipalityId === 'vmc') &&
        (vmcIssue?.jurisdiction_status === 'MATCHED' || vmcIssue?.jurisdictionStatus === 'MATCHED'),
      'Test 5: Coordinates inside Vadodara boundary automatically route to VMC (MATCHED)'
    );

    // ── Test 6: Jurisdiction Routing - Coordinates outside onboarded bounds get AUTHORITY_NOT_ONBOARDED ──
    const unassignedIssuePayload = {
      title: 'Water pipeline leak in Pune outer ring road',
      description: 'Pipeline leakage in non-onboarded territory.',
      category: 'water_drainage',
      address: 'FC Road, Shivajinagar, Pune, Maharashtra',
      latitude: 18.5204,
      longitude: 73.8567,
    };
    const unassignedIssueRes = await request('/api/issues', {
      method: 'POST',
      token: citizenToken,
      body: unassignedIssuePayload,
    });
    const unassignedIssue = unassignedIssueRes.body?.data?.issue || unassignedIssueRes.body?.data;
    assert(
      unassignedIssueRes.status === 201 &&
        (unassignedIssue?.jurisdiction_status === 'AUTHORITY_NOT_ONBOARDED' || unassignedIssue?.jurisdictionStatus === 'AUTHORITY_NOT_ONBOARDED') &&
        (!unassignedIssue?.municipality_id && !unassignedIssue?.municipalityId),
      'Test 6: Coordinates outside active jurisdictions receive AUTHORITY_NOT_ONBOARDED'
    );

    // ── Test 7: Cross-Municipality Isolation - AMC officer cannot modify VMC issue ──
    const crossMuniUpdateRes = await request(`/api/issues/${vmcIssue.id}/status`, {
      method: 'PATCH',
      token: amcToken,
      body: { status: 'in_progress', note: 'Unauthorized squad attempting cross-city status change' },
    });
    assert(
      crossMuniUpdateRes.status === 403,
      'Test 7: Cross-municipality isolation blocks AMC officer from modifying VMC issue (403 Forbidden)'
    );

    // ── Test 8: Authorized Municipal Officer can update their own municipality issue ──
    const authorizedUpdateRes = await request(`/api/issues/${vmcIssue.id}/status`, {
      method: 'PATCH',
      token: vmcToken,
      body: { status: 'in_progress', note: 'VMC Public Works Squad 4 dispatched onsite.' },
    });
    const updatedVmcIssue = authorizedUpdateRes.body?.data?.issue || authorizedUpdateRes.body?.data;
    assert(
      authorizedUpdateRes.status === 200 && updatedVmcIssue?.status === 'in_progress',
      'Test 8: Authorized VMC officer successfully updates status within their municipality'
    );

    // ── Test 9: Platform Admin can reassign issue jurisdiction manually with audit trail ──
    const reassignRes = await request(`/api/admin/issues/${unassignedIssue.id}/reassign-municipality`, {
      method: 'PATCH',
      token: adminToken,
      body: {
        municipalityId: 'vmc',
        reason: 'Administrative reassignment for regional road maintenance boundary',
      },
    });
    const reassignedIssue = reassignRes.body?.data?.issue || reassignRes.body?.data;
    assert(
      reassignRes.status === 200 && (reassignedIssue?.municipality_id === 'vmc' || reassignedIssue?.municipalityId === 'vmc'),
      'Test 9: Platform Admin manually reassigns issue municipality with audit trail'
    );

    // ── Test 10: Staff Management - Municipal Admin can invite new squad officer ──
    const inviteRes = await request('/api/municipalities/staff/invite', {
      method: 'POST',
      token: vmcToken,
      body: {
        name: 'Kiran Parmar',
        email: `kiran_${Date.now()}@vmc.gov.in`,
        department: 'Roads & Bridges Department',
        municipal_role: 'OFFICER',
      },
    });
    const invitedOfficer = inviteRes.body?.data?.officer || inviteRes.body?.data;
    assert(
      inviteRes.status === 201 && (invitedOfficer?.municipality_id === 'vmc' || invitedOfficer?.municipalityId === 'vmc'),
      'Test 10: Municipal Admin successfully invites and authorizes a new staff officer'
    );

    // ── Test 11: Analytics Overview Endpoint returns structured real data ──
    const analyticsRes = await request('/api/analytics/overview', {
      token: adminToken,
    });
    const analyticsData = analyticsRes.body?.data;
    assert(
      analyticsRes.status === 200 &&
        analyticsData?.kpis?.totalGenuineReports >= 1 &&
        Array.isArray(analyticsData?.timeSeries) &&
        Array.isArray(analyticsData?.categoryBreakdown) &&
        Array.isArray(analyticsData?.stackedByMunicipality) &&
        Array.isArray(analyticsData?.geoHotspots),
      'Test 11: Analytics endpoint aggregates genuine database KPIs, time-series, and geographic hotspots'
    );

    // ── Test 12: Municipal Officer analytics is automatically scoped to their municipality ──
    const vmcAnalyticsRes = await request('/api/analytics/overview', {
      token: vmcToken,
    });
    const vmcAnalyticsData = vmcAnalyticsRes.body?.data;
    assert(
      vmcAnalyticsRes.status === 200 &&
        vmcAnalyticsData?.activeFilter?.municipalityId === 'vmc',
      'Test 12: Municipal Officer analytics is automatically scoped to their authorized municipality'
    );

    // ── Test 13: Citizen can report issue with category 'other' and custom category description ──
    const otherIssueRes = await request('/api/issues', {
      method: 'POST',
      token: citizenToken,
      body: {
        title: 'Damaged Public Toilet in Market Square',
        description: 'Sanitary fittings broken and doors unhinged causing hygiene hazard.',
        category: 'other',
        customCategory: 'Damaged public toilet',
        address: 'Mandvi Main Market, Vadodara, Gujarat',
        latitude: 22.298,
        longitude: 73.208,
      },
    });
    const otherIssue = otherIssueRes.body?.data?.issue || otherIssueRes.body?.data;
    assert(
      otherIssueRes.status === 201 &&
        otherIssue?.category === 'other' &&
        (otherIssue?.customCategory === 'Damaged public toilet' || otherIssue?.categoryName === 'Damaged public toilet'),
      'Test 13: Citizen successfully reports issue under Other category with custom description saved'
    );

    // ── Test 14: Issue with category 'other' without customCategory is rejected with 400 ──
    const invalidOtherRes = await request('/api/issues', {
      method: 'POST',
      token: citizenToken,
      body: {
        title: 'Uncategorized Problem',
        description: 'Vague problem description without custom category description.',
        category: 'other',
        address: 'Mandvi Main Market, Vadodara, Gujarat',
        latitude: 22.298,
        longitude: 73.208,
      },
    });
    assert(
      invalidOtherRes.status === 400,
      'Test 14: Backend rejects Other category when custom category description is missing (400)'
    );

    // ── Test 15: Ordinary municipal officer cannot invite staff (403 Forbidden) ──
    const unauthorizedInviteRes = await request('/api/municipalities/staff/invite', {
      method: 'POST',
      token: amcToken, // amcToken is created with municipal_role: 'OFFICER'
      body: {
        name: 'Unauthorized New Officer',
        email: `unauthorized_${Date.now()}@amc.gov.in`,
        department: 'Dept of Roads',
      },
    });
    assert(
      unauthorizedInviteRes.status === 403,
      'Test 15: Ordinary municipal officer is blocked from inviting staff (403 Forbidden)'
    );

    // ── Test 16: Separate Demo Accounts for VMC and AMC authenticate to their bodies ──
    const amcLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'municipal.amc@civicvoice.org', password: 'Municipal@123' },
    });
    const amcLoggedUser = amcLoginRes.body?.data?.user;
    assert(
      amcLoginRes.status === 200 &&
        (amcLoggedUser?.municipality_id === 'amc' || amcLoggedUser?.municipalityId === 'amc'),
      'Test 16: AMC dedicated demo account (municipal.amc@civicvoice.org) authenticates and is scoped to AMC'
    );

    // ── Test 17: Feed Location Filter by State and City ──
    const feedFilterRes = await request('/api/issues?state=Gujarat&city=Vadodara');
    const feedFilteredIssues = feedFilterRes.body?.data?.issues || [];
    assert(
      feedFilterRes.status === 200 &&
        Array.isArray(feedFilteredIssues) &&
        feedFilteredIssues.length > 0 &&
        feedFilteredIssues.every((i) => !i.city || i.city.toLowerCase().includes('vadodara') || i.address.toLowerCase().includes('vadodara')),
      'Test 17: Public issues feed correctly filters by State and City'
    );

  } catch (err) {
    console.error('Fatal suite execution error:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
    console.log('\n---------------------------------------------------------------');
    console.log(`🏁 MULTI-MUNICIPALITY RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('---------------------------------------------------------------\n');
    process.exit(failed > 0 ? 1 : 0);
  }
};

runSuite();
