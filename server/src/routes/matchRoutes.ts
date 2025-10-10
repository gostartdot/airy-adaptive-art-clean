import express from 'express';
import {
  findMatch,
  skipMatch,
  requestReveal,
  acceptReveal,
  getMatches,
  getMatch
} from '../controllers/matchController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/find', protect, findMatch);
router.get('/', protect, getMatches);
router.get('/:matchId', protect, getMatch);
router.post('/:matchId/skip', protect, skipMatch);
router.post('/:matchId/reveal-request', protect, requestReveal);
router.post('/:matchId/reveal-accept', protect, acceptReveal);

export default router;

