const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      required: true,
      enum: ['property', 'agent', 'seller'],
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Holds the reference to Agent or Seller being reviewed
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please add a comment'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    interestTag: {
      type: String,
      enum: ['interested_buying', 'interested_renting', 'scheduled_visit', 'local_resident', 'just_browsing', 'inquired_loan', ''],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// One review per author per target
ReviewSchema.index({ author: 1, property: 1, targetUser: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
