const aiService = require('../services/aiService');
const Property = require('../models/Property');

// @desc    AI property search assistant chat
// @route   POST /api/ai/chat
// @access  Public (or Private depending on user context, we track user searches if authenticated)
exports.chatAssistant = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Please provide a message.' });
    }

    // 1. Call AI service to parse query into structured database filters
    const parsedFilters = await aiService.parseChatQuery(message);

    // 2. Query MongoDB using parsed filters
    const queryObj = { status: 'available' };

    if (parsedFilters.city) {
      queryObj.city = parsedFilters.city;
    }
    if (parsedFilters.propertyType) {
      queryObj.propertyType = parsedFilters.propertyType;
    }
    if (parsedFilters.listingType) {
      queryObj.listingType = parsedFilters.listingType;
    }
    
    // Bedrooms & Bathrooms
    if (parsedFilters.bedrooms > 0) {
      queryObj.bedrooms = { $gte: parsedFilters.bedrooms };
    }
    if (parsedFilters.bathrooms > 0) {
      queryObj.bathrooms = { $gte: parsedFilters.bathrooms };
    }

    // Price range
    if (parsedFilters.minPrice > 0 || parsedFilters.maxPrice > 0) {
      queryObj.price = {};
      if (parsedFilters.minPrice > 0) queryObj.price.$gte = parsedFilters.minPrice;
      if (parsedFilters.maxPrice > 0) queryObj.price.$lte = parsedFilters.maxPrice;
    }

    // Area range
    if (parsedFilters.minArea > 0 || parsedFilters.maxArea > 0) {
      queryObj.area = {};
      if (parsedFilters.minArea > 0) queryObj.area.$gte = parsedFilters.minArea;
      if (parsedFilters.maxArea > 0) queryObj.area.$lte = parsedFilters.maxArea;
    }

    // Execute query in MongoDB
    let properties = await Property.find(queryObj)
      .limit(6)
      .populate('seller', 'name email avatar')
      .populate('agent', 'name email avatar');

    // If properties.length === 0, relax query step-by-step
    let currentExplanation = parsedFilters.explanation;
    if (properties.length === 0) {
      // Step 1: Strip price filter (minPrice, maxPrice)
      const queryObjStep1 = { ...queryObj };
      delete queryObjStep1.price;
      properties = await Property.find(queryObjStep1)
        .limit(6)
        .populate('seller', 'name email avatar')
        .populate('agent', 'name email avatar');
      
      if (properties.length > 0) {
        currentExplanation = `We couldn't find matches in your exact price range, but here are some options matching your other requirements in ${parsedFilters.city || 'our database'}:`;
      } else {
        // Step 2: Strip bedrooms/bathrooms filters
        const queryObjStep2 = { ...queryObjStep1 };
        delete queryObjStep2.bedrooms;
        delete queryObjStep2.bathrooms;
        properties = await Property.find(queryObjStep2)
          .limit(6)
          .populate('seller', 'name email avatar')
          .populate('agent', 'name email avatar');
          
        if (properties.length > 0) {
          currentExplanation = `No exact matches in your price and bedroom configurations. Here are properties with similar features:`;
        } else {
          // Step 3: Filter by city only (status: 'available', city)
          const queryObjStep3 = { status: 'available' };
          if (queryObj.city) {
            queryObjStep3.city = queryObj.city;
          }
          properties = await Property.find(queryObjStep3)
            .limit(6)
            .populate('seller', 'name email avatar')
            .populate('agent', 'name email avatar');
            
          if (properties.length > 0) {
            currentExplanation = `We found no direct matches for your detailed filters. Here are the available properties in ${parsedFilters.city}:`;
          } else {
            // Step 4: Return general available properties (status: 'available')
            const queryObjStep4 = { status: 'available' };
            properties = await Property.find(queryObjStep4)
              .limit(6)
              .populate('seller', 'name email avatar')
              .populate('agent', 'name email avatar');
              
            currentExplanation = `No matches found in your selected location. Showing all our premium listings:`;
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      explanation: currentExplanation,
      filters: {
        city: parsedFilters.city,
        propertyType: parsedFilters.propertyType,
        bedrooms: parsedFilters.bedrooms,
        bathrooms: parsedFilters.bathrooms,
        minPrice: parsedFilters.minPrice,
        maxPrice: parsedFilters.maxPrice
      },
      properties
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate property marketing description
// @route   POST /api/ai/generate-description
// @access  Private (Sellers, Agents)
exports.generateDescription = async (req, res, next) => {
  try {
    const { propertyType, location, amenities, size, listingType } = req.body;

    if (!propertyType || !location || !size) {
      return res.status(400).json({ success: false, message: 'Property details (type, location, size) are required.' });
    }

    const amenitiesList = amenities || [];
    const descriptions = await aiService.generatePropertyDescription({
      propertyType,
      location,
      amenities: Array.isArray(amenitiesList) ? amenitiesList : [amenitiesList],
      size,
      listingType
    });

    res.status(200).json({
      success: true,
      descriptions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI Market Insights for dashboard
// @route   GET /api/ai/market-insights
// @access  Public
exports.getMarketInsights = async (req, res, next) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ success: false, message: 'Please specify a city for market insights.' });
    }

    const insights = await aiService.generateMarketInsights(city);

    res.status(200).json(insights);
  } catch (error) {
    next(error);
  }
};

// @desc    AI property locality Q&A assistant
// @route   POST /api/ai/locality-chat
// @access  Public
exports.chatLocality = async (req, res, next) => {
  try {
    const { propertyId, message } = req.body;

    if (!propertyId || !message) {
      return res.status(400).json({ success: false, message: 'Property ID and message are required.' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    // Call AI Service for locality specific Q&A
    const responseText = await aiService.answerLocalityQuestion({
      property,
      message
    });

    res.status(200).json({
      success: true,
      answer: responseText
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all unique cities present in properties database
// @route   GET /api/ai/cities
// @access  Public
exports.getAvailableCities = async (req, res, next) => {
  try {
    const cities = await Property.distinct('city');
    const validCities = cities.filter(c => !!c).map(c => c.toLowerCase().trim());
    const uniqueCities = Array.from(new Set(validCities));
    res.status(200).json({
      success: true,
      cities: uniqueCities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get location intelligence details for a property
// @route   GET /api/ai/location-intelligence
// @access  Public
exports.getPropertyLocationIntelligence = async (req, res, next) => {
  try {
    const { propertyId } = req.query;
    if (!propertyId) {
      return res.status(400).json({ success: false, message: 'Property ID is required.' });
    }
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }
    const intel = await aiService.getLocationIntelligence(property.city, property.address);
    res.status(200).json(intel);
  } catch (error) {
    next(error);
  }
};

