const Visit = require('../models/Visit');
const BuyerInterest = require('../models/BuyerInterest');
const PurchaseRequest = require('../models/PurchaseRequest');
const PropertyTransaction = require('../models/PropertyTransaction');
const Property = require('../models/Property');
const Notification = require('../models/Notification');

// @desc    Schedule property visit request
// @route   POST /api/visits
// @access  Private (Buyer, Agent, Seller)
exports.createVisit = async (req, res, next) => {
  try {
    const { propertyId, visitDate, visitTime, notes } = req.body;

    if (!visitDate || isNaN(Date.parse(visitDate))) {
      return res.status(400).json({ success: false, message: 'Please provide a valid visit date.' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    if (property.seller.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Sellers cannot book visits for their own properties.' });
    }

    const hostId = property.agent || property.seller;

    // Check if slot already booked by same buyer (to prevent duplicates via index)
    const existing = await Visit.findOne({
      property: propertyId,
      buyer: req.user.id,
      visitDate: new Date(visitDate),
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already requested/scheduled a visit for this property on this date.' });
    }

    const visit = await Visit.create({
      property: propertyId,
      buyer: req.user.id,
      seller: hostId,
      visitDate,
      visitTime,
      notes,
    });

    // Notify Seller
    await Notification.create({
      recipient: hostId,
      sender: req.user.id,
      type: 'booking_request',
      title: 'New Visit Request',
      message: `${req.user.name} has requested a visit for "${property.title}" on ${new Date(visitDate).toDateString()} at ${visitTime}.`,
      relatedProperty: propertyId,
    });

    res.status(201).json({ success: true, data: visit });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user visits
// @route   GET /api/visits
// @access  Private
exports.getVisits = async (req, res, next) => {
  try {
    let visits;
    if (req.user.role === 'buyer') {
      visits = await Visit.find({ buyer: req.user.id })
        .populate('property')
        .populate('seller', 'name email avatar')
        .sort({ visitDate: 1 });
    } else {
      visits = await Visit.find({ seller: req.user.id })
        .populate('property')
        .populate('buyer', 'name email avatar')
        .sort({ visitDate: 1 });
    }

    // Embed interest and purchase requests for each visit to enable visual pipeline mapping
    const enrichedVisits = [];
    for (const v of visits) {
      const interest = await BuyerInterest.findOne({ visit: v._id });
      const purchaseReq = await PurchaseRequest.findOne({ visit: v._id });
      const transaction = await PropertyTransaction.findOne({ visit: v._id });
      
      enrichedVisits.push({
        ...v.toObject(),
        interest: interest || null,
        purchaseRequest: purchaseReq || null,
        transaction: transaction || null
      });
    }

    res.status(200).json({ success: true, count: enrichedVisits.length, data: enrichedVisits });
  } catch (error) {
    next(error);
  }
};

// @desc    Update visit status (Approve, Reject, Reschedule)
// @route   PUT /api/visits/:id/status
// @access  Private (Seller, Agent, Admin)
exports.updateVisitStatus = async (req, res, next) => {
  try {
    const { status, visitDate, visitTime } = req.body; // status: 'approved', 'rejected', 'pending' (reschedule resets status or seller approves)

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid status: approved, rejected, pending.' });
    }

    const visit = await Visit.findById(req.params.id).populate('property');
    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit request not found.' });
    }

    if (visit.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this visit request.' });
    }

    visit.status = status;
    if (visitDate) visit.visitDate = visitDate;
    if (visitTime) visit.visitTime = visitTime;
    await visit.save();

    let notificationType = 'booking_status';
    let title = `Visit Request ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    let message = `Your visit scheduled for property "${visit.property.title}" has been ${status} by the listing manager.`;

    if (visitDate || visitTime) {
      title = 'Visit Request Rescheduled';
      message = `Your visit scheduled for property "${visit.property.title}" has been rescheduled to ${new Date(visit.visitDate).toDateString()} at ${visit.visitTime}.`;
    }

    // Notify Buyer
    await Notification.create({
      recipient: visit.buyer,
      sender: req.user.id,
      type: notificationType,
      title,
      message,
      relatedProperty: visit.property._id,
    });

    res.status(200).json({ success: true, data: visit });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm visit completion
// @route   PUT /api/visits/:id/complete
// @access  Private (Buyer, Seller)
exports.completeVisit = async (req, res, next) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found.' });
    }

    const isBuyer = visit.buyer.toString() === req.user.id;
    const isSeller = visit.seller.toString() === req.user.id;

    if (!isBuyer && !isSeller && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update completion status.' });
    }

    if (isBuyer) {
      visit.buyerConfirmedVisited = true;
    }
    if (isSeller) {
      visit.sellerConfirmedCompleted = true;
    }

    // If both parties confirm, transition status to completed
    if (visit.buyerConfirmedVisited && visit.sellerConfirmedCompleted) {
      visit.status = 'completed';
    } else if (isSeller) {
      // Allow seller to mark completed dynamically
      visit.status = 'completed';
      visit.sellerConfirmedCompleted = true;
      visit.buyerConfirmedVisited = true; // Auto-align for simplicity if needed
    }

    await visit.save();
    res.status(200).json({ success: true, data: visit });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit buyer interest feedback
// @route   POST /api/visits/:id/interest
// @access  Private (Buyer)
exports.submitInterest = async (req, res, next) => {
  try {
    const { interestLevel } = req.body; // 'very_interested', 'interested', 'not_interested'
    const visit = await Visit.findById(req.params.id).populate('property');

    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found.' });
    }

    if (visit.buyer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the visiting buyer can express interest feedback.' });
    }

    let interest = await BuyerInterest.findOne({ visit: visit._id });
    if (interest) {
      interest.interestLevel = interestLevel;
      await interest.save();
    } else {
      interest = await BuyerInterest.create({
        visit: visit._id,
        buyer: req.user.id,
        property: visit.property._id,
        interestLevel,
      });
    }

    // Notify Seller
    await Notification.create({
      recipient: visit.seller,
      sender: req.user.id,
      type: 'inquiry',
      title: 'Buyer Interest Expressed',
      message: `${req.user.name} reviewed visit for "${visit.property.title}" and is "${interestLevel.replace('_', ' ')}".`,
      relatedProperty: visit.property._id,
    });

    res.status(200).json({ success: true, data: interest });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit buyer purchase decision request
// @route   POST /api/visits/:id/decision
// @access  Private (Buyer)
exports.submitDecision = async (req, res, next) => {
  try {
    const { decision } = req.body; // 'yes_purchase', 'still_negotiating', 'not_interested'
    const visit = await Visit.findById(req.params.id).populate('property');

    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found.' });
    }

    if (visit.buyer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the visiting buyer can request purchase.' });
    }

    let purchaseReq = await PurchaseRequest.findOne({ visit: visit._id });
    if (purchaseReq) {
      purchaseReq.decision = decision;
      await purchaseReq.save();
    } else {
      purchaseReq = await PurchaseRequest.create({
        visit: visit._id,
        buyer: req.user.id,
        property: visit.property._id,
        decision,
      });
    }

    if (decision === 'yes_purchase') {
      // Notify Seller
      await Notification.create({
        recipient: visit.seller,
        sender: req.user.id,
        type: 'booking_request',
        title: 'Purchase Request Submitted',
        message: `${req.user.name} wants to purchase your property "${visit.property.title}"! Please verify client details and finalize the sale transaction.`,
        relatedProperty: visit.property._id,
      });
    }

    res.status(200).json({ success: true, data: purchaseReq });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm property sold and finalize transaction
// @route   POST /api/visits/:id/sell
// @access  Private (Seller, Agent)
exports.sellProperty = async (req, res, next) => {
  try {
    const visit = await Visit.findById(req.params.id).populate('property');
    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found.' });
    }

    if (visit.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to sell this property.' });
    }

    const property = await Property.findById(visit.property._id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    if (property.status === 'sold') {
      return res.status(400).json({ success: false, message: 'This property has already been marked as sold.' });
    }

    const purchaseReq = await PurchaseRequest.findOne({ visit: visit._id });

    // Mark property as sold in database
    property.status = 'sold';
    await property.save();

    // Create PropertyTransaction record
    const transaction = await PropertyTransaction.create({
      property: property._id,
      buyer: visit.buyer,
      seller: visit.seller,
      visit: visit._id,
      purchaseRequest: purchaseReq ? purchaseReq._id : null,
      amount: property.price,
    });

    if (purchaseReq) {
      purchaseReq.status = 'approved';
      await purchaseReq.save();
    }

    // Notify Buyer
    await Notification.create({
      recipient: visit.buyer,
      sender: req.user.id,
      type: 'property_sold',
      title: 'Congratulations! Property Purchased',
      message: `The manager of "${property.title}" has confirmed the sale! The property is now marked as Sold.`,
      relatedProperty: property._id,
    });

    res.status(200).json({ success: true, transaction, property });
  } catch (error) {
    next(error);
  }
};
