const router = require('express').Router();
const cloudinary = require('cloudinary').v2;
const auth = require('../middleware/auth'); 

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

router.post('/sign-upload', auth, async (req, res) => {
  try {
    const { folder } = req.body;
    
    // Generate Timestamp and Signature
    const timestamp = Math.round((new Date).getTime() / 1000);
    
    // IMPORTANT: The params signed here MUST match exactly what frontend sends
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: folder
      }, 
      process.env.CLOUD_API_SECRET
    );

    res.json({
      signature: signature,
      timestamp: timestamp,
      cloudname: process.env.CLOUD_NAME,
      apikey: process.env.CLOUD_API_KEY,
      folder: folder
    });
  } catch (err) {
    console.error('SIGNATURE ERROR:', err);
    res.status(500).json({ error: 'Failed to generate signature' });
  }
});

module.exports = router;