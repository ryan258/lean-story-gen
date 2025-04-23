const promptInput = document.getElementById('prompt');
const generateBtn = document.getElementById('generateBtn');
const storySection = document.getElementById('story-section');
const storyDiv = document.getElementById('story');
const focusGroupBtn = document.getElementById('focusGroupBtn');
const feedbackSection = document.getElementById('feedback-section');
const feedbackDiv = document.getElementById('feedback');
const enhanceBtn = document.getElementById('enhanceBtn');
const copyStoryBtn = document.getElementById('copyStoryBtn');
const body = document.getElementById('main-body');
const defaultBg = body.className;
const loadingBg = 'bg-yellow-200 dark:bg-yellow-900 min-h-screen flex flex-col items-center py-12';
const aiProviderSelect = document.getElementById('ai-provider');
const openaiModelInput = document.getElementById('openai-model');

aiProviderSelect.onchange = function() {
    if (aiProviderSelect.value === 'openai') {
        openaiModelInput.style.display = '';
    } else {
        openaiModelInput.style.display = 'none';
    }
};

function setLoadingBg(isLoading) {
    if (isLoading) {
        document.body.classList.add('loading');
    } else {
        document.body.classList.remove('loading');
    }
}

function getProviderAndModel() {
    const provider = aiProviderSelect.value;
    let model = '';
    if (provider === 'openai') {
        model = openaiModelInput.value.trim();
    }
    return { provider, model };
}

let currentStory = '';
let currentFeedback = '';

generateBtn.onclick = async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return;
    generateBtn.disabled = true;
    setLoadingBg(true);
    const { provider, model } = getProviderAndModel();
    const res = await fetch('/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, provider, model })
    });
    setLoadingBg(false);
    const data = await res.json();
    currentStory = data.story;
    storyDiv.textContent = currentStory;
    storySection.style.display = 'block';
    focusGroupBtn.style.display = 'inline-block';
    copyStoryBtn.style.display = 'inline-block';
    feedbackSection.style.display = 'none';
    generateBtn.disabled = false;
};

focusGroupBtn.onclick = async () => {
    focusGroupBtn.disabled = true;
    setLoadingBg(true);
    const { provider, model } = getProviderAndModel();
    const res = await fetch('/focus-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story: currentStory, provider, model })
    });
    setLoadingBg(false);
    const data = await res.json();
    currentFeedback = data.feedback;
    feedbackDiv.textContent = currentFeedback;
    feedbackSection.style.display = 'block';
    enhanceBtn.style.display = 'inline-block';
    focusGroupBtn.disabled = false;
};

enhanceBtn.onclick = async () => {
    enhanceBtn.disabled = true;
    setLoadingBg(true);
    const { provider, model } = getProviderAndModel();
    const res = await fetch('/enhance-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story: currentStory, feedback: currentFeedback, provider, model })
    });
    setLoadingBg(false);
    const data = await res.json();
    currentStory = data.newDraft;
    storyDiv.textContent = currentStory;
    feedbackSection.style.display = 'none';
    focusGroupBtn.style.display = 'inline-block';
    copyStoryBtn.style.display = 'inline-block';
    enhanceBtn.disabled = false;
};

copyStoryBtn.onclick = async () => {
    if (!currentStory) return;
    try {
        await navigator.clipboard.writeText(currentStory);
        copyStoryBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyStoryBtn.textContent = 'Copy Story';
        }, 1500);
    } catch (e) {
        copyStoryBtn.textContent = 'Failed to Copy';
        setTimeout(() => {
            copyStoryBtn.textContent = 'Copy Story';
        }, 1500);
    }
};
