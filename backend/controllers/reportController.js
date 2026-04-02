const Report = require('../models/Report');
const User = require('../models/User');
const ModerationAppeal = require('../models/ModerationAppeal');

/**
 * @desc    Submit a new report
 * @route   POST /api/reports
 * @access  Private
 */
exports.submitReport = async (req, res, next) => {
  try {
    const { reportedUser, reason, description } = req.body;

    const userToReport = await User.findById(reportedUser);
    if (!userToReport) {
      return res.status(404).json({ success: false, message: 'User to report not found' });
    }

    if (reportedUser === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot report yourself' });
    }

    const report = await Report.create({
      reporter: req.user._id,
      reportedUser,
      reason,
      description
    });

    res.status(201).json({
      success: true,
      data: report,
      message: 'Report submitted successfully. Our team will review it.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reports (Host Only)
 * @route   GET /api/reports
 * @access  Private/Host
 */
exports.getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email phone role')
      .populate('reportedUser', 'name email phone status suspendedUntil role')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Handle a report (Host Only)
 * @route   PUT /api/reports/:id/handle
 * @access  Private/Host
 */
exports.handleReport = async (req, res, next) => {
  try {
    const { action, adminNote } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const reportedUser = await User.findById(report.reportedUser);
    if (!reportedUser) {
      return res.status(404).json({ success: false, message: 'Reported user not found' });
    }

    let automatedDuration = '';
    let automatedMsg = '';

    if (action === 'resolve') {
      // 1. Count ALL previous 'resolved' reports for this user
      const resolvedCount = await Report.countDocuments({ 
        reportedUser: reportedUser._id, 
        status: 'resolved' 
      });

      // 2. Automate duration based on user rules
      // 0 before this = 1st resolve = 24h
      // 1 before this = 2nd resolve = 1w
      // 2-4 before this = 3rd-5th = 1m
      // 5-8 before this = 6th-9th = 1y
      // 9+ before this = 10th+ = Permanent
      
      const sessionCount = resolvedCount + 1;

      if (sessionCount === 1) automatedDuration = '1d';
      else if (sessionCount === 2) automatedDuration = '1w';
      else if (sessionCount >= 3 && sessionCount <= 5) automatedDuration = '1m';
      else if (sessionCount >= 6 && sessionCount <= 9) automatedDuration = '1y';
      else automatedDuration = 'permanent';

      // 3. Update User Status
      if (automatedDuration === 'permanent') {
        reportedUser.status = 'banned';
        reportedUser.suspendedUntil = null;
        reportedUser.suspensionDurationLabel = 'Permanent Ban';
        automatedMsg = 'User has been PERMANENTLY BANNED due to 10+ resolved reports.';
      } else {
        reportedUser.status = 'active';
        const timeMap = { '1d': 1, '1w': 7, '1m': 30, '1y': 365 };
        const days = timeMap[automatedDuration] || 1;
        reportedUser.suspendedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        reportedUser.suspensionDurationLabel = automatedDuration;
        
        const labelMap = { '1d': '24 Hours', '1w': '1 Week', '1m': '1 Month', '1y': '1 Year' };
        automatedMsg = `User suspended for ${labelMap[automatedDuration]} (Resolved Report #${sessionCount})`;
      }

      await reportedUser.save();
      report.status = 'resolved';
    } else {
      report.status = 'reviewed';
      automatedMsg = 'Report rejected with no action taken on user.';
    }

    await report.save();

    // 4. Add to Moderation History
    await ModerationAppeal.create({
      userId: reportedUser._id,
      message: `Reported for: ${report.reason}. Report ID: ${report._id}`,
      status: action === 'resolve' ? 'rejected' : 'reviewed',
      adminNote: adminNote || `System: ${automatedMsg}. Reason: ${report.reason}`
    });

    res.status(200).json({
      success: true,
      message: automatedMsg,
      data: {
        status: reportedUser.status,
        suspendedUntil: reportedUser.suspendedUntil,
        duration: automatedDuration
      }
    });
  } catch (error) {
    next(error);
  }
};
