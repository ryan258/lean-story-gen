// Powerhouse template for story generation prompt
module.exports = function generateStoryPrompt({ prompt, producerNotes }) {
  return `
Write a highly original, engaging, and emotionally resonant story based on the following prompt:
"""
${prompt}
"""

Guidelines:
- Use vivid sensory details and strong character motivations.
- Show, don't tell—use action and description to reveal emotions and stakes.
- Maintain a clear story arc (beginning, middle, end).
- Be creative, but keep the narrative coherent and logically consistent.
- Avoid cliches and strive for fresh, memorable ideas.
- Format the story with paragraphs and, if appropriate, dialogue formatting.
${producerNotes ? `- Producer Notes (high-priority creative direction): ${producerNotes}` : ''}

Respond ONLY with the story draft.`;
};
