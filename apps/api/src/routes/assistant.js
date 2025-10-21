const express = require('express');
const AssistantEngine = require('../assistant/engine');
const router = express.Router();

const assistantEngine = new AssistantEngine();

// POST /api/assistant/query
router.post('/query', async (req, res) => {
    try {
        const { message, context = {} } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required and must be a string' });
        }

        const result = await assistantEngine.processQuery(message, context);
        res.json(result);
    } catch (error) {
        console.error('Error processing assistant query:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to process your request'
        });
    }
});

// GET /api/assistant/intents
router.get('/intents', (req, res) => {
    try {
        const intents = assistantEngine.intentClassifier.intents;
        res.json({ intents });
    } catch (error) {
        console.error('Error fetching intents:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/assistant/functions
router.get('/functions', (req, res) => {
    try {
        const functions = assistantEngine.functionRegistry.getAllSchemas();
        res.json({ functions });
    } catch (error) {
        console.error('Error fetching functions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/assistant/execute-function
router.post('/execute-function', async (req, res) => {
    try {
        const { functionName, parameters } = req.body;

        if (!functionName) {
            return res.status(400).json({ error: 'Function name is required' });
        }

        const result = await assistantEngine.functionRegistry.execute(functionName, parameters || {});
        res.json(result);
    } catch (error) {
        console.error('Error executing function:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

module.exports = router;
