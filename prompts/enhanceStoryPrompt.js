// Powerhouse template for story enhancement prompt
module.exports = function enhanceStoryPrompt({ story, feedback, producerNotes }) {
  return `
You are a master story editor and creative writing coach. Carefully revise and enhance the following story based on the provided feedback and producer notes:
"""
${story}
"""
${feedback ? `\nFocus Group Feedback:\n${feedback}` : ''}
${producerNotes ? `\nProducer Notes (high-priority):\n${producerNotes}` : ''}

Guidelines:
- Analyze the feedback and producer notes thoroughly before revising.
- Make thoughtful, creative changes to improve clarity, engagement, and emotional impact.
- Strengthen character arcs, dialogue, and world-building as needed.
- Address all specific feedback points and producer intentions.
- Maintain the story's original voice and core themes while elevating its quality.
- Format the revised story with clear paragraphs and dialogue formatting.

Respond ONLY with the revised story draft.`;
};
