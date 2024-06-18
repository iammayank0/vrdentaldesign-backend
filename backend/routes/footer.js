const express = require('express');
const multer = require('multer');
const Footer = require('../models/Footer'); 
const cloudinary = require('../config/cloudinaryConfig');
const fs = require('fs');
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

// POST endpoint for adding new footer data
router.post('/footer/add', upload.single('logo'), async (req, res) => {
  const { descriptionText, facebook, twitter, linkedin, instagram, quickLinks, location1, location2, phone, copyright } = req.body;

  try {
    // Handle logo image upload if provided
    let logoUrl = '';
    if (req.file) {
      const logoResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'logo-images',
      });
      logoUrl = logoResult.secure_url;
      fs.unlinkSync(req.file.path); // Remove the file from local uploads folder
    } else {
      return res.status(400).json({ message: 'Logo image file must be uploaded' });
    }

    // Parse quickLinks if it's a JSON stringified array
    let parsedQuickLinks;
    try {
      parsedQuickLinks = JSON.parse(quickLinks);
      if (!Array.isArray(parsedQuickLinks)) {
        return res.status(400).json({ message: 'quickLinks must be an array' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Invalid quickLinks format' });
    }

    // Create a new Footer document
    const newFooter = new Footer({
      description: {
        logo: logoUrl,
        text: descriptionText,
      },
      socialLinks: {
        facebook,
        twitter,
        linkedin,
        instagram,
      },
      quickLinks: parsedQuickLinks,
      contactInfo: {
        location1,
        location2,
        phone,
      },
      copyright,
    });

    // Save the new footer entry to the database
    await newFooter.save();

    res.status(201).json(newFooter);
  } catch (error) {
    console.error('Failed to create footer entry:', error);
    res.status(500).json({ message: 'Failed to create footer entry', error: error.message });
  }
});

// PUT endpoint for editing existing footer data
router.put('/footer/edit/:id', upload.single('logo'), async (req, res) => {
  const { id } = req.params;
  const { descriptionText, facebook, twitter, linkedin, instagram, quickLinks, location1, location2, phone, copyright } = req.body;

  try {
    // Find the existing footer entry by ID
    let existingFooter = await Footer.findById(id);
    if (!existingFooter) {
      return res.status(404).json({ message: 'Footer entry not found' });
    }

    // Handle logo image update if provided
    if (req.file) {
      // Upload logo to Cloudinary
      const logoResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'logo-images',
      });
      existingFooter.description.logo = logoResult.secure_url;

      // Remove the file from local uploads folder after upload
      fs.unlinkSync(req.file.path);
    }

    // Update other fields if provided
    if (descriptionText) {
      existingFooter.description.text = descriptionText;
    }
    if (facebook) {
      existingFooter.socialLinks.facebook = facebook;
    }
    if (twitter) {
      existingFooter.socialLinks.twitter = twitter;
    }
    if (linkedin) {
      existingFooter.socialLinks.linkedin = linkedin;
    }
    if (instagram) {
      existingFooter.socialLinks.instagram = instagram;
    }
    if (quickLinks) {
      try {
        const parsedQuickLinks = JSON.parse(quickLinks);
        if (!Array.isArray(parsedQuickLinks)) {
          return res.status(400).json({ message: 'quickLinks must be an array' });
        }
        existingFooter.quickLinks = parsedQuickLinks;
      } catch (error) {
        return res.status(400).json({ message: 'Invalid quickLinks format' });
      }
    }
    if (location1) {
      existingFooter.contactInfo.location1 = location1;
    }
    if (location2) {
      existingFooter.contactInfo.location2 = location2;
    }
    if (phone) {
      existingFooter.contactInfo.phone = phone;
    }
    if (copyright) {
      existingFooter.copyright = copyright;
    }

    // Save the updated footer entry to the database
    await existingFooter.save();

    res.status(200).json(existingFooter);
  } catch (error) {
    console.error('Failed to update footer entry:', error);
    res.status(500).json({ message: 'Failed to update footer entry', error: error.message });
  }
});

// GET endpoint for fetching the single footer data
router.get('/footer', async (req, res) => {
  try {
    // Assuming there is only one footer entry
    const footer = await Footer.findOne();
    if (!footer) {
      return res.status(404).json({ message: 'Footer entry not found' });
    }

    res.status(200).json(footer);
  } catch (error) {
    console.error('Failed to fetch footer entry:', error);
    res.status(500).json({ message: 'Failed to fetch footer entry', error: error.message });
  }
});


module.exports = router;
