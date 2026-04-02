const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const onlineUsers = new Map(); // userId -> socket.id
const userRooms = new Map(); // socket.id -> Set of rooms (for stopTyping on disconnect)

const chatSocket = (server) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';

  const io = new Server(server, {
    cors: {
      // FIX: Locked down CORS from '*' to the actual frontend origin
      origin: frontendUrl,
      methods: ['GET', 'POST'],
    },
  });

  // FIX: JWT authentication middleware for Socket.io connections
  io.use((socket, next) => {
    const token = socket.handshake.query.token || socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userName = decoded.name;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // FIX: Use the verified userId from JWT instead of trusting query param
    const userId = socket.userId;

    if (userId) {
      onlineUsers.set(userId, socket.id);
      userRooms.set(socket.id, new Set());
      console.log(`User ${userId} is LIVE [Socket: ${socket.id}]`);

      // Notify others (especially host)
      io.emit('onlineStatusUpdate', { userId, status: 'online' });
    }

    // Join room based on propertyId or user pair
    socket.on('joinRoom', (room) => {
      socket.join(room);
      // FIX: Track rooms for stopTyping cleanup on disconnect
      const rooms = userRooms.get(socket.id);
      if (rooms) rooms.add(room);
    });

    // Send message to a specific room
    socket.on('sendMessage', (data) => {
      io.to(data.room).emit('receiveMessage', data.message);
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(data.room).emit('typing', data.user);
    });

    // Reaction
    socket.on('sendReaction', (data) => {
      io.to(data.room).emit('receiveReaction', { messageId: data.messageId, reactions: data.reactions });
    });

    socket.on('disconnect', () => {
      if (userId) {
        onlineUsers.delete(userId);
        io.emit('onlineStatusUpdate', { userId, status: 'offline' });

        // FIX: Emit stopTyping to all rooms user was in, preventing orphaned indicators
        const rooms = userRooms.get(socket.id);
        if (rooms) {
          rooms.forEach((room) => {
            socket.to(room).emit('stopTyping', { userId, name: socket.userName });
          });
          userRooms.delete(socket.id);
        }
      }
    });
  });

  return io;
};

const isUserOnline = (userId) => onlineUsers.has(userId.toString());

module.exports = { chatSocket, isUserOnline };
