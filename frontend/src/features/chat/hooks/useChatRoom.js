import { useState, useEffect } from 'react';
import { chatService } from '../api/chat.service';

export const useChatRoom = (chatId) => {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [chatMeta, setChatMeta] = useState(null); // { language_code, topic }

    useEffect(() => {
        if (!chatId || chatId === 'general' || chatId === 'new') return;

        const loadChat = async () => {
            setIsLoading(true);
            try {
                const chat = await chatService.getChat(chatId);
                setChatMeta({ language_code: chat.language_code, topic: chat.topic });

                // Map backend messages to frontend format
                const formattedMessages = chat.messages.map(m => ({
                    id: m._id,
                    sender: m.role,
                    text: m.content,
                    time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                setMessages(formattedMessages);
            } catch (error) {
                console.error("Failed to load chat:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadChat();
    }, [chatId]);

    const sendMessage = async (text) => {
        if (!text.trim()) return;

        // 1. Optimistic Update (Immediate feedback)
        const userMsg = {
            id: Date.now().toString(), // Temp ID
            sender: 'user',
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            // 2. API Call
            const updatedChat = await chatService.sendMessage(chatId, text);

            // 3. Update with real data from backend
            const formattedMessages = updatedChat.messages.map(m => ({
                id: m._id,
                sender: m.role,
                text: m.content,
                time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));

            setMessages(formattedMessages);
        } catch (error) {
            console.error("Failed to send message:", error);
            // Rollback optimistic update if needed
        } finally {
            setIsTyping(false);
        }
    };

    return { messages, sendMessage, isLoading, isTyping, chatMeta };
};