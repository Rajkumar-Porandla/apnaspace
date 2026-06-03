const express = require('express');
const {
  getMessages,
  getConversations,
  sendMessage,
} = require('../controllers/chatController');

const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect); // All chat APIs require JWT verification

router.get('/conversations', getConversations);
router.get('/messages/:userId', getMessages);
router.post('/messages', upload.single('image'), sendMessage);

module.exports = router;
