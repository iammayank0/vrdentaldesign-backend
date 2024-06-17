const express = require('express');
const multer = require('multer');
const { NavItem, ContactInfo, SocialLink, Logo } = require('../models/NavItem');
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

// Fetch logo
router.get('/logo', async (req, res) => {
  try {
    const logo = await Logo.findOne();
    res.json(logo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to create a new logo
router.post('/logo', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded or file type not supported' });
  }

  try {
    // Upload the image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'logo-images',
    });

    // Remove the temporary file
    await fs.unlinkSync(req.file.path);

    // Save the logo URL in the database
    const newLogo = new Logo({ logoUrl: result.secure_url });
    await newLogo.save();

    res.status(201).json(newLogo);
  } catch (error) {
    console.error('Failed to upload image and create logo:', error);
    res.status(500).json({ message: 'Failed to upload image and create logo', error: error.message });
  }
});

// Endpoint to edit an existing logo
router.put('/logo/:id', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded or file type not supported' });
  }

  try {
    const logoId = req.params.id;
    const logo = await Logo.findById(logoId);

    if (!logo) {
      return res.status(404).json({ message: 'Logo not found' });
    }

    // Upload the new image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'logo-images',
    });

    // Remove the temporary file
    await fs.unlinkSync(req.file.path);

    // Update the logo URL in the database
    logo.logoUrl = result.secure_url;
    await logo.save();

    res.json(logo);
  } catch (error) {
    console.error('Failed to upload image and update logo:', error);
    res.status(500).json({ message: 'Failed to upload image and update logo', error: error.message });
  }
});


// Endpoint to fetch navbar items
router.get('/navbar', async (req, res) => {
  try {
    const navbarItems = await NavItem.find().sort({ position: 1 });
    res.json(navbarItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to create a new navbar item
router.post('/navbar', async (req, res) => {
  try {
    const { position } = req.body;

    // Increment the position of items that are at or after the new position
    await NavItem.updateMany(
      { position: { $gte: position } },
      { $inc: { position: 1 } }
    );

    const newItem = new NavItem(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint to update an existing navbar item
router.put('/navbar/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const { position, ...updateData } = req.body;
    const currentItem = await NavItem.findById(itemId);

    if (!currentItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (position !== undefined && position !== currentItem.position) {
      // Adjust positions of other items
      if (position > currentItem.position) {
        await NavItem.updateMany(
          { position: { $gt: currentItem.position, $lte: position } },
          { $inc: { position: -1 } }
        );
      } else {
        await NavItem.updateMany(
          { position: { $gte: position, $lt: currentItem.position } },
          { $inc: { position: 1 } }
        );
      }
      currentItem.position = position;
    }

    Object.assign(currentItem, updateData);
    const updatedItem = await currentItem.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint to delete a navbar item
router.delete('/navbar/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const deletedItem = await NavItem.findByIdAndDelete(itemId);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Decrement the position of items that were after the deleted item
    await NavItem.updateMany(
      { position: { $gt: deletedItem.position } },
      { $inc: { position: -1 } }
    );

    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Fetch contact info
router.get('/contact-info', async (req, res) => {
  try {
    const contactInfo = await ContactInfo.findOne();
    res.json(contactInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update contact info
router.post('/contact-info', async (req, res) => {
  try {
    const existingInfo = await ContactInfo.findOne();
    if (existingInfo) {
      // Update existing contact info
      const updatedInfo = await ContactInfo.findByIdAndUpdate(existingInfo._id, req.body, { new: true });
      res.json(updatedInfo);
    } else {
      // Create new contact info
      const contactInfo = new ContactInfo(req.body);
      const savedInfo = await contactInfo.save();
      res.status(201).json(savedInfo);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Explicitly update contact info
router.put('/contact-info/:id', async (req, res) => {
  try {
    const updatedInfo = await ContactInfo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedInfo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// fetch for Social Links
router.get('/social-links', async (req, res) => {
  try {
    const socialLinks = await SocialLink.find();
    res.json(socialLinks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to create a new social link
router.post('/social-links', async (req, res) => {
  try {
    const newSocialLink = new SocialLink(req.body);
    const savedLink = await newSocialLink.save();
    res.status(201).json(savedLink);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint to update an existing social link
router.put('/social-links/:id', async (req, res) => {
  try {
    const updatedLink = await SocialLink.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedLink);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint to delete a social link
router.delete('/social-links/:id', async (req, res) => {
  try {
    await SocialLink.findByIdAndDelete(req.params.id);
    res.json({ message: 'Link deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
