import express from 'express';
import { getBalance, getHistory, refreshCredits } from '../controllers/creditController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/balance', protect, getBalance);
router.get('/history', protect, getHistory);
router.post('/refresh', protect, refreshCredits);

export default router;

