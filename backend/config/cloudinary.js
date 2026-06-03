const cloudinary = require('cloudinary').v2;

const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary Storage Service initialized successfully.');
} else {
  console.warn('WARNING: Cloudinary environment variables are missing. File uploads will return local dummy URL paths.');
}

const uploadToCloudinary = async (fileBuffer, folderName = 'estateai') => {
  if (!isCloudinaryConfigured) {
    // If not configured, we return a mock image URL or local mock path
    // We'll use a premium placeholder image from Unsplash suitable for real estate
    const randomPlaceholders = [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ];
    const randomIndex = Math.floor(Math.random() * randomPlaceholders.length);
    return {
      secure_url: randomPlaceholders[randomIndex],
      public_id: `mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    };
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: folderName, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    ).end(fileBuffer);
  });
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary
};
