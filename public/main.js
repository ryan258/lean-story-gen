const promptInput = document.getElementById('prompt');
const generateBtn = document.getElementById('generateBtn');
const storySection = document.getElementById('story-section');
const storyDiv = document.getElementById('story');
const focusGroupBtn = document.getElementById('focusGroupBtn');
const feedbackSection = document.getElementById('feedback-section');
const feedbackDiv = document.getElementById('feedback');
const enhanceBtn = document.getElementById('enhanceBtn');
const copyStoryBtn = document.getElementById('copyStoryBtn');
const runChainBtn = document.getElementById('runChainBtn');
const runChain5Btn = document.getElementById('runChain5Btn');
const runChain10Btn = document.getElementById('runChain10Btn');
const body = document.getElementById('main-body');
const defaultBg = body.className;
const loadingBg = 'bg-yellow-200 dark:bg-yellow-900 min-h-screen flex flex-col items-center py-12';
const aiProviderSelect = document.getElementById('ai-provider');
const openaiModelInput = document.getElementById('openai-model');
const producerNotesInput = document.getElementById('producer-notes');
const producerNotesLabel = document.getElementById('producer-notes-label');
const producerNotesOnlyCheckbox = document.getElementById('producer-notes-only');

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

// Hide producer notes on page load
producerNotesLabel.style.display = 'none';
producerNotesInput.style.display = 'none';

function showProducerNotesField() {
    producerNotesLabel.style.display = '';
    producerNotesInput.style.display = '';
}
function hideProducerNotesField() {
    producerNotesLabel.style.display = 'none';
    producerNotesInput.style.display = 'none';
    producerNotesInput.value = '';
}

function renderMarkdownToHtml(md) {
    if (!md || typeof md !== 'string') return '';
    // Basic markdown formatting for feedback (bold, lists, line breaks, rating)
    let html = md
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // bold
        .replace(/\n\n/g, '<br><br>') // paragraph breaks
        .replace(/\n- /g, '<br>&bull; ') // bullet points
        .replace(/\n\d+\. /g, m => '<br>' + m.trim()) // numbered list
        .replace(/\n/g, '<br>'); // line breaks
    // Highlight the rating line
    html = html.replace(/RATING: (\d{1,2}\/10 stars)/i, '<span class="font-bold text-yellow-500">RATING: $1</span>');
    return html;
}

function renderStoryMarkdownToHtml(md) {
    if (!md || typeof md !== 'string') return '';
    // Basic markdown formatting for stories (bold, italics, line breaks, lists)
    let html = md
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // italics
        .replace(/\n\n/g, '<br><br>') // paragraph breaks
        .replace(/\n- /g, '<br>&bull; ') // bullet points
        .replace(/\n\d+\. /g, m => '<br>' + m.trim()) // numbered list
        .replace(/\n/g, '<br>'); // line breaks
    return html;
}

function showStoryActions() {
    focusGroupBtn.style.display = 'inline-block';
    copyStoryBtn.style.display = 'inline-block';
    runChainBtn.style.display = 'inline-block';
    runChain5Btn.style.display = 'inline-block';
    runChain10Btn.style.display = 'inline-block';
}
function hideStoryActions() {
    focusGroupBtn.style.display = 'none';
    copyStoryBtn.style.display = 'none';
    runChainBtn.style.display = 'none';
    runChain5Btn.style.display = 'none';
    runChain10Btn.style.display = 'none';
}

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
    storyDiv.innerHTML = renderStoryMarkdownToHtml(currentStory);
    storySection.style.display = 'block';
    showStoryActions();
    feedbackSection.style.display = 'none';
    generateBtn.disabled = false;
    hideProducerNotesField();
};

// Run Chain: focus group + auto-enhance
runChainBtn.onclick = async () => {
    runChainBtn.disabled = true;
    setLoadingBg(true);
    const { provider, model } = getProviderAndModel();
    // Step 1: Focus group
    const res1 = await fetch('/focus-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story: currentStory, provider, model })
    });
    let data1;
    try {
        data1 = await res1.json();
    } catch (e) {
        feedbackDiv.innerHTML = '<span class="text-red-500">Error: Unable to parse feedback. Please check server logs.</span>';
        feedbackSection.style.display = 'block';
        runChainBtn.disabled = false;
        setLoadingBg(false);
        return;
    }
    currentFeedback = data1.feedback;
    feedbackDiv.innerHTML = renderMarkdownToHtml(currentFeedback);
    feedbackSection.style.display = 'block';
    // Step 2: Enhance (auto, no producer notes)
    const res2 = await fetch('/enhance-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story: currentStory, feedback: currentFeedback, producerNotes: '', provider, model })
    });
    setLoadingBg(false);
    let data2;
    try {
        data2 = await res2.json();
    } catch (e) {
        storyDiv.innerHTML = '<span class="text-red-500">Error: Unable to parse new story. Please check server logs.</span>';
        showStoryActions();
        runChainBtn.disabled = false;
        hideProducerNotesField();
        return;
    }
    currentStory = data2.newDraft;
    storyDiv.innerHTML = renderStoryMarkdownToHtml(currentStory);
    feedbackSection.style.display = 'none';
    showStoryActions();
    runChainBtn.disabled = false;
    hideProducerNotesField();
};

async function runChainNTimes(n) {
    runChainBtn.disabled = true;
    runChain5Btn.disabled = true;
    runChain10Btn.disabled = true;
    setLoadingBg(true);
    let lastStory = currentStory;
    let lastFeedback = currentFeedback;
    const { provider, model } = getProviderAndModel();
    for (let i = 0; i < n; i++) {
        // Step 1: Focus group
        const res1 = await fetch('/focus-group', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ story: lastStory, provider, model })
        });
        let data1;
        try {
            data1 = await res1.json();
        } catch (e) {
            feedbackDiv.innerHTML = '<span class="text-red-500">Error: Unable to parse feedback. Please check server logs.</span>';
            feedbackSection.style.display = 'block';
            setLoadingBg(false);
            runChainBtn.disabled = false;
            runChain5Btn.disabled = false;
            runChain10Btn.disabled = false;
            return;
        }
        lastFeedback = data1.feedback;
        feedbackDiv.innerHTML = renderMarkdownToHtml(lastFeedback);
        feedbackSection.style.display = 'block';
        // Step 2: Enhance (auto, no producer notes)
        const res2 = await fetch('/enhance-story', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ story: lastStory, feedback: lastFeedback, producerNotes: '', provider, model })
        });
        let data2;
        try {
            data2 = await res2.json();
        } catch (e) {
            storyDiv.innerHTML = '<span class="text-red-500">Error: Unable to parse new story. Please check server logs.</span>';
            showStoryActions();
            runChainBtn.disabled = false;
            runChain5Btn.disabled = false;
            runChain10Btn.disabled = false;
            hideProducerNotesField();
            setLoadingBg(false);
            return;
        }
        lastStory = data2.newDraft;
        storyDiv.innerHTML = renderStoryMarkdownToHtml(lastStory);
        await new Promise(r => setTimeout(r, 300)); // Small pause for UI responsiveness
    }
    currentStory = lastStory;
    currentFeedback = lastFeedback;
    feedbackSection.style.display = 'none';
    showStoryActions();
    runChainBtn.disabled = false;
    runChain5Btn.disabled = false;
    runChain10Btn.disabled = false;
    hideProducerNotesField();
    setLoadingBg(false);
}

runChain5Btn.onclick = async () => {
    await runChainNTimes(5);
};

runChain10Btn.onclick = async () => {
    await runChainNTimes(10);
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
    let data;
    try {
        data = await res.json();
    } catch (e) {
        feedbackDiv.innerHTML = '<span class="text-red-500">Error: Unable to parse feedback. Please check server logs.</span>';
        feedbackSection.style.display = 'block';
        enhanceBtn.style.display = 'none';
        focusGroupBtn.disabled = false;
        return;
    }
    currentFeedback = data.feedback;
    feedbackDiv.innerHTML = renderMarkdownToHtml(currentFeedback);
    feedbackSection.style.display = 'block';
    enhanceBtn.style.display = 'inline-block';
    focusGroupBtn.disabled = false;
    showProducerNotesField();
};

enhanceBtn.onclick = async () => {
    enhanceBtn.disabled = true;
    setLoadingBg(true);
    const { provider, model } = getProviderAndModel();
    const producerNotes = producerNotesInput.value.trim();
    // If the checkbox is checked, ignore focus group feedback
    const feedbackToSend = producerNotesOnlyCheckbox.checked ? '' : currentFeedback;
    const res = await fetch('/enhance-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story: currentStory, feedback: feedbackToSend, producerNotes, provider, model })
    });
    setLoadingBg(false);
    let data;
    try {
        data = await res.json();
    } catch (e) {
        storyDiv.innerHTML = '<span class="text-red-500">Error: Unable to parse new story. Please check server logs.</span>';
        showStoryActions();
        enhanceBtn.disabled = false;
        hideProducerNotesField();
        return;
    }
    currentStory = data.newDraft;
    storyDiv.innerHTML = renderStoryMarkdownToHtml(currentStory);
    feedbackSection.style.display = 'none';
    showStoryActions();
    enhanceBtn.disabled = false;
    hideProducerNotesField();
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
