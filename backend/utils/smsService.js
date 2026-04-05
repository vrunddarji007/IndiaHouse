/**
 * SMS Service using Twilio SDK
 * Sends OTP via SMS to Indian phone numbers
 */

let twilioClient = null;

const initTwilio = () => {
  if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
    try {
      const twilio = require('twilio');
      twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
      console.log('[SMS] Twilio client initialized');
    } catch (err) {
      console.log('[SMS] Twilio SDK not available, SMS will be simulated');
    }
  } else {
    console.log('[SMS] Twilio credentials not configured, SMS will be simulated');
  }
};

/**
 * Send OTP via SMS
 * @param {string} phone - Phone number with country code (e.g. +919876543210)
 * @param {string} otp - 6-digit OTP code
 */
const sendOTPSMS = async (phone, otp) => {
  // Normalize phone: ensure +91 prefix
  let normalizedPhone = phone.replace(/\s/g, '');
  if (normalizedPhone.startsWith('0')) {
    normalizedPhone = '+91' + normalizedPhone.substring(1);
  } else if (!normalizedPhone.startsWith('+')) {
    normalizedPhone = '+91' + normalizedPhone;
  }

  const messageBody = `Your IndiaHomes verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;

  if (twilioClient && process.env.TWILIO_PHONE) {
    try {
      const message = await twilioClient.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE,
        to: normalizedPhone,
      });
      console.log(`[SMS] OTP sent to ${normalizedPhone} | SID: ${message.sid}`);
      return { success: true, sid: message.sid };
    } catch (err) {
      console.error(`[SMS ERROR] Failed to send to ${normalizedPhone}:`, err.message);
      // Fallback to console
      console.log(`[SMS FALLBACK] OTP for ${normalizedPhone}: ${otp}`);
      return { success: false, error: err.message, simulated: true };
    }
  } else {
    // Simulation mode
    console.log(`📱 [SMS SIMULATION] To: ${normalizedPhone} | Message: ${messageBody}`);
    return { success: true, simulated: true };
  }
};

module.exports = { initTwilio, sendOTPSMS };
