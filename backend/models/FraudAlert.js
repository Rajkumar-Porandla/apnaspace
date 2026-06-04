const mongoose = require('mongoose');

const FraudAlertSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ['user', 'property'],
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
    },
    triggerType: {
      type: String,
      required: true, // e.g. 'price_anomaly', 'duplicate_listing', 'multiple_edits'
    },
    description: {
      type: String,
      required: true,
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['active', 'resolved'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FraudAlert', FraudAlertSchema);
