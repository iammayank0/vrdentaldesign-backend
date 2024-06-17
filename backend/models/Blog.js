const mongoose = require('mongoose');

const BlogTextSchema = new mongoose.Schema({
  title: { type: String, required: true },
  heading: { type: String, required: true },
  description: { type: String, required: true }
});

const BlogSchema = new mongoose.Schema({
  BlogTitle: { type: String, required: true },
  date: { type: String, required: true }  ,
  image: { type: String, required: true },
  link: { type: String, required: true }
});

const BlogText = mongoose.model('BlogText', BlogTextSchema);
const Blog = mongoose.model('Blog', BlogSchema);

module.exports = { BlogText, Blog };
