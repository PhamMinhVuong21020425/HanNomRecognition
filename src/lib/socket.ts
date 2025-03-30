import { io, Socket } from 'socket.io-client';

// Socket instance that will be reused
let socket: Socket | null = null;

export const connectSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_BASE_URL, {
      transports: ['websocket'],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Setup listeners
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    socket.on('connect_error', error => {
      console.error('Connection error:', error);
    });
  }

  return socket;
};

// Cleanup function to disconnect socket
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
