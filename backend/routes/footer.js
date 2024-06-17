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

// Fetch footer content
router.get('/footer', async (req, res) => {
    try {
        const footer = await Footer.findOne();

        if (!footer) {
            return res.status(404).json({ message: 'Footer content not found' });
        }

        res.json(footer);
    } catch (error) {
        console.error('Error fetching footer content:', error);
        res.status(500).json({ message: 'Error fetching footer content', error: error.message });
    }
});


router.post('/footer/upload', upload.single('logo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Logo image must be uploaded' });
  }

  try {
    // Upload logo to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'logo-images',
    });
    await fs.unlinkSync(req.file.path); // Remove the temporary file

    // Destructure the other fields from the request body
    const { text, socialLinks, quickLinks, contactInfo, copyright } = req.body;

    // Create a new Footer document
    const newFooter = new Footer({
      description: {
        logo: result.secure_url,
        text,
      },
      socialLinks: JSON.parse(socialLinks),
      quickLinks: JSON.parse(quickLinks),
      contactInfo: JSON.parse(contactInfo),
      copyright,
    });

    await newFooter.save();

    res.status(201).json(newFooter);
  } catch (error) {
    console.error('Failed to upload image and create footer content:', error);
    res.status(500).json({ message: 'Failed to upload image and create footer content', error: error.message });
  }
});


router.put('/footer/:id', upload.single('logo'), async (req, res) => {
    const { id } = req.params;
    const { text, socialLinks, quickLinks, contactInfo, copyright } = req.body;

    try {
        // Fetch existing footer content
        const existingFooter = await Footer.findById(id);

        if (!existingFooter) {
            return res.status(404).json({ message: 'Footer content not found' });
        }

        // Prepare updates, using existing values for fields that are not provided
        const updates = {
            description: {
                text: text || existingFooter.description.text,
                logo: existingFooter.description.logo
            },
            socialLinks: socialLinks ? JSON.parse(socialLinks) : existingFooter.socialLinks,
            quickLinks: quickLinks ? JSON.parse(quickLinks) : existingFooter.quickLinks,
            contactInfo: contactInfo ? JSON.parse(contactInfo) : existingFooter.contactInfo,
            copyright: copyright || existingFooter.copyright
        };

        // Handle logo upload if a new logo is provided
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, { folder: 'footer-images' });
            updates.description.logo = result.secure_url;
            fs.unlinkSync(req.file.path);
        }

        const updatedFooter = await Footer.findByIdAndUpdate(id, updates, { new: true });

        res.json(updatedFooter);
    } catch (error) {
        console.error('Error updating footer content:', error);
        res.status(500).json({ message: 'Error updating footer content', error: error.message });
    }
});

module.exports = router;
