
const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry');

router.post('/submit', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Create a new enquiry instance
    const enquiry = new Enquiry({
      name,
      email,
      phone,
      message
    });

    // Save the enquiry to the database
    await enquiry.save();

    res.status(201).json({ message: 'Enquiry submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit enquiry', error: error.message });
  }
});

module.exports = router;
