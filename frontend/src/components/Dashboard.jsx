import React from 'react';
import { MessageSquare, BarChart, ArrowRight, Mic, BookOpen } from 'lucide-react';

const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
}

const Dashboard = ({ theme }) => {

    const cardStyle = {
        backgroundColor: `rgba(${hexToRgb(theme.cardBg)}, ${theme.cardOpacity})`,
        borderColor: 'rgba(255, 255, 255, 0.6)', // White border
    };

    return (
        <div className="h-full w-full flex flex-col px-4 py-4 max-w-6xl mx-auto">

            {/* Header */}
            <div className="mb-8 flex-shrink-0 pt-4">
                <h1 className="text-3xl font-bold mb-2" style={{ color: theme.dashTitle }}>
                    Good morning, Erez.
                </h1>
                <p className="text-lg font-medium" style={{ color: theme.dashSub }}>
                    Ready to explore the universe of languages?
                </p>
            </div>

            {/* Main Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 flex-shrink-0">
                {[
                    { icon: Mic, title: "Start Practice", sub: "Interactive speaking session.", color: "#0ea5e9" }, // Sky Blue
                    { icon: MessageSquare, title: "Recent Chats", sub: "Topic: 'Ordering Coffee'", color: "#ec4899" }, // Pink
                    { icon: BarChart, title: "Your Stats", sub: "Level B1 • 85% Fluency", color: "#8b5cf6" } // Violet
                ].map((card, i) => (
                    <div
                        key={i}
                        style={cardStyle}
                        className="group relative backdrop-blur-md border rounded-3xl p-6 transition-all duration-300 cursor-pointer overflow-hidden hover:scale-[1.02] shadow-sm hover:shadow-xl"
                    >
                        {/* Colored Glow on Hover */}
                        <div
                            className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                            style={{ backgroundColor: card.color }}
                        ></div>

                        <div className="relative z-10 flex flex-col h-full justify-between min-h-[180px]">
                            <div>
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border shadow-sm"
                                    style={{
                                        backgroundColor: `${card.color}15`, // Very light tint of icon color
                                        color: card.color,
                                        borderColor: `${card.color}30`
                                    }}
                                >
                                    <card.icon size={22} />
                                </div>
                                <h3 className="text-xl font-bold mb-1" style={{ color: theme.dashTitle }}>{card.title}</h3>
                                <p className="text-sm opacity-80" style={{ color: theme.dashSub }}>{card.sub}</p>
                            </div>
                            <div className="flex items-center font-bold text-sm group-hover:gap-2 transition-all" style={{ color: card.color }}>
                                Start Now <ArrowRight size={16} className="ml-1" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity List */}
            <div className="flex-1 min-h-0 flex flex-col">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-4 pl-1 flex-shrink-0" style={{ color: theme.dashSub }}>
                    Recent Activity
                </h2>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {[1, 2, 3, 4, 5].map((item, i) => (
                        <div
                            key={i}
                            className="group relative backdrop-blur-sm border border-white/50 rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:bg-white/60"
                            style={{ backgroundColor: `rgba(${hexToRgb(theme.cardBg)}, ${theme.cardOpacity - 0.2})` }}
                        >
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center relative z-10"
                                style={{ backgroundColor: `${theme.dashSub}15`, color: theme.dashTitle }}
                            >
                                <BookOpen size={18} />
                            </div>
                            <div className="flex-1 relative z-10">
                                <h4 className="text-base font-bold" style={{ color: theme.dashTitle }}>Vocab: Travel Essentials</h4>
                                <p className="text-xs opacity-70" style={{ color: theme.dashSub }}>Spanish • Yesterday</p>
                            </div>

                            <div className="relative z-10 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                                <ArrowRight size={18} style={{ color: theme.dashTitle }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;