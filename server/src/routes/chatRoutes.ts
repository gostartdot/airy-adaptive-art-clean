import express from 'express';
import { getMessages, sendMessage, markAsRead, getConversations } from '../controllers/chatController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/match/:matchId', protect, getMessages);
router.post('/match/:matchId', protect, sendMessage);
router.put('/:chatId/read', protect, markAsRead);

export default router;

