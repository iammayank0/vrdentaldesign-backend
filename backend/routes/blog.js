const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('../config/cloudinaryConfig');
const { Blog, BlogText } = require('../models/Blog');

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

// Fetch All Blog Posts
router.get('/blogs', async (req, res) => {
    try {
      const blogs = await Blog.find();
      res.json(blogs);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      res.status(500).json({ message: 'Error fetching blog posts', error: error.message });
    }
  });

// Fetch Blog Texts
router.get('/blog-texts', async (req, res) => {
    try {
      const blogTexts = await BlogText.find();
      res.json(blogTexts);
    } catch (error) {
      console.error('Error fetching blog texts:', error);
      res.status(500).json({ message: 'Error fetching blog texts', error: error.message });
    }
  });

// Create Blog Post
router.post('/blog/upload', upload.fields([{ name: 'image', maxCount: 1 }]), async (req, res) => {
    if (!req.files.image) {
      return res.status(400).json({ message: 'Image file must be uploaded' });
    }
  
    try {
      // Upload image to Cloudinary
      const imageResult = await cloudinary.uploader.upload(req.files.image[0].path, {
        folder: 'blog-images',
      });
  
      // Create new blog post
      const newBlog = new Blog({
        BlogTitle: req.body.BlogTitle,
        date: req.body.date,
        image: imageResult.secure_url,
        link: req.body.link
      });
  
      // Save to database
      await newBlog.save();
      fs.unlinkSync(req.files.image[0].path); // Remove the file from local uploads folder
  
      res.status(201).json(newBlog);
    } catch (error) {
      console.error('Failed to upload image and create blog post:', error);
      res.status(500).json({ message: 'Failed to upload image and create blog post', error: error.message });
    }
  });
  

// Create Blog Text
router.post('/blog-text', async (req, res) => {
  try {
    const newBlogText = new BlogText({
      title: req.body.title,
      heading: req.body.heading,
      description: req.body.description
    });

    // Save to database
    await newBlogText.save();

    res.status(201).json(newBlogText);
  } catch (error) {
    console.error('Failed to create blog text:', error);
    res.status(500).json({ message: 'Failed to create blog text', error: error.message });
  }
});

// Edit Blog 
router.put('/blog/:id', upload.fields([{ name: 'image', maxCount: 1 }]), async (req, res) => {
    const { id } = req.params;
    const { BlogTitle, date, link } = req.body;
  
    const updates = {};
    if (BlogTitle) updates.BlogTitle = BlogTitle;
    if (date) updates.date = date;
    if (link) updates.link = link;
  
    try {
      // Handle image upload if a new image is provided
      if (req.files && req.files['image']) {
        const imageResult = await cloudinary.uploader.upload(req.files['image'][0].path, {
          folder: 'blog-images',
        });
        updates.image = imageResult.secure_url;
        fs.unlinkSync(req.files['image'][0].path); // Remove the file from local uploads folder
      }
  
      const updatedBlog = await Blog.findByIdAndUpdate(id, updates, { new: true });
  
      if (!updatedBlog) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
  
      res.json(updatedBlog);
    } catch (error) {
      console.error('Error updating blog post:', error);
      res.status(500).json({ message: 'Error updating blog post', error: error.message });
    }
  });


// Edit Blog Text
router.put('/blog-text/:id', async (req, res) => {
    const { id } = req.params;
    const { title, heading, description } = req.body;
  
    const updates = {};
    if (title) updates.title = title;
    if (heading) updates.heading = heading;
    if (description) updates.description = description;
  
    try {
      const updatedBlogText = await BlogText.findByIdAndUpdate(id, updates, { new: true });
  
      if (!updatedBlogText) {
        return res.status(404).json({ message: 'Blog text not found' });
      }
  
      res.json(updatedBlogText);
    } catch (error) {
      console.error('Error updating blog text:', error);
      res.status(500).json({ message: 'Error updating blog text', error: error.message });
    }
  });

  // Delete Blog Post
router.delete('/blog/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
      const deletedBlog = await Blog.findByIdAndDelete(id);
      
      if (!deletedBlog) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      
      res.json({ message: 'Blog post deleted successfully' });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({ message: 'Error deleting blog post', error: error.message });
    }
  });

module.exports = router;
