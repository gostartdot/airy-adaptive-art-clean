import { Server, Socket } from 'socket.io';

export const handleMatchSocket = (io: Server, socket: Socket) => {
  // Join user's personal room for match updates
  socket.on('join-user-room', (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`Socket ${socket.id} joined user room: user:${userId}`);
  });

  // Emit when profiles are revealed
  socket.on('profile-revealed', (data: { matchId: string; userId: string }) => {
    io.to(`user:${data.userId}`).emit('match-revealed', {
      matchId: data.matchId
    });
  });
};

