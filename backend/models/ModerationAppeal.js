const mongoose = require('mongoose');

const moderationAppealSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Please add an appeal message'],
      maxlength: [2000, 'Appeal message cannot be more than 2000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNote: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ModerationAppeal', moderationAppealSchema);
