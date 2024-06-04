const express = require('express');
const router = express.Router();
const { NavItem, ContactInfo, SocialLink } = require('../models/NavItem');

// CRUD for Navbar items
router.get('/navbar', async (req, res) => {
  try {
    const navbarItems = await NavItem.find().sort({ position: 1 });
    res.json(navbarItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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

// CRUD for Contact Info
router.get('/contact-info', async (req, res) => {
  try {
    const contactInfo = await ContactInfo.findOne();
    res.json(contactInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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

router.put('/contact-info/:id', async (req, res) => {
  try {
    const updatedInfo = await ContactInfo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedInfo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// CRUD for Social Links
router.get('/social-links', async (req, res) => {
  try {
    const socialLinks = await SocialLink.find();
    res.json(socialLinks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/social-links', async (req, res) => {
  const newLink = new SocialLink(req.body);
  try {
    const savedLink = await newLink.save();
    res.status(201).json(savedLink);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/social-links/:id', async (req, res) => {
  try {
    const updatedLink = await SocialLink.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedLink);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/social-links/:id', async (req, res) => {
  try {
    await SocialLink.findByIdAndDelete(req.params.id);
    res.json({ message: 'Link deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
