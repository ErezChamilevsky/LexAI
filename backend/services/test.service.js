const Test = require('../models/test.model');
const UserService = require('./user.service');

// Helper to handle creation logic
const createGenericTest = async (userId, languageCode, type) => {
    const test = new Test({
        user_id: userId,
        language_code: languageCode,
        type: type,
        result_level: 'A1', // Default, will be updated after grading
        score: 0
    });

    const savedTest = await test.save();

    // Add Test reference to User's specific language profile
    await UserService.addTestToUser(userId, languageCode, savedTest._id);

    return savedTest;
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

// 5. Set Grade By Test ID
const setGradeByTestID = async (testId, score, level, details) => {
    const test = await Test.findByIdAndUpdate(
        testId,
        {
            score: score,
            result_level: level,
            details: details
        },
        { new: true }
    );

    if (!test) throw new Error('Test not found');

    // Automatically update the User's level based on this test result
    // If it's a placement test, we might update 'overall_level'
    // If it's a writing test, we update 'skills.writing'
    let skillToUpdate = null;
    if (test.type === 'writing') skillToUpdate = 'writing';
    if (test.type === 'reading') skillToUpdate = 'reading';
    if (test.type === 'speaking') skillToUpdate = 'speaking';

    if (skillToUpdate) {
        await UserService.updateLanguageLevel(test.user_id, test.language_code, skillToUpdate, level);
    }

    return test;
};

module.exports = {
    createWritingTest, createReadingTest, createSpeakingTest,
    createOverallTest, setGradeByTestID
};