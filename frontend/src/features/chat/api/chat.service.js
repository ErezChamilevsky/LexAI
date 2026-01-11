import api from '../../../services/api';

export const chatService = {
    // Sends message to: POST /api/chats/:id/messages
    sendMessage: async (chatId, text) => {
        const response = await api.post(`/chats/${chatId}/messages`, {
            role: "user",      // Backend requirement
            content: text      // Backend requirement
        });
        return response.data;  // Returns the updated chat object
    },

    // Get chat history
    getChat: async (chatId) => {
        const response = await api.get(`/chats/${chatId}`);
        return response.data;
    },

    // Create new chat
    createChat: async (languageCode, topic = 'General Practice') => {
        const response = await api.post(`/chats`, {
            languageCode,
            topic
        });
        return response.data;
    },

    // Delete chat
    deleteChat: async (chatId) => {
        const response = await api.delete(`/chats/${chatId}`);
        return response.data;
    },

    // Update chat (e.g. topic)
    updateChat: async (chatId, topic) => {
        const response = await api.patch(`/chats/${chatId}`, { topic });
        return response.data;
    }
};