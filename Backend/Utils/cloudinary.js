const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// ✅ Ensure correct env variable names
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // not YOUR_CLOUD_NAME
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Use a complete storage config that handles file metadata
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'profile_pics',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: `${Date.now()}-${file.originalname.split('.')[0]}`, // unique file name
    transformation: [{ width: 300, height: 300, crop: 'thumb', gravity: 'face' }], // optional: crop to face
  }),
});

module.exports = {
  cloudinary,
  storage,
};
