import { Server, Socket } from 'socket.io';
import { handleChatSocket } from './chatSocket';
import { handleMatchSocket } from './matchSocket';
import { handleNotificationSocket } from './notificationSocket';
import { verifyToken } from '../utils/generateToken';

export const initializeSocket = (io: Server) => {
  // Auth
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token'));
    const decoded = verifyToken(token);
    if (!decoded) return next(new Error('Invalid token'));
    socket.data.userId = decoded.userId;
    next();
  });

  io.on('connection', (socket: Socket) => {
    console.log('Connected:', socket.id, 'User:', socket.data.userId);
    
    // Initialize handlers
    handleChatSocket(io, socket);
    handleMatchSocket(io, socket);
    handleNotificationSocket(io, socket);

    socket.on('disconnect', () => {
      console.log('Disconnected:', socket.id);
    });
  });
};
