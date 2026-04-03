const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { registerOrLogin, verifyOtp, resendOtp, setPassword, login, googleLogin, hostLogin, forgotPassword, resetPassword, acceptTerms, setRoleAndCompleteGoogle, submitAppeal } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const authLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 20, message: { success: false, message: 'Too many requests.' } });
const resendLimiter = rateLimit({ windowMs: 30 * 1000, max: 2, message: { success: false, message: 'Please wait before requesting again.' } });
const hostLoginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { success: false, message: 'Too many login attempts. Try again later.' } });
const forgotPasswordLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 5, message: { success: false, message: 'Too many reset attempts. Please wait 10 minutes.' } });

// Stricter limiter for appeals (5 requests per 10 minutes)
const appealLimiter = rateLimit({ 
  windowMs: 10 * 60 * 1000, 
  max: 5, 
  message: { success: false, message: 'Too many appeal attempts. Please wait 10 minutes.' } 
});

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: errors.array()[0].msg // Send the first error message
    });
  }
  next();
};

// Unified register-or-login
router.post('/register-or-login', authLimiter, [
  body('email', 'Valid email required').isEmail().normalizeEmail(),
  body('verificationMethod').optional().isIn(['email', 'sms', 'both']),
], validate, registerOrLogin);

// Verify OTP
router.post('/verify-otp', [
  body('email', 'Email required').isEmail(),
  body('otp', 'OTP must be 6 digits').isLength({ min: 6, max: 6 }).isNumeric(),
], validate, verifyOtp);

// Resend OTP
router.post('/resend-otp', resendLimiter, resendOtp);

// Set password (protected)
router.post('/set-password', protect, [
  body('password', 'Min 6 chars').isLength({ min: 6 }),
], validate, setPassword);

// Accept terms (protected)
router.post('/accept-terms', protect, acceptTerms);

// Fast-complete Google registration (protected)
router.post('/google-complete', protect, setRoleAndCompleteGoogle);

// Forgot password (public – sends OTP)
router.post('/forgot-password', forgotPasswordLimiter, [
  body('email', 'Valid email required').isEmail(),
], validate, forgotPassword);

// Reset password (public – verifies OTP + sets new password)
router.post('/reset-password', forgotPasswordLimiter, [
  body('email', 'Valid email required').isEmail(),
  body('otp', 'OTP must be 6 digits').isLength({ min: 6, max: 6 }).isNumeric(),
  body('newPassword', 'Password must be at least 6 characters').isLength({ min: 6 }),
], validate, resetPassword);

// Password login
router.post('/login', authLimiter, [
  body('email', 'Valid email required').isEmail(),
  body('password', 'Password required').exists(),
], validate, login);

// Google login
router.post('/google-login', authLimiter, [
  body('idToken', 'Google ID Token required').exists(),
], validate, googleLogin);

// Host login (fixed credentials, rate-limited)
router.post('/host-login', hostLoginLimiter, [
  body('email', 'Valid email required').isEmail(),
  body('password', 'Password required').exists(),
], validate, hostLogin);

// Submit moderation appeal (Strict 5-req limit)
router.post('/appeal', appealLimiter, [
  body('email', 'Valid email required').isEmail(),
  body('message', 'Message required').isLength({ min: 1, max: 2000 }),
], validate, (req, res, next) => {
  require('../controllers/authController').submitAppeal(req, res, next);
});

module.exports = router;
