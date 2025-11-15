import { Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import cloudinary from '../config/cloudinary';
import { AuthRequest } from '../middlewares/authMiddleware';
import { sendSuccess, sendError, sendServerError } from '../utils/responseHelper';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, user);
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const updates = req.body;

    // Fields that can be updated
    const allowedUpdates = ['name', 'bio', 'interests', 'preferences', 'city', 'showGender'];
    const updateData: any = {};

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, user, 'Profile updated');
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Upload profile photo
// @route   POST /api/users/upload-photo
// @access  Private
export const uploadPhoto = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { photo } = req.body; // Base64 encoded image

    if (!photo) {
      return sendError(res, 'No photo provided');
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(photo, {
      folder: 'start-dating-app/profiles',
      transformation: [
        { width: 800, height: 1000, crop: 'fill' },
        { quality: 'auto' }
      ]
    });

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Add photo URL to user's photos
    if (!user.photos) {
      user.photos = [];
    }
    user.photos.push(result.secure_url);
    await user.save();

    return sendSuccess(res, { photoUrl: result.secure_url }, 'Photo uploaded');
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Delete profile photo
// @route   DELETE /api/users/photo/:index
// @access  Private
export const deletePhoto = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { index } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (!user.photos || user.photos.length === 0) {
      return sendError(res, 'No photos to delete');
    }

    const photoIndex = parseInt(index);
    if (isNaN(photoIndex) || photoIndex < 0 || photoIndex >= user.photos.length) {
      return sendError(res, 'Invalid photo index');
    }

    // Remove photo
    user.photos.splice(photoIndex, 1);
    
    if (user.photos.length < 2) {
      return sendError(res, 'Must have at least 2 photos');
    }

    await user.save();

    return sendSuccess(res, user, 'Photo deleted');
  } catch (error) {
    return sendServerError(res, error);
  }
};

// ============ ADMIN ENDPOINTS ============

// @desc    Get all users (Admin only)
// @route   GET /api/users/admin/all
// @access  Private/Admin
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({ role: { $ne: 'Admin' } })
      .select('-password')
      .sort({ createdAt: -1 });

    return sendSuccess(res, users);
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Approve user verification (Admin only)
// @route   POST /api/users/admin/:userId/approve
// @access  Private/Admin
export const approveVerification = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const adminId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (user.verificationStatus === 'approved') {
      return sendError(res, 'User is already approved');
    }

    // Update user verification status
    user.verificationStatus = 'approved';
    user.verifiedBy = new mongoose.Types.ObjectId(adminId!);
    user.verifiedAt = new Date();
    user.isActive = true;
    user.credits = 10; // Give starting credits
    await user.save();

    // Send approval email
    const { sendVerificationEmail } = await import('../services/emailService');
    await sendVerificationEmail(user.email, user.name || 'User', 'approved');

    return sendSuccess(res, user, 'User verification approved');
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Reject user verification (Admin only)
// @route   POST /api/users/admin/:userId/reject
// @access  Private/Admin
export const rejectVerification = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const adminId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (user.verificationStatus === 'rejected') {
      return sendError(res, 'User is already rejected');
    }

    // Update user verification status
    user.verificationStatus = 'rejected';
    user.verifiedBy = new mongoose.Types.ObjectId(adminId!);
    user.verifiedAt = new Date();
    user.rejectionReason = reason || 'Verification documents did not meet requirements';
    user.isActive = false;
    await user.save();

    // Send rejection email
    const { sendVerificationEmail } = await import('../services/emailService');
    await sendVerificationEmail(user.email, user.name || 'User', 'rejected', reason);

    return sendSuccess(res, user, 'User verification rejected');
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Suspend user (Admin only)
// @route   POST /api/users/admin/:userId/suspend
// @access  Private/Admin
export const suspendUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (user.role === 'Admin') {
      return sendError(res, 'Cannot suspend admin users');
    }

    user.isActive = false;
    await user.save();

    return sendSuccess(res, user, 'User suspended');
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Unsuspend user (Admin only)
// @route   POST /api/users/admin/:userId/unsuspend
// @access  Private/Admin
export const unsuspendUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Only unsuspend if user is verified
    if (user.verificationStatus !== 'approved') {
      return sendError(res, 'User must be verified before unsuspending');
    }

    user.isActive = true;
    await user.save();

    return sendSuccess(res, user, 'User unsuspended');
  } catch (error) {
    return sendServerError(res, error);
  }
};

