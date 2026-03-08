import React from 'react';

export const TypingIndicator = () => {
    return (
        <div className="bg-white/80 border border-white/50 px-4 py-3 rounded-2xl rounded-tl-none w-fit shadow-sm ml-0">
            <div className="flex gap-1">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
            </div>
        </div>
    );
};
