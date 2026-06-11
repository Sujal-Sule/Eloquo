import { Router } from 'express';
import { getAchievements } from '../controllers/achievementController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.get('/', protect, getAchievements);

export default router;
