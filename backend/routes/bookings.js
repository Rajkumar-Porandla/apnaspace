const express = require('express');
const {
  createBooking,
  getBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');

const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All booking routes require authentication

router.post('/', createBooking);
router.get('/', getBookings);
router.put('/:id', updateBookingStatus);

module.exports = router;
