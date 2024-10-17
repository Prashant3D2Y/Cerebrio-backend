// server/groqChat.js
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: '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' });

async function getChatCompletion(content) {
    return await groq.chat.completions.create({
        messages: [{ role: 'user', content }],
        model: 'llama3-8b-8192',
    });
}

module.exports = { getChatCompletion };
