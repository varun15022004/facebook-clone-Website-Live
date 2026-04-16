import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { AuthContext } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  online: boolean;
}

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  online: false,
});

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [online, setOnline] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      // Connect to socket server
      const newSocket = io('http://localhost:5000', {
        withCredentials: true,
      });

      // Set up event listeners
      newSocket.on('connect', () => {
        console.log('Socket connected');
        setOnline(true);
        
        // Join user's room
        newSocket.emit('join', user._id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setOnline(false);
      });

      // Save socket instance
      setSocket(newSocket);

      // Clean up on unmount
      return () => {
        newSocket.disconnect();
      };
    } else {
      // Disconnect if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setOnline(false);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, online }}>
      {children}
    </SocketContext.Provider>
  );
};