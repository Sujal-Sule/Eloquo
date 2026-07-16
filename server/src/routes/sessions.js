import { Router } from 'express';
import { createSession, getSession, userSpeak, passTurn, triggerAIResponse, endSession, getSessionHistory, generateTTS } from '../controllers/sessionController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.post('/', protect, createSession);
router.post('/tts', protect, generateTTS);
router.get('/history', protect, getSessionHistory);
router.get('/:sessionId', protect, getSession);
router.post('/:sessionId/speak', protect, userSpeak);
router.post('/:sessionId/pass', protect, passTurn);
router.post('/:sessionId/ai-respond', protect, triggerAIResponse);
router.post('/:sessionId/end', protect, endSession);

export default router;
