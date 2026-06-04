const mongoose = require('mongoose');

const LocationIntelligenceSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true
  },
  localities: {
    type: Map,
    of: {
      name: String,
      locationScore: {
        overall: Number,
        connectivity: Number,
        safety: Number,
        education: Number,
        healthcare: Number,
        lifestyle: Number,
        publicTransport: Number,
        employmentOpportunities: Number
      },
      nearbyPlaces: [{
        category: {
          type: String,
          enum: ['school', 'college', 'hospital', 'pharmacy', 'metro', 'bus', 'railway', 'airport', 'mall', 'supermarket', 'restaurant', 'park', 'gym', 'itpark', 'bank']
        },
        name: String,
        distance: String,
        travelTime: String
      }],
      commuteTimes: {
        office: { driving: String, walking: String, transit: String },
        college: { driving: String, walking: String, transit: String },
        airport: { driving: String, walking: String, transit: String },
        railway: { driving: String, walking: String, transit: String },
        cityCenter: { driving: String, walking: String, transit: String }
      },
      neighborhoodInsights: String,
      investment: {
        rentalYield: Number, // Percentage value (e.g. 5.4)
        appreciationPotential: String, // e.g. "High", "Very High"
        demandScore: Number,
        investmentScore: Number,
        reasons: [String]
      },
      safetyIndex: {
        safetyScore: Number,
        familyFriendlyScore: Number,
        nightSafetyScore: Number
      },
      aiRecommendations: String
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('LocationIntelligence', LocationIntelligenceSchema);
