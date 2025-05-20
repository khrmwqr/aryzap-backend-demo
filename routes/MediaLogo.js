const router = require('express').Router();
const multer = require('multer'); // For handling file uploads
const path = require('path');
const sharp = require('sharp'); // For image optimization

// Configure storage for uploaded files (in-memory storage for processing)
const storage = multer.memoryStorage(); // Store images in memory temporarily

const upload = multer({ storage });

// Route for file upload and image optimization
router.post('/lupload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Process image with sharp (e.g., resize and convert to WebP)
    const timestamp = Date.now();
    const originalname = path.parse(req.file.originalname);
    const newFilename = `${originalname.name}_${timestamp}.webp`; // Change extension to .webp

    // Optimize image (resize, convert to WebP, adjust quality)
    const optimizedImageBuffer = await sharp(req.file.buffer)
      .webp({ quality: 75 })
      .toBuffer();

    // Define the path to save the optimized image
    const outputPath = path.join(__dirname, '..', 'public', 'logo', newFilename);

    // Write the optimized image to the server
    require('fs').writeFileSync(outputPath, optimizedImageBuffer);

    // Send the response with the new image path
    res.status(200).json({ imagePath: `${newFilename}` });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ message: 'Error while processing the image.' });
  }
});

module.exports = router;
