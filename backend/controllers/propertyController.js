const jwt = require('jsonwebtoken');
const Property = require('../models/Property');
const Review = require('../models/Review');
const User = require('../models/User');
const { uploadToCloudinary } = require('../config/cloudinary');

// @desc    Get all properties with filters, sorting, and pagination
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res, next) => {
  try {
    const {
      city,
      state,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      minArea,
      maxArea,
      listingType,
      q, // Search query text
      sort,
      seller,
      agent,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    console.log(`[DEBUG] getProperties request received. Query parameters:`, req.query);

    // Debug Incoming filters
    console.log(`[DEBUG] Incoming filters:`, {
      city, state, propertyType, listingType, minPrice, maxPrice, bedrooms, bathrooms, minArea, maxArea, q, status, seller, agent
    });

    // Building query
    const queryObj = {};

    // Apply status filter: if status is provided, filter by it.
    // Otherwise do not filter by status to allow newly added seller properties or pending items.
    if (status) {
      queryObj.status = status;
    }

    if (city) {
      queryObj.city = { $regex: city.toLowerCase().trim(), $options: 'i' };
    }
    if (state) {
      queryObj.state = { $regex: state.toLowerCase().trim(), $options: 'i' };
    }
    
    // Normalize propertyType (case-insensitive, partial matching)
    if (propertyType) {
      queryObj.propertyType = { $regex: propertyType.toLowerCase().trim(), $options: 'i' };
    }
    
    // Normalize listingType (e.g. "rent", "For Rent", "for-rent" mapped to "rent"; "sale", "For Sale" mapped to "sale")
    if (listingType) {
      let normalizedListingType = listingType.toLowerCase().trim();
      if (normalizedListingType.includes('rent')) {
        normalizedListingType = 'rent';
      } else if (normalizedListingType.includes('sale') || normalizedListingType.includes('buy')) {
        normalizedListingType = 'sale';
      }
      queryObj.listingType = normalizedListingType;
    }

    if (seller) queryObj.seller = seller;
    if (agent) queryObj.agent = agent;
    
    // Budget range
    if (minPrice || maxPrice) {
      queryObj.price = {};
      if (minPrice) queryObj.price.$gte = Number(minPrice);
      if (maxPrice) queryObj.price.$lte = Number(maxPrice);
    }

    // Configuration filters
    if (bedrooms) queryObj.bedrooms = Number(bedrooms);
    if (bathrooms) queryObj.bathrooms = Number(bathrooms);

    // Area range
    if (minArea || maxArea) {
      queryObj.area = {};
      if (minArea) queryObj.area.$gte = Number(minArea);
      if (maxArea) queryObj.area.$lte = Number(maxArea);
    }

    // Robust search query mapping
    if (q) {
      const searchVal = q.toLowerCase().trim();
      const cityFilterVal = (city || '').toLowerCase().trim();
      const stateFilterVal = (state || '').toLowerCase().trim();
      
      if (searchVal !== cityFilterVal && searchVal !== stateFilterVal) {
        queryObj.$or = [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { city: { $regex: q, $options: 'i' } },
          { state: { $regex: q, $options: 'i' } },
          { address: { $regex: q, $options: 'i' } }
        ];
      }
    }

    console.log(`[DEBUG] Generated MongoDB query:`, JSON.stringify(queryObj, null, 2));

    console.log(`[DEBUG] Final MongoDB Query object:`, JSON.stringify(queryObj));

    // Sorting
    let sortOption = { createdAt: -1 }; // Default: Newest first
    if (sort) {
      switch (sort) {
        case 'price_asc':
          sortOption = { price: 1 };
          break;
        case 'price_desc':
          sortOption = { price: -1 };
          break;
        case 'views':
          sortOption = { viewsCount: -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Execute query
    const properties = await Property.find(queryObj)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .populate('seller', 'name email avatar')
      .populate('agent', 'name email avatar isVerifiedAgent');

    // Total count for pagination metadata
    const total = await Property.countDocuments(queryObj);

    console.log(`[DEBUG] Documents found: ${total}, Returned results: ${properties.length}`);

    res.status(200).json({
      success: true,
      count: properties.length,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
      properties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get autocomplete search suggestions
// @route   GET /api/properties/suggestions
// @access  Public
exports.getPropertySuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.status(200).json({ success: true, suggestions: [] });
    }

    // Search properties by city, state, or title matching query string prefix
    const regex = new RegExp(`^${q}`, 'i');
    
    // We run aggregates or searches to find unique cities, states, and titles
    const properties = await Property.find({
      status: 'available',
      $or: [
        { city: regex },
        { state: regex },
        { title: { $regex: q, $options: 'i' } }
      ]
    }).limit(8).select('title city state price');

    const suggestions = properties.map(p => {
      if (p.city.toLowerCase().startsWith(q.toLowerCase())) {
        return { type: 'location', label: `${p.city.toUpperCase()}, ${p.state.toUpperCase()}`, value: p.city };
      }
      return { type: 'property', label: p.title, value: p._id, price: p.price };
    });

    // Remove duplicates
    const uniqueSuggestions = Array.from(new Set(suggestions.map(JSON.stringify))).map(JSON.parse);

    res.status(200).json({
      success: true,
      suggestions: uniqueSuggestions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single property details and increment views
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('seller', 'name email avatar rating')
      .populate('agent', 'name email avatar isVerifiedAgent agentLicense');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    // Increment view counter
    property.viewsCount += 1;
    await property.save();

    // Fetch related reviews
    const reviews = await Review.find({ property: property._id })
      .populate('author', 'name avatar');

    // Track click behavior if logged in
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        await User.findByIdAndUpdate(decoded.id, {
          $push: { clickBehavior: { propertyId: property._id, clickedAt: new Date() } }
        });
      } catch (err) {
        // Silently skip if token is invalid
      }
    }

    res.status(200).json({
      success: true,
      property,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new property listing
// @route   POST /api/properties
// @access  Private (Seller, Agent, Admin)
exports.createProperty = async (req, res, next) => {
  try {
    console.log(`[DEBUG] createProperty request received. User ID: ${req?.user?.id}, Role: ${req?.user?.role}`);
    console.log(`[DEBUG] Received request body keys:`, Object.keys(req.body));

    // Add seller references
    req.body.seller = req.user.id;

    // Default status to available so it is active immediately
    req.body.status = req.body.status || 'available';

    // Handle files upload
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      console.log(`[DEBUG] Uploading ${req.files.length} images...`);
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(file.buffer);
        imageUrls.push(uploaded.secure_url);
      }
    } else {
      console.log(`[DEBUG] No images uploaded. Setting default premium placeholder image.`);
      // Set a default premium placeholder if no image was provided
      imageUrls.push('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80');
    }
    
    req.body.images = imageUrls;

    // Convert coordinates block if exists
    if (req.body.coordinates) {
      try {
        req.body.coordinates = typeof req.body.coordinates === 'string'
          ? JSON.parse(req.body.coordinates)
          : req.body.coordinates;
      } catch (e) {
        req.body.coordinates = { lat: 0, lng: 0 };
      }
    }

    // Convert amenities array if sent as string (like form-data format)
    if (req.body.amenities && typeof req.body.amenities === 'string') {
      try {
        req.body.amenities = JSON.parse(req.body.amenities);
      } catch (e) {
        req.body.amenities = req.body.amenities.split(',').map(a => a.trim());
      }
    }

    console.log(`[DEBUG] Saving property to MongoDB. Payload:`, JSON.stringify(req.body));
    const property = await Property.create(req.body);

    console.log(`[DEBUG] Property saved successfully in MongoDB.`);
    console.log(`[DEBUG] MongoDB document ID: ${property._id}`);
    console.log(`[DEBUG] Seller ID: ${property.seller}`);
    console.log(`[DEBUG] Status: ${property.status}`);

    res.status(201).json({
      success: true,
      property,
    });
  } catch (error) {
    console.error(`[DEBUG] Error in createProperty:`, error);
    next(error);
  }
};

// @desc    Update property listing
// @route   PUT /api/properties/:id
// @access  Private (Seller, Agent, Admin)
exports.updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    // Ensure user is owner (seller) or admin
    if (property.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this listing.' });
    }

    // Handle files upload (adds new images if provided)
    if (req.files && req.files.length > 0) {
      let imageUrls = [...property.images];
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(file.buffer);
        imageUrls.push(uploaded.secure_url);
      }
      req.body.images = imageUrls;
    }

    // Allow deleting images if a list of remaining images is sent
    if (req.body.existingImages) {
      try {
        const existing = typeof req.body.existingImages === 'string'
          ? JSON.parse(req.body.existingImages)
          : req.body.existingImages;
        req.body.images = existing;
      } catch (e) {
        // Keep current images if parse fails
      }
    }

    // Convert coordinates
    if (req.body.coordinates) {
      try {
        req.body.coordinates = typeof req.body.coordinates === 'string'
          ? JSON.parse(req.body.coordinates)
          : req.body.coordinates;
      } catch (e) {
        // skip
      }
    }

    // Convert amenities
    if (req.body.amenities && typeof req.body.amenities === 'string') {
      try {
        req.body.amenities = JSON.parse(req.body.amenities);
      } catch (e) {
        req.body.amenities = req.body.amenities.split(',').map(a => a.trim());
      }
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete property listing
// @route   DELETE /api/properties/:id
// @access  Private (Seller, Agent, Admin)
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    // Ensure user is owner (seller) or admin
    if (property.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing.' });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Property listing deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
