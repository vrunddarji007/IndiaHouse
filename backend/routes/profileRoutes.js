const express = require('express');
const { completeProfile, editProfile, getProfile, checkUsername, getPublicProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const profileUpload = require('../middleware/multerProfile');

const router = express.Router();

// All routes are protected
router.use(protect);

// Complete profile (after OTP verify / host login)
router.post('/complete', profileUpload.single('profilePhoto'), completeProfile);

// Edit profile
router.put('/', profileUpload.single('profilePhoto'), editProfile);

// Get current user profile
router.get('/', getProfile);

// Check username availability
router.get('/check-username/:username', checkUsername);

// Get public profile
router.get('/:id', getPublicProfile);

module.exports = router;
