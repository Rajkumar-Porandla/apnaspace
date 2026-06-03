const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a property title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [5000, 'Description cannot be more than 5000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    propertyType: {
      type: String,
      required: [true, 'Please add a property type'],
      enum: ['apartment', 'house', 'villa', 'plot', 'commercial'],
    },
    bedrooms: {
      type: Number,
      default: 0,
    },
    bathrooms: {
      type: Number,
      default: 0,
    },
    area: {
      type: Number, // In square feet
      required: [true, 'Please add the area size'],
    },
    city: {
      type: String,
      required: [true, 'Please add a city'],
      trim: true,
      lowercase: true,
    },
    state: {
      type: String,
      required: [true, 'Please add a state'],
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: [true, 'Please add a street address'],
      trim: true,
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    images: {
      type: [String],
      default: [],
    },
    coordinates: {
      lat: {
        type: Number,
        default: 0,
      },
      lng: {
        type: Number,
        default: 0,
      },
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['available', 'sold', 'under_review'],
      default: 'under_review',
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    listingType: {
      type: String,
      required: true,
      enum: ['sale', 'rent'],
      default: 'sale',
      index: true
    },
    furnishing: {
      type: String,
      default: ''
    },
    tenants: {
      type: String,
      default: ''
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for optimized search filters and textual match
PropertySchema.index({ title: 'text', description: 'text' });
PropertySchema.index({ price: 1 });
PropertySchema.index({ city: 1 });
PropertySchema.index({ state: 1 });
PropertySchema.index({ propertyType: 1 });
PropertySchema.index({ status: 1 });

module.exports = mongoose.model('Property', PropertySchema);
