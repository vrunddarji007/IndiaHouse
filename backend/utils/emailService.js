const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Initialize email transporter
 * If no SMTP credentials configured, auto-create Ethereal test account
 * Ethereal gives you a real inbox URL to view sent emails!
 */
const initTransporter = async () => {
  // If real SMTP credentials exist, use them
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS && 
      process.env.EMAIL_USER !== 'your_email@gmail.com') {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log('[EMAIL] Using configured SMTP credentials');
    return;
  }

  // Auto-create Ethereal test account (free, no signup needed)
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`📧 [EMAIL] Auto-created Ethereal test account | User: ${testAccount.user} | Pass: ${testAccount.pass}`); 
    console.log(`   View emails at: https://ethereal.email`);
  } catch (err) {
    console.log('[EMAIL] Could not create test account:', err.message);
  }
};

/**
 * Send OTP via email with beautiful HTML template
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {string} name - User's name
 */
const sendOTPEmail = async (to, otp, name = 'User') => {
  // Initialize transporter if not ready
  if (!transporter) {
    await initTransporter();
  }

  const htmlTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f4f7fa; }
      .container { max-width: 500px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
      .header { background: linear-gradient(135deg, #0d6efd, #6610f2); padding: 32px; text-align: center; }
      .header h1 { color: #fff; margin: 0; font-size: 28px; }
      .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
      .body { padding: 40px 32px; text-align: center; }
      .otp-box { background: #f8f9fa; border: 2px dashed #0d6efd; border-radius: 12px; padding: 24px; margin: 24px 0; }
      .otp-code { font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0d6efd; font-family: 'Courier New', monospace; }
      .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🏠 IndiaHomes</h1>
        <p>Your Trusted Real Estate Partner</p>
      </div>
      <div class="body">
        <h2 style="color:#212529;">Hello, ${name}! 👋</h2>
        <p style="color:#6c757d;">Use the code below to verify your account.</p>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>
        <p style="color:#6c757d; font-size:13px;">Expires in <strong>10 minutes</strong>. Do not share.</p>
      </div>
      <div class="footer">&copy; 2026 IndiaHomes</div>
    </div>
  </body>
  </html>
  `;

  const mailOptions = {
    from: `"IndiaHomes" <noreply@indiahomes.com>`,
    to,
    subject: `${otp} is your IndiaHomes verification code`,
    html: htmlTemplate,
    text: `Your IndiaHomes verification code is: ${otp}. It expires in 10 minutes.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    
    // Get preview URL (works with Ethereal)
    const previewUrl = nodemailer.getTestMessageUrl(info);
    
    console.log(`📧 [EMAIL SENT] To: ${to}${previewUrl ? ' | View: ' + previewUrl : ''} | MsgID: ${info.messageId}`);
    
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (err) {
    console.error(`[EMAIL ERROR] ${err.message}`);
    console.log(`[EMAIL FALLBACK] OTP for ${to}: ${otp}`);
    return { success: false, error: err.message };
  }
};

module.exports = { sendOTPEmail, initTransporter };
