import * as issueModel from '../models/issueModel.js';
import * as userModel from '../models/userModel.js';
import * as emailService from '../services/emailService.js';
import * as jurisdictionService from '../services/jurisdictionService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getIssues = async (req, res, next) => {
  try {
    const { category, status, search, canonicalOnly, reporterId, municipalityId, state, city } = req.query;
    const userId = req.user ? req.user.id : null;

    // By default, public feed returns canonical complaints only to eliminate duplicate clutter
    const isCanonicalOnly = canonicalOnly === 'false' ? false : true;

    const issues = await issueModel.getAllIssues({
      category,
      status,
      search,
      userId,
      canonicalOnly: isCanonicalOnly,
      reporterId: reporterId || null,
      municipalityId: municipalityId || null,
      state: state || null,
      city: city || null,
    });

    return sendSuccess(res, { issues }, 'Issues fetched successfully.');
  } catch (error) {
    next(error);
  }
};


export const getIssueById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    const issue = await issueModel.getIssueById(id, userId);
    if (!issue) {
      return sendError(res, `Issue '${id}' not found.`, 404);
    }

    return sendSuccess(res, { issue }, 'Issue details retrieved.');
  } catch (error) {
    next(error);
  }
};

export const createIssue = async (req, res, next) => {
  try {
    const { title, description, category, customCategory, address, latitude, longitude, imageUrl, mediaUrls } = req.body;

    if (!title || !description || !category || !address) {
      return sendError(
        res,
        'Missing required fields: title, description, category, and address are required.',
        400
      );
    }

    const validCategories = [
      'roads_potholes',
      'garbage_sanitation',
      'streetlights_power',
      'water_drainage',
      'public_infrastructure',
      'traffic_safety',
      'other',
    ];

    if (!validCategories.includes(category)) {
      return sendError(res, `Invalid category: '${category}'.`, 400);
    }

    if (category === 'other' && (!customCategory || !customCategory.trim())) {
      return sendError(res, 'Describe the problem category is required when selecting Other.', 400);
    }

    // Validate maximum 10 photos
    const photos = Array.isArray(mediaUrls) && mediaUrls.length > 0 ? mediaUrls : (imageUrl ? [imageUrl] : []);
    if (photos.length > 10) {
      return sendError(res, 'A maximum of 10 photos can be attached to an issue dispatch.', 400);
    }

    // Evaluate jurisdiction routing based on coordinates
    const jurisdictionRoute = await jurisdictionService.routeCoordinatesToMunicipality(latitude, longitude);
    const municipalityId = jurisdictionRoute.matched ? jurisdictionRoute.municipalityId : null;
    const jurisdictionStatus = jurisdictionRoute.jurisdictionStatus;

    // Generate unique ID in general format CV-[CODE]-2026-XXXXXX or CV-2026-XXXXXX
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const codePrefix = jurisdictionRoute.municipalityCode || (req.body.jurisdictionCode ? req.body.jurisdictionCode.toUpperCase() : null);
    const id = codePrefix ? `CV-${codePrefix}-2026-${randomSuffix}` : `CV-2026-${randomSuffix}`;

    const newIssue = await issueModel.createIssue({
      id,
      title: title.trim(),
      description: description.trim(),
      category,
      customCategory: category === 'other' && customCategory ? customCategory.trim() : null,
      address: address.trim(),
      latitude: latitude || 20.5937,
      longitude: longitude || 78.9629,
      imageUrl: photos[0] || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      mediaUrls: photos,
      reportedById: req.user ? req.user.id : null,
      reporterName: req.user ? req.user.name : 'Civic Reporter',
      reporterBadge: req.user ? req.user.badge : 'Verified Citizen',
      reporterAvatar: req.user ? req.user.avatar : undefined,
      municipalityId,
      jurisdictionStatus,
    });

    const fullIssue = await issueModel.getIssueById(id, req.user ? req.user.id : null);

    // Event 1: Asynchronous non-blocking grievance acknowledgement email to citizen
    const citizenEmail = req.user?.email || (req.body.email ? req.body.email.trim() : null);
    const citizenName = req.user?.name || req.body.reporterName || 'Citizen';

    if (citizenEmail && fullIssue) {
      emailService
        .sendComplaintSubmittedEmail({
          issue: fullIssue,
          citizenEmail,
          citizenName,
        })
        .then((result) => {
          console.log(`[EMAIL NOTIFICATION] Submission acknowledgement dispatched for #${id} to ${citizenEmail}: success=${Boolean(result.success)}, preview=${result.previewUrl || 'none'}`);
        })
        .catch((err) => console.warn('[EMAIL NOTIFICATION] Submission email caught:', err.message));
    } else {
      console.warn(`[EMAIL NOTIFICATION] No recipient email found for dispatch #${id}. Acknowledgement skipped.`);
    }

    return sendSuccess(res, { issue: fullIssue }, 'Civic dispatch registered successfully.', 201);
  } catch (error) {
    next(error);
  }
};


export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note, evidenceUrl, officerName, department } = req.body;

    const validStatuses = [
      'under_review',
      'accepted',
      'in_progress',
      'completed',
      'citizen_verified',
      'reopened',
    ];

    if (!status || !validStatuses.includes(status)) {
      return sendError(res, `Invalid or missing lifecycle status: '${status}'.`, 400);
    }

    const existingIssue = await issueModel.getIssueById(id);
    if (!existingIssue) {
      return sendError(res, `Issue '${id}' not found.`, 404);
    }

    // RBAC: Cross-municipality isolation check
    if (req.user && req.user.role === 'MUNICIPAL') {
      if (
        existingIssue.municipalityId &&
        req.user.municipality_id &&
        existingIssue.municipalityId !== req.user.municipality_id
      ) {
        return sendError(res, 'Access denied: You can only update complaints within your municipal jurisdiction.', 403);
      }
    }

    const author = officerName || (req.user ? req.user.name : 'Municipal Officer');
    const role =
      department ||
      (req.user?.department ? req.user.department : 'Dept of Public Works - Field Squad');

    const updated = await issueModel.updateIssueStatus(id, {
      status,
      authorId: req.user ? req.user.id : null,
      author,
      role,
      note: note || '',
      evidenceUrl: status === 'completed' ? evidenceUrl : null,
    });

    if (!updated) {
      return sendError(res, `Issue '${id}' not found.`, 404);
    }

    const fullIssue = await issueModel.getIssueById(id, req.user ? req.user.id : null);

    // Event 2: Asynchronous completion notification to original citizen reporter
    if (status === 'completed' && fullIssue) {
      (async () => {
        try {
          let recipientEmail = null;
          let recipientName = fullIssue.reportedBy?.name || 'Citizen';

          if (fullIssue.reportedById) {
            const reporterUser = await userModel.findById(fullIssue.reportedById);
            if (reporterUser?.email) {
              recipientEmail = reporterUser.email;
              recipientName = reporterUser.name || recipientName;
            }
          }

          if (recipientEmail) {
            await emailService.sendWorkCompletedEmail({
              issue: fullIssue,
              citizenEmail: recipientEmail,
              citizenName: recipientName,
              resolutionNote: note,
              completionEvidenceUrl: evidenceUrl,
              officerName: author,
              department: role,
            });
          }
        } catch (err) {
          console.warn('[EMAIL NOTIFICATION] Completion email caught:', err.message);
        }
      })();
    }

    return sendSuccess(
      res,
      { issue: fullIssue },
      `Issue status advanced to '${status}'.`
    );
  } catch (error) {
    next(error);
  }
};


export const verifyIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isResolved, comment } = req.body;

    if (typeof isResolved !== 'boolean') {
      return sendError(res, "'isResolved' must be a boolean (true to certify, false to reopen).", 400);
    }

    const verified = await issueModel.verifyIssue(id, {
      isResolved,
      comment: comment || (isResolved ? 'Citizen Certified' : 'Reopened by Citizen Inspection'),
      userId: req.user ? req.user.id : null,
      userName: req.user ? req.user.name : 'Citizen Verifier',
    });

    if (!verified) {
      return sendError(res, `Issue '${id}' not found.`, 404);
    }

    const fullIssue = await issueModel.getIssueById(id, req.user ? req.user.id : null);

    return sendSuccess(
      res,
      { issue: fullIssue },
      isResolved ? 'Issue certified as resolved.' : 'Issue reopened.'
    );
  } catch (error) {
    next(error);
  }
};

export const toggleUpvote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await issueModel.toggleUpvote(userId, id);
    return sendSuccess(
      res,
      result,
      result.hasUpvoted ? 'Dispatch co-signed.' : 'Co-sign removed.'
    );
  } catch (error) {
    next(error);
  }
};

export const reportIssueForModeration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, details } = req.body;

    if (!reason) {
      return sendError(res, 'Reason for reporting is required.', 400);
    }

    const report = await issueModel.reportIssue({
      issueId: id,
      reportedById: req.user ? req.user.id : null,
      reason,
      details,
    });

    return sendSuccess(res, { report }, 'Issue flagged for administrative moderation.');
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await issueModel.getStats();
    return sendSuccess(res, stats, 'Civic analytics ledger retrieved.');
  } catch (error) {
    next(error);
  }
};

export const deleteIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await issueModel.deleteIssue(id);
    if (!deleted) {
      return sendError(res, `Issue '${id}' not found.`, 404);
    }
    return sendSuccess(res, { id }, 'Issue deleted by administrator.');
  } catch (error) {
    next(error);
  }
};

export const getSimilarIssues = async (req, res, next) => {
  try {
    const { category, latitude, longitude, radius, title, description, customCategory } = req.query;

    if (!category || !latitude || !longitude) {
      return sendError(res, 'category, latitude, and longitude are required parameters.', 400);
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusMetres = radius ? Math.min(parseInt(radius, 10), 5000) : null;

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return sendError(res, 'latitude and longitude must be valid geographic coordinates.', 400);
    }

    const similar = await issueModel.getSimilarIssues({
      category,
      customCategory: customCategory || null,
      latitude: lat,
      longitude: lng,
      title: title || '',
      description: description || '',
      radiusMetres,
    });

    return sendSuccess(res, { similar }, 'Similar complaints retrieved.');
  } catch (error) {
    next(error);
  }
};

export const joinCanonicalIssue = async (req, res, next) => {
  try {
    const { id: canonicalId } = req.params;
    const userId = req.user ? req.user.id : null;
    const userName = req.user ? req.user.name : 'Citizen Supporter';

    if (!userId) {
      return sendError(res, 'Authentication required to support a complaint.', 401);
    }

    const result = await issueModel.joinCanonicalIssue(userId, userName, canonicalId);
    if (result.notFound) {
      return sendError(res, result.error, 404);
    }

    return sendSuccess(res, result, result.message, 200);
  } catch (error) {
    next(error);
  }
};

export const markAsDuplicate = async (req, res, next) => {
  try {
    const { id: duplicateId } = req.params;
    const { canonicalId } = req.body;

    if (!req.user || req.user.role === 'CITIZEN') {
      return sendError(res, 'Unauthorized: Citizens cannot mark arbitrary complaints as duplicates.', 403);
    }

    if (!canonicalId) {
      return sendError(res, 'canonicalId is required — the ID of the original issue this duplicates.', 400);
    }

    if (duplicateId === canonicalId) {
      return sendError(res, 'An issue cannot be marked as a duplicate of itself.', 400);
    }

    // RBAC Jurisdiction Check for Municipal Officers
    if (req.user.role === 'MUNICIPAL') {
      const dupIssue = await issueModel.getIssueById(duplicateId);
      const canIssue = await issueModel.getIssueById(canonicalId);

      if (!dupIssue || !canIssue) {
        return sendError(res, 'One or both issue IDs not found.', 404);
      }

      if (
        !req.user.municipality_id ||
        dupIssue.municipality_id !== req.user.municipality_id ||
        canIssue.municipality_id !== req.user.municipality_id
      ) {
        return sendError(
          res,
          'Municipal officers cannot merge complaints outside their assigned jurisdiction.',
          403
        );
      }
    }

    const roleLabel = req.user.role === 'ADMIN' ? 'Platform Administration' : 'Municipal Moderation';

    const result = await issueModel.markAsDuplicate(
      duplicateId,
      canonicalId,
      req.user ? req.user.id : null,
      req.user ? req.user.name : 'Officer',
      roleLabel
    );

    if (!result) {
      return sendError(res, 'One or both issue IDs not found.', 404);
    }

    if (result.error) {
      return sendError(res, result.error, result.code || 400);
    }

    // Event 3: Asynchronous merge notification to original reporter of duplicate complaint
    (async () => {
      try {
        const dupIssue = await issueModel.getIssueById(duplicateId);
        const canIssue = await issueModel.getIssueById(canonicalId);
        if (dupIssue && canIssue && dupIssue.reportedById) {
          const reporterUser = await userModel.findById(dupIssue.reportedById);
          if (reporterUser?.email) {
            await emailService.sendComplaintMergedEmail({
              duplicateIssue: dupIssue,
              canonicalIssue: canIssue,
              citizenEmail: reporterUser.email,
              citizenName: reporterUser.name,
            });
          }
        }
      } catch (err) {
        console.warn('[EMAIL NOTIFICATION] Merge email caught:', err.message);
      }
    })();

    return sendSuccess(res, result, `Issue ${duplicateId} marked as duplicate of ${canonicalId}.`);
  } catch (error) {
    next(error);
  }
};

export const unmarkAsDuplicate = async (req, res, next) => {
  try {
    const { id: duplicateId } = req.params;

    if (!req.user || req.user.role === 'CITIZEN') {
      return sendError(res, 'Unauthorized: Citizens cannot unmark complaints from duplicate status.', 403);
    }

    // RBAC Jurisdiction Check for Municipal Officers
    if (req.user.role === 'MUNICIPAL') {
      const dupIssue = await issueModel.getIssueById(duplicateId);
      if (!dupIssue) {
        return sendError(res, `Issue '${duplicateId}' not found.`, 404);
      }

      if (!req.user.municipality_id || dupIssue.municipality_id !== req.user.municipality_id) {
        return sendError(
          res,
          'Municipal officers cannot unmark complaints outside their assigned jurisdiction.',
          403
        );
      }
    }

    const roleLabel = req.user.role === 'ADMIN' ? 'Platform Administration' : 'Municipal Moderation';

    const result = await issueModel.unlinkDuplicate(
      duplicateId,
      req.user ? req.user.id : null,
      req.user ? req.user.name : 'Officer',
      roleLabel
    );

    if (!result) {
      return sendError(res, `Issue '${duplicateId}' not found.`, 404);
    }

    if (result.unlinked === false) {
      return sendError(res, result.message, 400);
    }

    return sendSuccess(res, result, `Issue ${duplicateId} duplicate status unlinked.`);
  } catch (error) {
    next(error);
  }
};

export const getMergedIssues = async (req, res, next) => {
  try {
    const { id: canonicalId } = req.params;
    const merged = await issueModel.getMergedIssues(canonicalId);
    return sendSuccess(res, { merged }, `Retrieved ${merged.length} merged reports for canonical complaint.`);
  } catch (error) {
    next(error);
  }
};

export const uploadCompletionEvidence = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return sendError(res, 'No image file was provided for upload.', 400);
    }

    const issue = await issueModel.getIssueById(id);
    if (!issue) {
      return sendError(res, `Issue '${id}' not found.`, 404);
    }

    // RBAC: Cross-municipality isolation check
    if (req.user && req.user.role === 'MUNICIPAL') {
      if (
        issue.municipalityId &&
        req.user.municipality_id &&
        issue.municipalityId !== req.user.municipality_id
      ) {
        return sendError(res, 'Access denied: You can only upload evidence for complaints within your municipal jurisdiction.', 403);
      }
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const authorId = req.user ? req.user.id : null;

    // Save to issue_media table
    await issueModel.addIssueMedia({
      issueId: id,
      uploadedById: authorId,
      mediaUrl: fileUrl,
      mediaType: 'image',
      caption: req.body.caption || 'Official Municipal Resolution Evidence',
    });

    return sendSuccess(
      res,
      {
        evidenceUrl: fileUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
      'Completion photographic evidence uploaded successfully.'
    );
  } catch (error) {
    next(error);
  }
};


