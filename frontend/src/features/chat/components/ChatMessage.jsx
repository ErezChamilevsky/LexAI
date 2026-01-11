import React from 'react';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';

export const ChatMessage = ({ msg }) => (
    <div className={clsx(
        "flex flex-col max-w-[85%] md:max-w-[70%]",
        msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
    )}>
        <div className={clsx(
            "p-3 md:p-4 shadow-sm backdrop-blur-sm text-sm leading-relaxed overflow-hidden",
            msg.sender === 'user'
                ? "bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl rounded-tr-none"
                : "bg-white/80 text-slate-800 rounded-2xl rounded-tl-none border border-white/50"
        )}>
            <ReactMarkdown
                components={{
                    p: ({ node, ...props }) => <p className="mb-1 last:mb-0" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-0.5" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                    em: ({ node, ...props }) => <em className="italic" {...props} />,
                    code: ({ node, ...props }) => <code className="bg-black/10 px-1 rounded text-xs" {...props} />,
                }}
            >
                {msg.text}
            </ReactMarkdown>
        </div>
        <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
    </div>
);