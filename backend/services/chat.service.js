const Chat = require('../models/chat.model');
const UserService = require('./user.service'); // To link back to user
const LLMService = require('./llm.service');

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

    const userLevel = await UserService.getUserLevel(userId, languageCode) || 'B1';

    // C. CALL LLM: Generate the starter message
    const aiInitialMessage = await LLMService.generateInitialChat(
        languageCode,
        userLevel,
        topic
    );

    // D. CREATE CHAT: Save with AI as the first message
    const chat = new Chat({
        user_id: userId,
        language_code: languageCode,
        topic: topic,
        messages: [{
            role: 'assistant',
            content: aiInitialMessage,
            timestamp: new Date()
        }],
        // Initialize summary (optional, could be "Conversation started about [topic]")
        summary: `Conversation started about ${topic}.`
    });

    const savedChat = await chat.save();

    await UserService.addChatToUser(userId, languageCode, savedChat._id);

    return savedChat;
};

// 2. Get Chat By ID
const getChatByID = async (chatId) => {
    return await Chat.findById(chatId);
};


const addMessageToChat = async (chatId, role, content) => {

    // 1. Validate role
    if (!['user', 'assistant'].includes(role)) {
        throw new Error('Invalid message role');
    }

    // 2. Save the incoming message (User's message)
    let chat = await Chat.findByIdAndUpdate(
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
        { new: true } // Return the updated document including the new message
    );

    if (!chat) {
        throw new Error('Chat not found');
    }

    // 3. IF the sender is 'user', trigger the AI response pipeline
    if (role === 'user') {
        try {
            // A. Fetch Context Data

            // Get User Level (Assuming UserService has this capability)
            // If not, you might need: const user = await User.findById(chat.user_id); 
            const userLevel = await UserService.getUserCurrentLevel(chat.user_id, chat.language_code) || 'B1';

            // Here we take the last 6 messages *prior* to the current interaction for context).
            const rawMessages = chat.messages;
            // Get messages excluding the very last one (which is the user's current input)
            const historyWindow = rawMessages.slice(0, -1).slice(-6);

            // Map to clean format expected by LLM Service
            const cleanedHistory = historyWindow.map(m => ({
                role: m.role,
                content: m.content
            }));

            // B. Call LLM Service (The Black Box)
            const llmResult = await LLMService.generateChatResponse(
                chat.language_code,
                userLevel,
                chat.topic,
                chat.summary || "", // Pass existing summary or empty string
                cleanedHistory,
                content // The user's current message
            );

            // C. Save AI Response and Update Summary in DB
            chat = await Chat.findByIdAndUpdate(
                chatId,
                {
                    // Push the AI's response to messages
                    $push: {
                        messages: {
                            role: 'assistant',
                            content: llmResult.response_text,
                            timestamp: new Date()
                        }
                    },
                    // Update the summary field
                    $set: {
                        summary: llmResult.new_summary
                    }
                },
                { new: true }
            );

        } catch (error) {
            console.error("LLM Generation Failed:", error.message);
            // Optional: You might want to push a generic error message to the chat
            // or just let the user's message stand alone. 
            // For now, we propagate the error or handle it silently so the user's msg is saved at least.
        }
    }

    return chat;
};

module.exports = {
    createNewChat,
    getChatByID,
    addMessageToChat
};