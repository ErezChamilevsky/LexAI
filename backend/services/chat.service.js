const Chat = require('../models/chat.model');
const UserService = require('./user.service'); // To link back to user

// 1. Create New Chat
const createNewChat = async (userId, languageCode, initialMessage, topic) => {

    // BUSINESS LOGIC: Check chat limit per language
    const existingChatsCount = await Chat.countDocuments({
        user_id: userId,
        language_code: languageCode
    });

    if (existingChatsCount >= 3) {
        throw new Error('You have reached the limit of 3 active chats for this language.');
    }

    // Create Chat
    const chat = new Chat({
        user_id: userId,
        language_code: languageCode,
        topic: topic,
        messages: [{
            role: 'user', // Assuming user starts, or change to 'system'
            content: initialMessage
        }]
    });

    const savedChat = await chat.save();

    // Link Chat to User
    await UserService.addChatToUser(userId, savedChat._id);

    return savedChat;
};

// 2. Get Chat By ID
const getChatByID = async (chatId) => {
    return await Chat.findById(chatId);
};

module.exports = {
    createNewChat,
    getChatByID
};