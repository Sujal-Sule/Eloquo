import { Router } from 'express';
import { getRandomTopics, getTopics, createCustomTopic } from '../controllers/topicController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.get('/random', protect, getRandomTopics);
router.get('/', protect, getTopics);
router.post('/custom', protect, createCustomTopic);

export default router;
