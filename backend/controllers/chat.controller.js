const ChatService = require('../services/chat.service');

// 1. Create New Chat
const createNewChat = async (req, res) => {
    try {
        const { userId, languageCode, topic, message } = req.body;
        const chat = await ChatService.createNewChat(userId, languageCode, message, topic);
        res.status(201).json(chat);
    } catch (error) {
        res.status(400).json({ message: error.message }); // Handles "Max 3 chats" error
    }
};

// 2. Get Chat By ID
const getChatByID = async (req, res) => {
    try {
        const chat = await ChatService.getChatByID(req.params.id);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });
        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createNewChat,
    getChatByID
};