const promptInput = document.getElementById('prompt');
const generateBtn = document.getElementById('generateBtn');
const storySection = document.getElementById('story-section');
const storyDiv = document.getElementById('story');
const focusGroupBtn = document.getElementById('focusGroupBtn');
const feedbackSection = document.getElementById('feedback-section');
const feedbackDiv = document.getElementById('feedback');
const enhanceBtn = document.getElementById('enhanceBtn');
const copyStoryBtn = document.getElementById('copyStoryBtn');

let currentStory = '';
let currentFeedback = '';

generateBtn.onclick = async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return;
    generateBtn.disabled = true;
    const res = await fetch('/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
    });
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
    const res = await fetch('/focus-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story: currentStory })
    });
    const data = await res.json();
    currentFeedback = data.feedback;
    feedbackDiv.textContent = currentFeedback;
    feedbackSection.style.display = 'block';
    enhanceBtn.style.display = 'inline-block';
    focusGroupBtn.disabled = false;
};

enhanceBtn.onclick = async () => {
    enhanceBtn.disabled = true;
    const res = await fetch('/enhance-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story: currentStory, feedback: currentFeedback })
    });
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
