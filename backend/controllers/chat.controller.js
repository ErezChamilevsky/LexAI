const ChatService = require('../services/chat.service');

// 1. Create New Chat
const createNewChat = async (req, res) => {
    try {
        console.log("POST /chats Request Body:", req.body);
        const userId = req.user._id;
        const { languageCode, topic } = req.body;
        console.log(`Creating chat for User: ${userId}, Lang: ${languageCode}, Topic: ${topic}`);

        const chat = await ChatService.createNewChat(userId, languageCode, topic);
        console.log("Chat created successfully:", chat._id);
        res.status(201).json(chat);
    } catch (error) {
        console.error("Create Chat Error:", error.message);
        res.status(400).json({ message: error.message });
    }
};

// 2. Get Chat By ID
const getChatByID = async (req, res) => {
    try {
        const chat = await ChatService.getChatByID(req.params.id);

        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        // Check Ownership
        if (chat.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized: You do not own this chat.' });
        }

        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Add Message to Chat
const addMessageToChat = async (req, res) => {
    try {
        const chatCheck = await ChatService.getChatByID(req.params.id);
        if (!chatCheck) return res.status(404).json({ message: 'Chat not found' });

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

// 4. Delete Chat
const deleteChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const chatId = req.params.id;
        await ChatService.deleteChat(userId, chatId);
        res.status(200).json({ message: 'Chat deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Update Chat Topic
const updateChatTopic = async (req, res) => {
    try {
        const userId = req.user._id;
        const chatId = req.params.id;
        const { topic } = req.body;

        const chat = await ChatService.updateChatTopic(userId, chatId, topic);
        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createNewChat,
    getChatByID,
    addMessageToChat,
    deleteChat,
    updateChatTopic
};