const express = require('express');
const {
  getAdminMetrics,
  getUsers,
  updateUser,
  deleteUser,
  getListings,
  updateListingStatus,
  suspendUser,
  getFraudAlerts,
  resolveFraudAlert,
  verifyProperty,
  verifyUser
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
router.put('/users/:id/suspend', suspendUser);
router.get('/fraud-alerts', getFraudAlerts);
router.put('/fraud-alerts/:id/resolve', resolveFraudAlert);
router.put('/listings/:id/verify', verifyProperty);
router.put('/users/:id/verify', verifyUser);

module.exports = router;
