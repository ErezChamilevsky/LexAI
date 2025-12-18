const { GoogleGenAI } = require("@google/genai");

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
let ai;

function getClient() {
    if (!ai) {
        ai = new GoogleGenAI({});
    }
    return ai;
}



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
    // ---------------------------------------------------------
    // BLACK BOX: Implementation to be added in external service
    // ---------------------------------------------------------
    throw new Error("LLM Service: generateInitialChat is not yet implemented.");

    // Expected Return: "Bonjour ! Je suis ravi de parler de 'Voyage' avec vous. Où aimeriez-vous aller ?"
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
    // ---------------------------------------------------------
    // BLACK BOX: Implementation to be added in external service
    // ---------------------------------------------------------

    // For development purposes, you might return a mock object here, 
    // but per your request, this is just the declaration.
    throw new Error("LLM Service: generateChatResponse is not yet implemented.");

    /* Expected Return Structure:
    return {
        response_text: "Hola! ¿Cómo estás hoy?",
        new_summary: "The user greeted the assistant. The assistant asked how the user is doing."
    };
    */
}

/**
 * Generates a list of questions for a specific test type and level.
 */
async function generateTestQuestions(languageCode, type, currentLevel) {

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
        specificInstructions = `
        TASK: Generate a **Reading Test** for ${languageCode} at **${currentLevel}** level.
        - CONTENT: Create a short reading passage (approx 100-150 words) suitable for ${currentLevel}.
        - QUESTIONS: Create 3 multiple-choice comprehension questions based on that text.
        - FORMAT: 
          - Item 1: "question_text" contains the PASSAGE + Question 1.
          - Item 2 & 3: "question_text" contains only the question (referring to the passage).
        `;
    }
    else if (['writing', 'speaking'].includes(type)) {
        specificInstructions = `
        TASK: Generate a **${type.toUpperCase()} Test** for ${languageCode} at **${currentLevel}** level.
        - CONTENT: Create exactly 1 open-ended prompt.
        - TOPIC: Relevant to daily life, suitable for ${currentLevel} proficiency.
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
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: generatePrompt,
        config: {
            responseMimeType: "application/json" // Enforce JSON output mode if supported
        }
    });

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
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: evaluate_prompt,
        config: {
            responseMimeType: "application/json"
        }
    });

    // 4. Extract and Parse
    const textResponse = response.response.text();
    return cleanAndParseJSON(textResponse);
}

module.exports = {
    generateTestQuestions,
    evaluateTestResults,
    generateChatResponse,
    generateInitialChat
};