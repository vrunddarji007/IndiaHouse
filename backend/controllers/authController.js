const User = require('../models/User');
const jwt = require('jsonwebtoken');
const generateOTP = require('../utils/otpGenerator');
const { sendOTPEmail } = require('../utils/emailService');
const { sendOTPSMS } = require('../utils/smsService');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const checkSuspension = require('../utils/checkSuspension');

/**
 * @desc    Unified Register or Login
 * @route   POST /api/auth/register-or-login
 * @access  Public
 */
exports.registerOrLogin = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, role } = req.body;
    const method = 'email';
    const name = (firstName && lastName) ? `${firstName} ${lastName}` : req.body.name;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    let user = await User.findOne({ email });
    let isNewUser = false;
    if (user) {
      if (!user.isVerified) {
        if (name) user.name = name;
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;
        await user.save();
      }
    } else {
      if (!name || !role) return res.status(200).json({ success: false, needsRole: true, message: 'First time? Provide name and role.' });

      // FIX: Instead of deleting unverified users by phone (DoS vector),
      // check if phone is already taken by a VERIFIED user.
      const existingVerifiedPhone = await User.findOne({ phone, isVerified: true });
      if (existingVerifiedPhone) {
        return res.status(400).json({ success: false, message: 'This phone number is already registered with a verified account.' });
      }

      // Clean up only the SAME email's stale unverified record (not by phone)
      await User.deleteMany({ email, isVerified: false });

      user = await User.create({ name, firstName, lastName, email, phone, role: role || 'buyer', isVerified: false });
      isNewUser = true;
    }
    const otp = generateOTP();
    await user.setOTP(otp, method);
    await dispatchOTP(user, otp, method);
    res.status(200).json({ success: true, isNewUser, message: user.isVerified ? `Welcome back, ${user.name}! OTP sent.` : `OTP sent via ${method}.`, email: user.email, phone: user.phone ? user.phone.replace(/.(?=.{4})/g, '*') : undefined, method, role: user.role });
  } catch (error) { next(error); }
};

const generateToken = (user) => jwt.sign({ id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
const dispatchOTP = async (user, otp, method) => {
  await sendOTPEmail(user.email, otp, user.name);
  console.log(`[OTP] ${user.email}: ${otp}`);
};

/**
 * @desc    Verify OTP
 */
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const isValid = await user.verifyOTP(otp);
    if (!isValid) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    // FIX: DRY suspension check via shared utility
    const suspension = checkSuspension(user);
    if (suspension.isSuspended) {
      return res.status(suspension.response.statusCode).json(suspension.response.body);
    }

    user.isVerified = true;
    user.otp = undefined;
    user.lastLogin = new Date();
    await user.save();
    const token = generateToken(user);
    res.json({ success: true, message: 'Verified!', _id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, isVerified: true, token, needsPassword: !user.password });
  } catch (error) { next(error); }
};

/**
 * @desc    Google Login
 * @route   POST /api/auth/google-login
 */
exports.googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ success: false, message: 'Google ID Token is required' });

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user automatically from Google data
      user = await User.create({
        name,
        email,
        profilePhoto: picture,
        isVerified: true,
        // No password set yet, they use Google
      });
      
      const token = generateToken(user);
      return res.status(200).json({ 
        success: true, 
        isNewUser: true, 
        token,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // default 'buyer'
        needsTerms: true,
        isProfileComplete: false,
        isVerified: true,
        message: 'Google account linked. Please complete your profile.' 
      });
    }

    // Check if user has accepted terms
    const needsTerms = !user.termsAccepted || !user.termsAccepted.status;

    // Standard suspension check
    const suspension = checkSuspension(user);
    if (suspension.isSuspended) {
      return res.status(suspension.response.statusCode).json(suspension.response.body);
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);
    res.json({ 
      success: true, 
      token, 
      _id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      needsTerms,
      isProfileComplete: user.isProfileComplete,
      isVerified: true 
    });
  } catch (error) {
    console.error('[GOOGLE AUTH ERROR]', error);
    res.status(401).json({ success: false, message: error.message || 'Google authentication failed' });
  }
};

/**
 * @desc    Login with password
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // 1. Check for Host Credentials directly from .env
    const hostEmail = (process.env.HOST_EMAIL || '').toLowerCase().trim();
    const hostPassword = process.env.HOST_PASSWORD || '';

    if (hostEmail && hostPassword && email.toLowerCase().trim() === hostEmail && password === hostPassword) {
      let user = await User.findOne({ email: hostEmail });
      if (!user) {
        user = new User({
          name: 'Host Admin',
          email: hostEmail,
          phone: '+910000000000',
          password: hostPassword,
          role: 'host',
          isVerified: true
        });
      } else {
        user.role = 'host';
        user.isVerified = true;
        if (!user.password) user.password = hostPassword;
      }
      user.lastLogin = new Date();
      await user.save();
      return res.json({ success: true, _id: user.id, name: user.name, email: user.email, phone: user.phone, role: 'host', isVerified: true, token: generateToken(user) });
    }

    // 2. Fallback to standard database user check
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(403).json({ success: false, message: 'Please verify first', notVerified: true });
    if (!user.password) return res.status(400).json({ success: false, message: 'No password set. Use OTP.' });
    
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // FIX: DRY suspension check via shared utility
    const suspension = checkSuspension(user);
    if (suspension.isSuspended) {
      return res.status(suspension.response.statusCode).json(suspension.response.body);
    }

    user.lastLogin = new Date();
    await user.save();
    res.json({ success: true, _id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, isVerified: true, token: generateToken(user) });
  } catch (error) { next(error); }
};

/**
 * @desc    Resend OTP
 */
exports.resendOtp = async (req, res, next) => {
  try {
    const { email, verificationMethod } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const otp = generateOTP();
    await user.setOTP(otp, 'email');
    await dispatchOTP(user, otp, 'email');
    res.json({ success: true, message: 'New OTP sent' });
  } catch (error) { next(error); }
};

/**
 * @desc    Set password
 */
exports.setPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.password = password;
    await user.save();
    res.json({ success: true, message: 'Password set!' });
  } catch (error) { next(error); }
};

/**
 * @desc    Forgot Password – sends OTP to email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with that email' });
    if (!user.isVerified) return res.status(400).json({ success: false, message: 'Account not verified. Please register first.' });

    const otp = generateOTP();
    await user.setOTP(otp, 'email');
    await dispatchOTP(user, otp, 'email');
    res.json({ success: true, message: 'Password reset OTP sent to your email.' });
  } catch (error) { next(error); }
};

/**
 * @desc    Reset Password – verifies OTP then sets new password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isValid = await user.verifyOTP(otp);
    if (!isValid) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    user.password = newPassword;
    user.otp = undefined;
    await user.save();
    res.json({ success: true, message: 'Password reset successfully! You can now log in.' });
  } catch (error) { next(error); }
};

/**
 * @desc    Host Login
 */
exports.hostLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // FIX: Read credentials from env (fallback to hardcoded for backward compat)
    const hostEmail = (process.env.HOST_EMAIL || '').toLowerCase().trim();
    const hostPassword = process.env.HOST_PASSWORD || '';

    if (!hostEmail || !hostPassword || email.toLowerCase().trim() !== hostEmail || password !== hostPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    let user = await User.findOne({ email: hostEmail });
    if (!user) {
      // Create new host user — password will be hashed by pre('save') hook
      user = new User({
        name: 'Host Admin',
        email: hostEmail,
        phone: '+910000000000',
        password: hostPassword,
        role: 'host',
        isVerified: true,
      });
    } else {
      user.role = 'host';
      user.isVerified = true;
      // FIX: Only set password if it hasn't been set yet (avoid re-hashing every login)
      if (!user.password) {
        user.password = hostPassword;
      }
    }

    user.lastLogin = new Date();
    await user.save();
    res.json({ success: true, token: generateToken(user), _id: user._id, name: user.name, email: user.email, role: 'host' });
  } catch (error) { next(error); }
};

/**
 * @desc    Submit moderation appeal
 */
exports.submitAppeal = async (req, res, next) => {
  try {
    const { email, message } = req.body;
    console.log(`[APPEAL DEBUG] Received appeal: email=${email}, msg=${message}`);
    if (!email || !message) return res.status(400).json({ success: false, message: 'Email and message are required' });

    const User = require('../models/User');
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[APPEAL DEBUG] User not found for email: ${email}`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const suspension = checkSuspension(user);
    if (!suspension.isSuspended) {
      console.log(`[APPEAL DEBUG] User is not suspended: ${email}`);
      return res.status(400).json({ success: false, message: 'Your account is active. No appeal needed.' });
    }

    const ModerationAppeal = require('../models/ModerationAppeal');
    const existingAppeal = await ModerationAppeal.findOne({ userId: user._id, status: 'pending' });
    if (existingAppeal) {
      console.log(`[APPEAL DEBUG] Pending appeal already exists for: ${email}`);
      return res.status(400).json({ success: false, message: 'You already have a pending appeal.' });
    }

    await ModerationAppeal.create({ userId: user._id, message });
    console.log(`[APPEAL DEBUG] Appeal created successfully for: ${email}`);
    res.status(201).json({ success: true, message: 'Appeal submitted successfully. Our team will review it.' });
  } catch (error) {
    console.error('[APPEAL ERROR]', error);
    next(error);
  }
};

/**
 * @desc    Accept terms and conditions
 * @route   POST /api/auth/accept-terms
 * @access  Private
 */
exports.acceptTerms = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.termsAccepted = {
      status: true,
      date: new Date(),
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''
    };
    await user.save();

    res.status(200).json({ success: true, message: 'Terms accepted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fast-complete registration for Google users (only Role choice)
 * @route   POST /api/auth/google-complete
 * @access  Private
 */
exports.setRoleAndCompleteGoogle = async (req, res, next) => {
  try {
    const { role } = req.body;
    // req.user is already populated by protect middleware
    const user = req.user;
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Set role only if picking something new
    if (role && ['buyer', 'agent', 'host'].includes(role)) {
      user.role = role;
    }

    // Auto-generate username only if one doesn't exist
    if (!user.username) {
      const base = (user.name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15);
      const random = Math.floor(1000 + Math.random() * 8999);
      user.username = `${base}_${random}`;
    }

    // Force completion and terms
    user.isProfileComplete = true;
    user.termsAccepted = {
      status: true,
      date: new Date(),
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''
    };

    await user.save();

    res.status(200).json({ 
      success: true, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        isProfileComplete: true,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (error) {
    console.error('[GOOGLE COMPLETE ERROR]', error);
    res.status(400).json({ success: false, message: error.message || 'Partial registration failed' });
  }
};
