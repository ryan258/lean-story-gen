// Template for the story generation prompt
module.exports = function generateStoryPrompt({ prompt, producerNotes }) {
  return `Write a creative story based on: ${prompt}${producerNotes ? '\nProducer notes: ' + producerNotes : ''}`;
};
