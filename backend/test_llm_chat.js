const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './config/.env.local') });
const LLMService = require('./services/llm.service');

async function testLLM() {
    console.log("Testing LLM Response...");
    try {
        const response = await LLMService.generateChatResponse(
            'es', // Language
            'A2', // Level
            'Travel', // Topic
            'Conversation just started.', // Summary
            [], // History
            'Hola, quiero ir a Madrid.' // User Msg
        );
        console.log("LLM Success:", response);
    } catch (error) {
        console.error("LLM Failed:", error);
    }
}

testLLM();
