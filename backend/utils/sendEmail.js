const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Demo: Log the OTP to console as well in case SMTP is not configured
  console.log(`-----------------------------------------`);
  console.log(`EMAIL TO: ${options.email}`);
  console.log(`SUBJECT: ${options.subject}`);
  console.log(`MESSAGE: ${options.message}`);
  console.log(`-----------------------------------------`);

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
  } catch (err) {
    console.log('Error sending email (likely SMTP config missing):', err.message);
  }
};

module.exports = sendEmail;
