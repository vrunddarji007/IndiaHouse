const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create profiles upload directory if it doesn't exist
const profileDir = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/profiles/');
  },
  filename(req, file, cb) {
    const userId = req.user?.id || 'unknown';
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `user-${userId}-${Date.now()}${ext}`);
  },
});

function checkFileType(file, cb) {
  const allowedTypes = /jpg|jpeg|png/;
  const extValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = allowedTypes.test(file.mimetype);

  if (extValid && mimeValid) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, and PNG images are allowed'));
  }
}

const profileUpload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter(req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = profileUpload;
