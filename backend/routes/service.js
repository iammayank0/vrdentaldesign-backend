const express = require('express');
const multer = require('multer');
const { ServiceContent } = require('../models/ServiceItem');
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

// Fetch all service content
router.get('/services', async (req, res) => {
    try {
        const services = await ServiceContent.find({});
        res.json(services);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Endpoint to create a new service content
router.post('/services/upload', upload.fields([
    { name: 'img1', maxCount: 1 },
    { name: 'img2', maxCount: 1 },
    { name: 'img3', maxCount: 1 },
    { name: 'img4', maxCount: 1 },
    { name: 'img1Title', maxCount: 1 },
    { name: 'img2Title', maxCount: 1 },
    { name: 'img3Title', maxCount: 1 },
    { name: 'img4Title', maxCount: 1 },
]), async (req, res) => {
    try {
        // Check if all required image files and titles are uploaded
        if (!req.files || !req.files.img1 || !req.files.img2 || !req.files.img3 || !req.files.img4 ||
            !req.body.img1Title || !req.body.img2Title || !req.body.img3Title || !req.body.img4Title) {
            return res.status(400).json({ message: 'All image files and titles must be uploaded' });
        }

        // Upload images to Cloudinary and delete from uploads folder
        const uploadAndDelete = async (file) => {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'service-images',
            });
            await fs.unlink(file.path, (err) => {
                if (err) throw err;
            }); // Remove the temporary file
            return result.secure_url;
        };

        // Upload and get URLs for all images
        const img1Url = await uploadAndDelete(req.files.img1[0]);
        const img2Url = await uploadAndDelete(req.files.img2[0]);
        const img3Url = await uploadAndDelete(req.files.img3[0]);
        const img4Url = await uploadAndDelete(req.files.img4[0]);

        // Destructure the other fields from the request body
        const { subTitle, title, description } = req.body;
        const img1Title = req.body.img1Title;
        const img2Title = req.body.img2Title;
        const img3Title = req.body.img3Title;
        const img4Title = req.body.img4Title;

        // Create a new ServiceContent document
        const newServiceContent = new ServiceContent({
            img1: img1Url,
            img1Title,
            img2: img2Url,
            img2Title,
            img3: img3Url,
            img3Title,
            img4: img4Url,
            img4Title,
            subTitle,
            title,
            description: JSON.parse(description)
        });

        // Save the new service content document
        await newServiceContent.save();

        res.status(201).json(newServiceContent);
    } catch (error) {
        console.error('Failed to upload images and create service content:', error);
        res.status(500).json({ message: 'Failed to upload images and create service content', error: error.message });
    }
});


// Endpoint for updating service content
router.put('/services/:id', upload.fields([
    { name: 'img1' },
    { name: 'img2' },
    { name: 'img3' },
    { name: 'img4' },
    { name: 'img1Title' },
    { name: 'img2Title' },
    { name: 'img3Title' },
    { name: 'img4Title' },
]), async (req, res) => {
    const { id } = req.params;

    try {
        // Check if the service content exists
        const existingService = await ServiceContent.findById(id);
        if (!existingService) {
            return res.status(404).json({ message: 'Service content not found' });
        }

        // Update images if provided
        if (req.files) {
            for (const fileKey in req.files) {
                if (Object.prototype.hasOwnProperty.call(req.files, fileKey)) {
                    const file = req.files[fileKey][0];
                    const result = await cloudinary.uploader.upload(file.path, { folder: 'service-images' });
                    existingService[fileKey] = result.secure_url;
                    fs.unlinkSync(file.path);
                }
            }
        }

        // Update image titles if provided
        if (req.body) {
            for (const titleKey in req.body) {
                if (Object.prototype.hasOwnProperty.call(req.body, titleKey)) {
                    if (titleKey.endsWith('Title')) {
                        existingService[titleKey] = req.body[titleKey];
                    }
                }
            }
        }

        // Update text content if provided
        const { subTitle, title, description } = req.body;
        if (subTitle) existingService.subTitle = subTitle;
        if (title) existingService.title = title;
        if (description) existingService.description = JSON.parse(description);

        // Save the updated service content
        const updatedService = await existingService.save();

        res.json(updatedService);
    } catch (error) {
        console.error('Error updating service content:', error);
        res.status(500).json({ message: 'Error updating service content', error: error.message });
    }
});




module.exports = router;
