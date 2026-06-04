const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['buyer', 'seller', 'agent', 'admin'],
      default: 'buyer',
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
    },
    googleId: {
      type: String,
      default: null,
    },
    isVerifiedAgent: {
      type: Boolean,
      default: false,
    },
    agentLicense: {
      type: String,
      default: '',
    },
    savedProperties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
      },
    ],
    searchHistory: [
      {
        type: String,
        trim: true,
      },
    ],
    clickBehavior: [
      {
        propertyId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Property',
        },
        clickedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    riskScore: {
      type: Number,
      default: 15,
      min: 0,
      max: 100,
    },
    verificationConfidenceScore: {
      type: Number,
      default: 20,
      min: 0,
      max: 100,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'rejected'],
      default: 'pending',
    },
    verificationDocuments: {
      aadhaarPan: { type: String, default: '' },
      ownershipDoc: { type: String, default: '' },
      taxReceipt: { type: String, default: '' },
      utilityBill: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  if (!this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
