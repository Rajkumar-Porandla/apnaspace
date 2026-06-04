const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    visitDate: {
      type: Date,
      required: true,
    },
    visitTime: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    buyerConfirmedVisited: {
      type: Boolean,
      default: false,
    },
    sellerConfirmedCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index to prevent duplicate visits for the same date/slot
VisitSchema.index({ property: 1, buyer: 1, visitDate: 1 }, { unique: true });

module.exports = mongoose.model('Visit', VisitSchema);
