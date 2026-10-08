import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

// All admin routes strictly require ADMIN role
router.use(authenticateUser, authorizeRoles('ADMIN'));

router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.get('/overview', adminController.getAdminOverview);
router.get('/issues', adminController.getAllIssuesAdmin);

export default router;
