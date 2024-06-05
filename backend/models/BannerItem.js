const mongoose = require('mongoose');


const SlideSchema = new mongoose.Schema({
    className: { type: String, required: true },
    title: { type: String, required: true },
    heading: { type: String, required: true },
    description: { type: String, required: true },
    position: { type: Number, required: true },
  });


const SlideContent = mongoose.model('SlideContent', SlideSchema);

module.exports = { SlideContent };
