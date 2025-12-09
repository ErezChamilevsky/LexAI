const TestService = require('../services/test.service');

// 1. Create Writing Test
const createWritingTest = async (req, res) => {
    try {
        const { userId, languageCode } = req.body;
        const test = await TestService.createWritingTest(userId, languageCode);
        res.status(201).json(test);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Create Reading Test
const createReadingTest = async (req, res) => {
    try {
        const { userId, languageCode } = req.body;
        const test = await TestService.createReadingTest(userId, languageCode);
        res.status(201).json(test);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Create Speaking Test
const createSpeakingTest = async (req, res) => {
    try {
        const { userId, languageCode } = req.body;
        const test = await TestService.createSpeakingTest(userId, languageCode);
        res.status(201).json(test);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Create Overall (Placement) Test
const createOverallTest = async (req, res) => {
    try {
        const { userId, languageCode } = req.body;
        const test = await TestService.createOverallTest(userId, languageCode);
        res.status(201).json(test);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Set Grade By Test ID
const setGradeByTestID = async (req, res) => {
    try {
        const { score, level, details } = req.body;
        const test = await TestService.setGradeByTestID(req.params.id, score, level, details);
        res.json(test);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createWritingTest, createReadingTest, createSpeakingTest,
    createOverallTest, setGradeByTestID
};