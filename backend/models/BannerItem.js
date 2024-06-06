const mongoose = require('mongoose');

const SlideSchema = new mongoose.Schema({
    title: { type: String, required: true },
    heading: { type: String, required: true },
    description: { type: String, required: true },
    position: { type: Number, required: true },
    backgroundImageUrl: { type: String, required: true } 
});

const SlideContent = mongoose.model('SlideContent', SlideSchema);

module.exports = { SlideContent };
