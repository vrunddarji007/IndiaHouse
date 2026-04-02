const express = require('express');
const {
  getPendingProperties,
  updatePropertyStatus
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes below are protected and restricted to admin
router.use(protect);
router.use(authorize('admin'));

router.route('/properties/pending')
  .get(getPendingProperties);

router.route('/properties/:id/approve')
  .put(updatePropertyStatus);

module.exports = router;
