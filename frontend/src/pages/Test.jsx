import React, { useState, useEffect } from 'react';
import { PenTool, Mic, BookOpen, Check, X, RefreshCw, ChevronRight, Square, Volume2 } from 'lucide-react';
import { useTestSession } from '../features/test/hooks/useTestSession';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useVoiceToText } from '../hooks/useVoiceToText';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { clsx } from 'clsx';

const Test = ({ theme }) => {
    const { user } = useAuth();
    const {
        test,
        currentQuestion,
        currentQuestionIndex,
        totalQuestions,
        answers,
        startTest,
        submitAnswer,
        submitTest,
        abandonTest,
        mockRecordSpeaking,
        isLoading,
        result,
        reset
    } = useTestSession();

    const [userInput, setUserInput] = useState('');
    const [activeType, setActiveType] = useState(null);
    const isSubmitting = React.useRef(false);

    // Determine target language code for speech recognition
    const getTargetLang = () => {
        if (test?.language_code) return test.language_code;
        if (user?.languages?.length > 0) {
            const sorted = [...user.languages].sort((a, b) => {
                const dateA = new Date(a.last_active_at || 0);
                const dateB = new Date(b.last_active_at || 0);
                return dateB - dateA;
            });
            return sorted[0].language_code;
        }
        return 'en-US';
    };

    const { isListening, transcript, error, startListening, stopListening, resetTranscript } = useVoiceToText(getTargetLang());
    const { speak, stop: stopTTS, isSpeaking } = useTextToSpeech();

    // React to speech transcript
    useEffect(() => {
        if (transcript) {
            if (activeType === 'writing') {
                setUserInput(prev => prev + (prev ? ' ' : '') + transcript);
            } else {
                setUserInput(transcript);
            }
            resetTranscript();
        }
    }, [transcript, resetTranscript, activeType]);

    useEffect(() => {
        if (error) {
            console.error('Speech recognition error:', error);
        }
    }, [error]);

    // FIX: Auto-unlock if navigating away or closing tab during a test
    useEffect(() => {
        const handleTabClose = () => {
            if (test && !result && user?._id && !isSubmitting.current) {
                const token = localStorage.getItem('token');
                const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:12345/api';
                const url = `${baseUrl}/users/${user._id}/unlock-test`;

                // Use fetch with keepalive: true to ensure the request finishes even if the tab is closed
                fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    keepalive: true
                });
            }
        };

        window.addEventListener('beforeunload', handleTabClose);

        return () => {
            window.removeEventListener('beforeunload', handleTabClose);
            // This cleanup runs on unmount (Internal SPA navigation). 
            if (test && !result && user?._id && !isSubmitting.current) {
                console.log("Auto-unlocking session on unmount...");
                abandonTest(user._id);
            }
        };
    }, [test, result, user]);

    // Derive display type: use backend resolved type if test is active, otherwise local selection
    const displayType = test ? test.type : activeType;

    const handleStart = (type) => {
        if (!user || !user.languages || user.languages.length === 0) {
            alert("No language found for user.");
            return;
        }

        const sorted = [...user.languages].sort((a, b) => {
            const dateA = new Date(a.last_active_at || 0);
            const dateB = new Date(b.last_active_at || 0);
            return dateB - dateA;
        });

        const languageCode = sorted[0].language_code;
        setActiveType(type);
        startTest(type, languageCode);
    };

    const handleNext = () => {
        submitAnswer(userInput);
        setUserInput('');
    };

    const handleFinish = async () => {
        // Pass current input to submitTest as the final answer
        isSubmitting.current = true;
        await submitTest(userInput);
        setUserInput('');
    };

    const handleRecord = () => {
        if (isListening) {
            stopListening();
        } else {
            if (activeType === 'speaking') setUserInput('');
            startListening();
        }
    };

    const handleAbandon = async () => {
        if (user?._id) {
            await abandonTest(user._id);
        }
        setActiveType(null);
    };

    const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

    const containerClass = "h-full w-full overflow-y-auto custom-scrollbar p-4 pt-16 md:pt-4 flex flex-col";

    if (isLoading) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 gap-4">
                <RefreshCw className="animate-spin text-pink-500" size={32} />
                <p className="font-medium">Processing...</p>
            </div>
        );
    }

    // --- VIEW 3: FEEDBACK (Result) ---
    if (result) {
        const score = result.score || 0;
        const level = result.result_level || result.level || 'N/A';
        // feedback is an object { "1": "text", "2": "text" }
        const feedbackEntries = (result.details && typeof result.details === 'object')
            ? Object.entries(result.details)
            : ((result.feedback && typeof result.feedback === 'object') ? Object.entries(result.feedback) : []);

        return (
            <div className={containerClass}>
                <div className="max-w-4xl mx-auto w-full">
                    <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 md:p-8 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-1">Great Job!</h2>
                            <p className="text-slate-500">Module completed.</p>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="text-center">
                                <span className="block text-3xl font-bold text-green-500">{score}%</span>
                                <span className="text-xs text-slate-400 uppercase tracking-wider">Score</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-3xl font-bold text-blue-500">{level}</span>
                                <span className="text-xs text-slate-400 uppercase tracking-wider">Level</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pb-8">
                        <h3 className="text-lg font-bold text-slate-700 px-2 mb-2">Review & Feedback</h3>
                        {feedbackEntries.length > 0 ? feedbackEntries.map(([questionId, feedbackText], idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-white/60 border border-white flex gap-4 hover:bg-white/80 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold">{idx + 1}</span>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 leading-relaxed">{feedbackText}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="p-8 text-center bg-white/40 rounded-3xl border border-dashed border-slate-200 text-slate-400">
                                No detailed feedback available for this session.
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center pb-8">
                        <button onClick={() => { reset(); setActiveType(null); }} className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold shadow-lg hover:bg-slate-900 hover:scale-105 transition-all active:scale-95 flex items-center gap-2">
                            <RefreshCw size={18} /> Continue Practice
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW 2: ACTIVE TEST ---
    if (test) {
        return (
            <div className={containerClass}>
                <div className="max-w-3xl mx-auto w-full flex flex-col h-full">
                    <div className="w-full h-2 bg-white/40 rounded-full mb-6 shrink-0 overflow-hidden">
                        <div className="h-full bg-pink-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-6 md:p-8 shadow-lg mb-6 flex-1 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                            <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{displayType}</span>
                        </div>

                        {(displayType === 'reading' || displayType === 'placement') && (
                            <>
                                <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-4">
                                    {displayType === 'placement' ? 'Initial Level Assessment' : 'Read carefully and answer.'}
                                </h3>
                                <div className="p-5 bg-white/50 rounded-2xl text-slate-700 leading-relaxed mb-6 border border-white/50 font-medium">
                                    {currentQuestion?.question_text || "Loading..."}
                                </div>
                                {currentQuestion?.options && currentQuestion.options.length > 0 && (
                                    <div className="grid gap-3">
                                        {currentQuestion.options.map((opt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setUserInput(opt)}
                                                className={`w-full p-4 border rounded-xl text-left flex items-center gap-4 transition-all ${userInput === opt ? 'border-pink-500 bg-pink-50 ring-1 ring-pink-500' : 'border-white bg-white/30 hover:bg-white/60'}`}
                                            >
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${userInput === opt ? 'border-pink-500 bg-pink-500 text-white' : 'border-slate-300 bg-white'}`}>
                                                    {userInput === opt && <Check size={14} />}
                                                </div>
                                                <span className={`font-medium ${userInput === opt ? 'text-pink-700' : 'text-slate-600'}`}>{opt}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                        {displayType === 'writing' && (
                            <>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg md:text-xl font-bold text-slate-800">Translate or respond to:</h3>
                                    <button
                                        onClick={() => isSpeaking ? stopTTS() : speak(currentQuestion?.question_text, getTargetLang())}
                                        className={clsx(
                                            "p-2 rounded-xl transition-all",
                                            isSpeaking ? "bg-pink-100 text-pink-500 animate-pulse" : "text-slate-400 hover:text-pink-500 hover:bg-pink-50"
                                        )}
                                        title="Hear prompt"
                                    >
                                        <Volume2 size={24} />
                                    </button>
                                </div>
                                <p className="text-xl font-medium text-slate-700 mb-8 px-2 border-l-4 border-pink-400 pl-4">{currentQuestion?.question_text}</p>
                                <div className="relative group">
                                    <textarea
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        className="w-full p-6 rounded-3xl bg-white/50 border border-white focus:ring-4 focus:ring-pink-200 focus:border-pink-400 focus:outline-none resize-none min-h-[200px] shadow-inner text-lg transition-all"
                                        placeholder="Write your answer here..."
                                    ></textarea>
                                    <button
                                        onClick={handleRecord}
                                        className={`absolute bottom-6 right-6 p-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center gap-2 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-pink-500 hover:bg-pink-50'}`}
                                    >
                                        {isListening ? <Square size={24} fill="white" /> : <Mic size={24} />}
                                        {isListening && <span className="text-xs font-bold uppercase tracking-wider">Stop</span>}
                                    </button>
                                </div>
                            </>
                        )}
                        {displayType === 'speaking' && (
                            <div className="flex flex-col items-center justify-center py-8">
                                <h3 className="text-xl font-bold text-slate-800 mb-8 text-center">Read the following text aloud:</h3>
                                <div className="p-8 bg-white/30 rounded-3xl border border-white mb-10 w-full text-center relative group">
                                    <button
                                        onClick={() => isSpeaking ? stopTTS() : speak(currentQuestion?.question_text, getTargetLang())}
                                        className={clsx(
                                            "absolute top-4 right-4 p-2 rounded-xl transition-all",
                                            isSpeaking ? "bg-pink-100 text-pink-500 animate-pulse" : "text-slate-300 hover:text-pink-500 hover:bg-pink-50 group-hover:opacity-100 opacity-0"
                                        )}
                                        title="Hear prompt"
                                    >
                                        <Volume2 size={24} />
                                    </button>
                                    <p className="text-2xl md:text-3xl font-serif text-slate-700 leading-snug">
                                        "{currentQuestion?.question_text}"
                                    </p>
                                </div>

                                <div className="flex flex-col items-center gap-4">
                                    <button
                                        onClick={handleRecord}
                                        className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${isListening ? 'bg-red-500 animate-pulse' : userInput ? 'bg-green-500 shadow-green-200' : 'bg-pink-500 shadow-pink-200'}`}
                                    >
                                        {isListening ? (
                                            <Square size={40} className="text-white" fill="white" />
                                        ) : userInput ? (
                                            <Check size={40} className="text-white" />
                                        ) : (
                                            <Mic size={40} className="text-white" />
                                        )}
                                    </button>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                        {isListening ? 'Listening... Stop when done' : userInput ? 'Recorded!' : 'Tap to speak'}
                                    </p>
                                    {userInput && !isListening && (
                                        <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100 text-green-700 text-sm animate-in fade-in slide-in-from-bottom-2">
                                            <b>Transcription:</b> {userInput}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center pb-6 shrink-0">
                        <button onClick={handleAbandon} className="text-slate-400 font-bold px-4 hover:text-slate-600 transition-colors uppercase tracking-widest text-xs">Abandon Test</button>
                        <button
                            onClick={isLastQuestion ? handleFinish : handleNext}
                            disabled={!userInput && displayType !== 'speaking'}
                            className={`px-10 py-4 rounded-2xl font-bold shadow-lg flex items-center gap-3 transition-all ${(!userInput && displayType !== 'speaking') ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-900 hover:scale-105 active:scale-95'}`}
                        >
                            {isLastQuestion ? 'Submit Test' : 'Next Question'} <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW 1: SELECTION MENU ---
    return (
        <div className={containerClass}>
            <div className="max-w-5xl mx-auto w-full py-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">Select Your Challenge</h2>
                    <p className="text-lg text-slate-500 max-w-lg mx-auto">Master a new language with focused exercises designed to boost your fluency.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full pb-12">
                    {[
                        { id: 'writing', icon: PenTool, title: 'Writing', desc: 'Craft beautiful sentences and essays.', color: 'text-blue-600', bg: 'bg-blue-50', hoverBorder: 'hover:border-blue-300' },
                        { id: 'speaking', icon: Mic, title: 'Speaking', desc: 'Perfect your accent and flow.', color: 'text-pink-600', bg: 'bg-pink-50', hoverBorder: 'hover:border-pink-300' },
                        { id: 'reading', icon: BookOpen, title: 'Reading', desc: 'Broaden your vocabulary scope.', color: 'text-purple-600', bg: 'bg-purple-50', hoverBorder: 'hover:border-purple-300' }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleStart(item.id)}
                            className={`group relative bg-white/60 backdrop-blur-xl border border-white/80 p-8 rounded-[2rem] transition-all duration-500 hover:bg-white/90 hover:shadow-2xl hover:scale-[1.05] ${item.hoverBorder} text-left flex flex-col gap-6 overflow-hidden`}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/0 to-slate-100/50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                            <div className={`w-16 h-16 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shadow-inner shrink-0 transition-all duration-500 group-hover:rotate-6 group-hover:shadow-lg relative z-10`}>
                                <item.icon size={32} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">{item.title}</h3>
                                <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-800 transition-colors mt-auto relative z-10">
                                Start Now <ChevronRight size={16} />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Test;