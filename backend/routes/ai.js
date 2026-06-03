const express = require('express');
const {
  chatAssistant,
  generateDescription,
  getMarketInsights,
  chatLocality,
} = require('../controllers/aiController');

const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/chat', chatAssistant);
router.post('/locality-chat', chatLocality);
router.get('/market-insights', getMarketInsights);

// Protected tool (restricted to Sellers/Agents/Admins)
router.post(
  '/generate-description',
  protect,
  authorize('seller', 'agent', 'admin'),
  generateDescription
);

module.exports = router;
