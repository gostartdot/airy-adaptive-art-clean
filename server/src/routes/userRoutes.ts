import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  uploadPhoto, 
  deletePhoto,
  getAllUsers,
  approveVerification,
  rejectVerification,
  suspendUser,
  unsuspendUser
} from '../controllers/userController';
import { protect, adminOnly } from '../middlewares/authMiddleware';

const router = express.Router();

// User routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/upload-photo', protect, uploadPhoto);
router.delete('/photo/:index', protect, deletePhoto);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllUsers);
router.post('/admin/:userId/approve', protect, adminOnly, approveVerification);
router.post('/admin/:userId/reject', protect, adminOnly, rejectVerification);
router.post('/admin/:userId/suspend', protect, adminOnly, suspendUser);
router.post('/admin/:userId/unsuspend', protect, adminOnly, unsuspendUser);

export default router;

