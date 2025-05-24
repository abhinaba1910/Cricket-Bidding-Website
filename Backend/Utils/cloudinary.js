const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'profile_pics',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    // public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    // transformation: [{ width: 300, height: 300, crop: 'thumb', gravity: 'face' }],
  }),
});

module.exports = { cloudinary, storage };
