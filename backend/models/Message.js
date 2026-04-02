const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
    },
    text: {
      type: String,
      required: false,
    },
    file: {
      url: String,
      type: { type: String }, // "image" or "document"
      name: String,
      size: Number,
    },
    reactions: [
      {
        emojiCode: String,
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Message', messageSchema);
