import React, { useState } from 'react';
import { PenTool, Mic, BookOpen, Check, X, ArrowRight, RefreshCw, ChevronRight } from 'lucide-react';

const Test = ({ theme }) => {
    const [view, setView] = useState('menu');
    const [testType, setTestType] = useState(null);
    const [progress, setProgress] = useState(33);

    const containerClass = "h-full w-full overflow-y-auto custom-scrollbar p-4 pt-16 md:pt-4 flex flex-col";

    // --- VIEW 1: SELECTION MENU ---
    if (view === 'menu') {
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
                                onClick={() => { setTestType(item.id); setView('active'); }}
                                // NEW: Added hover effects here
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
    }

    // --- VIEW 2: ACTIVE TEST ---
    if (view === 'active') {
        return (
            <div className={containerClass}>
                <div className="max-w-3xl mx-auto w-full flex flex-col h-full">
                    {/* Progress */}
                    <div className="w-full h-2 bg-white/40 rounded-full mb-6 shrink-0">
                        <div className="h-full bg-pink-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-6 md:p-8 shadow-lg mb-6 flex-1 overflow-y-auto">
                        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2 block">Question 3 of 10</span>

                        {testType === 'reading' && (
                            <>
                                <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-4">Read and select the correct answer.</h3>
                                <p className="p-4 bg-white/50 rounded-xl text-slate-700 leading-relaxed mb-6 border border-white/50">
                                    "El gato caminó por el techo durante la noche. Estaba buscando comida pero solo encontró una ventana cerrada."
                                </p>
                                <div className="space-y-3">
                                    <div className="p-4 border border-white rounded-xl bg-white/30 hover:bg-white/60 hover:border-slate-300 hover:shadow-md cursor-pointer flex items-center gap-3 transition-all">
                                        <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div> The cat was sleeping.
                                    </div>
                                    <div className="p-4 border border-pink-300 rounded-xl bg-pink-50/50 hover:bg-pink-100 hover:shadow-md cursor-pointer flex items-center gap-3 transition-all">
                                        <div className="w-5 h-5 rounded-full border-4 border-pink-500"></div> The cat was looking for food.
                                    </div>
                                </div>
                            </>
                        )}
                        {testType === 'writing' && (
                            <>
                                <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-4">Translate the following sentence:</h3>
                                <p className="text-lg font-medium text-slate-600 mb-6">"I want to buy a ticket to Madrid."</p>
                                <textarea
                                    className="w-full p-4 rounded-xl bg-white/50 border border-white focus:ring-2 focus:ring-pink-400 focus:outline-none resize-none min-h-[150px]"
                                    placeholder="Type your translation here..."
                                ></textarea>
                            </>
                        )}
                        {testType === 'speaking' && (
                            <div className="flex flex-col items-center justify-center py-10">
                                <h3 className="text-xl font-bold text-slate-800 mb-8 text-center">Read aloud:</h3>
                                <p className="text-2xl font-serif text-slate-700 mb-12 text-center">"Me gustaría reservar una mesa."</p>
                                <button className="w-20 h-20 rounded-full bg-pink-500 text-white shadow-xl flex items-center justify-center hover:scale-110 hover:shadow-pink-500/40 transition-all duration-300">
                                    <Mic size={32} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer buttons with Hover */}
                    <div className="flex justify-between items-center pb-4 shrink-0">
                        <button onClick={() => setView('menu')} className="text-slate-500 font-medium px-4 hover:text-slate-800 transition-colors">Quit</button>
                        <button
                            onClick={() => setView('feedback')}
                            className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all hover:bg-slate-900 hover:scale-105 hover:shadow-xl active:scale-95"
                        >
                            Next <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW 3: FEEDBACK ---
    if (view === 'feedback') {
        return (
            <div className={containerClass}>
                <div className="max-w-4xl mx-auto w-full">
                    <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 md:p-8 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-1">Great Job!</h2>
                            <p className="text-slate-500">Module completed.</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-center"><span className="block text-3xl font-bold text-green-500">80%</span><span className="text-xs text-slate-400 uppercase">Score</span></div>
                        </div>
                    </div>

                    <div className="space-y-4 pb-8">
                        {[1, 2].map(n => (
                            <div key={n} className="p-4 rounded-2xl bg-white/60 border border-white flex gap-4 hover:bg-white/80 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0"><Check size={18} /></div>
                                <div><p className="font-bold text-slate-700">Question {n}</p><p className="text-sm text-slate-600">Correct Answer</p></div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pb-8">
                        <button onClick={() => { setView('menu'); setProgress(0); }} className="px-6 py-3 bg-white text-slate-700 rounded-xl font-bold shadow-sm border border-white/60 flex items-center gap-2 hover:bg-slate-50 hover:shadow-md transition-all">
                            <RefreshCw size={18} /> Practice Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export default Test;