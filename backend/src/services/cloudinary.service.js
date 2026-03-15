const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload un buffer image vers Cloudinary
 * @param {Buffer} buffer
 * @param {string} folder
 * @returns {Promise<{url: string, public_id: string}>}
 */
const uploadImage = (buffer, folder = 'arlette/reports') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', quality: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

const deleteImage = async (public_id) => {
  return cloudinary.uploader.destroy(public_id);
};

module.exports = { uploadImage, deleteImage };
