const ChatService = require('../services/chat.service');

// 1. Create New Chat
const createNewChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const { languageCode, topic } = req.body;

        const chat = await ChatService.createNewChat(userId, languageCode, topic);
        res.status(201).json(chat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 2. Get Chat By ID (THIS WAS THE VULNERABLE FUNCTION)
const getChatByID = async (req, res) => {
    try {
        const chat = await ChatService.getChatByID(req.params.id);

        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        // SECURITY FIX: Check Ownership
        // We convert both to strings to ensure correct comparison
        if (chat.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized: You do not own this chat.' });
        }

        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Add Message to Chat (Should also be secured)
const addMessageToChat = async (req, res) => {
    try {
        // Fetch chat first to check ownership
        const chatCheck = await ChatService.getChatByID(req.params.id);
        if (!chatCheck) return res.status(404).json({ message: 'Chat not found' });

        // SECURITY FIX: Check Ownership
        if (chatCheck.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized action' });
        }

        const { role, content } = req.body;

        const chat = await ChatService.addMessageToChat(
            req.params.id,
            role,
            content
        );

        res.json(chat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createNewChat,
    getChatByID,
    addMessageToChat
};