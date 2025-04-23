const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const API_URL = process.env.API_URL || 'http://localhost:11434/api/generate';
const MODEL_NAME = process.env.MODEL_NAME || 'llama3.1:latest';
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const streamOllamaStory = async (payload) => {
    const res = await axios({
        method: 'post',
        url: API_URL,
        data: payload,
        responseType: 'stream'
    });
    return new Promise((resolve, reject) => {
        let story = '';
        res.data.on('data', chunk => {
            const lines = chunk.toString().split('\n').filter(Boolean);
            for (const line of lines) {
                try {
                    const obj = JSON.parse(line);
                    if (obj.response) story += obj.response;
                } catch (e) { /* ignore parse errors */ }
            }
        });
        res.data.on('end', () => resolve(story));
        res.data.on('error', reject);
    });
};

// AI story generator via Ollama
app.post('/generate-story', async (req, res) => {
    const { prompt } = req.body;
    try {
        const story = await streamOllamaStory({
            model: MODEL_NAME,
            prompt: `Write a creative story based on: ${prompt}`
        });
        res.json({ story });
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate story', details: err.message });
    }
});

// Focus group feedback via Ollama
app.post('/focus-group', async (req, res) => {
    const { story } = req.body;
    try {
        const feedback = await streamOllamaStory({
            model: MODEL_NAME,
            prompt: `You are a focus group. Give constructive feedback on this story: ${story}`
        });
        res.json({ feedback });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get focus group feedback', details: err.message });
    }
});

// Enhancement via Ollama
app.post('/enhance-story', async (req, res) => {
    const { story, feedback } = req.body;
    try {
        const newDraft = await streamOllamaStory({
            model: MODEL_NAME,
            prompt: `You are a writer. Here is your story: ${story}\nFocus group feedback: ${feedback}\nRevise and enhance the story accordingly.`
        });
        res.json({ newDraft });
    } catch (err) {
        res.status(500).json({ error: 'Failed to enhance story', details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
