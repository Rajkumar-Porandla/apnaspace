const express = require('express');
const {
  createVisit,
  getVisits,
  updateVisitStatus,
  completeVisit,
  submitInterest,
  submitDecision,
  sellProperty
} = require('../controllers/visitController');

const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes require authentication

router.post('/', createVisit);
router.get('/', getVisits);
router.put('/:id/status', updateVisitStatus);
router.put('/:id/complete', completeVisit);
router.post('/:id/interest', submitInterest);
router.post('/:id/decision', submitDecision);
router.post('/:id/sell', sellProperty);

module.exports = router;
