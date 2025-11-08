import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import { generateToken } from '../utils/generateToken';
import { sendSuccess, sendError, sendServerError } from '../utils/responseHelper';
import { AuthRequest } from '../middlewares/authMiddleware';
import cloudinary from '../config/cloudinary';
import bcrypt from 'bcryptjs';
import { sendOTPEmail, sendWelcomeEmail } from '../services/emailService';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Google OAuth login/signup
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    console.log('Google auth attempt received');

    if (!credential) {
      console.error('No credential provided');
      return sendError(res, 'No credential provided');
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('GOOGLE_CLIENT_ID not configured on server');
      return sendError(res, 'Server configuration error');
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      console.error('Invalid Google token payload');
      return sendError(res, 'Invalid Google token');
    }

    const { sub: googleId, email, name } = payload;
    console.log('Google auth successful for:', email);

    // Check if user exists
    let user = await User.findOne({ googleId });

    if (user) {
      console.log('Existing user logging in:', user._id);
      
      // Prevent admin users from using Google OAuth
      if (user.role === 'Admin') {
        return sendError(res, 'Admin users cannot use Google OAuth. Please use admin login.');
      }
      
      // Check verification status
      if (user.verificationStatus === 'pending') {
        return sendError(res, 'Your account is pending verification. Please wait for admin approval.');
      }
      
      if (user.verificationStatus === 'rejected') {
        return sendError(res, 'Your account verification was rejected. Please contact support.');
      }
      
      if (user.verificationStatus !== 'approved') {
        return sendError(res, 'Your account is not verified. Please complete verification.');
      }
      
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
      console.log('New user, sending to onboarding:', email);
      // Check if email exists (shouldn't happen with Google)
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        // Prevent admin users from using Google OAuth
        if (existingEmail.role === 'Admin') {
          return sendError(res, 'Admin users cannot use Google OAuth. Please use admin login.');
        }
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
  } catch (error: any) {
    console.error('Google auth error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return sendServerError(res, error);
  }
};

// @desc    Upload onboarding photo to Cloudinary
// @route   POST /api/auth/upload-onboarding-photo
// @access  Public (no auth required during onboarding)
export const uploadOnboardingPhoto = async (req: Request, res: Response) => {
  try {
    const { photo } = req.body; // Base64 encoded image

    if (!photo) {
      return sendError(res, 'No photo provided');
    }

    // Upload to Cloudinary with optimization
    // Note: We store original for admin review, but can optimize on display
    const result = await cloudinary.uploader.upload(photo, {
      folder: 'start-dating-app/profiles',
      transformation: [
        { width: 1200, height: 1600, crop: 'limit' }, // Keep larger size for salary proof review
        { quality: 'auto:good' }, // Good quality for document readability
        { format: 'auto' } // Auto format (WebP when supported)
      ]
    });

    return sendSuccess(res, { photoUrl: result.secure_url }, 'Photo uploaded');
  } catch (error) {
    console.error('Onboarding photo upload error:', error);
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
      preferences,
      isWorkingProfessional,
      salaryProofImages
    } = req.body;

    // Validate that user is a working professional
    if (isWorkingProfessional !== true) {
      return sendError(res, 'Only working professionals with salary above 40k are eligible');
    }

    // Validate salary proof images
    if (!salaryProofImages || salaryProofImages.length < 2) {
      return sendError(res, 'Please upload at least 2 salary proof images');
    }

    // Calculate age
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Create new user with pending verification
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
      isWorkingProfessional: true,
      salaryProofImages,
      verificationStatus: 'pending',
      credits: 0, // No credits until verified
      lastCreditRefresh: new Date(),
      isActive: false, // Inactive until verified
      lastActive: new Date()
    });

    // Don't generate token - user needs to wait for admin verification
    return sendSuccess(res, {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        verificationStatus: user.verificationStatus
      }
    }, 'User account created and pending verification', 201);
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

// @desc    Admin login
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required');
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 'Invalid credentials');
    }

    // Check if user has a password (admin users)
    if (!user.password) {
      return sendError(res, 'Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 'Invalid credentials');
    }

    // Check if user is admin
    if (user.role !== 'Admin') {
      return sendError(res, 'Access denied. Admin privileges required.');
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(String(user._id));

    return sendSuccess(res, {
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return sendServerError(res, error);
  }
};

// @desc    Send OTP for email verification
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 'Email is required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'User already exists with this email');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);
    
    if (!emailSent) {
      return sendError(res, 'Failed to send OTP email. Please try again.');
    }
    
    // Store OTP temporarily (in production, use Redis or database)
    // For now, we'll just log it for development
    console.log(`OTP for ${email}: ${otp}`);
    
    return sendSuccess(res, { message: 'OTP sent successfully' }, 'OTP sent');
  } catch (error) {
    console.error('Send OTP error:', error);
    return sendServerError(res, error);
  }
};

// @desc    Admin signup
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req: Request, res: Response) => {
  try {
    console.log('Signup request body:', req.body);
    
    const {
      accountType,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      otp
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
      return sendError(res, 'All fields are required');
    }

    if (password !== confirmPassword) {
      return sendError(res, 'Passwords do not match');
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'User already exists with this email');
    }

    // In a real application, verify OTP here
    // For now, we'll accept any 6-digit OTP
    if (!/^\d{6}$/.test(otp)) {
      return sendError(res, 'Invalid OTP format. Please enter a 6-digit OTP.');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new admin user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'Admin',
      isEmailVerified: true,
      credits: 100, // Admin gets more credits
      lastCreditRefresh: new Date(),
      isActive: true,
      lastActive: new Date()
    });

    // Generate JWT token
    const token = generateToken(String(user._id));

    // Send welcome email
    await sendWelcomeEmail(user.email, user.firstName || 'User');

    return sendSuccess(res, {
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    }, 'Admin account created successfully', 201);
  } catch (error) {
    console.error('Signup error:', error);
    return sendServerError(res, error);
  }
};

