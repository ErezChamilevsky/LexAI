import React from 'react';
import { clsx } from 'clsx';

export const ChatMessage = ({ msg }) => (
    <div className={clsx(
        "flex flex-col max-w-[85%] md:max-w-[70%]",
        msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
    )}>
        <div className={clsx(
            "p-3 md:p-4 shadow-sm backdrop-blur-sm text-sm leading-relaxed",
            msg.sender === 'user'
                ? "bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl rounded-tr-none"
                : "bg-white/80 text-slate-800 rounded-2xl rounded-tl-none border border-white/50"
        )}>
            {msg.text}
        </div>
        <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
    </div>
);