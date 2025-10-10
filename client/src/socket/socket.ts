import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket: Socket | null = null;

export const initSocket = (token: string): Socket => {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Helper methods for chat rooms
export const joinRoom = (matchId: string) => {
  if (socket) {
    socket.emit('join-room', matchId);
    console.log('Joined room:', matchId);
  }
};

export const leaveRoom = (matchId: string) => {
  if (socket) {
    socket.emit('leave-room', matchId);
    console.log('Left room:', matchId);
  }
};

export const onReceiveMessage = (callback: (message: any) => void) => {
  if (socket) {
    socket.on('receive-message', callback);
  }
};

export const offReceiveMessage = () => {
  if (socket) {
    socket.off('receive-message');
  }
};

export default {
  initSocket,
  getSocket,
  disconnectSocket,
  joinRoom,
  leaveRoom,
  onReceiveMessage,
  offReceiveMessage,
};

