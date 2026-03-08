import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // To get Chat ID from URL
import {
    ChatHeader,
    ChatMessage,
    MessageInput,
    useChatScroll,
    useChatRoom,
    chatService, // Import service to create/check chats
    TypingIndicator
} from '../features/chat';
import { useAuth } from '../features/auth/hooks/useAuth';
import { LANGUAGES } from '../features/language/constants';

const ChatPage = () => {
    const { id } = useParams(); // Get :id from route
    const navigate = useNavigate();
    const { user, isLoading: isUserLoading, refreshUser } = useAuth(); // Add refreshUser
    const initRef = React.useRef(null); // Track init per ID

    // Redirect 'general', 'new', or undefined to a real chat
    useEffect(() => {
        if (isUserLoading || !user) return; // Wait for user

        // console.log("ChatPage Effect:", { id, initRef: initRef.current });

        if (!user.languages || user.languages.length === 0) return;

        // Reset initRef if we are on a specific chat page (so returning to 'new' works later)
        if (id !== 'new' && id !== 'general') {
            initRef.current = null;
            return;
        }

        // Skip if already initialized for this ID
        if (initRef.current === id) return;

        // Handle initialization logic
        if (id === 'general' || id === 'new') {
            initRef.current = id; // Mark as handled

            // Get active language
            const sorted = [...user.languages].sort((a, b) => {
                const dateA = new Date(a.last_active_at || 0);
                const dateB = new Date(b.last_active_at || 0);
                return dateB - dateA;
            });
            const activeLang = sorted[0];
            const langCode = activeLang.language_code;

            // Logic for 'new': Always create
            if (id === 'new') {
                chatService.createChat(langCode)
                    .then(async (newChat) => {
                        await refreshUser(); // Update sidebar
                        navigate(`/chat/${newChat._id}`);
                    })
                    .catch(err => {
                        console.error("Failed to create new chat", err);
                        alert("Failed to create chat. Redirecting home.");
                        initRef.current = null; // Reset on failure so they can retry
                        navigate('/');
                    });
                return;
            }

            // Logic for 'general': Resume if exists, else create
            const hasChats = activeLang.chats && activeLang.chats.length > 0;
            if (hasChats) {
                const lastChatId = activeLang.chats[activeLang.chats.length - 1];
                const realId = typeof lastChatId === 'object' ? lastChatId._id : lastChatId;
                navigate(`/chat/${realId}`);
            } else {
                chatService.createChat(langCode)
                    .then(async (newChat) => {
                        await refreshUser(); // Update sidebar
                        navigate(`/chat/${newChat._id}`);
                    })
                    .catch(err => {
                        console.error("Failed to create init chat", err);
                        alert("Failed to create chat. Redirecting home.");
                        initRef.current = null;
                        navigate('/');
                    });
            }
        }
    }, [id, user, navigate, isUserLoading, refreshUser]);

    // Don't render chat room if we are redirecting
    const shouldRenderChat = id && id !== 'general' && id !== 'new';
    const { messages, sendMessage, isLoading: isChatLoading, isTyping, chatMeta } = useChatRoom(shouldRenderChat ? id : null); // Destructure isTyping
    const scrollRef = useChatScroll(messages, isChatLoading, isTyping);

    // Compute Title
    const getHeaderTitle = () => {
        let code = 'es'; // default
        if (id === 'new' && user?.languages?.length > 0) {
            const sorted = [...user.languages].sort((a, b) => {
                const dateA = new Date(a.last_active_at || 0);
                const dateB = new Date(b.last_active_at || 0);
                return dateB - dateA;
            });
            code = sorted[0].language_code;
        } else if (chatMeta) {
            code = chatMeta.language_code;
        }

        const lang = LANGUAGES.find(l => l.code === code);
        return lang ? `${lang.name} Tutor` : 'Language Tutor';
    };

    if (isUserLoading) return <div className="p-10 text-center text-slate-400">Loading user data...</div>;
    if (!shouldRenderChat) return <div className="p-10 text-center text-slate-400">Loading your conversation...</div>;

    return (
        <div className="flex flex-col h-full w-full max-w-5xl mx-auto pt-16 md:pt-2 relative">
            <ChatHeader title={getHeaderTitle()} />

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 custom-scrollbar mx-2 flex flex-col"
            >
                <div className="mt-auto space-y-4 w-full">
                    {messages.map((msg, index) => (
                        <ChatMessage
                            key={msg._id || msg.id || index}
                            msg={msg}
                            languageCode={chatMeta?.language_code || 'en-US'}
                        />
                    ))}
                    {/* Visual cue that AI is thinking */}
                    {isTyping && <TypingIndicator />}
                </div>
            </div>

            <MessageInput
                onSendMessage={sendMessage}
                disabled={isChatLoading || isTyping}
                languageCode={chatMeta?.language_code || (user?.languages?.[0]?.language_code) || 'en-US'}
            />
        </div>
    );
};

export default ChatPage;