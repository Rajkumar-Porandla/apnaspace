const express = require('express');
const {
  getAdminMetrics,
  getUsers,
  updateUser,
  deleteUser,
  getListings,
  updateListingStatus
} = require('../controllers/adminController');

const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin')); // Strictly restrict all route endpoints to Admin role only

router.get('/metrics', getAdminMetrics);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/listings', getListings);
router.put('/listings/:id/status', updateListingStatus);

module.exports = router;
