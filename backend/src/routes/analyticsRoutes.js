import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public / Authenticated analytics overview with municipality and date filters
router.get('/overview', optionalAuth, analyticsController.getAnalyticsOverview);

export default router;
