import { Router } from 'express';
import * as municipalityController from '../controllers/municipalityController.js';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

// Staff management for municipal administrators and platform admin
router.get('/staff', authenticateUser, authorizeRoles('MUNICIPAL', 'ADMIN'), municipalityController.getMunicipalOfficers);
router.post('/staff/invite', authenticateUser, authorizeRoles('MUNICIPAL', 'ADMIN'), municipalityController.createMunicipalOfficer);

// Public routes for municipality listing, details, and onboarding
router.get('/', municipalityController.getMunicipalities);
router.get('/jurisdiction/check', municipalityController.checkJurisdiction);
router.get('/:id', municipalityController.getMunicipalityById);
router.post('/onboard', municipalityController.submitApplication);

export default router;
