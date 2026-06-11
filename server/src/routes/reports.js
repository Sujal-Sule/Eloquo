import { Router } from 'express';
import { getReport, getUserReports } from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.get('/', protect, getUserReports);
router.get('/:sessionId', protect, getReport);

export default router;
