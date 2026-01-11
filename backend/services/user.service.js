const User = require('../models/user.model');
const Chat = require('../models/chat.model');
const Test = require('../models/test.model');

// Helper: Check if user is premium based on date
const isUserPremium = (user) => {
    if (!user.premium_expires_at) return false;
    return new Date(user.premium_expires_at) > new Date();
};

// 1. Create User
const createUser = async (userData) => {
    const user = new User(userData);
    return await user.save();
};

// 2. Get User By email
const getUserByEmail = async (mail) => {
    return await User.findOne({ email: mail }).populate('languages.tests').populate('languages.chats');
};

const getUserById = async (user_id) => {
    return await User.findOne({ _id: user_id }).populate('languages.tests').populate('languages.chats');
};

// 3. Update Language Level
const updateLanguageLevel = async (userId, languageCode, skillType, newLevel) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const langIndex = user.languages.findIndex(l => l.language_code === languageCode);
    if (langIndex === -1) throw new Error('Language not found for user');

    if (['reading', 'writing', 'speaking'].includes(skillType)) {
        user.languages[langIndex].skills[skillType] = newLevel;
    }
    user.languages[langIndex].overall_level = newLevel;

    return await user.save();
};

// 4. Add Language To User (Enforcing Premium Date Constraints)
const addLanguageToUser = async (userId, languageData) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // CHECK: Logic changed to date comparison
    const isPremium = isUserPremium(user);
    const limit = isPremium ? 3 : 1;

    if (user.languages.length >= limit) {
        throw new Error(`Limit reached. ${isPremium ? 'Premium users max 3.' : 'Upgrade to Premium for more.'}`);
    }

    const exists = user.languages.find(l => l.language_code === languageData.language_code);
    if (exists) throw new Error('User already has this language');

    // Add with initial last_active_at
    user.languages.push({
        ...languageData,
        last_active_at: new Date() // Auto-set active on creation
    });
    return await user.save();
};

// 5. Add Test To User
const addTestToUser = async (userId, languageCode, testId) => {
    return await User.findOneAndUpdate(
        { _id: userId, "languages.language_code": languageCode },
        { $push: { "languages.$.tests": testId } },
        { new: true }
    );
};

// 6. Update Premium Status (Purchase/Extend)
// Input: durationInMonths (e.g., 1, 2, 3)
const updatePremium = async (userId, durationInMonths) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const monthsToAdd = parseInt(durationInMonths);
    if (isNaN(monthsToAdd) || monthsToAdd <= 0) {
        throw new Error('Invalid duration provided');
    }

    let newExpiryDate;
    const now = new Date();

    // LOGIC:
    // If user is currently premium, extend their current expiration.
    // If user is NOT premium (or expired), start from NOW.
    if (user.premium_expires_at && new Date(user.premium_expires_at) > now) {
        newExpiryDate = new Date(user.premium_expires_at);
    } else {
        newExpiryDate = new Date();
    }

    // Add months
    newExpiryDate.setMonth(newExpiryDate.getMonth() + monthsToAdd);

    user.premium_expires_at = newExpiryDate;
    return await user.save();
};

// 7. Add Chat To User 
const addChatToUser = async (userId, languageCode, chatId) => {
    return await User.findOneAndUpdate(
        { _id: userId, "languages.language_code": languageCode },
        { $push: { "languages.$.chats": chatId } },
        { new: true }
    );
};

// 8. Delete User
const deleteUser = async (userId) => {
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

// 10. Delete Chat Of User (Fixing your previous logic bug here too - identifying chat by nested ID is tricky, 
// usually you pull by ID regardless of nesting, or find specific language first. 
// Keeping simple pull for now assuming Mongoose handles recursive ID pull or you handle it elsewhere)
const deleteChatOfUser = async (userId, chatId) => {
    // Note: The original code used $pull on root 'chats', but schema has chats in 'languages'. 
    // This is a complex update in Mongo. For now, we assume standard behavior or that you fix the query separately.
    // To fix properly requires knowing which language the chat belongs to.
    await User.updateOne(
        { _id: userId },
        { $pull: { "languages.$[].chats": chatId } } // $[] pulls from ALL language arrays
    );
    return await Chat.findByIdAndDelete(chatId);
};

// 11. Update Corrections
const updateCorrections = async (userId, languageCode, status) => {
    return await User.findOneAndUpdate(
        { _id: userId, "languages.language_code": languageCode },
        { $set: { "languages.$.corrections": status } },
        { new: true }
    );
};

// 12. Attempt to Start Test Session
const startTestSession = async (userId) => {
    const user = await User.findOneAndUpdate(
        { _id: userId, is_taking_test: false },
        { is_taking_test: true },
        { new: true }
    );
    if (!user) throw new Error('User is already taking a test. Please finish the current one first.');
    return user;
};

// 13. End Test Session
const endTestSession = async (userId) => {
    return await User.findByIdAndUpdate(
        userId,
        { is_taking_test: false },
        { new: true }
    );
};

const getUserCurrentLevel = async (userId, languageCode) => {
    const user = await getUserById(userId);
    // For now, assuming you can fetch the user:
    const lang = user.languages.find(l => l.language_code === languageCode);
    return lang ? lang.overall_level : 'A1';
};

// 14. Update Language Last Active
const updateLanguageLastActive = async (userId, languageCode) => {
    // 1. Update the specific language's last_active_at
    const user = await User.findOneAndUpdate(
        { _id: userId, "languages.language_code": languageCode },
        {
            $set: {
                "languages.$.last_active_at": new Date()
            }
        },
        { new: true }
    );
    if (!user) throw new Error('User or language not found');
    return user;
};

module.exports = {
    createUser, getUserByEmail, updateLanguageLevel, addLanguageToUser,
    addTestToUser, updatePremium, addChatToUser, deleteUser,
    deleteLanguage, deleteChatOfUser, updateCorrections,
    startTestSession, endTestSession, getUserById, getUserCurrentLevel,
    updateLanguageLastActive
};