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
            role: 'user',
            content: initialMessage
        }]
    });

    const savedChat = await chat.save();

    // UPDATED: Pass languageCode so it gets added to the correct array
    await UserService.addChatToUser(userId, languageCode, savedChat._id);

    return savedChat;
};

// 2. Get Chat By ID
const getChatByID = async (chatId) => {
    return await Chat.findById(chatId);
};

// 3. Add a Message to an Existing Chat
const addMessageToChat = async (chatId, role, content) => {

    // Validate role
    if (!['user', 'assistant'].includes(role)) {
        throw new Error('Invalid message role');
    }

    // Push message into messages array
    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: {
                messages: {
                    role,
                    content,
                    timestamp: new Date()
                }
            }
        },
        { new: true } // return updated chat
    );

    if (!updatedChat) {
        throw new Error('Chat not found');
    }

    return updatedChat;
};


module.exports = {
    createNewChat,
    getChatByID,
    addMessageToChat
};