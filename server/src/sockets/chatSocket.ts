import { Server, Socket } from 'socket.io';
import Chat from '../models/Chat';
import Match from '../models/Match';

export const handleChatSocket = (io: Server, socket: Socket) => {
  console.log('Chat handler for:', socket.id);
  
  // Join room
  socket.on('join-room', (matchId: string) => {
    socket.join(`match:${matchId}`);
    const roomSize = io.sockets.adapter.rooms.get(`match:${matchId}`)?.size || 0;
    console.log(`Joined match:${matchId} - ${roomSize} users in room`);
  });

  // Leave room
  socket.on('leave-room', (matchId: string) => {
    socket.leave(`match:${matchId}`);
    console.log(`Left match:${matchId}`);
  });

  // Send message (not used, but keep for compatibility)
  socket.on('send-message', async (data: { matchId: string; content: string; senderId: string; receiverId: string }) => {
    try {
      const { matchId, content, senderId, receiverId } = data;
      const message = await Chat.create({ matchId, senderId, receiverId, content, type: 'text' });
      await Match.findByIdAndUpdate(matchId, { lastMessageAt: new Date() });
      const populatedMessage = await Chat.findById(message._id).populate('senderId receiverId', 'name photos');
      io.to(`match:${matchId}`).emit('receive-message', populatedMessage);
    } catch (error) {
      console.error('Socket message error:', error);
    }
  });
};
