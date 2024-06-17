const mongoose = require('mongoose');

const BlogTextSchema = new mongoose.Schema({
  title: { type: String, required: true },
  heading: { type: String, required: true },
  description: { type: String, required: true }
});

const BlogText = mongoose.model('BlogText', BlogTextSchema);

module.exports = { BlogText };
