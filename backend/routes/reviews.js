const express = require('express');
const {
  createReview,
  getReviews,
} = require('../controllers/reviewController');

const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/', getReviews);

module.exports = router;
