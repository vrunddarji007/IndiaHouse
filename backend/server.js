const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const connectDB = require('./config/db');
const { chatSocket } = require('./sockets/chat');
const { initTwilio } = require('./utils/smsService');
const { initTransporter } = require('./utils/emailService');
const { errorHandler } = require('./middleware/error');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize Twilio
initTwilio();

// Initialize Email (auto-creates Ethereal test account if no SMTP configured)
initTransporter();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
chatSocket(server);

// Middleware
app.use(express.json());
app.use(mongoSanitize()); // Prevent NoSQL Injection
// FIX: Strict CORS instead of origin: *
const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:4200').replace(/\/$/, '');
app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(helmet({ 
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false
})); // Allow serving images and external scripts
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Make uploads folder static
app.use('/uploads/chat', express.static(path.join(__dirname, 'uploads/chat'))); // Priority
app.use('/uploads/chat', express.static(path.join(__dirname, 'uploads')));      // Legacy fallback
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/host', require('./routes/hostRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
