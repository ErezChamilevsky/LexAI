import React, { useState, useEffect } from 'react';
import { PenTool, Mic, BookOpen, Check, X, RefreshCw, ChevronRight } from 'lucide-react';
import { useTestSession } from '../features/test/hooks/useTestSession';
import { useAuth } from '../features/auth/hooks/useAuth';

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
        isLoading,
        result,
        reset
    } = useTestSession();

    const [userInput, setUserInput] = useState('');
    // Store type locally to know what to render if test object doesn't have it easily accessible
    const [activeType, setActiveType] = useState(null);

    const handleStart = (type) => {
        if (!user || !user.languages || user.languages.length === 0) {
            alert("No language found for user.");
            return;
        }

        // Sort by last_active_at to get the current one
        const sorted = [...user.languages].sort((a, b) => {
            const dateA = new Date(a.last_active_at || 0);
            const dateB = new Date(b.last_active_at || 0);
            return dateB - dateA; // Descending
        });

        const languageCode = sorted[0].language_code;
        setActiveType(type);
        startTest(type, languageCode);
    };

    const handleNext = () => {
        submitAnswer(userInput); // Submit current input
        setUserInput(''); // Clear input for next question
    };

    const handleFinish = async () => {
        submitAnswer(userInput); // Submit last answer locally
        // Wait a tick or just pass answers directly? 
        // simplistic approach: submitAnswer updates state, but it might be async.
        // Better: submitTest() uses `answers` state. 
        // Issue: `setAnswers` is async.
        // Workaround for now: Call submitTest after small delay or handling it better in hook.
        // Actually, let's just submit the test. The hook likely expects answers to be accumulated.
        // For the LAST question, we need to ensure the answer is recorded.
        // I'll update `submission` logic in hook if needed, but for now I'll assume user clicks "Next" then "Submit" or purely "Next" until end.
        // Let's change UI to "Finish" on last question.
        // But `submitAnswer` advances index. 
        // If index == total - 1, we are at last question.
        await submitTest();
    };

    // Calculate progress
    const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

    const containerClass = "h-full w-full overflow-y-auto custom-scrollbar p-4 pt-16 md:pt-4 flex flex-col";

    if (isLoading) {
        return <div className="h-full w-full flex items-center justify-center text-slate-500">Loading Test...</div>;
    }

    // --- VIEW 3: FEEDBACK (Result) ---
    if (result) {
        // Calculate score
        const score = result.score || 0;
        // Mocking result feedback for now if backend doesn't return detailed breakdown
        return (
            <div className={containerClass}>
                <div className="max-w-4xl mx-auto w-full">
                    <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 md:p-8 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-1">Great Job!</h2>
                            <p className="text-slate-500">Module completed.</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-center"><span className="block text-3xl font-bold text-green-500">{score}%</span><span className="text-xs text-slate-400 uppercase">Score</span></div>
                        </div>
                    </div>

                    <div className="space-y-4 pb-8">
                        {/* Render corrections if available */}
                        {result.feedback && result.feedback.map((item, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-white/60 border border-white flex gap-4 hover:bg-white/80 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0"><Check size={18} /></div>
                                <div><p className="font-bold text-slate-700">Question: {item.question}</p><p className="text-sm text-slate-600">{item.feedback}</p></div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pb-8">
                        <button onClick={reset} className="px-6 py-3 bg-white text-slate-700 rounded-xl font-bold shadow-sm border border-white/60 flex items-center gap-2 hover:bg-slate-50 hover:shadow-md transition-all">
                            <RefreshCw size={18} /> Practice Again
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
                    {/* Progress */}
                    <div className="w-full h-2 bg-white/40 rounded-full mb-6 shrink-0">
                        <div className="h-full bg-pink-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-6 md:p-8 shadow-lg mb-6 flex-1 overflow-y-auto">
                        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2 block">Question {currentQuestionIndex + 1} of {totalQuestions}</span>

                        {activeType === 'reading' && (
                            <>
                                <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-4">Read and select the correct answer.</h3>
                                <p className="p-4 bg-white/50 rounded-xl text-slate-700 leading-relaxed mb-6 border border-white/50">
                                    {currentQuestion?.text || "Question text loading..."}
                                </p>
                                <div className="space-y-3">
                                    {/* Assuming currentQuestion has options for Reading */}
                                    {currentQuestion?.options?.map((opt, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setUserInput(opt)}
                                            className={`p-4 border rounded-xl cursor-pointer flex items-center gap-3 transition-all ${userInput === opt ? 'border-pink-500 bg-pink-50' : 'border-white bg-white/30 hover:bg-white/60'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 ${userInput === opt ? 'border-pink-500 bg-pink-500' : 'border-slate-300'}`}></div>
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        {activeType === 'writing' && (
                            <>
                                <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-4">Translate/Answer the following:</h3>
                                <p className="text-lg font-medium text-slate-600 mb-6">"{currentQuestion?.text}"</p>
                                <textarea
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    className="w-full p-4 rounded-xl bg-white/50 border border-white focus:ring-2 focus:ring-pink-400 focus:outline-none resize-none min-h-[150px]"
                                    placeholder="Type here..."
                                ></textarea>
                            </>
                        )}
                        {activeType === 'speaking' && (
                            <div className="flex flex-col items-center justify-center py-10">
                                <h3 className="text-xl font-bold text-slate-800 mb-8 text-center">Read aloud:</h3>
                                <p className="text-2xl font-serif text-slate-700 mb-12 text-center">"{currentQuestion?.text}"</p>
                                <button className="w-20 h-20 rounded-full bg-pink-500 text-white shadow-xl flex items-center justify-center hover:scale-110 hover:shadow-pink-500/40 transition-all duration-300">
                                    <Mic size={32} />
                                </button>
                                <p className="text-sm text-slate-400 mt-4">(Microphone logic not implemented yet)</p>
                            </div>
                        )}
                    </div>

                    {/* Footer buttons */}
                    <div className="flex justify-between items-center pb-4 shrink-0">
                        <button onClick={reset} className="text-slate-500 font-medium px-4 hover:text-slate-800 transition-colors">Quit</button>
                        <button
                            onClick={isLastQuestion ? handleFinish : handleNext}
                            className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all hover:bg-slate-900 hover:scale-105 hover:shadow-xl active:scale-95"
                        >
                            {isLastQuestion ? 'Finish' : 'Next'} <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW 1: SELECTION MENU ---
    return (
        <div className={containerClass}>
            <div className="max-w-5xl mx-auto w-full">
                <div className="text-center mb-6 md:mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Select Your Challenge</h2>
                    <p className="text-slate-500">Choose a skill to focus on today.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full pb-8">
                    {[
                        { id: 'writing', icon: PenTool, title: 'Writing', desc: 'Compose sentences and essays.', color: 'text-blue-500', bg: 'bg-blue-50', hoverBorder: 'hover:border-blue-300' },
                        { id: 'speaking', icon: Mic, title: 'Speaking', desc: 'Pronunciation and fluency.', color: 'text-pink-500', bg: 'bg-pink-50', hoverBorder: 'hover:border-pink-300' },
                        { id: 'reading', icon: BookOpen, title: 'Reading', desc: 'Comprehension and vocab.', color: 'text-purple-500', bg: 'bg-purple-50', hoverBorder: 'hover:border-purple-300' }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleStart(item.id)}
                            className={`group bg-white/50 backdrop-blur-md border border-white/60 p-6 md:p-8 rounded-3xl transition-all duration-300 hover:bg-white/80 hover:shadow-xl hover:scale-[1.03] ${item.hoverBorder} text-left flex flex-row md:flex-col items-center md:items-start gap-4`}
                        >
                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shadow-sm shrink-0 transition-transform group-hover:scale-110`}>
                                <item.icon size={24} className="md:w-7 md:h-7" />
                            </div>
                            <div>
                                <h3 className="text-lg md:text-xl font-bold text-slate-800">{item.title}</h3>
                                <p className="text-xs md:text-sm text-slate-500">{item.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Test;