const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const FraudAlert = require('../models/FraudAlert');
const Visit = require('../models/Visit');
const PropertyTransaction = require('../models/PropertyTransaction');
const Notification = require('../models/Notification');

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

    // Fraud alerts and Verification additions
    const pendingUserVerifications = await User.countDocuments({ verificationStatus: 'under_review' });
    const pendingPropertyVerifications = await Property.countDocuments({ verificationStatus: 'under_review' });
    const pendingVerifications = pendingUserVerifications + pendingPropertyVerifications;

    const flaggedAccounts = await User.countDocuments({
      $or: [
        { riskScore: { $gt: 50 } },
        { isSuspended: true }
      ]
    });

    const riskAlerts = await FraudAlert.countDocuments({ status: 'active' });
    const visitRequests = await Visit.countDocuments();
    const propertyTransactions = await PropertyTransaction.countDocuments();

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
        platformRevenue,
        pendingVerifications,
        flaggedAccounts,
        riskAlerts,
        visitRequests,
        propertyTransactions
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

// @desc    Toggle user suspension status
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (Admin only)
exports.suspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isSuspended = !user.isSuspended;
    if (user.isSuspended) {
      user.riskScore = Math.min(100, user.riskScore + 30);
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isSuspended ? 'suspended' : 'unsuspended'} successfully.`,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get fraud risk alerts
// @route   GET /api/admin/fraud-alerts
// @access  Private (Admin only)
exports.getFraudAlerts = async (req, res, next) => {
  try {
    const alerts = await FraudAlert.find()
      .populate('user', 'name email avatar riskScore')
      .populate('property', 'title price riskScore')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve fraud risk alert
// @route   PUT /api/admin/fraud-alerts/:id/resolve
// @access  Private (Admin only)
exports.resolveFraudAlert = async (req, res, next) => {
  try {
    const alert = await FraudAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Fraud alert not found.' });
    }

    alert.status = 'resolved';
    await alert.save();

    res.status(200).json({
      success: true,
      message: 'Fraud alert resolved successfully.',
      alert
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify property document status
// @route   PUT /api/admin/listings/:id/verify
// @access  Private (Admin only)
exports.verifyProperty = async (req, res, next) => {
  try {
    const { status } = req.body; // 'verified' or 'rejected'
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please specify status: verified or rejected.' });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    property.verificationStatus = status;
    property.isVerified = status === 'verified';
    if (status === 'verified') {
      property.riskScore = Math.max(0, property.riskScore - 20);
      property.verificationConfidenceScore = 100;
      property.status = 'available';
    } else {
      property.riskScore = Math.min(100, property.riskScore + 15);
      property.verificationConfidenceScore = 0;
    }
    await property.save();

    // Notify Seller
    await Notification.create({
      recipient: property.seller,
      sender: req.user.id,
      type: status === 'verified' ? 'property_verified' : 'property_rejected',
      title: status === 'verified' ? 'Property Listing Verified!' : 'Property Documents Rejected',
      message: status === 'verified' 
        ? `Your property "${property.title}" has been verified successfully and is now active.`
        : `Verification documents for property "${property.title}" were rejected. Please review files and re-upload.`,
      relatedProperty: property._id
    });

    res.status(200).json({
      success: true,
      message: `Property listing verification status updated to: ${status}`,
      property
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify user identity status
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin only)
exports.verifyUser = async (req, res, next) => {
  try {
    const { status } = req.body; // 'verified' or 'rejected'
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please specify status: verified or rejected.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.verificationStatus = status;
    if (status === 'verified') {
      user.riskScore = Math.max(0, user.riskScore - 20);
      user.verificationConfidenceScore = 100;
      if (user.role === 'agent') {
        user.isVerifiedAgent = true;
      }
    } else {
      user.riskScore = Math.min(100, user.riskScore + 15);
      user.verificationConfidenceScore = 0;
      if (user.role === 'agent') {
        user.isVerifiedAgent = false;
      }
    }
    await user.save();

    // Notify User
    await Notification.create({
      recipient: user._id,
      sender: req.user.id,
      type: status === 'verified' ? 'property_verified' : 'property_rejected',
      title: status === 'verified' ? 'Account Verified Successfully!' : 'Account Verification Rejected',
      message: status === 'verified'
        ? 'Your verification documents have been approved by admin. Your account is now fully verified.'
        : 'Your account verification documents were rejected. Please submit valid documents.',
    });

    res.status(200).json({
      success: true,
      message: `User identity verification status updated to: ${status}`,
      user
    });
  } catch (error) {
    next(error);
  }
};
