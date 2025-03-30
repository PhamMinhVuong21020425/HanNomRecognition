import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

export const initSocketIO = (httpServer: HTTPServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CROSS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[🔗] New client connected: ${socket.id}`);

    socket.on('disconnect', () =>
      console.log(`[🔌] Client disconnected: ${socket.id}`)
    );
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error(
      'Socket.IO has not been initialized. Please call initSocketIO first.'
    );
  }
  return io;
};
