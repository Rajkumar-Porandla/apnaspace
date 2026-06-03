const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware configurations
app.use(helmet()); // Basic security headers
app.use(cors()); // CORS protection
app.use(express.json()); // Body parser

// Rate limiting (prevent API spam) — skip in serverless as it uses in-memory store
if (!process.env.VERCEL) {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { success: false, message: 'Too many requests from this IP, please try again later.' },
  });
  app.use('/api/', limiter);
}

// Mount routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/chats', require('./routes/chats'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ai', require('./routes/ai'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'ApnaSpace API Server is healthy.' });
});

// Error handling middleware (Must be mounted last)
app.use(errorHandler);

// Only start the HTTP server + Socket.io when NOT running on Vercel (serverless)
if (!process.env.VERCEL) {
  const socketio = require('socket.io');
  const server = http.createServer(app);

  // Setup Socket.io
  const io = socketio(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Socket.io Real-time Chat and Notification handler
  const Message = require('./models/Message');

  io.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    socket.on('join_chat', (chatId) => {
      socket.join(chatId);
      console.log(`Socket joined room: ${chatId}`);
    });

    socket.on('send_message', async (data) => {
      const { chatId, senderId, receiverId, content, image } = data;
      try {
        const message = await Message.create({
          chatId,
          sender: senderId,
          receiver: receiverId,
          content: content || 'Sent an image',
          image: image || null,
        });
        io.to(chatId).emit('receive_message', message);
        io.emit(`notification_${receiverId}`, {
          type: 'chat_message',
          title: 'New Chat Message',
          message: message.content,
          sender: senderId,
        });
      } catch (err) {
        console.error('Socket send_message error:', err.message);
        socket.emit('socket_error', { message: 'Message could not be sent.' });
      }
    });

    socket.on('typing', (data) => {
      const { chatId, senderId, isTyping } = data;
      socket.to(chatId).emit('typing_status', { senderId, isTyping });
    });

    socket.on('read_receipt', async (data) => {
      const { chatId, messageId, receiverId, senderId } = data;
      try {
        if (messageId) {
          await Message.findByIdAndUpdate(messageId, { isRead: true });
        } else {
          await Message.updateMany(
            { chatId, receiver: receiverId, isRead: false },
            { $set: { isRead: true } }
          );
        }
        socket.to(chatId).emit('messages_read', { senderId });
      } catch (err) {
        console.error('Socket read_receipt error:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`ApnaSpace Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

// Export the Express app for Vercel serverless
module.exports = app;
