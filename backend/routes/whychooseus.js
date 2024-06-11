const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('../config/cloudinaryConfig');
const WhyChooseUs = require('../models/WhyChooseUsItem');

const router = express.Router();

// Multer configuration for file upload
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

router.get('/whychooseus', async (req, res) => {
    try {
      // Find the "Why Choose Us" content from the database
      const content = await WhyChooseUs.findOne();
  
      // If content exists, send it as JSON response
      if (content) {
        res.json(content);
      } else {
        // If no content found, send 404 status with message
        res.status(404).json({ message: 'Why Choose Us content not found' });
      }
    } catch (error) {
      // If an error occurs, send 500 status with error message
      console.error('Error fetching Why Choose Us content:', error);
      res.status(500).json({ message: 'Failed to fetch Why Choose Us content', error: error.message });
    }
  });

// POST endpoint to add content to the "Why Choose Us" section
router.post('/whychooseus/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file must be uploaded' });
  }

  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'whychooseus-images',
    });

    // Delete the temporary file
    await fs.unlinkSync(req.file.path);

    // Extract fields from the request body
    const { sectionTitle, subtitle, features } = req.body;

    // Create a new WhyChooseUs document
    const newWhyChooseUs = new WhyChooseUs({
      image: result.secure_url,
      sectionTitle,
      subtitle,
      features: JSON.parse(features), // Parse the JSON string back into an array
    });

    // Save the new document to the database
    await newWhyChooseUs.save();

    // Send a success response
    res.status(201).json(newWhyChooseUs);
  } catch (error) {
    console.error('Failed to upload image and create Why Choose Us content:', error);
    res.status(500).json({ message: 'Failed to upload image and create Why Choose Us content', error: error.message });
  }
});

router.put('/whychooseus/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { sectionTitle, subtitle, features } = req.body;
  
    const updates = { sectionTitle, subtitle, features: JSON.parse(features) };
  
    try {
      // Handle image upload if a new image is provided
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'whychooseus-images',
        });
        updates.image = result.secure_url;
        fs.unlinkSync(req.file.path); // Delete the temporary file
      }
  
      const updatedWhyChooseUs = await WhyChooseUs.findByIdAndUpdate(id, updates, { new: true });
  
      if (!updatedWhyChooseUs) {
        return res.status(404).json({ message: 'Why Choose Us content not found' });
      }
  
      res.json(updatedWhyChooseUs);
    } catch (error) {
      console.error('Error updating Why Choose Us content:', error);
      res.status(500).json({ message: 'Error updating Why Choose Us content', error: error.message });
    }
  })

module.exports = router;
