const express = require('express');
const Enquiry = require('../models/Enquiry'); 
const router = express.Router();

router.post('/submit', async (req, res) => {
  try {
    console.log('Received enquiry:', req.body); 

    const { name, email, phone, message } = req.body;
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newEnquiry = new Enquiry({ name, email, phone: Number(phone), message });
    await newEnquiry.save();

    res.status(201).json({ message: 'Enquiry submitted successfully', enquiry: newEnquiry });
  } catch (error) {
    console.error('Error saving enquiry:', error); 
    res.status(500).json({ message: 'Failed to submit enquiry', error: error.message });
  }
});

module.exports = router;
