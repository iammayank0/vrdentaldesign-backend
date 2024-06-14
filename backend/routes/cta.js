const express = require('express');
const multer = require('multer');
const { CTAContent } = require('../models/CTAitem'); 
const cloudinary = require('../config/cloudinaryConfig'); 
const fs = require('fs');

const router = express.Router();

// Multer setup for file upload
const upload = multer({
    dest: 'uploads/', // Temporary folder for uploaded files
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
});

// Endpoint to fetch all CTAContent documents
router.get('/CTA', async (req, res) => {
    try {
        const allCTAContent = await CTAContent.find();
        res.json(allCTAContent);
    } catch (error) {
        console.error('Error fetching CTA content:', error);
        res.status(500).json({ message: 'Error fetching CTA content', error: error.message });
    }
});

// Endpoint to create MainContent
router.post('/CTA/upload', upload.single('CTAbg'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Image file must be uploaded' });
        }

        // Upload image to Cloudinary and delete from uploads folder
        const uploadAndDelete = async (file) => {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'CTA-BG', 
            });
            await fs.unlink(file.path, (err) => {
                if (err) throw err;
            });
            return result.secure_url;
        };

        const CTAbgUrl = await uploadAndDelete(req.file);

        const { ctaTitle, ctaSubtitle, phoneNumber } = req.body;

        // Create a new MainContent document
        const newCTAContent = new CTAContent({
            CTAbg: CTAbgUrl,
            ctaTitle,
            ctaSubtitle,
            phoneNumber,
        });

        // Save the new MainContent document
        await newCTAContent.save();

        res.status(201).json(newCTAContent);
    } catch (error) {
        console.error('Failed to upload image and create Main content:', error);
        res.status(500).json({ message: 'Failed to upload image and create Main content', error: error.message });
    }
});

// Update CTAContent by ID
router.put('/CTA/:id', upload.single('CTAbg'), async (req, res) => {
    const { id } = req.params;
    const { ctaTitle, ctaSubtitle, phoneNumber } = req.body;

    const updates = {};

    if (ctaTitle) updates.ctaTitle = ctaTitle;
    if (ctaSubtitle) updates.ctaSubtitle = ctaSubtitle;
    if (phoneNumber) updates.phoneNumber = phoneNumber;

    try {
        // Handle image upload if a new image is provided
        if (req.file) {
            const CTAbgUrl = await uploadAndDelete(req.file);
            updates.CTAbg = CTAbgUrl;
        }

        const updatedCTAContent = await CTAContent.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedCTAContent) {
            return res.status(404).json({ message: 'CTA content not found' });
        }

        res.json(updatedCTAContent);
    } catch (error) {
        console.error('Error updating CTA content:', error);
        res.status(500).json({ message: 'Error updating CTA content', error: error.message });
    }
});

// Function to upload image to Cloudinary and delete from uploads folder
const uploadAndDelete = async (file) => {
    const result = await cloudinary.uploader.upload(file.path, {
        folder: 'CTA-BG', // Folder in Cloudinary where the image will be stored
    });
    await fs.unlink(file.path, (err) => {
        if (err) throw err;
    });
    return result.secure_url;
};

module.exports = router;
