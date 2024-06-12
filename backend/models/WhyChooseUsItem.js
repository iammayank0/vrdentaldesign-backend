const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true }, 
});

const whyChooseUsSchema = new mongoose.Schema({
  mainImage: { type: String, required: true },
  sectionTitle: { type: String, required: true },
  subtitle: { type: String, required: true },
  features: [featureSchema],
});

const WhyChooseUs = mongoose.model('WhyChooseUs', whyChooseUsSchema);

module.exports = WhyChooseUs;
