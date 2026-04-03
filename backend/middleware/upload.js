const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    // If it's a message upload, save to chat/images subfolder
    const isMessage = req.originalUrl.includes('/api/messages');
    const dest = isMessage ? 'uploads/chat/images/' : 'uploads/';
    
    // Ensure nested directory exists
    const fullPath = path.join(__dirname, '..', dest);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, dest);
  },
  filename(req, file, cb) {
    // Generate safe filename: timestamp + extension
    cb(null, `${Date.now()}${path.extname(file.originalname).toLowerCase()}`);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
  limits: {
    fileSize: 5000000, // 5MB
    files: 30, // Max 30 files
  },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;
