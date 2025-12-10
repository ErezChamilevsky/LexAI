const UserService = require('../services/user.service');

// 1. Create User
const createUser = async (req, res) => {
    try {
        const user = await UserService.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 2. Get User By ID
const getUserByEmail = async (req, res) => {
    try {
        const user = await UserService.getUserByEmail(req.params.email);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Update Language Level
const updateLanguageLevel = async (req, res) => {
    try {
        const { languageCode, skillType, newLevel } = req.body;
        const user = await UserService.updateLanguageLevel(req.params.id, languageCode, skillType, newLevel);
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 4. Add Language To User
const addLanguageToUser = async (req, res) => {
    try {
        // req.body should contain { language_code: 'fr', overall_level: 'A1', ... }
        const user = await UserService.addLanguageToUser(req.params.id, req.body);
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message }); // Handles "Limit reached" errors
    }
};



// 5. Update Premium Status
const updatePremium = async (req, res) => {
    try {
        const { is_premium } = req.body;
        const user = await UserService.updatePremium(req.params.id, is_premium);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 6. Delete User
const deleteUser = async (req, res) => {
    try {
        await UserService.deleteUser(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 7. Delete Language
const deleteLanguage = async (req, res) => {
    try {
        // Expecting language code in params or body. Using params for REST convention.
        const user = await UserService.deleteLanguage(req.params.id, req.params.code);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 8. Delete Chat Of User
const deleteChatOfUser = async (req, res) => {
    try {
        await UserService.deleteChatOfUser(req.params.id, req.params.chatId);
        res.json({ message: 'Chat deleted and removed from user' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 9. Update Corrections
const updateCorrections = async (req, res) => {
    try {
        const { languageCode, status } = req.body;
        const user = await UserService.updateCorrections(req.params.id, languageCode, status);
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Note: addTestToUser and addChatToUser are internal functions called by Test/Chat creation.
// We generally do not expose them as direct API endpoints to prevent data inconsistency.

module.exports = {
    createUser, getUserByEmail, updateLanguageLevel, addLanguageToUser,
    updatePremium, deleteUser, deleteLanguage, deleteChatOfUser, updateCorrections
};