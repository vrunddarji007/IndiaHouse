const express = require('express');
const { submitReport, getAllReports, handleReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', submitReport);

// Host only routes
router.get('/', authorize('host'), getAllReports);
router.put('/:id/handle', authorize('host'), handleReport);

module.exports = router;
