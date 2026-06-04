const express = require('express');
const {
  register,
  login,
  googleLogin,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  toggleSaveProperty,
  uploadUserDocs
} = require('../controllers/authController');

const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/saved/:propertyId', protect, toggleSaveProperty);
router.put('/verify-docs', protect, upload.fields([
  { name: 'aadhaarPan', maxCount: 1 },
  { name: 'ownershipDoc', maxCount: 1 },
  { name: 'taxReceipt', maxCount: 1 },
  { name: 'utilityBill', maxCount: 1 }
]), uploadUserDocs);

module.exports = router;
