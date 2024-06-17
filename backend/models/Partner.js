const mongoose = require('mongoose');

const PartnerSchema = new mongoose.Schema({
  PartnerImage: { type: String, required: true }
});

const PartnerContent = mongoose.model('PartnerContent', PartnerSchema);

module.exports = { PartnerContent };