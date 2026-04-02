const express = require('express');
const {
  getProperties, getProperty, getPropertyById, getPropertyInquiries, createProperty, updateProperty, deleteProperty, rateProperty, deleteReview, likeReview
} = require('../controllers/propertyController');

const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const upload = require('../middleware/upload');

const router = express.Router();

// Public
router.route('/').get(getProperties);
router.get('/id/:id', getPropertyById);
router.get('/id/:id/inquiries', protect, getPropertyInquiries);
router.route('/:slug').get(getProperty);

// Authenticated users
router.post('/:id/rate', protect, rateProperty);
router.post('/:id/reviews/:reviewId/like', protect, likeReview);
router.delete('/:id/reviews/:reviewId', protect, deleteReview);

// Agent + Host only
router.post('/', protect, roleGuard(['agent', 'host']), upload.array('images', 30), createProperty);
router.put('/:id', protect, roleGuard(['agent', 'host']), upload.array('images', 30), updateProperty);
router.delete('/:id', protect, roleGuard(['agent', 'host']), deleteProperty);

module.exports = router;
