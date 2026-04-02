const express = require('express');
const {
  toggleFavorite,
  getFavorites
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes below are protected

router.route('/')
  .get(getFavorites);

router.route('/:propertyId')
  .post(toggleFavorite);

module.exports = router;
