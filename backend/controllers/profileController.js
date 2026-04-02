const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Helper: build user response object
const userResponse = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  username: user.username,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  profilePhoto: user.profilePhoto,
  bio: user.bio,
  gender: user.gender,
  dateOfBirth: user.dateOfBirth,
  address: user.address,
  company: user.company,
  designation: user.designation,
  website: user.website,
  experience: user.experience,
  specialization: user.specialization,
  languages: user.languages,
  reraNumber: user.reraNumber,
  socialLinks: user.socialLinks,
  isProfileComplete: user.isProfileComplete,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
  lastLogin: user.lastLogin,
});

/**
 * @desc    Complete profile (after OTP verify or host login)
 * @route   POST /api/profile/complete
 * @access  Private
 */
exports.completeProfile = async (req, res, next) => {
  try {
    const {
      firstName, lastName, username, bio,
      gender, dateOfBirth,
      street, city, state, pincode, country,
      company, designation, website, experience, specialization,
      languages, reraNumber,
      linkedin, twitter, instagram, facebook,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Required fields
    if (!firstName || !lastName || !username) {
      return res.status(400).json({ success: false, message: 'First name, last name, and username are required' });
    }

    // Username format
    const usernameRegex = /^[a-z0-9_]{3,30}$/;
    if (!usernameRegex.test(username.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Username: 3-30 chars, lowercase letters, numbers, underscores' });
    }

    // Username uniqueness
    const existing = await User.findOne({ username: username.toLowerCase(), _id: { $ne: user._id } });
    if (existing) return res.status(409).json({ success: false, message: 'Username already taken' });

    // Bio length
    if (bio && bio.length > 250) return res.status(400).json({ success: false, message: 'Bio max 250 characters' });

    // Update core fields
    user.firstName = firstName.trim();
    user.lastName = lastName.trim();
    user.username = username.toLowerCase().trim();
    user.name = `${firstName.trim()} ${lastName.trim()}`;
    if (bio !== undefined) user.bio = bio.trim();

    // Extended fields
    if (gender) user.gender = gender;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (street || city || state || pincode || country) {
      user.address = {
        street: (street || '').trim(),
        city: (city || '').trim(),
        state: (state || '').trim(),
        pincode: (pincode || '').trim(),
        country: (country || 'India').trim(),
      };
    }
    if (company !== undefined) user.company = company.trim();
    if (designation !== undefined) user.designation = designation.trim();
    if (website !== undefined) user.website = website.trim();
    if (experience !== undefined) user.experience = experience.trim();
    if (specialization !== undefined) user.specialization = specialization.trim();
    if (reraNumber !== undefined) user.reraNumber = reraNumber.trim();
    if (languages) {
      user.languages = typeof languages === 'string' ? languages.split(',').map(l => l.trim()).filter(Boolean) : languages;
    }
    if (linkedin || twitter || instagram || facebook) {
      user.socialLinks = {
        linkedin: (linkedin || user.socialLinks?.linkedin || '').trim(),
        twitter: (twitter || user.socialLinks?.twitter || '').trim(),
        instagram: (instagram || user.socialLinks?.instagram || '').trim(),
        facebook: (facebook || user.socialLinks?.facebook || '').trim(),
      };
    }

    // Profile photo
    if (req.file) {
      if (user.profilePhoto) {
        const oldPath = path.join(__dirname, '..', user.profilePhoto);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      user.profilePhoto = '/' + req.file.path.replace(/\\/g, '/');
    }

    user.isProfileComplete = true;
    await user.save();

    console.log(`[PROFILE] ${user.email} completed profile as @${user.username}`);
    res.json({ success: true, message: 'Profile completed successfully!', user: userResponse(user) });
  } catch (error) {
    console.error('[PROFILE ERROR]', error.message);
    next(error);
  }
};

/**
 * @desc    Edit profile
 * @route   PUT /api/profile
 * @access  Private
 */
exports.editProfile = async (req, res, next) => {
  try {
    const {
      firstName, lastName, username, bio,
      gender, dateOfBirth,
      street, city, state, pincode, country,
      company, designation, website, experience, specialization,
      languages, reraNumber,
      linkedin, twitter, instagram, facebook,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (firstName || lastName) user.name = `${user.firstName} ${user.lastName}`.trim();

    // Username
    if (username) {
      if (!/^[a-z0-9_]{3,30}$/.test(username.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Invalid username format' });
      }
      const existing = await User.findOne({ username: username.toLowerCase(), _id: { $ne: user._id } });
      if (existing) return res.status(409).json({ success: false, message: 'Username already taken' });
      user.username = username.toLowerCase().trim();
    }

    if (bio !== undefined) {
      if (bio.length > 250) return res.status(400).json({ success: false, message: 'Bio max 250 characters' });
      user.bio = bio.trim();
    }

    // Extended
    if (gender !== undefined) user.gender = gender;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (street !== undefined || city !== undefined || state !== undefined || pincode !== undefined || country !== undefined) {
      user.address = {
        street: (street !== undefined ? street : user.address?.street || '').trim(),
        city: (city !== undefined ? city : user.address?.city || '').trim(),
        state: (state !== undefined ? state : user.address?.state || '').trim(),
        pincode: (pincode !== undefined ? pincode : user.address?.pincode || '').trim(),
        country: (country !== undefined ? country : user.address?.country || 'India').trim(),
      };
    }
    if (company !== undefined) user.company = company.trim();
    if (designation !== undefined) user.designation = designation.trim();
    if (website !== undefined) user.website = website.trim();
    if (experience !== undefined) user.experience = experience.trim();
    if (specialization !== undefined) user.specialization = specialization.trim();
    if (reraNumber !== undefined) user.reraNumber = reraNumber.trim();
    if (languages !== undefined) {
      user.languages = typeof languages === 'string' ? languages.split(',').map(l => l.trim()).filter(Boolean) : languages;
    }
    if (linkedin !== undefined || twitter !== undefined || instagram !== undefined || facebook !== undefined) {
      user.socialLinks = {
        linkedin: (linkedin !== undefined ? linkedin : user.socialLinks?.linkedin || '').trim(),
        twitter: (twitter !== undefined ? twitter : user.socialLinks?.twitter || '').trim(),
        instagram: (instagram !== undefined ? instagram : user.socialLinks?.instagram || '').trim(),
        facebook: (facebook !== undefined ? facebook : user.socialLinks?.facebook || '').trim(),
      };
    }

    // Photo
    if (req.file) {
      if (user.profilePhoto) {
        const oldPath = path.join(__dirname, '..', user.profilePhoto);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      user.profilePhoto = '/' + req.file.path.replace(/\\/g, '/');
    }

    await user.save();
    res.json({ success: true, message: 'Profile updated!', user: userResponse(user) });
  } catch (error) {
    console.error('[PROFILE EDIT ERROR]', error.message);
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/profile
 * @access  Private
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: userResponse(user) });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check username availability
 * @route   GET /api/profile/check-username/:username
 * @access  Private
 */
exports.checkUsername = async (req, res, next) => {
  try {
    const { username } = req.params;
    if (!/^[a-z0-9_]{3,30}$/.test(username.toLowerCase())) {
      return res.json({ success: true, available: false, message: 'Invalid format' });
    }
    const existing = await User.findOne({ username: username.toLowerCase(), _id: { $ne: req.user.id } });
    res.json({ success: true, available: !existing, message: existing ? 'Username already taken' : 'Available' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get public profile of any user
 * @route   GET /api/profile/:id
 * @access  Private
 */
exports.getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('firstName lastName name username role bio profilePhoto profilePic company designation experience specialization website languages address createdAt isVerified isProfileComplete');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};
