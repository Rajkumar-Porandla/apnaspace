const mongoose = require('mongoose');

const PurchaseRequestSchema = new mongoose.Schema(
  {
    visit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visit',
      required: true,
      unique: true, // One purchase intent decision form per visit
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    decision: {
      type: String,
      enum: ['yes_purchase', 'still_negotiating', 'not_interested'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PurchaseRequest', PurchaseRequestSchema);
