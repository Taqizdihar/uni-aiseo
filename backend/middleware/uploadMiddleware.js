const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================================================
// Upload Directory Setup
// ============================================================
// NOTE: Render's free tier uses an ephemeral filesystem. Files
// stored here WILL BE LOST on every deploy/restart. This setup
// prevents the 500 error, but for persistent storage you should
// migrate to Cloudinary, AWS S3, or similar cloud object storage.
//
// To swap to cloud storage later:
// 1. Replace multer.diskStorage with multer.memoryStorage()
// 2. In the controller, upload req.file.buffer to your provider
// 3. Store the returned URL in the database instead of a local path
// ============================================================

const uploadDir = path.join(__dirname, '../uploads');

// Create at module load time
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.warn('⚠️  Created uploads/ directory. On Render free tier, this is ephemeral — files will be lost on restart.');
}

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Re-check at upload time in case the dir was cleaned by ephemeral disk
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.warn('⚠️  Re-created uploads/ directory at upload time (ephemeral disk detected).');
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file .png, .jpg, dan .jpeg yang diizinkan!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: fileFilter
});

module.exports = upload;
