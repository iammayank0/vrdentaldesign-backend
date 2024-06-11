const mongoose = require('mongoose');

const ServiceContentSchema = new mongoose.Schema({
    img1: { type: String, required: true },
    img1Title: { type: String, required: true },
    img2: { type: String, required: true },
    img2Title: { type: String, required: true },
    img3: { type: String, required: true },
    img3Title: { type: String, required: true },
    img4: { type: String, required: true },
    img4Title: { type: String, required: true },
    subTitle: { type: String, required: true },
    title: { type: String, required: true },
    description: [String]
});

const ServiceContent = mongoose.model('ServiceContent', ServiceContentSchema);

module.exports = { ServiceContent };
