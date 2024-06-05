const express = require('express');
const router = express.Router();
const { SlideContent } = require('../models/BannerItem');

//fetch 
router.get('/banner', async (req, res) => {
  try {
    const BannerContent = await SlideContent.find().sort({ position: 1 });
    res.json(BannerContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Add
router.post('/banner', async (req, res) => {
  try {
    const { position } = req.body;

    
    await SlideContent.updateMany(
      { position: { $gte: position } },
      { $inc: { position: 1 } }
    );

    const newItem = new SlideContent(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint to update an existing navbar item
router.put('/banner/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const { position, ...updateData } = req.body;
    const currentItem = await SlideContent.findById(itemId);

    if (!currentItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (position !== undefined && position !== currentItem.position) {
      // Adjust positions of other items
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

    Object.assign(currentItem, updateData);
    const updatedItem = await currentItem.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
