const Property = require('../models/Property');
const User = require('../models/User');

// @desc    Get Trending Listings (Most Viewed)
// @route   GET /api/recommendations/trending
// @access  Public
exports.getTrendingListings = async (req, res, next) => {
  try {
    const trending = await Property.find({ status: 'available' })
      .sort({ viewsCount: -1, createdAt: -1 })
      .limit(6)
      .populate('seller', 'name email avatar')
      .populate('agent', 'name email avatar');

    res.status(200).json({
      success: true,
      count: trending.length,
      properties: trending
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Similar Properties
// @route   GET /api/recommendations/similar/:propertyId
// @access  Public
exports.getSimilarProperties = async (req, res, next) => {
  try {
    const propertyId = req.params.propertyId;
    const baseProperty = await Property.findById(propertyId);

    if (!baseProperty) {
      return res.status(404).json({ success: false, message: 'Reference property not found.' });
    }

    // Parameters for similarity:
    // 1. Same property type or city
    // 2. Price within +/- 30% range
    // 3. Excluding itself
    const priceMin = baseProperty.price * 0.7;
    const priceMax = baseProperty.price * 1.3;

    const similar = await Property.find({
      _id: { $ne: propertyId },
      status: 'available',
      city: baseProperty.city,
      propertyType: baseProperty.propertyType,
      price: { $gte: priceMin, $lte: priceMax }
    })
      .limit(5)
      .populate('seller', 'name email avatar')
      .populate('agent', 'name email avatar');

    // If we didn't find enough matches, fall back to broader search (same city and status available)
    if (similar.length < 3) {
      const fallbackMatches = await Property.find({
        _id: { $ne: propertyId },
        status: 'available',
        city: baseProperty.city
      })
        .limit(5)
        .populate('seller', 'name email avatar');
      
      // Merge unique ones
      const ids = new Set(similar.map(p => p._id.toString()));
      fallbackMatches.forEach(p => {
        if (!ids.has(p._id.toString()) && similar.length < 5) {
          similar.push(p);
        }
      });
    }

    res.status(200).json({
      success: true,
      count: similar.length,
      properties: similar
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Personalized Recommendations ("Recommended For You")
// @route   GET /api/recommendations/personalized
// @access  Private/Public (graceful authentication fallback)
exports.getPersonalizedRecommendations = async (req, res, next) => {
  try {
    let user = null;
    
    // Check if token exists in headers
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      try {
        const token = authHeader.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        user = await User.findById(decoded.id).populate('savedProperties');
      } catch (err) {
        // Suppress auth decode errors, fall back to public
      }
    }

    // Case 1: Anonymous user or new user with zero click/save history
    // Return Trending + Newest listings
    const hasHistory = user && (user.savedProperties.length > 0 || user.clickBehavior.length > 0);

    if (!hasHistory) {
      const generalRecommendations = await Property.find({ status: 'available' })
        .sort({ viewsCount: -1, createdAt: -1 })
        .limit(6)
        .populate('seller', 'name email avatar');
      
      return res.status(200).json({
        success: true,
        personalized: false,
        properties: generalRecommendations
      });
    }

    // Case 2: Personalized recommendations based on user history
    // 1. Gather all cities, propertyTypes and prices user interacted with
    const cities = new Set();
    const propertyTypes = new Set();
    let totalPrice = 0;
    let priceCount = 0;

    // Collect from saved properties
    user.savedProperties.forEach(p => {
      if (p.city) cities.add(p.city);
      if (p.propertyType) propertyTypes.add(p.propertyType);
      if (p.price) {
        totalPrice += p.price;
        priceCount++;
      }
    });

    // Collect from click behavior (recent 15 clicks)
    const recentClicks = user.clickBehavior.slice(-15);
    for (const click of recentClicks) {
      const clickedProperty = await Property.findById(click.propertyId);
      if (clickedProperty) {
        if (clickedProperty.city) cities.add(clickedProperty.city);
        if (clickedProperty.propertyType) propertyTypes.add(clickedProperty.propertyType);
        if (clickedProperty.price) {
          totalPrice += clickedProperty.price;
          priceCount++;
        }
      }
    }

    // Build recommendation filter
    const query = { status: 'available' };
    
    // Match any of user's favorite cities/propertyTypes
    const conditions = [];
    if (cities.size > 0) conditions.push({ city: { $in: Array.from(cities) } });
    if (propertyTypes.size > 0) conditions.push({ propertyType: { $in: Array.from(propertyTypes) } });
    
    // Average price range +/- 40%
    if (priceCount > 0) {
      const avgPrice = totalPrice / priceCount;
      conditions.push({ price: { $gte: avgPrice * 0.6, $lte: avgPrice * 1.4 } });
    }

    if (conditions.length > 0) {
      query.$or = conditions;
    }

    // Exclude properties already saved by the user
    const savedIds = user.savedProperties.map(p => p._id.toString());
    query._id = { $nin: savedIds };

    let personalizedProperties = await Property.find(query)
      .limit(6)
      .populate('seller', 'name email avatar')
      .populate('agent', 'name email avatar');

    // If we have fewer than 4 recommendations, pad with trending listings
    if (personalizedProperties.length < 4) {
      const trending = await Property.find({
        status: 'available',
        _id: { $nin: [...savedIds, ...personalizedProperties.map(p => p._id.toString())] }
      })
        .sort({ viewsCount: -1 })
        .limit(6 - personalizedProperties.length)
        .populate('seller', 'name email avatar');
      
      personalizedProperties = [...personalizedProperties, ...trending];
    }

    res.status(200).json({
      success: true,
      personalized: true,
      properties: personalizedProperties
    });
  } catch (error) {
    next(error);
  }
};
