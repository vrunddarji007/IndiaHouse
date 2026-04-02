const Property = require('../models/Property');
const Message = require('../models/Message');
const mongoose = require('mongoose');

// @desc    Get single property by ID
// @route   GET /api/properties/id/:id
// @access  Public
exports.getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('postedBy', '-password -otp -__v')
      .populate('ratings.user', '-password -otp -__v');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all properties (with advanced filtering)
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res, next) => {
  try {
    const {
      type,
      state,
      minPrice,
      maxPrice,
      location,
      propertyType,
      bedrooms,
      sort,
      limit = 12,
      page = 1,
    } = req.query;

    let queryInfo = {};
    if (req.query.status) {
      if (req.query.status !== 'all') {
        queryInfo.status = req.query.status;
      }
    } else {
      queryInfo.status = 'active';
    }

    // Filtering logic
    if (type) queryInfo.type = type;
    if (state) queryInfo.state = { $regex: state, $options: 'i' };
    if (minPrice || maxPrice) {
      queryInfo.price = {};
      if (minPrice) queryInfo.price.$gte = Number(minPrice);
      if (maxPrice) queryInfo.price.$lte = Number(maxPrice);
    }
    if (location) {
      queryInfo.location = { $regex: location, $options: 'i' }; // fuzzy match
    }
    if (propertyType) {
      // Handle multi-select properly if passed as comma separated or array
      const ptArray = Array.isArray(propertyType) ? propertyType : propertyType.split(',');
      queryInfo.propertyType = { $in: ptArray };
    }
    if (bedrooms) queryInfo.bedrooms = Number(bedrooms);

    // Sorting
    let sortStr = '-createdAt';
    if (sort) {
      const parts = sort.split('-');
      sortStr = parts[1] === 'desc' ? `-${parts[0]}` : parts[0];
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // FIX: Run find and count in parallel instead of sequentially
    const [properties, total] = await Promise.all([
      Property.find(queryInfo)
        .sort(sortStr)
        .skip(skip)
        .limit(Number(limit))
        .populate('postedBy', '-password -otp -__v'),
      Property.countDocuments(queryInfo),
    ]);

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single property by slug
// @route   GET /api/properties/:slug
// @access  Public
exports.getProperty = async (req, res, next) => {
  try {
    const property = await Property.findOne({ slug: req.params.slug })
      .populate('postedBy', '-password -otp -__v')
      .populate('ratings.user', '-password -otp -__v');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Increment views
    property.views += 1;
    await property.save();

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

const { processPropertyImages } = require('../utils/imageProcessor');

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Agent only)
exports.createProperty = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.postedBy = req.user.id;

    // Handle files (from Multer) and convert to WebP
    if (req.files && req.files.length > 0) {
      try {
        const processedImages = await processPropertyImages(req.files);
        // FIX: Check if any images were actually processed successfully
        if (processedImages.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'None of the uploaded images could be processed. Please upload valid JPG/PNG images.',
          });
        }
        req.body.images = processedImages;
      } catch (imgError) {
        console.error('Image processing failed:', imgError);
        return res.status(500).json({ success: false, message: 'Image processing failed. Please try again with valid images.' });
      }
    }

    // Auto-generate title if missing
    if (!req.body.title && req.body.bedrooms && req.body.propertyType && req.body.location) {
      req.body.title = `${req.body.bedrooms} BHK ${req.body.propertyType} in ${req.body.location}`;
    }

    // Create property (Slug is now auto-generated in model)
    const property = await Property.create(req.body);

    res.status(201).json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Create Property Error:', error);
    next(error);
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Owner/Agent)
exports.updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // FIX: Changed 'admin' to 'host' so host users can manage all properties
    if (
      property.postedBy.toString() !== req.user.id &&
      req.user.role !== 'host'
    ) {
      return res
        .status(401)
        .json({ message: 'Not authorized to update this property' });
    }

    // Keep existing images or add new (converted to WebP)
    if (req.files && req.files.length > 0) {
      const processedNewImages = await processPropertyImages(req.files);
      req.body.images = [...(property.images || []), ...processedNewImages];
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Owner/Admin)
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // FIX: Changed 'admin' to 'host' so host users can delete any property
    if (
      property.postedBy.toString() !== req.user.id &&
      req.user.role !== 'host'
    ) {
      return res
        .status(401)
        .json({ message: 'Not authorized to delete this property' });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate and review a property
// @route   POST /api/properties/:id/rate
// @access  Private
exports.rateProperty = async (req, res, next) => {
  try {
    const { rating, review } = req.body;
    const propertyId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Please provide a valid rating between 1 and 5' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check how many reviews the user has already submitted
    const userReviewsCount = property.ratings.filter(
      (r) => r.user.toString() === req.user.id
    ).length;

    if (userReviewsCount >= 3) {
      return res.status(400).json({ message: 'You have reached the maximum limit of 3 review submissions for this property.' });
    }

    // Add new rating (Do NOT overwrite/replace previous ones)
    property.ratings.push({
      user: req.user.id,
      rating: Number(rating),
      review: review || '',
    });

    // Calculate average rating
    const totalRatings = property.ratings.length;
    const sumRatings = property.ratings.reduce((sum, item) => sum + item.rating, 0);
    property.averageRating = sumRatings / totalRatings;

    await property.save();
    await property.populate('ratings.user', 'name profilePhoto profilePic');

    res.status(200).json({
      success: true,
      data: property,
      message: 'Rating submitted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a property review
// @route   DELETE /api/properties/:id/reviews/:reviewId
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const review = property.ratings.id(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the user trying to delete is the author of the review or an admin/host
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'host') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    // Remove the review correctly using Mongoose method for subdocuments
    review.deleteOne();

    // Recalculate average rating
    if (property.ratings.length > 0) {
      const sumRatings = property.ratings.reduce((sum, item) => sum + item.rating, 0);
      property.averageRating = sumRatings / property.ratings.length;
    } else {
      property.averageRating = 0;
    }

    await property.save();
    await property.populate('ratings.user', 'name profilePhoto profilePic');

    res.status(200).json({
      success: true,
      data: property,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like on a property review
// @route   POST /api/properties/:id/reviews/:reviewId/like
// @access  Private
exports.likeReview = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const review = property.ratings.id(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // FIX: Initialize likes array if undefined to prevent crash
    if (!review.likes) {
      review.likes = [];
    }

    // Check if user already liked the review
    const isLiked = review.likes.some((userId) => userId.toString() === req.user.id);

    if (isLiked) {
      // Unlike it
      review.likes = review.likes.filter((userId) => userId.toString() !== req.user.id);
    } else {
      // Like it
      review.likes.push(req.user.id);
    }

    await property.save();
    await property.populate('ratings.user', 'name profilePhoto profilePic');

    res.status(200).json({
      success: true,
      data: property,
      message: isLiked ? 'Review unliked' : 'Review liked',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get property inquiries (who messaged about it)
// @route   GET /api/properties/id/:id/inquiries
// @access  Private (Owner/Agent)
exports.getPropertyInquiries = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // FIX: Changed 'admin' to 'host' so host users can view inquiries
    if (property.postedBy.toString() !== req.user.id && req.user.role !== 'host') {
      return res.status(401).json({ message: 'Not authorized to view inquiries' });
    }

    // Find all messages associated with this property
    const messages = await Message.find({ property: propertyId })
      .populate('from', 'name email phone profilePhoto profilePic')
      .sort('-createdAt');

    // Aggregate unique buyers
    const uniqueBuyers = [];
    const buyerIds = new Set();

    messages.forEach(msg => {
      // FIX: Guard against null references when a user account has been deleted
      if (!msg.from || !msg.from._id) return;

      if (!buyerIds.has(msg.from._id.toString())) {
        buyerIds.add(msg.from._id.toString());
        uniqueBuyers.push({
          user: msg.from,
          lastMessage: msg.text,
          date: msg.createdAt
        });
      }
    });

    res.status(200).json({
      success: true,
      count: uniqueBuyers.length,
      data: uniqueBuyers
    });
  } catch (error) {
    next(error);
  }
};
