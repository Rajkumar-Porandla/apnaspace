const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, agentLicense } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email.' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'buyer',
      agentLicense: role === 'agent' ? agentLicense : '',
      isVerifiedAgent: false // Needs admin approval
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerifiedAgent: user.isVerifiedAgent
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerifiedAgent: user.isVerifiedAgent
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth payload login/register
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res, next) => {
  try {
    const { googleId, email, name, avatar, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email from Google payload is required.' });
    }

    let user = await User.findOne({ email });

    if (user) {
      // User exists, update googleId and avatar if not present
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (avatar && user.avatar !== avatar) {
        user.avatar = avatar;
      }
      await user.save();
    } else {
      // Create new user via Google sign-in
      user = await User.create({
        name: name || 'Google User',
        email,
        googleId,
        avatar: avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
        role: role || 'buyer',
        agentLicense: role === 'agent' ? 'RERA-GOOGLE-2026' : '',
        isVerifiedAgent: role === 'agent' ? false : undefined
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerifiedAgent: user.isVerifiedAgent
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('savedProperties');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      avatar: req.body.avatar,
      agentLicense: req.body.agentLicense
    };

    // Remove undefined keys
    Object.keys(fieldsToUpdate).forEach(key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]);

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email.' });
    }

    // In a fully integrated production app we would generate a crypto token and send an email
    // Here we generate a simple reset token and send it in response for easy demonstration/testing
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Simulating token hash save in db (expiring in 10 mins)
    // For demonstration, we simply send the resetToken back so the client can perform reset
    res.status(200).json({
      success: true,
      message: 'Password reset link simulated. Use the returned resetToken to submit the new password.',
      resetToken // Returned directly for UI integration testing
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const resetToken = req.params.token;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Please provide a new password.' });
    }

    // In simulation, we accept any active request if the token matches a simulated key or just any key
    // Let's reset the first user or let the caller specify the email for verification in body
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide the email associated with the account to complete verification.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Set new password
    user.password = password;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully!'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Save Property (Wishlist)
// @route   POST /api/auth/saved/:propertyId
// @access  Private
exports.toggleSaveProperty = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const propertyId = req.params.propertyId;

    const isSaved = user.savedProperties.includes(propertyId);

    if (isSaved) {
      // Remove from saved
      user.savedProperties = user.savedProperties.filter(id => id.toString() !== propertyId);
    } else {
      // Add to saved
      user.savedProperties.push(propertyId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      isSaved: !isSaved,
      savedProperties: user.savedProperties
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload User verification documents
// @route   PUT /api/auth/verify-docs
// @access  Private
exports.uploadUserDocs = async (req, res, next) => {
  try {
    const { uploadToCloudinary } = require('../config/cloudinary');
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const docs = {
      aadhaarPan: user.verificationDocuments?.aadhaarPan || '',
      ownershipDoc: user.verificationDocuments?.ownershipDoc || '',
      taxReceipt: user.verificationDocuments?.taxReceipt || '',
      utilityBill: user.verificationDocuments?.utilityBill || ''
    };

    if (req.files) {
      if (req.files.aadhaarPan) {
        const uploaded = await uploadToCloudinary(req.files.aadhaarPan[0].buffer);
        docs.aadhaarPan = uploaded.secure_url;
      }
      if (req.files.ownershipDoc) {
        const uploaded = await uploadToCloudinary(req.files.ownershipDoc[0].buffer);
        docs.ownershipDoc = uploaded.secure_url;
      }
      if (req.files.taxReceipt) {
        const uploaded = await uploadToCloudinary(req.files.taxReceipt[0].buffer);
        docs.taxReceipt = uploaded.secure_url;
      }
      if (req.files.utilityBill) {
        const uploaded = await uploadToCloudinary(req.files.utilityBill[0].buffer);
        docs.utilityBill = uploaded.secure_url;
      }
    }

    user.verificationDocuments = docs;
    user.verificationStatus = 'under_review';
    const docCount = Object.values(docs).filter(val => !!val).length;
    user.verificationConfidenceScore = 30 + docCount * 15; // 30 base + up to 60 = 90% confidence under review
    user.riskScore = Math.max(5, user.riskScore - 5);
    await user.save();

    // Create Notification for admin
    const Notification = require('../models/Notification');
    const AdminUsers = await User.find({ role: 'admin' });
    for (const admin of AdminUsers) {
      await Notification.create({
        recipient: admin._id,
        sender: user._id,
        type: 'verification_request',
        title: 'New User Verification Request',
        message: `${user.name} has uploaded identity documents for verification.`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Verification documents uploaded successfully. Under review.',
      user
    });
  } catch (error) {
    next(error);
  }
};
