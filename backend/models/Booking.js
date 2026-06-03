const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sellerOrAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    visitDate: {
      type: Date,
      required: [true, 'Please specify a date for the visit'],
    },
    visitTime: {
      type: String, // E.g., '14:30' or '2:30 PM'
      required: [true, 'Please specify a time slot for the visit'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent booking double visits on the same slot for the same property by the same buyer
BookingSchema.index({ property: 1, buyer: 1, visitDate: 1 }, { unique: true });

module.exports = mongoose.model('Booking', BookingSchema);
