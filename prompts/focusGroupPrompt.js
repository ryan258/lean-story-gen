// Powerhouse template for focus group feedback prompt
module.exports = function focusGroupPrompt({ story }) {
  return `
You are a professional literary focus group and critique panel. Provide a thorough, expert review of the following story:
"""
${story}
"""

Guidelines:
- Begin with your initial reactions (emotional response, engagement, etc.).
- Identify strengths: what works well in the story (characters, pacing, originality, etc.).
- Offer constructive criticism: specific, actionable suggestions for improvement.
- Address character development, plot structure, pacing, and emotional impact.
- Highlight any inconsistencies, cliches, or areas lacking clarity.
- End your feedback with a single line rating in the format: RATING: x/10 stars (e.g., RATING: 8/10 stars).
- Be honest but encouraging, and use clear, professional language.

Respond ONLY with the feedback and rating.`;
};
