import React, { useState, useEffect } from 'react';
import { Send, Mic, Loader2, Square } from 'lucide-react';
import { useVoiceToText } from '../../../hooks/useVoiceToText';

export const MessageInput = ({ onSendMessage, disabled, languageCode = 'en-US' }) => {
    const [text, setText] = useState('');
    const { isListening, transcript, error, startListening, stopListening, resetTranscript } = useVoiceToText(languageCode);

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (text.trim() && !disabled) {
            onSendMessage(text);
            setText('');
        }
    };

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    // React to speech transcript
    useEffect(() => {
        if (transcript) {
            setText(prev => prev + (prev ? ' ' : '') + transcript);
            resetTranscript();
        }
    }, [transcript, resetTranscript]);

    useEffect(() => {
        if (error) {
            console.error('Speech recognition error:', error);
            // Non-critical alert or toast would be better, but sticking to basics for now
            if (error === 'not-allowed') alert('Microphone access denied.');
        }
    }, [error]);

    return (
        <form onSubmit={handleSubmit} className="flex-shrink-0 p-4 mb-2 mx-2">
            <div className={`bg-white/60 backdrop-blur-xl border ${isListening ? 'border-pink-500 ring-2 ring-pink-200' : 'border-white/50'} rounded-2xl p-2 shadow-lg flex items-end gap-2 transition-all`}>
                <textarea
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                    placeholder={isListening ? "Listening..." : "Type a message..."}
                    className="flex-1 bg-transparent border-none 
                    resize-none py-3 max-h-32 text-slate-700 
                    placeholder-slate-400 text-sm md:text-base 
                    outline-none focus:outline-none ring-0 focus:ring-0 focus:shadow-none custom-scrollbar"
                    rows="1"
                    disabled={disabled}
                />
                <button
                    type="button"
                    onClick={handleMicClick}
                    disabled={disabled}
                    className={`p-3 rounded-xl transition-all ${isListening ? 'bg-pink-500 text-white animate-pulse' : 'text-slate-400 hover:text-pink-500'}`}
                >
                    {isListening ? <Square size={20} fill="white" /> : <Mic size={20} />}
                </button>
                <button
                    type="submit"
                    disabled={disabled || !text.trim() || isListening}
                    className="p-3 bg-pink-500 text-white rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                    {disabled ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
            </div>
            {isListening && (
                <div className="flex justify-center mt-2">
                    <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest animate-pulse">Listening... Click square to stop</span>
                </div>
            )}
        </form>
    );
};
