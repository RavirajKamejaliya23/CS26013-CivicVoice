import * as issueModel from '../models/issueModel.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getIssues = async (req, res, next) => {
  try {
    const { category, status, search } = req.query;
    const userId = req.user ? req.user.id : null;

    const issues = await issueModel.getAllIssues({
      category,
      status,
      search,
      userId,
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
    const { title, description, category, address, latitude, longitude, imageUrl, mediaUrls } = req.body;

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
    ];

    if (!validCategories.includes(category)) {
      return sendError(res, `Invalid category: '${category}'.`, 400);
    }

    // Validate maximum 10 photos
    const photos = Array.isArray(mediaUrls) && mediaUrls.length > 0 ? mediaUrls : (imageUrl ? [imageUrl] : []);
    if (photos.length > 10) {
      return sendError(res, 'A maximum of 10 photos can be attached to an issue dispatch.', 400);
    }

    // Generate unique ID in the format CV-VAD-2026-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const id = `CV-VAD-2026-${randomSuffix}`;

    const newIssue = await issueModel.createIssue({
      id,
      title: title.trim(),
      description: description.trim(),
      category,
      address: address.trim(),
      latitude: latitude || 22.3168,
      longitude: longitude || 73.1495,
      imageUrl: photos[0] || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      mediaUrls: photos,
      reportedById: req.user ? req.user.id : null,
      reporterName: req.user ? req.user.name : 'Civic Reporter',
      reporterBadge: req.user ? req.user.badge : 'Verified Citizen',
      reporterAvatar: req.user ? req.user.avatar : undefined,
    });

    const fullIssue = await issueModel.getIssueById(id, req.user ? req.user.id : null);

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
    const { category, latitude, longitude, radius, title, description } = req.query;

    if (!category || !latitude || !longitude) {
      return sendError(res, 'category, latitude, and longitude are required parameters.', 400);
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusMetres = radius ? Math.min(parseInt(radius, 10), 5000) : null;

    if (isNaN(lat) || isNaN(lng)) {
      return sendError(res, 'latitude and longitude must be valid numbers.', 400);
    }

    const similar = await issueModel.getSimilarIssues({
      category,
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

    if (!canonicalId) {
      return sendError(res, 'canonicalId is required — the ID of the original issue this duplicates.', 400);
    }

    if (duplicateId === canonicalId) {
      return sendError(res, 'An issue cannot be marked as a duplicate of itself.', 400);
    }

    const result = await issueModel.markAsDuplicate(
      duplicateId,
      canonicalId,
      req.user ? req.user.id : null,
      req.user ? req.user.name : 'Administrator'
    );

    if (!result) {
      return sendError(res, 'One or both issue IDs not found.', 404);
    }

    return sendSuccess(res, result, `Issue ${duplicateId} marked as duplicate of ${canonicalId}.`);
  } catch (error) {
    next(error);
  }
};

export const unmarkAsDuplicate = async (req, res, next) => {
  try {
    const { id: duplicateId } = req.params;

    const result = await issueModel.unlinkDuplicate(
      duplicateId,
      req.user ? req.user.id : null,
      req.user ? req.user.name : 'Administrator'
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

