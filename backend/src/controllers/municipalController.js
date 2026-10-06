import * as issueModel from '../models/issueModel.js';
import { sendSuccess } from '../utils/response.js';

export const getMunicipalOverview = async (req, res, next) => {
  try {
    const stats = await issueModel.getStats();
    const pendingReview = await issueModel.getAllIssues({ status: 'under_review' });
    const inProgress = await issueModel.getAllIssues({ status: 'in_progress' });
    const completed = await issueModel.getAllIssues({ status: 'completed' });

    return sendSuccess(
      res,
      {
        officer: {
          name: req.user.name,
          department: req.user.department || 'Public Works',
          role: req.user.role,
        },
        stats,
        pendingReviewCount: pendingReview.length,
        inProgressCount: inProgress.length,
        completedPendingVerifyCount: completed.length,
      },
      'Municipal oversight overview retrieved.'
    );
  } catch (error) {
    next(error);
  }
};
