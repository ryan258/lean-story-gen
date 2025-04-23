# Lean Story Generator

A simple AI-powered web app for iterative story creation and enhancement, using local LLMs via Ollama (llama3.1:latest by default).

## Features
- Generate creative stories from your prompts with AI
- Run stories past a simulated "focus group" for feedback
- Incorporate feedback into new drafts with a single click
- Repeat the review/enhancement cycle as many times as you want

## Tech Stack
- **Backend:** Node.js + Express
- **Frontend:** HTML, CSS, JavaScript
- **AI Model:** [Ollama](https://ollama.com/) (default: llama3.1:latest)

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Ollama](https://ollama.com/) running locally with `llama3.1:latest` pulled

### Installation
1. Clone the repository:
   ```sh
   git clone <your-repo-url>
   cd lean-story-gen
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Copy `.env.example` to `.env` and adjust if needed:
   ```sh
   cp .env.example .env
   # Edit .env to match your Ollama setup if needed
   ```
4. Start the app:
   ```sh
   node server.js
   ```
5. Open your browser to [http://localhost:3003](http://localhost:3003)

## Configuration
Edit `.env` to set your Ollama API URL, model, and port:
```
API_URL=http://localhost:11434/api/generate
MODEL_NAME=llama3.1:latest
PORT=3003
```

## How It Works
1. Enter a prompt and generate a story using the AI model.
2. Click "Run Past Focus Group" to get feedback from a simulated focus group (AI-powered).
3. Click "Incorporate Feedback" to send the story and feedback back to the AI for a new draft.
4. Repeat as desired to iteratively enhance your story.

## Customization
- To use a different model, update `MODEL_NAME` in your `.env` file.
- To use a different port, update `PORT` in your `.env` file.
- To connect to other AI providers (OpenAI, etc.), further backend changes are needed.

## License
MIT

---

*Built for rapid, lean story iteration with local AI.*
