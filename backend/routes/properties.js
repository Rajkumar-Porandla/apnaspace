const express = require('express');
const {
  getProperties,
  getPropertySuggestions,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyDocs
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

router.put(
  '/:id/verify-docs',
  protect,
  authorize('seller', 'agent', 'admin'),
  upload.fields([
    { name: 'ownershipDoc', maxCount: 1 },
    { name: 'taxReceipt', maxCount: 1 },
    { name: 'utilityBill', maxCount: 1 }
  ]),
  uploadPropertyDocs
);

module.exports = router;
