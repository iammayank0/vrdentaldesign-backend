const mongoose = require('mongoose');

const AboutSchema = new mongoose.Schema({
  img1: { type: String, required: true },
  img2: { type: String, required: true },
  subTitle: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  services: { type: [String], required: true },
  companyName: { type: String, required: true },
  founders: { type: String, required: true },
  signImage: { type: String, required: true }
});

const AboutContent = mongoose.model('AboutContent', AboutSchema);

module.exports = { AboutContent };
