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
      page = 1,
      limit = 10,
    } = req.query;

    // Building query
    const queryObj = { status: 'available' }; // Only show active listings

    if (city) queryObj.city = city.toLowerCase().trim();
    if (state) queryObj.state = state.toLowerCase().trim();
    if (propertyType) queryObj.propertyType = propertyType;
    if (listingType) queryObj.listingType = listingType;
    
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

    // Text search query
    if (q) {
      queryObj.$text = { $search: q };
    }

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
    // Add seller references
    req.body.seller = req.user.id;

    // Handle files upload
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(file.buffer);
        imageUrls.push(uploaded.secure_url);
      }
    } else {
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

    const property = await Property.create(req.body);

    res.status(201).json({
      success: true,
      property,
    });
  } catch (error) {
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
