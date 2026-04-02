const express = require('express');
const { getDashboardUsers, getDashboardProperties, getUserDetail, updateUserStatus, deleteUser, getUserTermsPDF } = require('../controllers/hostController');
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

const router = express.Router();

// All routes protected for host only
router.use(protect, roleGuard(['host']));

router.get('/dashboard/users', getDashboardUsers);
router.get('/dashboard/users/:id', getUserDetail);
router.put('/dashboard/users/:id/status', updateUserStatus);
router.delete('/dashboard/users/:id', deleteUser);
router.get('/dashboard/users/:id/terms-pdf', getUserTermsPDF);
router.get('/dashboard/properties', getDashboardProperties);

// Moderation Appeals
const { getAppeals, getAppealHistory, handleAppeal } = require('../controllers/hostController');
router.get('/dashboard/appeals/history', getAppealHistory);
router.get('/dashboard/appeals', getAppeals);
router.put('/dashboard/appeals/:id', handleAppeal);

module.exports = router;
