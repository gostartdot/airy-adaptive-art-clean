import express from 'express';
import { getProfile, updateProfile, uploadPhoto, deletePhoto } from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/upload-photo', protect, uploadPhoto);
router.delete('/photo/:index', protect, deletePhoto);

export default router;

