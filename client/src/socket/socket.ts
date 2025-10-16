import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

console.log('🔌 Socket URL:', SOCKET_URL);

let socket: Socket | null = null;

export const initSocket = (token: string): Socket => {
  if (socket && socket.connected) {
    console.log('✅ Socket already connected');
    return socket;
  }

  console.log('🔄 Initializing socket connection...');
  
  socket = io(SOCKET_URL, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    // FORCE WEBSOCKET ONLY to avoid session issues
    transports: ['websocket'],
    upgrade: false, // Disable transport upgrade
    withCredentials: true,
    // Add timeout
    timeout: 10000,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  socket.on('connect_error', (error: Error) => {
    console.error('❌ Socket connection error:', error.message);
    console.error('Full error:', error);
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log(`✅ Reconnected after ${attemptNumber} attempts`);
  });

  socket.on('reconnect_failed', () => {
    console.error('❌ Reconnection failed after all attempts');
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('👋 Disconnecting socket...');
    socket.disconnect();
    socket = null;
  }
};

// Helper methods for chat rooms
export const joinRoom = (matchId: string) => {
  if (socket) {
    console.log('🚪 Joining room:', matchId);
    socket.emit('join-room', matchId);
  }
};

export const leaveRoom = (matchId: string) => {
  if (socket) {
    console.log('🚪 Leaving room:', matchId);
    socket.emit('leave-room', matchId);
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