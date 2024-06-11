const express = require('express');
const router = express.Router();
const { FunFact } = require('../models/FactItem');

// Fetch all fun facts
router.get('/fun-facts', async (req, res) => {
    try {
        const funFacts = await FunFact.find({});
        res.json(funFacts);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Add multiple fun facts
router.post('/fun-facts', async (req, res) => {
    try {
        const newFunFacts = await FunFact.insertMany(req.body.funFacts);
        res.status(201).json(newFunFacts);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Update a fun fact by ID
router.put('/fun-facts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { number, label } = req.body;
        const updatedFunFact = await FunFact.findByIdAndUpdate(id, { number, label }, { new: true, runValidators: true });

        if (!updatedFunFact) {
            return res.status(404).send('Fun fact not found');
        }

        res.json(updatedFunFact);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
