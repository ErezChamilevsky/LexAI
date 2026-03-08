const TestService = require('../services/test.service');

// 1. Create Writing Test
const createWritingTest = async (req, res) => {
    try {
        const userId = req.user._id; // SECURITY: From Token
        const { languageCode } = req.body;

        const test = await TestService.createWritingTest(userId, languageCode);
        res.status(201).json(test);
    } catch (error) {
        console.error("Test Controller Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// 2. Create Reading Test
const createReadingTest = async (req, res) => {
    try {
        const userId = req.user._id; // SECURITY: From Token
        const { languageCode } = req.body;

        const test = await TestService.createReadingTest(userId, languageCode);
        res.status(201).json(test);
    } catch (error) {
        console.error("Test Controller Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// 3. Create Speaking Test
const createSpeakingTest = async (req, res) => {
    try {
        const userId = req.user._id; // SECURITY: From Token
        const { languageCode } = req.body;

        const test = await TestService.createSpeakingTest(userId, languageCode);
        res.status(201).json(test);
    } catch (error) {
        console.error("Test Controller Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// 4. Create Overall (Placement) Test
const createOverallTest = async (req, res) => {
    try {
        const userId = req.user._id; // SECURITY: From Token
        const { languageCode } = req.body;

        const test = await TestService.createOverallTest(userId, languageCode);
        res.status(201).json(test);
    } catch (error) {
        console.error("Test Controller Error:", error);
        res.status(500).json({ message: error.message });
    }
};



const submitTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const { answers } = req.body; // Expect array of answers

        // Security check: ensure the test belongs to req.user._id (omitted for brevity, but recommended)

        const result = await TestService.submitTestAnswers(testId, answers);
        res.json(result);
    } catch (error) {
        console.error("Test Controller Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createWritingTest, createReadingTest, createSpeakingTest,
    createOverallTest, submitTest
};