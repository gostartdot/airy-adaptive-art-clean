import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { initSocket, disconnectSocket } from '../socket/socket';
import { useAuth } from '../store/useAuthStore';

export const useSocket = () => {
  const { token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (token) {
      const socketInstance = initSocket(token);
      setSocket(socketInstance);

      const handleConnect = () => {
        console.log('Socket connected via hook');
        setConnected(true);
      };

      const handleDisconnect = () => {
        console.log('Socket disconnected via hook');
        setConnected(false);
      };

      socketInstance.on('connect', handleConnect);
      socketInstance.on('disconnect', handleDisconnect);

      // Check initial connection state
      if (socketInstance.connected) {
        setConnected(true);
      }

      return () => {
        socketInstance.off('connect', handleConnect);
        socketInstance.off('disconnect', handleDisconnect);
      };
    } else {
      disconnectSocket();
      setSocket(null);
      setConnected(false);
    }
  }, [token]);

  return { socket, connected };
};

export default useSocket;

