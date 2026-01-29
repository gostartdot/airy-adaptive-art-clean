import { Response } from 'express';
import Match from '../models/Match';
import User from '../models/User';
import Credit from '../models/Credit';
import Notification from '../models/Notification';
import { AuthRequest } from '../middlewares/authMiddleware';
import { sendSuccess, sendError, sendServerError } from '../utils/responseHelper';
import mongoose from 'mongoose';
import { getRandomPersona, isAIPersonaId, getPersonaById } from '../config/aiPersonas';
import { getBlurredImageUrls } from '../utils/imageTransform';

// Helper function to mask name
const maskName = (name: string): string => {
  if (name.length <= 2) return name;
  return name[0] + '***' + name[name.length - 1];
};

// Helper function to deduct credits
const deductCredits = async (userId: string, action: string, amount: number, matchId?: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  if (user.credits < amount) {
    throw new Error('Insufficient credits');
  }

  user.credits -= amount;
  await user.save();

  // Record transaction
  await Credit.create({
    userId,
    action,
    amount: -amount,
    balanceAfter: user.credits,
    relatedMatchId: matchId
  });

  return user.credits;
};

// @desc    Find a new match
// @route   POST /api/matches/find
// @access  Private
export const findMatch = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const user = await User.findById(userId);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Check credits
    if (user.credits < 1) {
      return sendError(res, 'Insufficient credits', 400);
    }

    // STEP 1: Try to find REAL users first
    // Filter out AI persona IDs from matched/skipped users (only use real user ObjectIds)
    const realMatchedUsers = (user.matchedUsers || []).filter((id: any) => !isAIPersonaId(id.toString()));
    const realSkippedUsers = (user.skippedUsers || []).filter((id: any) => !isAIPersonaId(id.toString()));
    
    // Check if user has preferences set
    if (!user.preferences) {
      return sendError(res, 'User preferences not set. Please complete your profile.', 400);
    }
    
    const potentialMatches = await User.find({
      _id: { 
        $ne: userId,
        $nin: [...realMatchedUsers, ...realSkippedUsers]
      },
      gender: { $in: user.preferences.showMe },
      age: { 
        $gte: user.preferences.ageRange.min,
        $lte: user.preferences.ageRange.max
      },
      city: user.city,
      isActive: true,
      lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Active in last 7 days
    });

    let randomMatch: any;
    let isAIMatch = false;

    if (potentialMatches.length > 0) {
      // Found real users - use them!
      randomMatch = potentialMatches[Math.floor(Math.random() * potentialMatches.length)];
      console.log(`✅ Matched with REAL user: ${randomMatch.name}`);
    } else {
      // STEP 2: No real users available - use AI persona as fallback
      console.log('⚠️  No real users available. Using AI persona as fallback...');
      
      // Get already matched AI personas to avoid duplicates
      const matchedPersonaIds = (user.matchedUsers || []).filter((id: any) => 
        isAIPersonaId(id.toString())
      ).map((id: any) => id.toString());

      const aiPersona = getRandomPersona(
        user.preferences.showMe,
        user.preferences.ageRange,
        matchedPersonaIds
      );

      if (!aiPersona) {
        return sendError(res, 'No matches available. Try adjusting your preferences.', 404);
      }

      // Create a virtual user object from AI persona
      randomMatch = {
        _id: aiPersona.id, // Use AI persona ID (starts with 'ai_')
        name: aiPersona.name,
        age: aiPersona.age,
        gender: aiPersona.gender,
        city: aiPersona.city,
        bio: aiPersona.bio,
        interests: aiPersona.interests,
        photos: aiPersona.photos
      };

      isAIMatch = true;
      console.log(`🤖 Matched with AI persona: ${aiPersona.name} (${aiPersona.id})`);
    }

    // Normalize user order (always put smaller ID first to prevent race conditions)
    let normalizedUser1, normalizedUser2;
    if (!isAIMatch) {
      // For real users, sort by ID to ensure consistency
      const ids = [userId, randomMatch._id.toString()].sort();
      normalizedUser1 = ids[0];
      normalizedUser2 = ids[1];
      console.log(`🔍 Checking for match (normalized): ${normalizedUser1} <-> ${normalizedUser2}`);
    } else {
      // For AI matches, user is always first
      normalizedUser1 = userId;
      normalizedUser2 = randomMatch._id;
    }

    // Check if match already exists
    let match;
    if (!isAIMatch) {
      match = await Match.findOne({
        user1Id: normalizedUser1,
        user2Id: normalizedUser2,
        status: { $ne: 'skipped' }
      });
      
      if (match) {
        console.log(`✓ Found existing match: ${match._id}`);
      } else {
        console.log(`✗ No existing match found, will create new one`);
      }
    }

    // If match doesn't exist, create it
    if (!match) {
      match = await Match.create({
        user1Id: normalizedUser1,
        user2Id: normalizedUser2,
        status: 'active',
        revealStatus: {
          user1Requested: false,
          user2Requested: false,
          isRevealed: false
        }
      });
      console.log(`✅ Created new match: ${match._id}`);
    } else {
      console.log(`♻️ Match already exists: ${match._id}`);
    }

    // Update user's matched users (avoid duplicates)
    if (!user.matchedUsers) {
      user.matchedUsers = [];
    }
    if (!user.matchedUsers.includes(randomMatch._id)) {
      user.matchedUsers.push(randomMatch._id);
      await user.save();
    }

    // Deduct credit
    await deductCredits(userId, 'find_match', 1, (match._id as mongoose.Types.ObjectId).toString());

    // Create anonymous profile for response
    // SECURITY: Use server-side blurred image URLs to prevent DOM inspection bypass
    // The blurred URLs contain Cloudinary transformations that cannot be removed by users
    const anonymousProfile = {
      _id: randomMatch._id,
      matchId: match._id,
      maskedName: maskName(randomMatch.name),
      age: randomMatch.age,
      blurredPhotos: getBlurredImageUrls(randomMatch.photos || []),
      bio: randomMatch.bio,
      interests: randomMatch.interests,
      city: randomMatch.city,
      distance: 5, // Simplified for MVP
      isAnonymous: true
    };

    return sendSuccess(res, anonymousProfile, 'Match found!', 201);
  } catch (error: any) {
    return sendServerError(res, error);
  }
};

// @desc    Skip a match
// @route   POST /api/matches/:matchId/skip
// @access  Private
export const skipMatch = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { matchId } = req.params;

    const match = await Match.findById(matchId);
    if (!match) {
      return sendError(res, 'Match not found', 404);
    }

    // Verify user is part of this match
    if (match.user1Id.toString() !== userId && match.user2Id.toString() !== userId) {
      return sendError(res, 'Unauthorized', 403);
    }

    // Update match status
    match.status = 'skipped';
    await match.save();

    // Add to skipped users
    const otherUserId = match.user1Id.toString() === userId ? match.user2Id : match.user1Id;
    await User.findByIdAndUpdate(userId, {
      $push: { skippedUsers: otherUserId }
    });

    // Deduct credit
    //set 0 credit cost for testing
    await deductCredits(userId, 'skip_match', 0, matchId);

    return sendSuccess(res, { matchId }, 'Match skipped');
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Request reveal
// @route   POST /api/matches/:matchId/reveal-request
// @access  Private
export const requestReveal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { matchId } = req.params;

    const match = await Match.findById(matchId);
    if (!match) {
      return sendError(res, 'Match not found', 404);
    }

    // Verify user is part of this match
    const isUser1 = match.user1Id.toString() === userId;
    const isUser2 = match.user2Id.toString() === userId;
    
    if (!isUser1 && !isUser2) {
      return sendError(res, 'Unauthorized', 403);
    }

    // Check if user has already requested reveal
    const alreadyRequested = isUser1 ? match.revealStatus.user1Requested : match.revealStatus.user2Requested;
    
    if (alreadyRequested) {
      return sendError(res, 'You have already requested to reveal this profile', 400);
    }

    // Check if already revealed
    if (match.revealStatus.isRevealed) {
      return sendError(res, 'Profiles are already revealed', 400);
    }

    // Deduct credits (only after all checks pass)
    //set 0 credit cost for testing
    await deductCredits(userId, 'request_reveal', 0, matchId);

    // Update reveal request
    if (isUser1) {
      match.revealStatus.user1Requested = true;
      match.revealStatus.user1RequestedAt = new Date();
    } else {
      match.revealStatus.user2Requested = true;
      match.revealStatus.user2RequestedAt = new Date();
    }

    await match.save();

    // Create notification for other user (only if real user, not AI persona)
    const otherUserId = isUser1 ? match.user2Id : match.user1Id;
    if (!isAIPersonaId(otherUserId.toString())) {
      await Notification.create({
        userId: otherUserId,
        type: 'reveal_request',
        title: 'Reveal Request',
        message: 'Someone wants to reveal profiles!',
        relatedUserId: userId,
        relatedMatchId: matchId
      });
    }

    return sendSuccess(res, { match }, 'Reveal request sent');
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Accept reveal
// @route   POST /api/matches/:matchId/reveal-accept
// @access  Private
export const acceptReveal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { matchId } = req.params;

    const match = await Match.findById(matchId);
    if (!match) {
      return sendError(res, 'Match not found', 404);
    }

    // Verify user is part of this match
    const isUser1 = match.user1Id.toString() === userId;
    const isUser2 = match.user2Id.toString() === userId;
    
    if (!isUser1 && !isUser2) {
      return sendError(res, 'Unauthorized', 403);
    }

    // Check if other user has requested
    const otherUserRequested = isUser1 ? match.revealStatus.user2Requested : match.revealStatus.user1Requested;
    
    if (!otherUserRequested) {
      return sendError(res, 'Other user has not requested reveal yet', 400);
    }

    // Deduct credits
    //set 0 credit cost for testing
    await deductCredits(userId, 'accept_reveal', 0, matchId);

    // Update reveal status
    if (isUser1) {
      match.revealStatus.user1Requested = true;
      match.revealStatus.user1RequestedAt = new Date();
    } else {
      match.revealStatus.user2Requested = true;
      match.revealStatus.user2RequestedAt = new Date();
    }

    // Both have now requested - reveal!
    match.revealStatus.isRevealed = true;
    match.revealStatus.revealedAt = new Date();
    match.status = 'revealed';
    await match.save();

    // Create notification for other user (only if real user, not AI persona)
    const otherUserId = isUser1 ? match.user2Id : match.user1Id;
    if (!isAIPersonaId(otherUserId.toString())) {
      await Notification.create({
        userId: otherUserId,
        type: 'reveal_accepted',
        title: 'Profiles Revealed!',
        message: 'You can now see each other\'s full profiles',
        relatedUserId: userId,
        relatedMatchId: matchId
      });
    }

    return sendSuccess(res, { match }, 'Profiles revealed!');
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Get all matches for user
// @route   GET /api/matches
// @access  Private
export const getMatches = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const matches = await Match.find({
      $or: [{ user1Id: userId }, { user2Id: userId }],
      status: { $ne: 'skipped' }
    })
    .sort({ createdAt: -1 });

    // Format matches with anonymous/revealed data
    const formattedMatches = await Promise.all(matches.map(async (match) => {
      const isUser1 = match.user1Id.toString() === userId;
      const otherUserId = isUser1 ? match.user2Id : match.user1Id;
      
      let otherUser: any;
      
      // Check if other user is AI persona or real user
      if (isAIPersonaId(otherUserId.toString())) {
        // Get AI persona data
        const persona = getPersonaById(otherUserId.toString());
        if (persona) {
          otherUser = {
            _id: persona.id,
            name: persona.name,
            age: persona.age,
            gender: persona.gender,
            photos: persona.photos,
            bio: persona.bio,
            interests: persona.interests,
            city: persona.city
          };
        }
      } else {
        // Get real user data
        otherUser = await User.findById(otherUserId);
      }

      if (!otherUser) return null;
      
      if (match.revealStatus.isRevealed) {
        return {
          ...match.toObject(),
          otherUser,
          isAnonymous: false
        };
      } else {
        return {
          ...match.toObject(),
          otherUser: {
            _id: otherUser._id || otherUser.id,
            maskedName: maskName(otherUser.name),
            age: otherUser.age,
            blurredPhotos: getBlurredImageUrls(otherUser.photos || []),
            bio: otherUser.bio,
            interests: otherUser.interests,
            city: otherUser.city
          },
          isAnonymous: true
        };
      }
    }));

    // Filter out null matches
    const validMatches = formattedMatches.filter(m => m !== null);

    return sendSuccess(res, validMatches);
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Get single match
// @route   GET /api/matches/:matchId
// @access  Private
export const getMatch = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { matchId } = req.params;

    const match = await Match.findById(matchId);
    
    if (!match) {
      return sendError(res, 'Match not found', 404);
    }

    // Verify user is part of this match
    if (match.user1Id.toString() !== userId && match.user2Id.toString() !== userId) {
      return sendError(res, 'Unauthorized', 403);
    }

    const isUser1 = match.user1Id.toString() === userId;
    const otherUserId = isUser1 ? match.user2Id : match.user1Id;
    
    let otherUser: any;
    
    // Check if other user is AI persona or real user
    if (isAIPersonaId(otherUserId.toString())) {
      // Get AI persona data
      const persona = getPersonaById(otherUserId.toString());
      if (persona) {
        otherUser = {
          _id: persona.id,
          name: persona.name,
          age: persona.age,
          gender: persona.gender,
          photos: persona.photos,
          bio: persona.bio,
          interests: persona.interests,
          city: persona.city
        };
      }
    } else {
      // Get real user data
      otherUser = await User.findById(otherUserId);
    }

    if (!otherUser) {
      return sendError(res, 'Match user not found', 404);
    }
    
    let formattedMatch;
    if (match.revealStatus.isRevealed) {
      formattedMatch = {
        ...match.toObject(),
        otherUser,
        isAnonymous: false
      };
    } else {
      formattedMatch = {
        ...match.toObject(),
        otherUser: {
          _id: otherUser._id || otherUser.id,
          maskedName: maskName(otherUser.name),
          age: otherUser.age,
          blurredPhotos: getBlurredImageUrls(otherUser.photos || []),
          bio: otherUser.bio,
          interests: otherUser.interests,
          city: otherUser.city
        },
        isAnonymous: true
      };
    }

    return sendSuccess(res, formattedMatch);
  } catch (error) {
    return sendServerError(res, error);
  }
};

