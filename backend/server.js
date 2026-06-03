const express = require('express');
const http = require('http');
const socketio = require('socket.io');
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
const server = http.createServer(app);

// Setup Socket.io
const io = socketio(server, {
  cors: {
    origin: '*', // Allow connections from any origin for ease of development testing
    methods: ['GET', 'POST'],
  },
});

// Middleware configurations
app.use(helmet()); // Basic security headers
app.use(cors()); // CORS protection
app.use(express.json()); // Body parser

// Rate limiting (prevent API spam)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
});
app.use('/api/', limiter);

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
  res.status(200).json({ success: true, message: 'EstateAI API Server is healthy.' });
});

// Error handling middleware (Must be mounted last)
app.use(errorHandler);

// Socket.io Real-time Chat and Notification handler
const Message = require('./models/Message');

io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  // 1. Join Chat Session
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`Socket joined room: ${chatId}`);
  });

  // 2. Relay Real-time Message
  socket.on('send_message', async (data) => {
    const { chatId, senderId, receiverId, content, image } = data;

    try {
      // Create and save message in MongoDB
      const message = await Message.create({
        chatId,
        sender: senderId,
        receiver: receiverId,
        content: content || 'Sent an image',
        image: image || null,
      });

      // Broadcast message to the chat room (notifying both parties in real-time)
      io.to(chatId).emit('receive_message', message);
      
      // Send an alert in-app notification to receiver if listening elsewhere
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

  // 3. Typings Indicators
  socket.on('typing', (data) => {
    const { chatId, senderId, isTyping } = data;
    socket.to(chatId).emit('typing_status', { senderId, isTyping });
  });

  // 4. Read Receipts
  socket.on('read_receipt', async (data) => {
    const { chatId, messageId, receiverId, senderId } = data;

    try {
      if (messageId) {
        await Message.findByIdAndUpdate(messageId, { isRead: true });
      } else {
        // Mark all messages as read for this thread
        await Message.updateMany(
          { chatId, receiver: receiverId, isRead: false },
          { $set: { isRead: true } }
        );
      }
      
      // Notify the original sender that message is read
      socket.to(chatId).emit('messages_read', { senderId });
    } catch (err) {
      console.error('Socket read_receipt error:', err.message);
    }
  });

  // 5. Connection Disconnect
  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`EstateAI Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
