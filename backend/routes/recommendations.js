const express = require('express');
const {
  getTrendingListings,
  getSimilarProperties,
  getPersonalizedRecommendations,
} = require('../controllers/recommendationController');

const router = express.Router();

router.get('/trending', getTrendingListings);
router.get('/similar/:propertyId', getSimilarProperties);
router.get('/personalized', getPersonalizedRecommendations);

module.exports = router;
