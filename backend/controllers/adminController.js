const Property = require('../models/Property');

// @desc    Get pending properties
// @route   GET /api/admin/properties/pending
// @access  Private/Admin
exports.getPendingProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ status: 'pending' }).populate(
      'postedBy',
      'name email phone'
    );

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject property
// @route   PUT /api/admin/properties/:id/approve
// @access  Private/Admin
exports.updatePropertyStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'active' or remain 'pending' or 'rejected' etc.

    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.status = status || 'active';
    await property.save();

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};
