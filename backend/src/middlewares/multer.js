const multer = require('multer');

// Stockage en mémoire (buffer) — on envoie directement à Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format image non supporté. Utilisez JPG, PNG ou WEBP.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // max 10 MB
  }
});

module.exports = upload;
