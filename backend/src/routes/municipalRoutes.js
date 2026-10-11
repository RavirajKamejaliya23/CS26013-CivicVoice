import { Router } from 'express';
import * as municipalController from '../controllers/municipalController.js';
import * as municipalityController from '../controllers/municipalityController.js';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

// All municipal routes require MUNICIPAL or ADMIN role
router.use(authenticateUser, authorizeRoles('MUNICIPAL', 'ADMIN'));

router.get('/overview', municipalController.getMunicipalOverview);
router.get('/issues', municipalController.getMunicipalIssues);
router.get('/officers', municipalityController.getMunicipalOfficers);
router.post('/officers', municipalityController.createMunicipalOfficer);

export default router;
