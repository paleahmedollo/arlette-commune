const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

/**
 * Upload une image vers Cloudinary
 * @param {Buffer} buffer - Buffer de l'image
 * @param {string} folder - Sous-dossier dans Cloudinary
 * @returns {Promise<object>} - Résultat Cloudinary (url, public_id...)
 */
const uploadImage = (buffer, folder = 'arlette-commune/signalements') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        // Optimisation automatique
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 1200, crop: 'limit' } // max 1200px de large
        ],
        // Métadonnées utiles
        tags: ['arlette-commune', 'signalement']
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    // Convertir le buffer en stream et l'envoyer
    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
};

/**
 * Supprimer une image de Cloudinary
 * @param {string} publicId - ID public de l'image
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Erreur suppression Cloudinary:', error);
    throw error;
  }
};

module.exports = { uploadImage, deleteImage };
