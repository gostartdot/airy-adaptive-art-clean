import { Server, Socket } from 'socket.io';
import Notification from '../models/Notification';

export const handleNotificationSocket = (io: Server, socket: Socket) => {
  // Send notification to specific user
  socket.on('send-notification', async (data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedUserId?: string;
    relatedMatchId?: string;
  }) => {
    try {
      const notification = await Notification.create(data);
      
      const populatedNotification = await Notification.findById(notification._id)
        .populate('relatedUserId', 'name photos')
        .populate('relatedMatchId');

      io.to(`user:${data.userId}`).emit('new-notification', populatedNotification);
    } catch (error) {
      console.error('Send notification error:', error);
    }
  });
};

