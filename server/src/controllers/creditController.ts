import { Response } from 'express';
import User from '../models/User';
import Credit from '../models/Credit';
import { AuthRequest } from '../middlewares/authMiddleware';
import { sendSuccess, sendError, sendServerError } from '../utils/responseHelper';

// @desc    Get credit balance
// @route   GET /api/credits/balance
// @access  Private
export const getBalance = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const user = await User.findById(userId);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Check if credits need refresh (daily at midnight)
    const now = new Date();
    const lastRefresh = new Date(user.lastCreditRefresh);
    
    const shouldRefresh = now.getDate() !== lastRefresh.getDate() ||
                          now.getMonth() !== lastRefresh.getMonth() ||
                          now.getFullYear() !== lastRefresh.getFullYear();

    if (shouldRefresh) {
      user.credits = 5;
      user.lastCreditRefresh = now;
      await user.save();

      // Record transaction
      await Credit.create({
        userId,
        action: 'daily_refresh',
        amount: 5,
        balanceAfter: 5
      });
    }

    // Calculate time until next refresh
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilRefresh = tomorrow.getTime() - now.getTime();

    return sendSuccess(res, {
      credits: user.credits,
      lastRefresh: user.lastCreditRefresh,
      nextRefresh: tomorrow,
      timeUntilRefresh
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Get credit history
// @route   GET /api/credits/history
// @access  Private
export const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { limit = 20 } = req.query;

    const transactions = await Credit.find({ userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('relatedMatchId');

    return sendSuccess(res, transactions);
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Refresh credits (manual - for testing/admin)
// @route   POST /api/credits/refresh
// @access  Private
export const refreshCredits = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const user = await User.findById(userId);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    user.credits = 5;
    user.lastCreditRefresh = new Date();
    await user.save();

    await Credit.create({
      userId,
      action: 'daily_refresh',
      amount: 5,
      balanceAfter: 5
    });

    return sendSuccess(res, { credits: user.credits }, 'Credits refreshed');
  } catch (error) {
    return sendServerError(res, error);
  }
};

