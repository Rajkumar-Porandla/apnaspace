const multer = require('multer');
const path = require('path');

// Configure disk storage/memory storage
// Memory storage is ideal as we stream files directly to Cloudinary
const storage = multer.memoryStorage();

// File check filter (only allow images)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only (jpeg, jpg, png, webp, gif) are allowed!'));
  }
};

// Multer upload configurations
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size 5MB
  fileFilter,
});

module.exports = upload;
