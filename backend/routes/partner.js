const express = require('express');
const multer = require('multer');
const { PartnerContent } = require('../models/Partner'); 
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

//Fetch
router.get('/partner', async (req, res) => {
    try {
        // Fetch all partner documents from MongoDB
        const partners = await PartnerContent.find();

        // Respond with the array of partner documents
        res.status(200).json(partners);
    } catch (error) {
        console.error('Failed to fetch partners:', error);
        res.status(500).json({ message: 'Failed to fetch partners', error: error.message });
    }
});

// ADD
router.post('/partner/upload', upload.single('PartnerImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Image file must be uploaded' });
        }

        // Upload image to Cloudinary
        const uploadImage = async (filePath) => {
            const result = await cloudinary.uploader.upload(filePath, {
                folder: 'partner-images', 
            });
            await fs.unlinkSync(filePath); 
            return result.secure_url; 
        };


        const PartnerImageUrl = await uploadImage(req.file.path);


        const newPartner = new PartnerContent({
            PartnerImage: PartnerImageUrl,
        });


        await newPartner.save();


        res.status(201).json(newPartner);
    } catch (error) {
        console.error('Failed to upload image and create Partner container:', error);
        res.status(500).json({ message: 'Failed to upload image and create Partner container', error: error.message });
    }
});

// DELETE 
router.delete('/partner/:id', async (req, res) => {
    try {
        const partnerId = req.params.id;


        if (!partnerId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid partner ID format' });
        }


        const deletedPartner = await PartnerContent.findByIdAndDelete(partnerId);

        if (!deletedPartner) {
            return res.status(404).json({ message: 'Partner not found' });
        }


        res.status(200).json({ message: 'Partner deleted successfully', partner: deletedPartner });
    } catch (error) {
        console.error('Failed to delete partner:', error);
        res.status(500).json({ message: 'Failed to delete partner', error: error.message });
    }
});

module.exports = router;
