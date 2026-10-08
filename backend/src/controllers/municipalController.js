import * as issueModel from '../models/issueModel.js';
import { sendSuccess } from '../utils/response.js';

export const getMunicipalOverview = async (req, res, next) => {
  try {
    const stats = await issueModel.getStats();
    const pendingReview = await issueModel.getAllIssues({ status: 'under_review' });
    const inProgress = await issueModel.getAllIssues({ status: 'in_progress' });
    const completed = await issueModel.getAllIssues({ status: 'completed' });
    const reported = await issueModel.getAllIssues({ status: 'reported' });
    const reopened = await issueModel.getAllIssues({ status: 'reopened' });

    return sendSuccess(
      res,
      {
        officer: {
          name: req.user.name,
          department: req.user.department || 'Public Works',
          role: req.user.role,
        },
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
    const issues = await issueModel.getAllIssues({ category, status, search });
    return sendSuccess(res, { issues }, 'Municipal issue queue retrieved.');
  } catch (error) {
    next(error);
  }
};
