const mongoose = require('mongoose');

const FunFactSchema = new mongoose.Schema({
    number: { type: String, required: true },
    label: { type: String, required: true }
});

const FunFact = mongoose.model('FunFact', FunFactSchema);

module.exports = { FunFact };
