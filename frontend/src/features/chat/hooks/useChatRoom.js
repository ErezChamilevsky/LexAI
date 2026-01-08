import { useState } from 'react';
import { chatService } from '../api/chat.service';

export const useChatRoom = (chatId) => {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);

    const sendMessage = async (text) => {
        if (!text.trim()) return;

        // 1. Optimistic Update (Immediate feedback)
        const userMsg = { id: Date.now(), sender: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            // 2. API Call
            const updatedChat = await chatService.sendMessage(chatId, text);

            // 3. Map backend messages to frontend format
            const formattedMessages = updatedChat.messages.map(m => ({
                id: m._id,
                sender: m.role === 'user' ? 'user' : 'bot',
                text: m.content,
                time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));

            setMessages(formattedMessages);
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsTyping(false);
        }
    };

    return { messages, sendMessage, isTyping };
};