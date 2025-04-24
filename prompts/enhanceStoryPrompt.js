// Template for the story enhancement prompt
module.exports = function enhanceStoryPrompt({ story, feedback, producerNotes }) {
  return (
    `You are a writer. Here is your story: ${story}\n` +
    (feedback ? `Focus group feedback: ${feedback}\n` : '') +
    (producerNotes ? `Producer notes: ${producerNotes}\n` : '') +
    'Revise and enhance the story accordingly.'
  );
};
