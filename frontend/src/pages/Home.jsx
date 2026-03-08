import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
// import api from '../services/api'; // No longer needed here
import { Play, MessageSquare, BarChart, BookOpen, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import LanguageModal from '../features/language/components/LanguageModal';
import { LANGUAGES } from '../features/language/constants';

const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
}

const Home = ({ theme }) => {
    const { user, refreshUser, isLoading } = useAuth();
    const navigate = useNavigate(); // Hook must be here
    const [showLangModal, setShowLangModal] = useState(false);
    const [currentLang, setCurrentLang] = useState(null);

    // Determine active language on mount or user change
    useEffect(() => {
        if (isLoading) return;

        if (user && user.languages && user.languages.length > 0) {
            // Sort by last_active_at descending
            const sorted = [...user.languages].sort((a, b) => {
                const dateA = new Date(a.last_active_at || 0);
                const dateB = new Date(b.last_active_at || 0);
                return dateB - dateA;
            });

            const active = sorted[0];
            const langDetails = LANGUAGES.find(l => l.code === active.language_code) || { code: active.language_code, name: active.language_code, flag: '🌐' };
            setCurrentLang(langDetails);
        } else {
            setCurrentLang(null);
            setShowLangModal(true); // Auto open if no language
        }
    }, [user, isLoading]);

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
                        <h1 className="text-3xl font-bold mb-1" style={{ color: theme.textMain }}>Hello, {user?.name || 'User'}.</h1>
                        <p className="text-lg opacity-80" style={{ color: theme.textSub }}>
                            {currentLang ? `Ready to practice ${currentLang.name}?` : 'Start your journey by adding a language.'}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowLangModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md border shadow-sm hover:shadow-md transition-all bg-white/40 hover:bg-white/60 w-full md:w-auto justify-between md:justify-start transform hover:scale-[1.02]"
                        style={{ borderColor: 'rgba(255,255,255,0.6)' }}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{currentLang?.flag || '🌐'}</span>
                            <span className="font-bold text-sm" style={{ color: theme.textMain }}>{currentLang?.name || 'Select Language'}</span>
                        </div>
                        {/* Globe removed as requested */}
                    </button>
                </div>

                {/* Dashboard Cards (Only show if language selected) */}
                {currentLang && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 flex-shrink-0">
                        {[
                            { title: "New Practice", sub: "Start session", icon: Play, color: "blue" },
                            { title: "Continue", sub: "Resume chat", icon: MessageSquare, color: "pink" },
                            { title: "Progress", sub: "View stats", icon: BarChart, color: "purple" },
                        ].map((item, i) => (
                            <div
                                key={i}
                                onClick={() => {
                                    if (item.title === "New Practice") navigate('/chat/new');
                                    else if (item.title === "Continue") navigate('/chat/general');
                                    // else if (item.title === "Progress") navigate('/progress');
                                }}
                                style={cardStyle}
                                className={`group relative backdrop-blur-md border rounded-3xl p-6 transition-all hover:scale-[1.02] shadow-sm hover:shadow-xl cursor-pointer min-h-[160px] md:min-h-[200px] flex flex-col justify-between overflow-hidden`}
                            >
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
                )}

                {/* Recent Activity (Placeholder) */}
                <div className="flex-1 flex flex-col pb-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider mb-4 pl-1 flex-shrink-0 opacity-60">Recent Activity</h2>
                    {/* ... (Activity List kept same or empty if no lang) ... */}
                    <div className="space-y-3">
                        {currentLang ? [1, 2].map((_, i) => (
                            <div
                                key={i}
                                style={{ backgroundColor: `rgba(255,255,255,0.4)` }}
                                className="group relative overflow-hidden border border-white/60 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/80 transition-all cursor-pointer shadow-sm hover:shadow-md"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center text-slate-600 relative z-10">
                                    <BookOpen size={18} />
                                </div>
                                <div className="flex-1 relative z-10">
                                    <h4 className="text-base font-bold text-slate-800">Practice Session</h4>
                                    <p className="text-xs opacity-60">{currentLang.name} • Recently</p>
                                </div>
                            </div>
                        )) : <div className="text-slate-500 italic">No recent activity.</div>}
                    </div>
                </div>

                {/* Language Modal Feature */}
                {showLangModal && (
                    <LanguageModal
                        isOpen={showLangModal}
                        onClose={() => setShowLangModal(false)}
                        user={user}
                        refreshUser={refreshUser}
                        currentLang={currentLang}
                    />
                )}
            </div>
        </div>
    );
};

export default Home;