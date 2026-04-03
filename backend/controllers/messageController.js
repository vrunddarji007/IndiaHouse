const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');
const liveEmojis = require('../utils/liveEmojis');
const { isUserOnline } = require('../sockets/chat');

// @desc    Get live emojis
exports.getEmojis = (req, res) => {
  res.status(200).json({ success: true, data: liveEmojis });
};

// @desc    React to a message
exports.reactToMessage = async (req, res, next) => {
  try {
    const { emojiCode } = req.body;
    const userId = req.user.id;
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Not found' });

    const idx = message.reactions.findIndex(r => r.user.toString() === userId && r.emojiCode === emojiCode);
    if (idx > -1) message.reactions.splice(idx, 1);
    else message.reactions.push({ emojiCode, user: userId });
    
    await message.save();
    res.status(200).json({ success: true, data: message.reactions });
  } catch (error) { next(error); }
};

// @desc    Send a message
// @route   POST /api/messages/:propertyId/contact
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { to, text, emoji } = req.body;
    const from = req.user.id;
    const property = req.params.propertyId;
    let file = null;

    // Safety: Check for blocks
    const recipient = await User.findById(to);
    const sender = await User.findById(from);
    if (!recipient) return res.status(404).json({ success: false, message: 'Recipient not found' });

    const isBlockedByMe = (sender.blockedUsers || []).some(id => id.toString() === to.toString());
    const isBlockedByRecipient = (recipient.blockedUsers || []).some(id => id.toString() === from.toString());

    if (isBlockedByMe) return res.status(403).json({ success: false, message: 'You have blocked this user' });
    if (isBlockedByRecipient) return res.status(403).json({ success: false, message: 'This user has blocked you' });

    if (req.file) {
      const isMessage = req.originalUrl.includes('/api/messages');
      const urlPrefix = isMessage ? '/uploads/chat/images/' : '/uploads/';
      file = {
        url: `${urlPrefix}${req.file.filename}`,
        type: req.file.mimetype.startsWith('image/') ? 'image' : 'document',
        name: req.file.originalname,
        size: req.file.size
      };
    }

    const message = await Message.create({
      from, to, property: property || null, text, file
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) { next(error); }
};

// @desc    Get user conversations
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find all messages where user is sender or receiver AND not deleted by user
    const messages = await Message.find({
      $or: [{ from: userId }, { to: userId }],
      deletedBy: { $ne: userId }
    })
      .sort('-createdAt')
      .populate('from', 'name firstName lastName profilePhoto profilePic')
      .populate('to', 'name firstName lastName profilePhoto profilePic')
      .populate('property', 'title slug');

    // Group by conversation partner
    const conversationsMap = {};

    messages.forEach((msg) => {
      const otherUser = msg.from._id.toString() === userId ? msg.to : msg.from;
      if (!otherUser) return;
      
      const otherUserId = otherUser._id.toString();
      
      if (!conversationsMap[otherUserId]) {
        conversationsMap[otherUserId] = {
          user: {
            ...otherUser.toObject(),
            _id: otherUserId,
            isOnline: isUserOnline(otherUserId)
          },
          lastMessage: msg,
          property: msg.property,
          unreadCount: (msg.to._id.toString() === userId && !msg.read) ? 1 : 0
        };
      } else {
        if (msg.to._id.toString() === userId && !msg.read) {
          conversationsMap[otherUserId].unreadCount += 1;
        }
      }
    });

    res.status(200).json({
      success: true,
      data: Object.values(conversationsMap),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages with a specific user
// @route   GET /api/messages/:otherUserId
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.otherUserId;

    const messages = await Message.find({
      $or: [{ from: userId, to: otherUserId }, { from: otherUserId, to: userId }],
      deletedBy: { $ne: userId }
    }).sort('createdAt').populate('property', 'title price images');

    // Mark messages as read
    await Message.updateMany(
      { from: otherUserId, to: userId, read: false },
      { read: true }
    );

    // Safety: Check block status for UI
    const me = await User.findById(userId);
    const other = await User.findById(otherUserId);
    const isBlockedByMe = (me.blockedUsers || []).includes(otherUserId);
    const isBlockedByOther = other ? (other.blockedUsers || []).includes(userId) : false;

    res.status(200).json({
      success: true,
      data: messages,
      isBlockedByMe,
      isBlockedByOther
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear chat with a user (deletes all messages)
// @route   POST /api/messages/clear-chat/:otherUserId
// @access  Private
exports.clearChat = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.otherUserId;

    await Message.updateMany(
      {
        $or: [
          { from: userId, to: otherUserId },
          { from: otherUserId, to: userId }
        ],
        deletedBy: { $ne: userId }
      },
      { $addToSet: { deletedBy: userId } }
    );

    res.status(200).json({
      success: true,
      data: {},
      message: 'Chat cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete conversation (same for now, could be used for soft-delete)
// @route   DELETE /api/messages/delete-chat/:otherUserId
// @access  Private
exports.deleteChat = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.otherUserId;

    // Add user to deletedBy for all messages between these users
    await Message.updateMany(
      {
        $or: [
          { from: userId, to: otherUserId },
          { from: otherUserId, to: userId }
        ],
        deletedBy: { $ne: userId }
      },
      { $addToSet: { deletedBy: userId } }
    );

    res.status(200).json({
      success: true,
      data: {},
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete multiple messages
exports.deleteMessages = async (req, res, next) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user.id;
    // Security: Only hide if sender or receiver matches the current user
    await Message.updateMany(
      { 
        _id: { $in: messageIds }, 
        $or: [{ from: userId }, { to: userId }],
        deletedBy: { $ne: userId }
      },
      { $addToSet: { deletedBy: userId } }
    );
    res.status(200).json({ success: true, message: 'Messages deleted successfully' });
  } catch (error) { next(error); }
};

// @desc    Block a user
exports.blockUser = async (req, res, next) => {
  try {
    const targetId = req.params.userId;
    const userId = req.user.id;
    await User.findByIdAndUpdate(userId, { $addToSet: { blockedUsers: targetId } });
    res.status(200).json({ success: true, message: 'User blocked' });
  } catch (error) { next(error); }
};

// @desc    Unblock a user
exports.unblockUser = async (req, res, next) => {
  try {
    const targetId = req.params.userId;
    const userId = req.user.id;
    await User.findByIdAndUpdate(userId, { $pull: { blockedUsers: targetId } });
    res.status(200).json({ success: true, message: 'User unblocked' });
  } catch (error) { next(error); }
};
