const crypto = require('crypto');

/**
 * Generate a cryptographically secure 6-digit OTP
 * Uses crypto.randomInt for uniform distribution
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

module.exports = generateOTP;
