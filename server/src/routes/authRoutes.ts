import express from 'express';
import { googleAuth, completeOnboarding, getMe, uploadOnboardingPhoto, login, sendOtp, signup } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';
import { validateOnboarding } from '../middlewares/validateRequest';

const router = express.Router();

router.post('/google', googleAuth);
router.post('/upload-onboarding-photo', uploadOnboardingPhoto);
router.post('/signup', validateOnboarding, completeOnboarding);
router.get('/me', protect, getMe);

// Admin auth routes
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/admin-signup', signup);

export default router;

