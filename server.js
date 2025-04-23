const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const app = express();
const API_URL = process.env.API_URL || 'http://localhost:11434/api/generate';
const MODEL_NAME = process.env.MODEL_NAME || 'llama3.1:latest';
const PORT = process.env.PORT || 3000;
const LOG_PATH = path.join(__dirname, 'logs', 'story-log.md');

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

function logStoryRevision(type, prompt, content, feedback = null, customLogPath = null) {
    const timestamp = new Date().toLocaleString();
    let entry = `\n---\n`;
    if (type === 'Original Story') {
        entry += `\n## 🟢 NEW STORY GENERATED (${timestamp})\n`;
        entry += `---\n`;
    } else {
        entry += `\n### ${type} (${timestamp})\n`;
    }
    if (prompt) entry += `**Prompt:** ${prompt}\n\n`;
    if (type === 'Revision' && feedback) entry += `**Focus Group Feedback:**\n${feedback}\n\n`;
    entry += `**Story Draft:**\n\n${content}\n`;
    fs.appendFileSync(customLogPath || LOG_PATH, entry, 'utf8');
}

function getNewLogFilename() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    return path.join(__dirname, 'logs', `story-log-${y}${m}${d}-${h}${min}${s}.md`);
}

let currentLogPath = LOG_PATH;

// AI story generator via Ollama
app.post('/generate-story', async (req, res) => {
    const { prompt } = req.body;
    try {
        currentLogPath = getNewLogFilename();
        fs.writeFileSync(currentLogPath, '# Story Generation Log\n\n', 'utf8');
        const story = await streamOllamaStory({
            model: MODEL_NAME,
            prompt: `Write a creative story based on: ${prompt}`
        });
        logStoryRevision('Original Story', prompt, story, null, currentLogPath);
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
        logStoryRevision('Revision', null, newDraft, feedback, currentLogPath);
        res.json({ newDraft });
    } catch (err) {
        res.status(500).json({ error: 'Failed to enhance story', details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
