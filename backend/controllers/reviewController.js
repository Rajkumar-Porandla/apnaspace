const Review = require('../models/Review');
const Property = require('../models/Property');
const User = require('../models/User');

// @desc    Submit a review / rating
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { targetType, propertyId, targetUserId, rating, comment, interestTag } = req.body;

    if (!targetType || !['property', 'agent', 'seller'].includes(targetType)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid review targetType (property, agent, or seller).' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a rating between 1 and 5.' });
    }

    // Build the query checks
    let reviewObj = {
      targetType,
      author: req.user.id,
      rating,
      comment,
      interestTag: interestTag || '',
    };

    if (targetType === 'property') {
      if (!propertyId) {
        return res.status(400).json({ success: false, message: 'Property ID is required for a property review.' });
      }
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found.' });
      }
      reviewObj.property = propertyId;
    } else {
      // agent or seller review
      if (!targetUserId) {
        return res.status(400).json({ success: false, message: 'Target User ID is required.' });
      }
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'Target User not found.' });
      }
      reviewObj.targetUser = targetUserId;
    }

    // Create the review - handles uniqueness constraint via catch
    const review = await Review.create(reviewObj);

    res.status(201).json({
      success: true,
      review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this target.' });
    }
    next(error);
  }
};

// @desc    Get reviews for a target and compute average rating
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
  try {
    const { propertyId, targetUserId } = req.query;

    let query = {};
    if (propertyId) {
      query.property = propertyId;
      query.targetType = 'property';
    } else if (targetUserId) {
      query.targetUser = targetUserId;
      query.targetType = { $in: ['agent', 'seller'] };
    } else {
      return res.status(400).json({ success: false, message: 'Please specify propertyId or targetUserId in query parameter.' });
    }

    const reviews = await Review.find(query)
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    // Calculate Average Rating dynamically
    const aggregateData = await Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const averageRating = aggregateData.length > 0
      ? Math.round(aggregateData[0].averageRating * 10) / 10
      : 0;
    const totalReviews = aggregateData.length > 0
      ? aggregateData[0].totalReviews
      : 0;

    res.status(200).json({
      success: true,
      averageRating,
      totalReviews,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};
