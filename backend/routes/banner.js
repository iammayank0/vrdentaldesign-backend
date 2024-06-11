
const express = require('express');
const multer = require('multer');
const { SlideContent } = require('../models/BannerItem');
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

// Endpoint to fetch banner content
router.get('/banner', async (req, res) => {
  try {
    const bannerContent = await SlideContent.find().sort({ position: 1 });
    res.json(bannerContent);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch banner content', error: error.message });
  }
});

// Endpoint to  create a new slide
router.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded or file type not supported' });
  }

  try {
    
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'banner-images',
    });

    // Remove the temporary file
    await fs.unlinkSync(req.file.path);

    
    const { title, heading, description, position } = req.body;

    
    await SlideContent.updateMany(
      { position: { $gte: position } },
      { $inc: { position: 1 } }
    );

    
    const newSlide = new SlideContent({
      title,
      heading,
      description,
      position,
      backgroundImageUrl: result.secure_url,
    });

    await newSlide.save();

    res.status(201).json(newSlide);
  } catch (error) {
    console.error('Failed to upload image and create slide:', error);
    res.status(500).json({ message: 'Failed to upload image and create slide', error: error.message });
  }
});

//endpoint to edit
router.put('/banner/:id', upload.single('image'), async (req, res) => {
  try {
    const itemId = req.params.id;
    const { position, ...updateData } = req.body;
    const currentItem = await SlideContent.findById(itemId);

    if (!currentItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (position !== undefined && position !== currentItem.position) {
      if (position > currentItem.position) {
        await SlideContent.updateMany(
          { position: { $gt: currentItem.position, $lte: position } },
          { $inc: { position: -1 } }
        );
      } else {
        await SlideContent.updateMany(
          { position: { $gte: position, $lt: currentItem.position } },
          { $inc: { position: 1 } }
        );
      }
      currentItem.position = position;
    }

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'banner-images',
      });
      await fs.unlinkSync(req.file.path);
      updateData.backgroundImageUrl = result.secure_url;
    }

    Object.assign(currentItem, updateData);
    const updatedItem = await currentItem.save();

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating slide:', error);
    res.status(400).json({ message: error.message });
  }
});




// Endpoint to delete a slide by ID
router.delete('/banner/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const deletedItem = await SlideContent.findByIdAndDelete(itemId);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Decrement the position of items that were after the deleted item
    await SlideContent.updateMany(
      { position: { $gt: deletedItem.position } },
      { $inc: { position: -1 } }
    );

    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


module.exports = router;
