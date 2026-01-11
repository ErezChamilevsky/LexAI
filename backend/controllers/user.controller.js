const UserService = require('../services/user.service');

// Helper: Authorization Check
// Throws an error if the logged-in user tries to modify someone else's data
const ensureOwnership = (req, targetId) => {
    // req.user is set by your verifyToken middleware
    if (req.user._id !== targetId) {
        throw new Error('ACCESS_DENIED'); // Custom error flag to catch below
    }
};

// 1. Create User (Public - typically for registration)
const createUser = async (req, res) => {
    try {
        const user = await UserService.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 2. Get User By Email (SECURED)
const getUserByEmail = async (req, res) => {
    try {
        const requestedEmail = req.params.email;
        const requesterEmail = req.user.email;

        // SECURITY: Prevent users from fetching other people's profiles
        if (requestedEmail !== requesterEmail) {
            return res.status(403).json({ message: 'Access denied: You can only view your own profile.' });
        }

        const user = await UserService.getUserByEmail(requestedEmail);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Update Language Level (SECURED)
const updateLanguageLevel = async (req, res) => {
    try {
        // SECURITY CHECK
        if (req.params.id !== req.user._id) {
            return res.status(403).json({ message: 'Unauthorized action on another user.' });
        }

        const { languageCode, skillType, newLevel } = req.body;
        const user = await UserService.updateLanguageLevel(req.params.id, languageCode, skillType, newLevel);
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 4. Add Language To User (SECURED)
const addLanguageToUser = async (req, res) => {
    try {
        // SECURITY CHECK
        if (req.params.id !== req.user._id) {
            return res.status(403).json({ message: 'Unauthorized action on another user.' });
        }

        const user = await UserService.addLanguageToUser(req.params.id, req.body);
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// 5. Update Premium Status (SECURED & Payment Logic)
const updatePremium = async (req, res) => {
    try {
        // SECURITY CHECK: Identity
        if (req.params.id !== req.user._id) {
            return res.status(403).json({ message: 'Unauthorized action on another user.' });
        }
        // ⚠️ CRITICAL WARNING:
        // Even with this check, a user can send { is_premium: true } to UPGRADE THEMSELVES for free.
        // In a real production app, this specific route should be restricted to ADMINS only
        // or handled via a server-side payment webhook (e.g., Stripe), not a direct API call.
        // For now, checking Identity prevents them from upgrading *others*.

        // CHANGED: Expecting 'months' in body (e.g., { "months": 1 })
        // In production, this data would come from a webhook verification, not user input.
        const { months } = req.body;

        if (!months) {
            return res.status(400).json({ message: 'Please provide number of months.' });
        }

        const user = await UserService.updatePremium(req.params.id, months);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 6. Delete User (SECURED)
const deleteUser = async (req, res) => {
    try {
        // SECURITY CHECK
        if (req.params.id !== req.user._id) {
            return res.status(403).json({ message: 'Access denied. You can only delete your own account.' });
        }

        await UserService.deleteUser(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 7. Delete Language (SECURED)
const deleteLanguage = async (req, res) => {
    try {
        // SECURITY CHECK
        if (req.params.id !== req.user._id) {
            return res.status(403).json({ message: 'Unauthorized.' });
        }

        const user = await UserService.deleteLanguage(req.params.id, req.params.code);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 8. Delete Chat Of User (SECURED)
const deleteChatOfUser = async (req, res) => {
    try {
        // SECURITY CHECK
        if (req.params.id !== req.user._id) {
            return res.status(403).json({ message: 'Unauthorized.' });
        }

        await UserService.deleteChatOfUser(req.params.id, req.params.chatId);
        res.json({ message: 'Chat deleted and removed from user' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 9. Update Corrections (SECURED)
const updateCorrections = async (req, res) => {
    try {
        // SECURITY CHECK
        if (req.params.id !== req.user._id) {
            return res.status(403).json({ message: 'Unauthorized.' });
        }

        const { languageCode, status } = req.body;
        const user = await UserService.updateCorrections(req.params.id, languageCode, status);
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Force unlock (SECURED)
const unlockTestSession = async (req, res) => {
    try {
        // SECURITY CHECK
        if (req.params.id !== req.user._id) {
            return res.status(403).json({ message: 'Unauthorized.' });
        }

        await UserService.endTestSession(req.params.id);
        res.json({ message: 'Test session unlocked.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateLanguageLastActive = async (req, res) => {
    try {
        if (req.params.id !== req.user._id) {
            return res.status(403).json({ message: 'Unauthorized.' });
        }
        const user = await UserService.updateLanguageLastActive(req.params.id, req.params.code);
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createUser, getUserByEmail, updateLanguageLevel, addLanguageToUser,
    updatePremium, deleteUser, deleteLanguage, deleteChatOfUser, updateCorrections, unlockTestSession,
    updateLanguageLastActive
};