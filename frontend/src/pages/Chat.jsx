import React, { useEffect, useRef } from 'react';
import { Send, Mic, Paperclip, MoreVertical } from 'lucide-react';
import { clsx } from 'clsx';

const Chat = ({ theme }) => {
    const scrollRef = useRef(null);

    const messages = [
        { id: 1, sender: 'bot', text: 'Hola! ¿Cómo estás hoy?', time: '10:00 AM' },
        { id: 2, sender: 'user', text: 'Estoy bien, gracias. ¿Y tú?', time: '10:01 AM' },
        { id: 3, sender: 'bot', text: 'Muy bien. Practice ordering?', time: '10:01 AM' },
        { id: 4, sender: 'user', text: 'Claro que si.', time: '10:05 AM' },
        { id: 5, sender: 'bot', text: 'Great. You are at a cafe.', time: '10:06 AM' },
        { id: 6, sender: 'user', text: 'Un café con leche, por favor.', time: '10:07 AM' },
        { id: 7, sender: 'bot', text: 'Excellent grammar! What else?', time: '10:08 AM' },
        { id: 8, sender: 'user', text: 'Un croissant también.', time: '10:09 AM' },
    ];

    // Auto-scroll to bottom on mount or when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-full w-full max-w-5xl mx-auto pt-16 md:pt-2 relative">

            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/40 bg-white/30 backdrop-blur-md rounded-t-3xl mx-2 md:mt-2">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                        AI
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Spanish Tutor</h3>
                        <span className="text-xs text-green-600 font-medium">Online</span>
                    </div>
                </div>
                <button className="p-2 hover:bg-white/40 rounded-full transition-colors"><MoreVertical size={20} className="text-slate-600" /></button>
            </div>

            {/* Messages Area */}
            {/* Added 'flex flex-col' to the container and 'mt-auto' logic implicitly via justify-end if needed, 
                but using scrollTop is more reliable for scroll behavior. 
                Using flex-col + overflow-y-auto is standard. 
            */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 custom-scrollbar mx-2 flex flex-col"
            >
                {/* div with mt-auto pushes content to the bottom if there are few messages. 
                   If there are many, it scrolls normally.
                */}
                <div className="mt-auto space-y-4 w-full">
                    {messages.map((msg) => (
                        <div key={msg.id} className={clsx("flex flex-col max-w-[85%] md:max-w-[70%]", msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
                            <div
                                className={clsx(
                                    "p-3 md:p-4 shadow-sm backdrop-blur-sm text-sm leading-relaxed",
                                    msg.sender === 'user'
                                        ? "bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl rounded-tr-none"
                                        : "bg-white/80 text-slate-800 rounded-2xl rounded-tl-none border border-white/50"
                                )}
                            >
                                {msg.text}
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 p-4 mb-2 mx-2">
                <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-2 shadow-lg flex items-end gap-2">
                    <button className="p-3 text-slate-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-all hidden md:block"><Paperclip size={20} /></button>

                    <textarea
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 max-h-32 text-slate-700 placeholder-slate-400 custom-scrollbar text-sm md:text-base"
                        rows="1"
                    />

                    <button className="p-3 text-slate-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-all"><Mic size={20} /></button>

                    {/* Hover effects for Send Button */}
                    <button className="p-3 bg-pink-500 text-white rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 hover:bg-pink-600 hover:shadow-lg hover:shadow-pink-500/30 active:scale-95">
                        <Send size={18} />
                    </button>
                </div>
            </div>

        </div>
    );
};

export default Chat;