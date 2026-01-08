import React from 'react';
import { useParams } from 'react-router-dom'; // To get Chat ID from URL
import {
    ChatHeader,
    ChatMessage,
    MessageInput,
    useChatScroll,
    useChatRoom
} from '../features/chat';

const ChatPage = () => {
    const { id } = useParams(); // Get :id from route
    const { messages, sendMessage, isLoading } = useChatRoom(id);
    const scrollRef = useChatScroll(messages);

    return (
        <div className="flex flex-col h-full w-full max-w-5xl mx-auto pt-16 md:pt-2 relative">
            <ChatHeader />

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 custom-scrollbar mx-2 flex flex-col"
            >
                <div className="mt-auto space-y-4 w-full">
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} msg={msg} />
                    ))}
                    {/* Visual cue that AI is thinking */}
                    {isLoading && (
                        <div className="text-xs text-slate-400 italic ml-2">Tutor is typing...</div>
                    )}
                </div>
            </div>

            <MessageInput onSendMessage={sendMessage} disabled={isLoading} />
        </div>
    );
};

export default ChatPage;