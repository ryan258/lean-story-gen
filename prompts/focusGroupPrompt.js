// Template for the focus group feedback prompt
module.exports = function focusGroupPrompt({ story }) {
  return `You are a focus group. Give constructive feedback on this story, and at the end, provide a single line rating in the format: 'RATING: x/10 stars'. Example: RATING: 7/10 stars.\nStory: ${story}`;
};
