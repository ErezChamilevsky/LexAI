const { GoogleGenerativeAI } = require("@google/generative-ai");

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const api_key = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(api_key);

/**
 * HELPER: Clean and Parse JSON from LLM Response
 * Removes markdown code blocks (```json ... ```) if present.
 */
function cleanAndParseJSON(responseText) {
    try {
        // Remove markdown formatting if present (e.g., ```json\n ... \n```)
        let cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Failed to parse LLM JSON:", error);
        console.error("Raw Text:", responseText);
        throw new Error("AI Service Error: Invalid JSON response format.");
    }
}
/**
 * INTERFACE ONLY: Generates the very first message to start a chat.
 * * The AI acts as the initiator here, inviting the user to speak about the topic.
 * * @param {string} languageCode - The target language.
 * @param {string} userLevel - The user's proficiency level.
 * @param {string} topic - The chosen topic for the conversation.
 * @returns {Promise<string>} The initial greeting/question from the AI.
 */
async function generateInitialChat(languageCode, userLevel, topic) {
    const prompt = `
    You are a friendly language tutor. The student is learning ${languageCode} and is at ${userLevel} level.
    The topic of conversation is "${topic}".
    
    ACTION: Generate a single, engaging opening question or greeting to start the conversation about this topic.
    LANGUAGE: Output ONLY in ${languageCode}.
    DIFFICulty: Appropriate for ${userLevel} level. Simple and clear.
    `;

    try {

        const model = genAI.getGenerativeModel({
            model: "models/gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const response = await model.generateContent(prompt);

        return response.response.text().trim();
    } catch (error) {
        console.error("LLM Init Error:", error);
        // Fallback if AI fails
        const fallbacks = {
            'es': 'Hola! ¿Cómo estás?',
            'fr': 'Bonjour! Comment ça va?',
            'de': 'Hallo! Wie geht es dir?',
            'default': 'Hello! How are you?'
        };
        return fallbacks[languageCode] || fallbacks['default'];
    }
}

/**
 * INTERFACE ONLY: Generates a chat response and updates the conversation summary.
 * * This is a black-box declaration. The implementation will reside in a separate service/microservice later.
 * * @param {string} languageCode - The target language (e.g., "es", "fr").
 * @param {string} userLevel - The user's proficiency level (e.g., "A2", "B1").
 * @param {string} topic - The topic of the conversation.
 * @param {string} currentSummary - The running summary of the conversation up to this point.
 * @param {Array<{role: string, content: string}>} lastMessages - The last 6 messages for context.
 * @param {string} userMessage - The latest message sent by the user.
 * * @returns {Promise<{ response_text: string, new_summary: string }>} 
 * Returns an object containing the AI's reply and the updated summary.
 */
async function generateChatResponse(languageCode, userLevel, topic, currentSummary, lastMessages, userMessage) {
    // 1. Build Context String
    const historyText = lastMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

    const prompt = `
    You are a helpful and patient language tutor teaching ${languageCode}. 
    Student Level: ${userLevel}.
    Topic: ${topic}.
    Previous Summary: ${currentSummary || "None"}
    
    Recent Conversation:
    ${historyText}
    USER: ${userMessage}
    
    TASK:
    1. Respond to the user naturally in ${languageCode}. Correct them gently if they make major mistakes, but prioritize conversation flow.
    2. Update the conversation summary in English.
    
    OUTPUT JSON FORMAT:
    {
      "response_text": "Your reply in ${languageCode}...",
      "new_summary": "Updated summary in English..."
    }
    `;

    try {

        const model = genAI.getGenerativeModel({
            model: "models/gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return cleanAndParseJSON(text);

    } catch (error) {
        console.error("LLM Chat Error:", error);
        return {
            response_text: "I'm having trouble connecting right now. Can you say that again?",
            new_summary: currentSummary
        };
    }
}

/**
 * Generates a list of questions for a specific test type and level.
 */
async function generateTestQuestions(languageCode, type, currentLevel, mixWithLevel = null) {

    // 1. Construct the specific prompt based on type
    let specificInstructions = "";

    if (type === 'placement') {
        specificInstructions = `
        TASK: Generate a **Placement Test** for ${languageCode}.
        - Create exactly 5 multiple-choice questions.
        - DIFFICULTY: Must strictly progress: Q1(A1), Q2(A2), Q3(B1), Q4(B2), Q5(C1).
        - OPTIONS: Each question must have 4 options (A, B, C, D).
        - FORMAT: Return an array of objects.
        `;
    }
    else if (type === 'reading') {
        const levelInstruction = mixWithLevel
            ? `MIXED: 2 questions should be at ${currentLevel} and 1 question at ${mixWithLevel}.`
            : `DIFFICULTY: All questions must be at ${currentLevel} level.`;

        specificInstructions = `
        TASK: Generate a **Reading Test** for ${languageCode}.
        - CONTENT: Create a short reading passage (approx 100-150 words) suitable for ${currentLevel}.
        - QUESTIONS: Create 3 multiple-choice comprehension questions based on that text.
        - ${levelInstruction}
        - FORMAT: 
          - Item 1: "question_text" contains the PASSAGE + Question 1.
          - Item 2 & 3: "question_text" contains only the question (referring to the passage).
        `;
    }
    else if (['writing', 'speaking'].includes(type)) {
        const levelInstruction = mixWithLevel
            ? `MIXED: 2 prompts should be at ${currentLevel} and 1 prompt at ${mixWithLevel}.`
            : `DIFFICULTY: All prompts must be at ${currentLevel} level.`;

        specificInstructions = `
        TASK: Generate a **${type.toUpperCase()} Test** for ${languageCode}.
        - CONTENT: Create exactly 3 diverse open-ended prompts.
        - TOPIC: Relevant to daily life.
        - ${levelInstruction}
        - OPTIONS: Do not provide options. Return an empty array for "options".
        `;
    }

    // 2. Build the final prompt string
    const generatePrompt = `
    You are a strict API endpoint for a language learning platform. 
    You are an expert CEFR language examiner.
    
    ${specificInstructions}
    
    OUTPUT RULES:
    1. Return ONLY raw JSON. No markdown, no explanations, no filler text.
    2. The structure must be a strictly valid JSON Array of objects:
    [ 
      { 
        "question_id": "1", 
        "question_text": "Text of the question...", 
        "options": ["Option A", "Option B", "Option C", "Option D"] // Remove if open-ended
      } 
    ]
    `;

    // 3. Call AI
    const model = genAI.getGenerativeModel({
        model: "models/gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
        },
    });

    const response = await model.generateContent(generatePrompt);

    // 4. Extract and Parse
    // Note: The specific property to access text varies by SDK version. 
    // Usually response.response.text() or response.candidates[0].content...
    // Assuming standard GoogleGenAI behavior:
    const textResponse = response.response.text();
    return cleanAndParseJSON(textResponse);
}

/**
 * Analyzes the user's answers and generates a grade and feedback.
 */
async function evaluateTestResults(testContext, currentLevel) {

    // 1. Format the User's Answers for the Prompt
    // We handle cases where the user might not have answered everything.
    const questionsAndAnswers = testContext.content.map(item => {
        return `
        ID: ${item.question_id}
        Question: "${item.question_text}"
        User Answer: "${item.user_answer || '(No Answer)'}"
        `;
    }).join('\n----------------\n');

    // 2. Build the Prompt
    const evaluate_prompt = `
    You are a strict API endpoint and an expert CEFR grader.
    Your task is to grade a student's **${testContext.type}** test in **${testContext.language_code}**.
    
    Student's Current Level: **${currentLevel}**
    Target Level of Test: **${testContext.result_level || currentLevel}**

    INPUT DATA (Questions & Answers):
    ${questionsAndAnswers}

    GRADING RULES:
    1. **Score**: Calculate a fair score (0-100) based on accuracy, grammar, and relevance.
    2. **Level**: Determine the user's demonstrated CEFR level (A1-C2) based specifically on these answers.
    3. **Feedback**: 
       - If the answer is WRONG: You **MUST** explicitly provide the correct answer or a better phrasing.
       - If the answer is RIGHT: Confirm it and briefly explain why (e.g., "Correct usage of future tense").
       - Check for grammar and vocabulary suitable for the ${currentLevel} level.

    OUTPUT RULES:
    1. Return ONLY raw JSON. No markdown.
    2. Use this exact structure:
    {
         "score": 85,
         "level": "B1",
         "feedback": { 
            "1": "Feedback for question 1...",
            "2": "Feedback for question 2..."
         }
    }
    (Keys in 'feedback' object must match the question IDs provided in Input Data).
    `;

    // 3. Call AI
    const model = genAI.getGenerativeModel({
        model: "models/gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
        },
    });

    const response = await model.generateContent(evaluate_prompt);

    // 4. Extract and Parse
    const textResponse = response.response.text();
    const parsed = cleanAndParseJSON(textResponse);

    // Defensive: Clean the level to match enum
    const allowedLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    if (parsed.level && !allowedLevels.includes(parsed.level)) {
        // Try to find if any allowedLevel is inside the string
        const cleaned = allowedLevels.find(l => parsed.level.includes(l));
        parsed.level = cleaned || currentLevel; // Fallback to current level or A1
    }

    return parsed;
}

module.exports = {
    generateTestQuestions,
    evaluateTestResults,
    generateChatResponse,
    generateInitialChat
};
