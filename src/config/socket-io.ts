import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import * as redis from 'redis';

interface UserSocket {
  socketId: string;
  isOnline: boolean;
}

interface MessageSocket {
  id: string;
  to: string;
  content: Object;
  created_at: Date;
}

let io: Server;

// Create Redis client
const redisClient = redis.createClient();

// Connect to Redis
(async () => {
  await redisClient.connect();
  console.log('Connected to Redis!');
})();

// Handle Redis errors
redisClient.on('error', err => {
  console.error('Redis Error:', err);
});

// Redis key prefixes
const MESSAGE_QUEUE_PREFIX = 'message:queue:';
const USER_STATUS_PREFIX = 'user:status:';

const userSockets: Map<string, UserSocket> = new Map();

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

    let userId: string;

    // User login event
    socket.on('login', async (id: string) => {
      userId = id;

      // Register or update user
      userSockets.set(userId, {
        socketId: socket.id,
        isOnline: true,
      });

      // Update user status in Redis
      await redisClient.set(`${USER_STATUS_PREFIX}${userId}`, 'online');

      console.log(`User ${userId} connected with socket ${socket.id}`);

      // Deliver queued messages
      await deliverQueuedMessages(userId, socket);
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`[🔌] Client disconnected: ${socket.id}`);
      if (userId) {
        // Mark user as offline but keep their socket ID
        const user = userSockets.get(userId);
        if (user) {
          user.isOnline = false;
          userSockets.set(userId, user);

          // Update user status in Redis
          await redisClient.set(`${USER_STATUS_PREFIX}${userId}`, 'offline');

          console.log(`User ${userId} disconnected but kept in records`);
        }
      }
    });
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

export const sendSystemMessage = async (userId: string, data: Object) => {
  const message: MessageSocket = {
    id: uuidv4(),
    to: userId,
    content: data,
    created_at: new Date(),
  };

  // Try to deliver message immediately
  const targetUser = userSockets.get(userId);

  console.log(`[📡] Sending message to :`, targetUser);

  if (targetUser && targetUser.isOnline) {
    // User is online, send message directly
    io.to(targetUser.socketId).emit('receive_message', message);
    console.log(`Message sent directly to ${userId}`);
  } else {
    // User is offline or doesn't exist, queue the message in Redis
    await queueMessage(userId, message);
    console.log(`Message queued for ${userId}`);
  }
};

// Function to queue messages for offline users in Redis
async function queueMessage(
  userId: string,
  message: MessageSocket
): Promise<void> {
  await redisClient.rPush(
    `${MESSAGE_QUEUE_PREFIX}${userId}`,
    JSON.stringify(message)
  );
}

// Function to deliver queued messages from Redis
async function deliverQueuedMessages(
  userId: string,
  socket: Socket
): Promise<void> {
  const queueKey = `${MESSAGE_QUEUE_PREFIX}${userId}`;

  // Get the length of the queue
  const queueLength = await redisClient.lLen(queueKey);

  if (queueLength > 0) {
    console.log(`Delivering ${queueLength} queued messages to ${userId}`);

    // Get all messages from the queue
    const messages = await redisClient.lRange(queueKey, 0, -1);

    // Send all queued messages
    for (const messageJson of messages) {
      try {
        const message = JSON.parse(messageJson);
        socket.emit('receive_message', message);
      } catch (err) {
        console.error('Error parsing queued message:', err);
      }
    }

    // Clear the queue after delivery
    await redisClient.del(queueKey);
  }
}
