import React from 'react';
import { MoreVertical } from 'lucide-react';

export const ChatHeader = () => (
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
        <button className="p-2 hover:bg-white/40 rounded-full transition-colors">
            <MoreVertical size={20} className="text-slate-600" />
        </button>
    </div>
);