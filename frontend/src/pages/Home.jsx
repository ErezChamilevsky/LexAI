import React, { useState } from 'react';
import { Play, MessageSquare, BarChart, Globe, Plus, X, ArrowRight, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';

const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
}

const Home = ({ theme }) => {
    const [showLangModal, setShowLangModal] = useState(false);
    const [currentLang, setCurrentLang] = useState({ code: 'ES', name: 'Spanish', flag: '🇪🇸' });

    const cardStyle = {
        backgroundColor: `rgba(${hexToRgb(theme.cardBg)}, ${theme.cardOpacity})`,
        borderColor: 'rgba(255, 255, 255, 0.6)',
    };

    return (
        <div className="h-full w-full overflow-y-auto custom-scrollbar relative p-4 pt-16 md:pt-4">
            <div className="max-w-6xl mx-auto flex flex-col min-h-full">

                {/* Header */}
                <div className="flex-shrink-0 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-1" style={{ color: theme.textMain }}>Hello, Erez.</h1>
                        <p className="text-lg opacity-80" style={{ color: theme.textSub }}>Ready to practice {currentLang.name}?</p>
                    </div>
                    <button
                        onClick={() => setShowLangModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md border shadow-sm hover:shadow-md transition-all bg-white/40 hover:bg-white/60 w-full md:w-auto justify-between md:justify-start transform hover:scale-[1.02]"
                        style={{ borderColor: 'rgba(255,255,255,0.6)' }}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{currentLang.flag}</span>
                            <span className="font-bold text-sm" style={{ color: theme.textMain }}>{currentLang.name}</span>
                        </div>
                        <Globe size={16} className="opacity-50" />
                    </button>
                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 flex-shrink-0">
                    {[
                        { title: "New Practice", sub: "Start session", icon: Play, color: "blue" },
                        { title: "Continue", sub: "Resume chat", icon: MessageSquare, color: "pink" },
                        { title: "Progress", sub: "View stats", icon: BarChart, color: "purple" },
                    ].map((item, i) => (
                        <div key={i} style={cardStyle} className={`group relative backdrop-blur-md border rounded-3xl p-6 transition-all hover:scale-[1.02] shadow-sm hover:shadow-xl cursor-pointer min-h-[160px] md:min-h-[200px] flex flex-col justify-between overflow-hidden`}>
                            {/* Card Glow */}
                            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl bg-${item.color}-400/20 group-hover:bg-${item.color}-400/30 transition-all`}></div>

                            <div className="relative z-10">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-${item.color}-50 text-${item.color}-500 shadow-sm transition-transform group-hover:scale-110 duration-300`}>
                                    <item.icon size={24} fill={item.title === 'New Practice' ? 'currentColor' : 'none'} />
                                </div>
                                <h3 className="text-xl font-bold mb-1" style={{ color: theme.textMain }}>{item.title}</h3>
                                <p className="text-sm opacity-70">{item.sub}</p>
                            </div>
                            <div className={`relative z-10 flex items-center text-sm font-bold text-${item.color}-600 mt-4 group-hover:gap-2 transition-all`}>
                                Go <ArrowRight size={16} className="ml-1" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="flex-1 flex flex-col pb-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider mb-4 pl-1 flex-shrink-0 opacity-60">Recent Activity</h2>

                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5, 6].map((_, i) => (
                            <div
                                key={i}
                                style={{ backgroundColor: `rgba(255,255,255,0.4)` }}
                                className="group relative overflow-hidden border border-white/60 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/80 transition-all cursor-pointer shadow-sm hover:shadow-md"
                            >
                                {/* NEW: Subtle Glow for Activity Items */}
                                <div className="absolute right-0 top-0 w-24 h-24 bg-pink-400/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center text-slate-600 relative z-10">
                                    <BookOpen size={18} />
                                </div>
                                <div className="flex-1 relative z-10">
                                    <h4 className="text-base font-bold text-slate-800">Review: Past Tense</h4>
                                    <p className="text-xs opacity-60">Spanish • Yesterday</p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0 relative z-10">
                                    <ArrowRight size={18} className="text-slate-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Language Modal */}
                {showLangModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white/90 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-800">Choose Language</h2>
                                <button onClick={() => setShowLangModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                {[
                                    { name: 'Spanish', flag: '🇪🇸' }, { name: 'French', flag: '🇫🇷' },
                                    { name: 'German', flag: '🇩🇪' }, { name: 'Italian', flag: '🇮🇹' }
                                ].map(lang => (
                                    <button
                                        key={lang.name}
                                        onClick={() => { setCurrentLang(lang); setShowLangModal(false); }}
                                        className={clsx("flex items-center gap-3 p-4 rounded-2xl border transition-all text-left",
                                            currentLang.name === lang.name
                                                ? "bg-pink-50 border-pink-200 ring-1 ring-pink-200"
                                                : "bg-white/50 border-transparent hover:bg-white hover:border-slate-200 shadow-sm hover:scale-[1.02]"
                                        )}
                                    >
                                        <span className="text-2xl">{lang.flag}</span>
                                        <span className="font-semibold text-slate-700">{lang.name}</span>
                                    </button>
                                ))}
                            </div>
                            <button className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-pink-300 hover:text-pink-500 hover:bg-pink-50 transition-all flex items-center justify-center gap-2 font-semibold hover:shadow-sm">
                                <Plus size={18} /> Add New Language
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;