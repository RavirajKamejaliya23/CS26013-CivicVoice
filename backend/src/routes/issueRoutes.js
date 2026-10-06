import { Router } from 'express';
import * as issueController from '../controllers/issueController.js';
import { authenticateUser, authorizeRoles, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public / optionally authenticated
router.get('/', optionalAuth, issueController.getIssues);
router.get('/stats', issueController.getStats);
router.get('/:id', optionalAuth, issueController.getIssueById);

// Citizen Actions: Issue reporting, co-signing/upvoting, and community resolution verification.
// In the civic workflow, Municipal officers review and act upon issues rather than filing dispatches.
// ADMIN role is permitted for administrative testing and emergency submissions.
router.post('/', authenticateUser, authorizeRoles('CITIZEN', 'ADMIN'), issueController.createIssue);
router.post('/:id/upvote', authenticateUser, authorizeRoles('CITIZEN', 'ADMIN'), issueController.toggleUpvote);
router.post('/:id/verify', authenticateUser, authorizeRoles('CITIZEN', 'ADMIN'), issueController.verifyIssue);

// Municipal & Admin Lifecycle Management
router.patch(
  '/:id/status',
  authenticateUser,
  authorizeRoles('MUNICIPAL', 'ADMIN'),
  issueController.updateStatus
);

// Admin-only issue deletion / moderation
router.delete('/:id', authenticateUser, authorizeRoles('ADMIN'), issueController.deleteIssue);

export default router;
