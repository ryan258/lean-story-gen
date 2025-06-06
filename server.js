const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Import prompt templates
const generateStoryPrompt = require('./prompts/generateStoryPrompt');
const enhanceStoryPrompt = require('./prompts/enhanceStoryPrompt');
const focusGroupPrompt = require('./prompts/focusGroupPrompt');
const systemMessages = require('./prompts/systemMessages');

const app = express();
const API_URL = process.env.API_URL || 'http://localhost:11434/api/generate';
const MODEL_NAME = process.env.MODEL_NAME || 'llama3.1:latest';
const PORT = process.env.PORT || 3000;
const LOG_PATH = path.join(__dirname, 'logs', 'story-log.md');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

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

async function streamOpenAIStory({ prompt, model, systemType = 'storyWriter' }) {
    const apiKey = OPENAI_API_KEY;
    const modelName = model && model.length > 0 ? model : OPENAI_MODEL;
    const url = 'https://api.openai.com/v1/chat/completions';
    const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    };
    const data = {
        model: modelName,
        messages: [
            { role: 'system', content: systemMessages[systemType] || '' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        stream: false
    };
    const response = await axios.post(url, data, { headers });
    return response.data.choices[0].message.content;
}

function logStoryRevision(type, prompt, content, feedback = null, customLogPath = null, producerNotes = null) {
    const timestamp = new Date().toLocaleString();
    let entry = `\n---\n`;
    if (type === 'Original Story') {
        entry += `\n## 🟢 NEW STORY GENERATED (${timestamp})\n`;
        entry += `---\n`;
    } else {
        entry += `\n### ${type} (${timestamp})\n`;
    }
    if (prompt) entry += `**Prompt:** ${prompt}\n\n`;
    if (producerNotes) entry += `**Producer Notes:**\n${producerNotes}\n\n`;
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
    const { prompt, producerNotes, provider, model } = req.body;
    try {
        currentLogPath = getNewLogFilename();
        fs.writeFileSync(currentLogPath, '# Story Generation Log\n\n', 'utf8');
        let story;
        const promptText = generateStoryPrompt({ prompt, producerNotes });
        if (provider === 'openai') {
            story = await streamOpenAIStory({ prompt: promptText, model, systemType: 'storyWriter' });
        } else {
            story = await streamOllamaStory({
                model: model && model.length > 0 ? model : MODEL_NAME,
                prompt: promptText
            });
        }
        logStoryRevision('Original Story', prompt, story, null, currentLogPath, producerNotes);
        res.json({ story });
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate story', details: err.message });
    }
});

// Focus group feedback via Ollama
app.post('/focus-group', async (req, res) => {
    const { story, provider, model } = req.body;
    try {
        let feedback;
        const promptText = focusGroupPrompt({ story });
        if (provider === 'openai') {
            feedback = await streamOpenAIStory({ prompt: promptText, model, systemType: 'focusGroup' });
        } else {
            feedback = await streamOllamaStory({
                model: model && model.length > 0 ? model : MODEL_NAME,
                prompt: promptText
            });
        }
        res.json({ feedback });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get focus group feedback', details: err.message });
    }
});

// Enhancement via Ollama
app.post('/enhance-story', async (req, res) => {
    const { story, feedback, producerNotes, provider, model } = req.body;
    try {
        let newDraft;
        const promptText = enhanceStoryPrompt({ story, feedback, producerNotes });
        if (provider === 'openai') {
            newDraft = await streamOpenAIStory({ prompt: promptText, model, systemType: 'enhancer' });
        } else {
            newDraft = await streamOllamaStory({
                model: model && model.length > 0 ? model : MODEL_NAME,
                prompt: promptText
            });
        }
        logStoryRevision('Revision', null, newDraft, feedback, currentLogPath, producerNotes);
        res.json({ newDraft });
    } catch (err) {
        res.status(500).json({ error: 'Failed to enhance story', details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
