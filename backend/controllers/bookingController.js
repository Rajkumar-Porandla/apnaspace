const Booking = require('../models/Booking');
const Property = require('../models/Property');
const Notification = require('../models/Notification');

// @desc    Schedule property visit
// @route   POST /api/bookings
// @access  Private (Buyer, Agent, Seller)
exports.createBooking = async (req, res, next) => {
  try {
    const { propertyId, visitDate, visitTime, notes } = req.body;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    // Check that buyer is not the seller
    if (property.seller.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Sellers cannot book visits for their own properties.' });
    }

    // Determine target host (agent if assigned, otherwise seller)
    const hostId = property.agent || property.seller;

    // Check if slot already booked by same buyer (to prevent duplicates via index)
    const existing = await Booking.findOne({
      property: propertyId,
      buyer: req.user.id,
      visitDate: new Date(visitDate),
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already requested/scheduled a visit for this property on this date.' });
    }

    const booking = await Booking.create({
      property: propertyId,
      buyer: req.user.id,
      sellerOrAgent: hostId,
      visitDate,
      visitTime,
      notes,
    });

    // Create Notification for Seller/Agent
    await Notification.create({
      recipient: hostId,
      sender: req.user.id,
      type: 'booking_request',
      title: 'New Visit Scheduled',
      message: `${req.user.name} has scheduled a visit for property "${property.title}" on ${new Date(visitDate).toDateString()} at ${visitTime}.`,
      relatedProperty: propertyId,
    });

    res.status(201).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user bookings (visit schedules)
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
  try {
    let bookings;

    // Buyers see their booked visits, Sellers/Agents see visits scheduled with them
    if (req.user.role === 'buyer') {
      bookings = await Booking.find({ buyer: req.user.id })
        .populate('property')
        .populate('sellerOrAgent', 'name email avatar isVerifiedAgent')
        .sort({ visitDate: 1 });
    } else {
      bookings = await Booking.find({ sellerOrAgent: req.user.id })
        .populate('property')
        .populate('buyer', 'name email avatar')
        .sort({ visitDate: 1 });
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (Approve or Reject visit)
// @route   PUT /api/bookings/:id
// @access  Private (Seller, Agent, Admin)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid status update: approved or rejected.' });
    }

    const booking = await Booking.findById(req.params.id).populate('property');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Ensure authorized host is changing status
    if (booking.sellerOrAgent.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to change status of this booking.' });
    }

    booking.status = status;
    await booking.save();

    // Create Notification for Buyer
    await Notification.create({
      recipient: booking.buyer,
      sender: req.user.id,
      type: 'booking_status',
      title: `Visit Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your visit scheduled for property "${booking.property.title}" has been ${status} by the listing manager.`,
      relatedProperty: booking.property._id,
    });

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};
