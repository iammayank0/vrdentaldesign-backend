const mongoose = require('mongoose');

const CTASchema = new mongoose.Schema({
  CTAbg: { type: String, required: true }, 
  ctaTitle: { type: String, required: true }, 
  ctaSubtitle: { type: String, required: true },
  phoneNumber: { type: String, required: true } 
});

const CTAContent = mongoose.model('CTAContent', CTASchema);

module.exports = { CTAContent };
