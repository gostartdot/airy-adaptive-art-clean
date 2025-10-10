import { Response } from 'express';
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

