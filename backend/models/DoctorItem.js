const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema({
  facebook: { type: String },
  twitter: { type: String },
  linkedin: { type: String },
  instagram: { type: String }
});

const doctorSchema = new mongoose.Schema({
  img: { type: String, required: true },
  title: { type: String, required: true },
  time: { type: String, required: true },
  socialLinks: socialLinkSchema
});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
