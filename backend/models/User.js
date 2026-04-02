const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    firstName: { type: String, trim: true, default: '' },
    lastName: { type: String, trim: true, default: '' },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9_]{3,30}$/, 'Username: 3-30 chars, lowercase, numbers, underscores'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
      unique: true,
    },
    password: { type: String, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['buyer', 'agent', 'host'],
      required: [true, 'Please select a role'],
      default: 'buyer',
    },

    // ─── Profile Fields ───
    profilePhoto: { type: String, default: '' },
    bio: { type: String, maxlength: [250, 'Bio max 250 chars'], default: '' },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say', ''], default: '' },
    dateOfBirth: { type: Date, default: null },

    // Address
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },

    // Professional
    company: { type: String, default: '' },
    designation: { type: String, default: '' },
    website: { type: String, default: '' },
    experience: { type: String, default: '' }, // e.g. "5 years"
    specialization: { type: String, default: '' }, // e.g. "Residential Properties"
    languages: [{ type: String }], // e.g. ["English", "Hindi", "Gujarati"]
    reraNumber: { type: String, default: '' }, // RERA reg for agents

    // Social
    socialLinks: {
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
    },

    isProfileComplete: { type: Boolean, default: false },
    profilePic: { type: String, default: '' },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // OTP & Auth
    isVerified: { type: Boolean, default: false },
    otp: {
      code: String,
      expires: Date,
      method: { type: String, enum: ['email', 'sms', 'both'] },
    },
    otpResendCount: { type: Number, default: 0 },
    otpResendResetAt: Date,
    lastLogin: Date,
    status: {
      type: String,
      enum: ['active', 'banned'],
      default: 'active',
    },
    suspendedUntil: {
      type: Date,
      default: null,
    },
    suspensionDurationLabel: {
      type: String,
      default: '',
    },
    termsAccepted: {
      status: { type: Boolean, default: false },
      date: { type: Date, default: null },
      ip: { type: String, default: '' }
    },
  },
  { timestamps: true }
);

// Password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (pw) {
  if (!this.password) return false;
  return bcrypt.compare(pw, this.password);
};

userSchema.methods.setOTP = async function (plainOtp, method = 'email') {
  this.otp = {
    code: await bcrypt.hash(plainOtp, 10),
    expires: new Date(Date.now() + 10 * 60 * 1000),
    method,
  };
  await this.save();
};

userSchema.methods.verifyOTP = async function (plainOtp) {
  if (!this.otp?.code || new Date() > this.otp.expires) return false;
  return bcrypt.compare(plainOtp, this.otp.code);
};

module.exports = mongoose.model('User', userSchema);
