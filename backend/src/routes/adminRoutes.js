import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import * as municipalityController from '../controllers/municipalityController.js';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

// All admin routes strictly require ADMIN role
router.use(authenticateUser, authorizeRoles('ADMIN'));

router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserProfileAdmin);
router.patch('/users/:id/role', adminController.updateUserRole);
router.get('/overview', adminController.getAdminOverview);
router.get('/issues', adminController.getAllIssuesAdmin);

// Municipal onboarding applications management
router.get('/municipal-applications', municipalityController.getApplications);
router.get('/municipal-applications/:id', municipalityController.getApplicationDetail);
router.patch('/municipal-applications/:id/status', municipalityController.reviewApplication);

// Reassign issue jurisdiction
router.patch('/issues/:id/reassign-municipality', municipalityController.reassignIssueJurisdiction);

// Platform audit logs
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
