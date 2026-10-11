import * as issueModel from '../models/issueModel.js';
import * as municipalityModel from '../models/municipalityModel.js';
import { sendSuccess } from '../utils/response.js';

export const getMunicipalOverview = async (req, res, next) => {
  try {
    const municipalityId = req.user.role === 'ADMIN' ? (req.query.municipalityId || null) : req.user.municipality_id;
    
    const stats = await issueModel.getStats({ municipalityId });
    const pendingReview = await issueModel.getAllIssues({ status: 'under_review', municipalityId });
    const inProgress = await issueModel.getAllIssues({ status: 'in_progress', municipalityId });
    const completed = await issueModel.getAllIssues({ status: 'completed', municipalityId });
    const reported = await issueModel.getAllIssues({ status: 'reported', municipalityId });
    const reopened = await issueModel.getAllIssues({ status: 'reopened', municipalityId });

    let municipality = null;
    if (municipalityId) {
      municipality = await municipalityModel.getMunicipalityById(municipalityId);
    }

    return sendSuccess(
      res,
      {
        officer: {
          name: req.user.name,
          department: req.user.department || 'Public Works',
          role: req.user.role,
          municipalRole: req.user.municipal_role || 'OFFICER',
          municipalityId: req.user.municipality_id,
          municipalityName: municipality?.name || 'Local Municipal Jurisdiction',
        },
        municipality,
        stats,
        reportedCount: reported.length,
        pendingReviewCount: pendingReview.length,
        inProgressCount: inProgress.length,
        completedPendingVerifyCount: completed.length,
        reopenedCount: reopened.length,
      },
      'Municipal oversight overview retrieved.'
    );
  } catch (error) {
    next(error);
  }
};

export const getMunicipalIssues = async (req, res, next) => {
  try {
    const { category, status, search } = req.query;
    const municipalityId = req.user.role === 'ADMIN' ? (req.query.municipalityId || null) : req.user.municipality_id;

    const issues = await issueModel.getAllIssues({ category, status, search, municipalityId });
    return sendSuccess(res, { issues }, 'Municipal issue queue retrieved.');
  } catch (error) {
    next(error);
  }
};
