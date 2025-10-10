import { Response } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../middlewares/authMiddleware';
import { sendSuccess, sendError, sendServerError } from '../utils/responseHelper';

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { limit = 20 } = req.query;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('relatedUserId', 'name photos')
      .populate('relatedMatchId');

    return sendSuccess(res, notifications);
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:notificationId/read
// @access  Private
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return sendError(res, 'Notification not found', 404);
    }

    if (notification.userId.toString() !== userId) {
      return sendError(res, 'Unauthorized', 403);
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return sendSuccess(res, notification, 'Notification marked as read');
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return sendSuccess(res, {}, 'All notifications marked as read');
  } catch (error) {
    return sendServerError(res, error);
  }
};

