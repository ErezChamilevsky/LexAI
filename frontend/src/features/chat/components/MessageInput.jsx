import React, { useState } from 'react';
import { Send, Mic, Loader2 } from 'lucide-react';

export const MessageInput = ({ onSendMessage, disabled }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim() && !disabled) {
            onSendMessage(text);
            setText('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex-shrink-0 p-4 mb-2 mx-2">
            <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-2 shadow-lg flex items-end gap-2">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none 
                    resize-none py-3 max-h-32 text-slate-700 
                    placeholder-slate-400 text-sm md:text-base 
                    outline-none focus:outline-none ring-0 focus:ring-0 focus:shadow-none"
                    rows="1"
                />
                <button type="button" className="p-3 text-slate-400 hover:text-pink-500 rounded-xl transition-all">
                    <Mic size={20} />
                </button>
                <button
                    type="submit"
                    disabled={disabled || !text.trim()}
                    className="p-3 bg-pink-500 text-white rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                    {disabled ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
            </div>
        </form>
    );
};