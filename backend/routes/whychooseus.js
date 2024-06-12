const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('../config/cloudinaryConfig');
const WhyChooseUs = require('../models/WhyChooseUsItem');

const router = express.Router();

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

// GET endpoint to fetch "Why Choose Us" content
router.get('/whychooseus', async (req, res) => {
  try {
    const content = await WhyChooseUs.findOne();
    if (content) {
      res.json(content);
    } else {
      res.status(404).json({ message: 'Why Choose Us content not found' });
    }
  } catch (error) {
    console.error('Error fetching Why Choose Us content:', error);
    res.status(500).json({ message: 'Failed to fetch Why Choose Us content', error: error.message });
  }
});

//Add
router.post('/whychooseus/upload', upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'feature1Image', maxCount: 1 },
  { name: 'feature2Image', maxCount: 1 },
  { name: 'feature3Image', maxCount: 1 },
  { name: 'feature4Image', maxCount: 1 }
]), async (req, res) => {
  if (!req.files.mainImage || !req.files.feature1Image || !req.files.feature2Image || !req.files.feature3Image || !req.files.feature4Image) {
    return res.status(400).json({ message: 'Main image and all feature images must be uploaded' });
  }

  try {
    // Upload main image to Cloudinary
    const mainImageResult = await cloudinary.uploader.upload(req.files.mainImage[0].path, {
      folder: 'whychooseus-images',
    });

    // Upload feature images to Cloudinary and construct features array
    const features = [];
    for (let i = 1; i <= 4; i++) {
      const featureImage = req.files[`feature${i}Image`][0];
      const featureImageResult = await cloudinary.uploader.upload(featureImage.path, {
        folder: 'whychooseus-images',
      });
      features.push({
        title: req.body[`feature${i}Title`],
        description: req.body[`feature${i}Description`],
        image: featureImageResult.secure_url
      });
      fs.unlinkSync(featureImage.path);
    }

    // Create new "Why Choose Us" content
    const newWhyChooseUs = new WhyChooseUs({
      mainImage: mainImageResult.secure_url,
      sectionTitle: req.body.sectionTitle,
      subtitle: req.body.subtitle,
      features: features
    });

    // Save to database
    await newWhyChooseUs.save();

    res.status(201).json(newWhyChooseUs);
  } catch (error) {
    console.error('Failed to upload images and create Why Choose Us content:', error);
    res.status(500).json({ message: 'Failed to upload images and create Why Choose Us content', error: error.message });
  }
});

// PUT endpoint to update "Why Choose Us" content
router.put('/whychooseus/:id', upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'feature1Image', maxCount: 1 },
  { name: 'feature2Image', maxCount: 1 },
  { name: 'feature3Image', maxCount: 1 },
  { name: 'feature4Image', maxCount: 1 }
]), async (req, res) => {
  const { id } = req.params;

  try {
    // Construct updates object
    const updates = {};
    
    // Update main image if provided
    if (req.files.mainImage) {
      const mainImageResult = await cloudinary.uploader.upload(req.files.mainImage[0].path, {
        folder: 'whychooseus-images',
      });
      updates.mainImage = mainImageResult.secure_url;
      fs.unlinkSync(req.files.mainImage[0].path);
    }

    // Update feature images if provided
    if (req.files.feature1Image) {
      const featureImageResult = await cloudinary.uploader.upload(req.files.feature1Image[0].path, {
        folder: 'whychooseus-images',
      });
      updates['features.0.image'] = featureImageResult.secure_url;
      fs.unlinkSync(req.files.feature1Image[0].path);
    }
    if (req.files.feature2Image) {
      const featureImageResult = await cloudinary.uploader.upload(req.files.feature2Image[0].path, {
        folder: 'whychooseus-images',
      });
      updates['features.1.image'] = featureImageResult.secure_url;
      fs.unlinkSync(req.files.feature2Image[0].path);
    }
    if (req.files.feature3Image) {
      const featureImageResult = await cloudinary.uploader.upload(req.files.feature3Image[0].path, {
        folder: 'whychooseus-images',
      });
      updates['features.2.image'] = featureImageResult.secure_url;
      fs.unlinkSync(req.files.feature3Image[0].path);
    }
    if (req.files.feature4Image) {
      const featureImageResult = await cloudinary.uploader.upload(req.files.feature4Image[0].path, {
        folder: 'whychooseus-images',
      });
      updates['features.3.image'] = featureImageResult.secure_url;
      fs.unlinkSync(req.files.feature4Image[0].path);
    }

    // Update sectionTitle and subtitle
    updates.sectionTitle = req.body.sectionTitle;
    updates.subtitle = req.body.subtitle;

    // Update feature titles and descriptions
    updates['features.0.title'] = req.body.feature1Title;
    updates['features.0.description'] = req.body.feature1Description;
    updates['features.1.title'] = req.body.feature2Title;
    updates['features.1.description'] = req.body.feature2Description;
    updates['features.2.title'] = req.body.feature3Title;
    updates['features.2.description'] = req.body.feature3Description;
    updates['features.3.title'] = req.body.feature4Title;
    updates['features.3.description'] = req.body.feature4Description;

    // Find and update the document
    const updatedWhyChooseUs = await WhyChooseUs.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedWhyChooseUs) {
      return res.status(404).json({ message: 'Why Choose Us content not found' });
    }

    res.json(updatedWhyChooseUs);
  } catch (error) {
    console.error('Error updating Why Choose Us content:', error);
    res.status(500).json({ message: 'Error updating Why Choose Us content', error: error.message });
  }
});



module.exports = router;