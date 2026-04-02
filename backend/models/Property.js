const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['rent', 'sale'],
      required: true,
    },
    propertyType: {
      type: String,
      enum: ['Flat', 'Row House', 'Bungalow', 'Plot', 'Commercial', 'Penthouse'],
      required: true,
    },
    bedrooms: {
      type: Number,
      default: 0,
    },
    bathrooms: {
      type: Number,
      default: 0,
    },
    area: {
      type: Number,
      required: true,
    },
    furnishing: {
      type: String,
      enum: ['Furnished', 'Semi', 'Unfurnished'],
      default: 'Unfurnished',
    },
    state: {
      type: String,
      required: false,
    },
    location: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    nearbyLandmarks: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        review: { type: String, default: '' },
        date: { type: Date, default: Date.now },
        editCount: { type: Number, default: 1 },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
      }
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'sold/rented'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const slugify = require('slugify');

// Pre-save hook to generate title and slug
propertySchema.pre('validate', function (next) {
  // 1. Generate title if missing
  if (!this.title && this.bedrooms && this.propertyType && this.location) {
    this.title = `${this.bedrooms} BHK ${this.propertyType} in ${this.location}`;
  }

  // 2. Generate slug from title if modified or missing
  if (this.isModified('title') || !this.slug) {
    const baseSlug = slugify(this.title, { lower: true, strict: true });
    this.slug = `${baseSlug}-${Date.now()}`;
  }
  next();
});

// FIX: Add indexes for performant search instead of full collection $regex scans
propertySchema.index({ location: 'text', state: 'text', title: 'text' });
propertySchema.index({ status: 1, type: 1, price: 1 });
propertySchema.index({ postedBy: 1 });

module.exports = mongoose.model('Property', propertySchema);
