const mongoose = require('mongoose');

const FooterSchema = new mongoose.Schema({
  description: {
    logo: { type: String, required: true },
    text: { type: String, required: true },
  },
  socialLinks: {
    facebook: { type: String, required: true },
    twitter: { type: String, required: true },
    linkedin: { type: String, required: true },
    instagram: { type: String, required: true },
  },
  quickLinks: [
    {
      text: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],
  contactInfo: {
    location1: { type: String, required: true },
    location2: { type: String, required: true },
    phone: { type: String, required: true },
  },
  copyright: { type: String, required: true },
});

const Footer = mongoose.model('Footer', FooterSchema);

module.exports = Footer;
