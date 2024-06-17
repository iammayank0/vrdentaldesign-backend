const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true }  ,
  image: { type: String, required: true },
  link: { type: String, required: true }
});

const Blog = mongoose.model('Blog', BlogSchema);

module.exports = { Blog };
