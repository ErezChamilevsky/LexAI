const Test = require('../models/test.model');
const UserService = require('./user.service');
const LLMService = require('./llm.service');


// Helper to handle creation logic
const createGenericTest = async (userId, languageCode, type) => {
    // 1. Lock User
    await UserService.startTestSession(userId);

    try {

        const user = await UserService.getUserById(userId);
        const lang = user.languages.find(l => l.language_code === languageCode);

        if (!lang) {
            throw new Error(`Language ${languageCode} not found for this user.`);
        }

        let finalType = type;
        if (lang.tests.length === 0) {
            finalType = 'placement';
        }

        const currentLevel = (finalType === 'placement') ? 'A1' : lang.overall_level;

        // --- LEVEL MIXING LOGIC ---
        let mixWithLevel = null;
        if (finalType !== 'placement') {
            const isReady = await UserService.isReadyForLevelMixing(userId, languageCode, currentLevel);
            if (isReady) {
                mixWithLevel = UserService.getNextLevel(currentLevel);
                console.log(`User ${userId} is ready for level mixing: ${currentLevel} -> ${mixWithLevel}`);
            }
        }

        const generatedQuestions = await LLMService.generateTestQuestions(languageCode, finalType, currentLevel, mixWithLevel);

        // 3. Create Test in DB with Questions
        const test = new Test({
            user_id: userId,
            language_code: languageCode,
            language_level: currentLevel,
            type: finalType,
            status: 'generated',
            result_level: 'Pending',
            content: generatedQuestions // [{ question_text: "...", question_id: "1" }]
        });

        const savedTest = await test.save();
        await UserService.addTestToUser(userId, languageCode, savedTest._id);

        return savedTest;

    } catch (error) {
        // Unlock on failure
        await UserService.endTestSession(userId);
        throw error;
    }
};

// 1. Create Writing Test
const createWritingTest = async (userId, languageCode) => {
    return await createGenericTest(userId, languageCode, 'writing');
};

// 2. Create Reading Test
const createReadingTest = async (userId, languageCode) => {
    return await createGenericTest(userId, languageCode, 'reading');
};

// 3. Create Speaking Test
const createSpeakingTest = async (userId, languageCode) => {
    return await createGenericTest(userId, languageCode, 'speaking');
};

// 4. Create Overall (Placement) Test
const createOverallTest = async (userId, languageCode) => {
    return await createGenericTest(userId, languageCode, 'placement');
};


const submitTestAnswers = async (testId, userAnswers) => {
    // userAnswers format expected: [{ question_id: "1", answer: "My answer" }]

    const test = await Test.findById(testId);
    if (!test) throw new Error('Test not found');
    if (test.status !== 'generated') throw new Error('Test already submitted or graded');

    try {
        // 1. Map User Answers to Test Content
        userAnswers.forEach(ans => {
            const itemIndex = test.content.findIndex(q => q.question_id === ans.question_id);
            if (itemIndex > -1) {
                test.content[itemIndex].user_answer = ans.answer;
            }
        });

        test.status = 'submitted';
        await test.save(); // Save answers before grading (safety)

        // 2. CALL LLM TO GRADE
        const gradingResult = await LLMService.evaluateTestResults(test, test.language_level);

        // 3. Update Test with Results
        test.score = gradingResult.score || 0;
        test.result_level = gradingResult.level || test.language_level;
        test.details = gradingResult.feedback || {};
        test.status = 'graded';

        const savedTest = await test.save();

        // 4. Update User Profile Level
        let skillToUpdate = null;
        if (test.type === 'writing') skillToUpdate = 'writing';
        if (test.type === 'reading') skillToUpdate = 'reading';
        if (test.type === 'speaking') skillToUpdate = 'speaking';

        if (skillToUpdate) {
            await UserService.updateLanguageLevel(test.user_id, test.language_code, skillToUpdate, savedTest.result_level);
        }

        console.log(`Test ${test._id} graded. Score: ${test.score}`);
        return savedTest;
    } catch (error) {
        console.error("Grading/Submission Error:", error);
        throw error;
    } finally {
        // ALWAYS unlock user, even if grading fails
        console.log(`Unlocking user ${test.user_id}`);
        await UserService.endTestSession(test.user_id);
    }
};

module.exports = {
    createWritingTest, createReadingTest, createSpeakingTest,
    createOverallTest, createGenericTest, submitTestAnswers
};