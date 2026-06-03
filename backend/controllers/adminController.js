const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');

// @desc    Get Admin Dashboard statistics and analytics
// @route   GET /api/admin/metrics
// @access  Private (Admin only)
exports.getAdminMetrics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    
    const activeListings = await Property.countDocuments({ status: 'available' });
    const underReviewListings = await Property.countDocuments({ status: 'under_review' });
    const soldListings = await Property.countDocuments({ status: 'sold' });

    const totalBookings = await Booking.countDocuments();
    const approvedBookings = await Booking.countDocuments({ status: 'approved' });

    // Revenue calculations (commission calculation: e.g. 1% commission on sold properties)
    const soldProperties = await Property.find({ status: 'sold' }).select('price');
    const totalSoldVolume = soldProperties.reduce((sum, p) => sum + (p.price || 0), 0);
    const platformRevenue = Math.round(totalSoldVolume * 0.01); // 1% platform fee

    // Group users by role
    const buyersCount = await User.countDocuments({ role: 'buyer' });
    const sellersCount = await User.countDocuments({ role: 'seller' });
    const agentsCount = await User.countDocuments({ role: 'agent' });
    
    // Non-verified agents count
    const pendingAgentsCount = await User.countDocuments({ role: 'agent', isVerifiedAgent: false });

    res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        buyersCount,
        sellersCount,
        agentsCount,
        pendingAgentsCount,
        totalProperties,
        activeListings,
        underReviewListings,
        soldListings,
        totalBookings,
        approvedBookings,
        totalSoldVolume,
        platformRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details (Role or verification status)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
exports.updateUser = async (req, res, next) => {
  try {
    const { role, isVerifiedAgent } = req.body;
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (role) user.role = role;
    if (isVerifiedAgent !== undefined) user.isVerifiedAgent = isVerifiedAgent;

    await user.save();

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await User.findByIdAndDelete(req.params.id);

    // Also delete any property listed by this user
    await Property.deleteMany({ seller: req.params.id });

    res.status(200).json({
      success: true,
      message: 'User and all their associated property listings deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all properties (including under-review ones)
// @route   GET /api/admin/listings
// @access  Private (Admin only)
exports.getListings = async (req, res, next) => {
  try {
    const properties = await Property.find()
      .populate('seller', 'name email avatar role')
      .populate('agent', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Moderate Property listings (verify and make available)
// @route   PUT /api/admin/listings/:id/status
// @access  Private (Admin only)
exports.updateListingStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'available', 'sold', 'under_review'

    if (!['available', 'sold', 'under_review'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid listing status. Choose from available, sold, or under_review.' });
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property listing not found.' });
    }

    res.status(200).json({
      success: true,
      property
    });
  } catch (error) {
    next(error);
  }
};
