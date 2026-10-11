import * as municipalityModel from '../models/municipalityModel.js';
import * as userModel from '../models/userModel.js';
import * as jurisdictionService from '../services/jurisdictionService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import bcrypt from 'bcryptjs';

// ============================================================================
// PUBLIC MUNICIPALITY APIS
// ============================================================================

export const getMunicipalities = async (req, res, next) => {
  try {
    const { status } = req.query;
    const municipalities = await municipalityModel.getAllMunicipalities({ status });
    return sendSuccess(res, { municipalities }, 'Municipal bodies retrieved.');
  } catch (error) {
    next(error);
  }
};

export const getMunicipalityById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const municipality = await municipalityModel.getMunicipalityById(id);
    if (!municipality) {
      return sendError(res, `Municipal body '${id}' not found.`, 404);
    }
    return sendSuccess(res, { municipality }, 'Municipality details retrieved.');
  } catch (error) {
    next(error);
  }
};

export const submitApplication = async (req, res, next) => {
  try {
    const applicantName = req.body.applicantName || req.body.applicant_name;
    const applicantEmail = req.body.applicantEmail || req.body.applicant_email;
    const applicantRole = req.body.applicantRole || req.body.applicant_role || req.body.applicant_designation;
    const applicantPhone = req.body.applicantPhone || req.body.applicant_phone;
    const municipalityName = req.body.municipalityName || req.body.municipality_name;
    const authorityType = req.body.authorityType || req.body.authority_type;
    const city = req.body.city;
    const state = req.body.state;
    const officialWebsite = req.body.officialWebsite || req.body.official_website;
    const officeAddress = req.body.officeAddress || req.body.office_address;
    const jurisdictionDetails = req.body.jurisdictionDetails || req.body.jurisdiction_details || req.body.jurisdiction_description;
    const supportingDocuments = req.body.supportingDocuments || req.body.supporting_documents;
    const declarationConfirmed = req.body.declarationConfirmed !== undefined ? req.body.declarationConfirmed : req.body.declaration_confirmed;

    if (!applicantName || !applicantEmail || !applicantRole || !municipalityName || !authorityType || !city || !state) {
      return sendError(
        res,
        'Missing required fields. Applicant name, email, role, municipality name, authority type, city, and state are required.',
        400
      );
    }

    if (!declarationConfirmed) {
      return sendError(
        res,
        'You must confirm that you are authorized to submit this onboarding application.',
        400
      );
    }

    const application = await municipalityModel.createApplication({
      applicantName,
      applicantEmail,
      applicantRole,
      applicantPhone,
      municipalityName,
      authorityType,
      city,
      state,
      officialWebsite,
      officeAddress,
      jurisdictionDetails,
      supportingDocuments,
    });

    // Record audit log
    await municipalityModel.recordAuditLog({
      userEmail: applicantEmail,
      userRole: 'APPLICANT',
      action: 'MUNICIPALITY_APPLICATION_SUBMITTED',
      resourceType: 'APPLICATION',
      resourceId: application.id,
      details: {
        applicationNo: application.applicationNo,
        municipalityName,
        city,
        state,
      },
      ipAddress: req.ip,
    });

    return sendSuccess(
      res,
      { application },
      'Municipal registration application submitted successfully. It will be reviewed by platform administrators.',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const checkJurisdiction = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.query;
    const result = await jurisdictionService.routeCoordinatesToMunicipality(latitude, longitude);
    return sendSuccess(res, result, 'Jurisdiction routing evaluated.');
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// ADMIN MUNICIPALITY APIS (Platform Admin Only)
// ============================================================================

export const getApplications = async (req, res, next) => {
  try {
    const { status } = req.query;
    const applications = await municipalityModel.getAllApplications({ status });
    return sendSuccess(res, { applications }, 'Municipal applications retrieved.');
  } catch (error) {
    next(error);
  }
};

export const getApplicationDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await municipalityModel.getApplicationById(id);
    if (!application) {
      return sendError(res, `Application '${id}' not found.`, 404);
    }
    return sendSuccess(res, { application }, 'Application details retrieved.');
  } catch (error) {
    next(error);
  }
};

export const reviewApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, rejectionReason, createBody = true } = req.body;

    const validStatuses = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_INFORMATION'];
    if (!status || !validStatuses.includes(status)) {
      return sendError(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const application = await municipalityModel.getApplicationById(id);
    if (!application) {
      return sendError(res, `Application '${id}' not found.`, 404);
    }

    const updated = await municipalityModel.updateApplicationStatus(id, {
      status,
      adminNotes,
      rejectionReason,
      reviewedBy: req.user.id,
      reviewerName: req.user.name,
      action: status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : 'STATUS_CHANGE',
    });

    let createdMunicipality = null;
    let invitation = null;

    // If APPROVED, activate or create the municipal body and issue invitation
    if (status === 'APPROVED' && createBody) {
      const code = application.municipalityName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 8) || 'MC';
      const bodyId = (application.city + '_' + code).toLowerCase().replace(/[^a-z0-9_]/g, '_');

      // Check if body already exists or create
      const existing = await municipalityModel.getMunicipalityById(bodyId);
      if (!existing) {
        createdMunicipality = await municipalityModel.createMunicipality({
          id: bodyId,
          code,
          name: application.municipalityName,
          state: application.state,
          city: application.city,
          authorityType: application.authorityType,
          officialWebsite: application.officialWebsite,
          contactEmail: application.applicantEmail,
          contactPhone: application.applicantPhone,
          status: 'active',
        });
      } else {
        createdMunicipality = existing;
      }

      // Generate secure invitation for applicant as Municipal Admin
      invitation = await municipalityModel.createInvitation({
        municipalityId: createdMunicipality.id,
        applicationId: application.id,
        email: application.applicantEmail,
        invitedName: application.applicantName,
        role: 'MUNICIPAL',
        municipalRole: 'ADMIN',
        createdBy: req.user.id,
      });

      // If user with this email already exists in users table, link them to the municipality!
      const existingUser = await userModel.findByEmail(application.applicantEmail);
      if (existingUser) {
        await userModel.updateUserRole(existingUser.id, 'MUNICIPAL', {
          municipalityId: createdMunicipality.id,
          municipalRole: 'ADMIN',
        });
      }
    }

    // Record audit log
    await municipalityModel.recordAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: `MUNICIPAL_APPLICATION_${status}`,
      resourceType: 'APPLICATION',
      resourceId: id,
      details: {
        applicationNo: application.applicationNo,
        newStatus: status,
        notes: adminNotes || rejectionReason,
        municipalityId: createdMunicipality?.id,
      },
      ipAddress: req.ip,
    });

    return sendSuccess(
      res,
      {
        application: updated,
        municipality: createdMunicipality,
        invitation,
      },
      `Application updated to status '${status}'.`
    );
  } catch (error) {
    next(error);
  }
};

export const reassignIssueJurisdiction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { municipalityId, reason } = req.body;

    if (!municipalityId) {
      return sendError(res, 'New municipalityId is required.', 400);
    }

    const updated = await jurisdictionService.reassignIssueMunicipality(id, municipalityId, req.user, reason);
    return sendSuccess(res, { issue: updated }, 'Issue jurisdiction successfully reassigned.');
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// MUNICIPAL ADMIN APIS (Municipal Admin managing their own body)
// ============================================================================

export const getMunicipalOfficers = async (req, res, next) => {
  try {
    const municipalityId = req.user.role === 'ADMIN' ? req.query.municipalityId || req.user.municipality_id : req.user.municipality_id;
    if (!municipalityId) {
      return sendError(res, 'No municipality associated with this account.', 400);
    }

    const officers = await userModel.getOfficersByMunicipality(municipalityId);
    const invitations = await municipalityModel.getInvitationsByMunicipality(municipalityId);

    return sendSuccess(res, { officers, invitations }, 'Municipal officers retrieved.');
  } catch (error) {
    next(error);
  }
};

export const createMunicipalOfficer = async (req, res, next) => {
  try {
    const isPlatformAdmin = req.user.role === 'ADMIN';
    const isMunicipalAdmin = req.user.role === 'MUNICIPAL' && (req.user.municipal_role === 'ADMIN' || req.user.municipalRole === 'ADMIN');

    if (!isPlatformAdmin && !isMunicipalAdmin) {
      return sendError(res, 'Access denied: Only municipal administrators or platform administrators can invite staff.', 403);
    }

    const municipalityId = isPlatformAdmin
      ? (req.body.municipalityId || req.user.municipality_id)
      : req.user.municipality_id;

    if (!municipalityId) {
      return sendError(res, isPlatformAdmin ? 'municipalityId is required for platform administrator invitations.' : 'You must belong to a municipal body to invite staff.', 400);
    }

    // Verify municipality exists
    const municipality = await municipalityModel.getMunicipalityById(municipalityId);
    if (!municipality) {
      return sendError(res, `Municipality '${municipalityId}' does not exist.`, 404);
    }

    const { name, email, department, municipalRole = 'OFFICER', municipal_role, password = 'Officer@123' } = req.body;
    const finalRole = municipal_role || municipalRole || 'OFFICER';

    if (!name || !name.trim()) {
      return sendError(res, 'Name is required for officer onboarding.', 400);
    }

    if (!email || !email.trim()) {
      return sendError(res, 'Email is required for officer onboarding.', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return sendError(res, 'Please provide a valid email address.', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existing = await userModel.findByEmail(normalizedEmail);
    if (existing) {
      return sendError(res, `An account with email '${normalizedEmail}' already exists.`, 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newOfficer = await userModel.createUser({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'MUNICIPAL',
      badge: 'Municipal Field Squad',
      department: department || 'Department of Public Works',
      municipalityId,
      municipalRole: finalRole,
    });

    // Also record invitation for token validation, expiration tracking, and acceptance flow
    let invitationRecord = null;
    try {
      invitationRecord = await municipalityModel.createInvitation({
        municipalityId,
        email: normalizedEmail,
        invitedName: name.trim(),
        role: 'MUNICIPAL',
        municipalRole: finalRole,
        department: department || 'Department of Public Works',
        createdBy: req.user.id,
      });
    } catch (invErr) {
      console.warn('[STAFF INVITATION] Invitation tracking record skipped:', invErr.message);
    }

    // Record audit log
    await municipalityModel.recordAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'MUNICIPAL_OFFICER_CREATED',
      resourceType: 'USER',
      resourceId: newOfficer.id,
      details: {
        name: name.trim(),
        email: normalizedEmail,
        department: department || 'Department of Public Works',
        municipalityId,
        municipalRole: finalRole,
        invitationToken: invitationRecord?.invitationToken || null,
      },
      ipAddress: req.ip,
    });

    return sendSuccess(
      res,
      { officer: newOfficer, invitation: invitationRecord },
      'Municipal officer authorized and created successfully.',
      201
    );
  } catch (error) {
    next(error);
  }
};
