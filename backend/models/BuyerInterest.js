const mongoose = require('mongoose');

const BuyerInterestSchema = new mongoose.Schema(
  {
    visit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visit',
      required: true,
      unique: true, // One interest feedback per visit
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
    interestLevel: {
      type: String,
      enum: ['very_interested', 'interested', 'not_interested'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BuyerInterest', BuyerInterestSchema);
