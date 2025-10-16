import express from 'express';
import { googleAuth, completeOnboarding, getMe, uploadOnboardingPhoto } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';
import { validateOnboarding } from '../middlewares/validateRequest';

const router = express.Router();

router.post('/google', googleAuth);
router.post('/upload-onboarding-photo', uploadOnboardingPhoto);
router.post('/signup', validateOnboarding, completeOnboarding);
router.get('/me', protect, getMe);

export default router;

