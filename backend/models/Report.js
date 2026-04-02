const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    enum: ['scam', 'fraud', 'fake_profile', 'inappropriate', 'spam', 'other'],
    required: [true, 'Please provide a reason for the report']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster queries by reported user
ReportSchema.index({ reportedUser: 1, status: 1 });

module.exports = mongoose.model('Report', ReportSchema);
