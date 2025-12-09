const User = require('../models/user.model');
const Chat = require('../models/chat.model');
const Test = require('../models/test.model');

// 1. Create User
const createUser = async (userData) => {
    const user = new User(userData);
    return await user.save();
};

// 2. Get User By ID
const getUserByID = async (userId) => {
    return await User.findById(userId).populate('languages.tests').populate('chats');
};

// 3. Update Language Level (Updates specific skill + logic for overall could be added here)
const updateLanguageLevel = async (userId, languageCode, skillType, newLevel) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const langIndex = user.languages.findIndex(l => l.language_code === languageCode);
    if (langIndex === -1) throw new Error('Language not found for user');

    // Update specific skill
    if (['reading', 'writing', 'speaking'].includes(skillType)) {
        user.languages[langIndex].skills[skillType] = newLevel;
    }

    // Update overall level (simple logic: matches the updated skill or complex average)
    user.languages[langIndex].overall_level = newLevel;

    return await user.save();
};

// 4. Add Language To User (Enforcing Premium Constraints)
const addLanguageToUser = async (userId, languageData) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Constraint Check:
    // Premium: Max 3 languages
    // Standard: Max 1 language
    const limit = user.is_premium ? 3 : 1;

    if (user.languages.length >= limit) {
        throw new Error(`Limit reached. ${user.is_premium ? 'Premium users max 3.' : 'Upgrade to Premium for more.'}`);
    }

    // Check for duplicates
    const exists = user.languages.find(l => l.language_code === languageData.language_code);
    if (exists) throw new Error('User already has this language');

    user.languages.push(languageData);
    return await user.save();
};

// 5. Add Test To User (Internal helper, usually called by TestService)
const addTestToUser = async (userId, languageCode, testId) => {
    // We use atomic operator $push to ensure data integrity
    return await User.findOneAndUpdate(
        { _id: userId, "languages.language_code": languageCode },
        { $push: { "languages.$.tests": testId } },
        { new: true }
    );
};

// 6. Update Premium Status
const updatePremium = async (userId, isPremium) => {
    return await User.findByIdAndUpdate(userId, { is_premium: isPremium }, { new: true });
};

// 7. Add Chat To User (Internal helper, usually called by ChatService)
const addChatToUser = async (userId, chatId) => {
    return await User.findByIdAndUpdate(userId, { $push: { chats: chatId } }, { new: true });
};

// 8. Delete User (Cascading delete recommended)
const deleteUser = async (userId) => {
    // Optional: Delete all associated chats and tests first to keep DB clean
    await Chat.deleteMany({ user_id: userId });
    await Test.deleteMany({ user_id: userId });
    return await User.findByIdAndDelete(userId);
};

// 9. Delete Language
const deleteLanguage = async (userId, languageCode) => {
    return await User.findByIdAndUpdate(
        userId,
        { $pull: { languages: { language_code: languageCode } } },
        { new: true }
    );
};

// 10. Delete Chat Of User (Removes ref from User and deletes Chat Doc)
const deleteChatOfUser = async (userId, chatId) => {
    // Remove reference from User
    await User.findByIdAndUpdate(userId, { $pull: { chats: chatId } });
    // Delete actual Chat document
    return await Chat.findByIdAndDelete(chatId);
};

// 11. Update Corrections (Toggle)
const updateCorrections = async (userId, languageCode, status) => {
    return await User.findOneAndUpdate(
        { _id: userId, "languages.language_code": languageCode },
        { $set: { "languages.$.corrections": status } },
        { new: true }
    );
};

module.exports = {
    createUser, getUserByID, updateLanguageLevel, addLanguageToUser,
    addTestToUser, updatePremium, addChatToUser, deleteUser,
    deleteLanguage, deleteChatOfUser, updateCorrections
};