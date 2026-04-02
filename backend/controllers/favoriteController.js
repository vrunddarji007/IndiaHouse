const User = require('../models/User');

// @desc    Toggle property in favorites
// @route   POST /api/favorites/:propertyId
// @access  Private
exports.toggleFavorite = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    // Check if property is already favorited
    const isFavorited = user.favorites.some(
      (fav) => fav.toString() === req.params.propertyId
    );

    if (isFavorited) {
      // Remove from favorites
      user.favorites = user.favorites.filter(
        (fav) => fav.toString() !== req.params.propertyId
      );
    } else {
      // Add to favorites
      user.favorites.push(req.params.propertyId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');

    res.status(200).json({
      success: true,
      data: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};
