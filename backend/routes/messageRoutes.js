const express = require('express');
const {
  sendMessage,
  getConversations,
  getMessages,
  getEmojis,
  reactToMessage,
  clearChat,
  deleteChat,
  deleteMessages,
  blockUser,
  unblockUser
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect); // All routes below are protected

router.route('/conversations')
  .get(getConversations);

router.get('/emojis', getEmojis);

router.post('/react/:messageId', reactToMessage);

router.post('/clear/:otherUserId', clearChat);
router.delete('/delete/:otherUserId', deleteChat);
router.post('/delete-multiple', deleteMessages);
router.post('/block/:userId', blockUser);
router.post('/unblock/:userId', unblockUser);

router.post('/:propertyId/contact', upload.single('file'), sendMessage);

router.post('/', upload.single('file'), sendMessage);

router.route('/:otherUserId')
  .get(getMessages);

module.exports = router;
