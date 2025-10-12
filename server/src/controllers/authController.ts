import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import { generateToken } from '../utils/generateToken';
import { sendSuccess, sendError, sendServerError } from '../utils/responseHelper';
import { AuthRequest } from '../middlewares/authMiddleware';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Google OAuth login/signup
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return sendError(res, 'No credential provided');
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      return sendError(res, 'Invalid Google token');
    }

    const { sub: googleId, email, name } = payload;

    // Check if user exists
    let user = await User.findOne({ googleId });

    if (user) {
      // Update last active
      user.lastActive = new Date();
      await user.save();

      // Generate JWT token
      const token = generateToken(String(user._id));

      return sendSuccess(res, {
        token,
        user,
        isNewUser: false
      }, 'Login successful');
    } else {
      // Check if email exists (shouldn't happen with Google)
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return sendError(res, 'Email already registered');
      }

      // Return data for onboarding
      return sendSuccess(res, {
        googleId,
        email,
        name,
        isNewUser: true
      }, 'New user, needs onboarding');
    }
  } catch (error) {
    console.error('Google auth error:', error);
    return sendServerError(res, error);
  }
};

// @desc    Complete onboarding and create user
// @route   POST /api/auth/signup
// @access  Public
export const completeOnboarding = async (req: Request, res: Response) => {
  try {
    const {
      googleId,
      email,
      name,
      dateOfBirth,
      gender,
      genderCustom,
      showGender,
      city,
      photos,
      bio,
      interests,
      preferences
    } = req.body;

    // Calculate age
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Create new user
    const user = await User.create({
      googleId,
      email,
      name,
      dateOfBirth: birthDate,
      age,
      gender,
      genderCustom,
      showGender: showGender !== false,
      city,
      photos,
      bio,
      interests,
      preferences,
      credits: 10, // Starting credits
      lastCreditRefresh: new Date(),
      isActive: true,
      lastActive: new Date()
    });

    // Generate JWT token
    const token = generateToken(String(user._id));

    return sendSuccess(res, {
      token,
      user
    }, 'User created successfully', 201);
  } catch (error) {
    console.error('Signup error:', error);
    return sendServerError(res, error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response) => {
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

