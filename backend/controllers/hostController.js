const User = require('../models/User');
const Property = require('../models/Property');
const ModerationAppeal = require('../models/ModerationAppeal');
const PDFDocument = require('pdfkit');
const { isUserOnline } = require('../sockets/chat');

/**
 * @desc    Get all users for host dashboard
 * @route   GET /api/host/dashboard/users
 * @access  Private (host only)
 */
exports.getDashboardUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (req.query.role && ['buyer', 'agent', 'host'].includes(req.query.role)) {
      filter.role = req.query.role;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name email phone role createdAt isVerified lastLogin status suspendedUntil')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    // Attach online status
    const usersWithOnlineStatus = users.map(user => ({
      ...user,
      isOnline: isUserOnline(user._id)
    }));

    res.json({
      success: true,
      data: usersWithOnlineStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user status (ban/activate)
 * @route   PUT /api/host/dashboard/users/:id/status
 * @access  Private (host only)
 */
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status, duration } = req.body;
    
    // Validate inputs
    if (status && !['active', 'banned'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let message = '';

    if (duration) {
      const now = new Date();
      let suspendedUntil = null;

      switch (duration) {
        case '1d':
          suspendedUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          user.suspensionDurationLabel = '24 Hour';
          message = 'User suspended for 24 hours';
          break;
        case '1w':
          suspendedUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          user.suspensionDurationLabel = '1 Week';
          message = 'User suspended for 1 week';
          break;
        case '1m':
          suspendedUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          user.suspensionDurationLabel = '1 Month';
          message = 'User suspended for 1 month';
          break;
        case '1y':
          suspendedUntil = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
          user.suspensionDurationLabel = '1 Year';
          message = 'User suspended for 1 year';
          break;
        case 'permanent':
          user.status = 'banned';
          user.suspendedUntil = null;
          user.suspensionDurationLabel = 'Permanently';
          message = 'User banned permanently';
          break;
        case 'none':
          user.status = 'active';
          user.suspendedUntil = null;
          user.suspensionDurationLabel = '';
          message = 'User suspension cleared';
          break;
        default:
          return res.status(400).json({ success: false, message: 'Invalid duration' });
      }

      if (suspendedUntil) {
        user.status = 'active'; // Status is active, but middleware blocks if suspendedUntil is set
        user.suspendedUntil = suspendedUntil;
      } else {
        user.suspendedUntil = null;
        user.suspensionDurationLabel = '';
      }
    } else if (status) {
      user.status = status;
      user.suspendedUntil = null;
      user.suspensionDurationLabel = ''; // Clear label when status changed manually
      message = `User status updated to ${status}`;
    }

    await user.save();
    res.json({ success: true, message, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user permanently
 * @route   DELETE /api/host/dashboard/users/:id
 * @access  Private (host only)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Cascade: Delete user's properties
    await Property.deleteMany({ postedBy: user._id });
    
    // Delete user
    await user.deleteOne();

    res.json({ success: true, message: 'User and their properties deleted permanently' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all properties for host dashboard
 * @route   GET /api/host/dashboard/properties
 * @access  Private (host only)
 */
exports.getDashboardProperties = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.type && ['rent', 'sale'].includes(req.query.type)) {
      filter.type = req.query.type;
    }
    if (req.query.status && ['active', 'pending', 'sold/rented'].includes(req.query.status)) {
      filter.status = req.query.status;
    }
    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: 'i' };
    }

    // Filter by postedBy role
    if (req.query.postedByRole && ['buyer', 'agent', 'host'].includes(req.query.postedByRole)) {
      const usersWithRole = await User.find({ role: req.query.postedByRole }).select('_id').lean();
      filter.postedBy = { $in: usersWithRole.map((u) => u._id) };
    }

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate('postedBy', 'name email role profilePhoto profilePic')
        .select('title price type propertyType location status createdAt images views')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Property.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user detail with their properties/favorites
 * @route   GET /api/host/dashboard/users/:id
 * @access  Private (host only)
 */
exports.getUserDetail = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('firstName lastName username name email phone role profilePhoto bio gender dateOfBirth address company designation experience specialization languages reraNumber socialLinks isProfileComplete isVerified createdAt lastLogin favorites')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get posted properties (for agent/host)
    let postedProperties = [];
    if (user.role === 'agent' || user.role === 'host') {
      postedProperties = await Property.find({ postedBy: user._id })
        .select('title price type propertyType location status images views createdAt slug')
        .sort({ createdAt: -1 })
        .lean();
    }

    // Get favorite properties (for buyer)
    let favoriteProperties = [];
    if (user.role === 'buyer' && user.favorites && user.favorites.length > 0) {
      favoriteProperties = await Property.find({ _id: { $in: user.favorites } })
        .select('title price type propertyType location status images views createdAt slug')
        .populate('postedBy', 'name role profilePhoto profilePic')
        .lean();
    }

    res.json({
      success: true,
      user,
      postedProperties,
      favoriteProperties,
      stats: {
        propertiesPosted: postedProperties.length,
        favoriteCount: (user.favorites || []).length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all pending moderation appeals
 * @route   GET /api/host/dashboard/appeals
 * @access  Private (host only)
 */
exports.getAppeals = async (req, res, next) => {
  try {
    const appeals = await ModerationAppeal.find({ status: 'pending' })
      .populate('userId', 'name email phone role status suspendedUntil suspensionDurationLabel')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: appeals });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all resolved moderation appeals (history)
 * @route   GET /api/host/dashboard/appeals/history
 * @access  Private (host only)
 */
exports.getAppealHistory = async (req, res, next) => {
  try {
    const history = await ModerationAppeal.find({ status: { $ne: 'pending' } })
      .populate('userId', 'name email phone role status suspendedUntil suspensionDurationLabel')
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Handle moderation appeal (approve/reject)
 * @route   PUT /api/host/dashboard/appeals/:id
 * @access  Private (host only)
 */
exports.handleAppeal = async (req, res, next) => {
  try {
    const { action, adminNote } = req.body; // action: 'approve' | 'reject'
    const appeal = await ModerationAppeal.findById(req.params.id);
    if (!appeal) return res.status(404).json({ success: false, message: 'Appeal not found' });

    const user = await User.findById(appeal.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (action === 'approve') {
      user.status = 'active';
      user.suspendedUntil = null;
      user.suspensionDurationLabel = '';
      await user.save();
      appeal.status = 'approved';
    } else {
      appeal.status = 'rejected';
    }

    appeal.adminNote = adminNote || '';
    await appeal.save();

    res.json({ success: true, message: `Appeal ${action}d successfully.`, data: appeal });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate and download Terms & Conditions PDF for a user
 * @route   GET /api/host/dashboard/users/:id/terms-pdf
 * @access  Private (host only)
 */
exports.getUserTermsPDF = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.termsAccepted || !user.termsAccepted.status) {
      return res.status(400).json({ success: false, message: 'User has not accepted the Terms and Conditions yet.' });
    }

    const doc = new PDFDocument({ margin: 50 });
    
    // Name the file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="IndiaHomes_TnC_${user.name.replace(/\s+/g, '_')}.pdf"`);

    doc.pipe(res);

    // Header
    doc.fontSize(22).font('Helvetica-Bold').text('IndiaHomes Terms & Conditions', { align: 'center' });
    doc.moveDown(0.2);
    doc.fontSize(10).font('Helvetica').text('Acceptance Record', { align: 'center', color: 'gray' });
    doc.moveDown(2);

    // User Details section
    doc.fontSize(14).font('Helvetica-Bold').text('User Information', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    doc.text(`Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Phone: ${user.phone}`);
    doc.text(`Role: ${user.role}`);
    if (user.termsAccepted.ip) {
       doc.text(`IP Address: ${user.termsAccepted.ip}`);
    }
    const acceptedDate = user.termsAccepted.date ? new Date(user.termsAccepted.date).toLocaleString() : 'N/A';
    doc.text(`Accepted On: ${acceptedDate}`);
    doc.moveDown(2);

    // Terms Content
    doc.fontSize(14).font('Helvetica-Bold').text('Agreed Terms', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(
`1. Services Provided
IndiaHomes is an online intermediary connecting Buyers, Agents, and Hosts. We do not own, verify, or guarantee any properties listed. All transactions are solely between users.

2. User Accounts
• Eligibility: You must be 18+ years old.
• Accuracy: You agree to provide truthful registration details (OTP/Direct Login).
• Security: You are responsible for all activities under your account. We reserve the right to terminate accounts for misuse or fraud.

3. Roles & Responsibilities
• Buyers: Responsible for independent due diligence and legal verification.
• Agents/Hosts: Must ensure all listings are accurate and comply with Indian laws (including RERA where applicable). Hosts are fully liable for their direct listings.

4. Property Listings & Chat
• Content: Users are liable for all listings and chat messages (images, files, emojis).
• Monitoring: IndiaHomes does not pre-screen content but reserves the right to remove material that violates these terms or legal standards.
• No Warranty: We do not guarantee property availability, price, or quality.

5. Prohibited Conduct
You agree not to:
• Post fraudulent listings or upload malicious code.
• Harass users or bypass Platform security.
• Use automated scrapers or bots without authorization.

6. Intellectual Property
All Platform branding belongs to IndiaHomes. By uploading content, you grant us a non-exclusive license to display and distribute it for service purposes.

7. Legal Disclaimers
• "As-Is": The Platform is provided without warranties of any kind.
• Liability: IndiaHomes is not liable for indirect damages or disputes arising between users.
• Indemnity: You agree to hold IndiaHomes harmless from claims resulting from your breach of these Terms.

8. Governing Law
These Terms are governed by the Laws of India. Disputes are subject to the exclusive jurisdiction of courts in Vadodara.
________________________________________
Contact & Grievance
For complaints or inquiries, contact our Grievance Officer:
• Email: grievance@indiahomes.com
• Web: www.indiahomes.com`, {
      align: 'left',
      lineGap: 2
    });

    doc.end();

  } catch (error) {
    next(error);
  }
};
