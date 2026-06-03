const express = require('express');
const {
  getProperties,
  getPropertySuggestions,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} = require('../controllers/propertyController');

const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getProperties);
router.get('/suggestions', getPropertySuggestions);
router.get('/:id', getProperty);

// Protected routes (Sellers, Agents, Admins only)
router.post(
  '/',
  protect,
  authorize('seller', 'agent', 'admin'),
  upload.array('images', 10),
  createProperty
);

router.put(
  '/:id',
  protect,
  authorize('seller', 'agent', 'admin'),
  upload.array('images', 10),
  updateProperty
);

router.delete(
  '/:id',
  protect,
  authorize('seller', 'agent', 'admin'),
  deleteProperty
);

module.exports = router;
