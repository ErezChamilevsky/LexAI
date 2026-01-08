// Base API utility (usually in src/utils/api.js)
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL, // Matches your server.js PORT
});

// Add token to requests (Assuming token is in localStorage)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const chatService = {
    // Sends message to: POST /api/chats/:id/messages
    sendMessage: async (chatId, text) => {
        const response = await api.post(`/${chatId}/messages`, {
            role: "user",      // Backend requirement
            content: text      // Backend requirement
        });
        return response.data;  // Returns the updated chat object
    }
};