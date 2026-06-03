const Message = require('../models/Message');
const User = require('../models/User');
const { uploadToCloudinary } = require('../config/cloudinary');

// Helper to generate dynamic chatId
const getChatId = (id1, id2) => {
  return [id1.toString(), id2.toString()].sort().join('_');
};

// @desc    Get message history between logged-in user and another user
// @route   GET /api/chats/messages/:userId
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;

    const chatId = getChatId(currentUserId, targetUserId);

    // Retrieve message history
    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 });

    // Mark messages received from the other user as read
    await Message.updateMany(
      { chatId, receiver: currentUserId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active conversation threads (chat partners list)
// @route   GET /api/chats/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;

    // Aggregate to find unique chat IDs the user belongs to
    // and extract the latest message from each
    const conversationsRaw = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 } // Sort newest first
      },
      {
        $group: {
          _id: '$chatId',
          lastMessage: { $first: '$$ROOT' }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    const conversations = [];

    for (const conv of conversationsRaw) {
      const lastMsg = conv.lastMessage;
      // Get the other user's info
      const partnerId = lastMsg.sender.toString() === currentUserId ? lastMsg.receiver : lastMsg.sender;
      
      const partner = await User.findById(partnerId).select('name email avatar role');
      if (!partner) continue;

      // Count unread messages received from this partner
      const unreadCount = await Message.countDocuments({
        chatId: conv._id,
        receiver: currentUserId,
        isRead: false
      });

      conversations.push({
        chatId: conv._id,
        partner,
        lastMessage: {
          content: lastMsg.content,
          image: lastMsg.image,
          sender: lastMsg.sender,
          createdAt: lastMsg.createdAt
        },
        unreadCount
      });
    }

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message via HTTP REST (useful for sending images or fallback)
// @route   POST /api/chats/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;
    const currentUserId = req.user.id;

    if (!receiverId || (!content && !req.file)) {
      return res.status(400).json({ success: false, message: 'Please provide receiverId and message content or image.' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Recipient not found.' });
    }

    let imageUrl = null;
    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.buffer);
      imageUrl = uploaded.secure_url;
    }

    const chatId = getChatId(currentUserId, receiverId);

    const message = await Message.create({
      chatId,
      sender: currentUserId,
      receiver: receiverId,
      content: content || 'Sent an image',
      image: imageUrl
    });

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
};
