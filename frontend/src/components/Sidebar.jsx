import React, { useState } from 'react';
import { Home, MessageCircle, BarChart2, User, LogOut, Menu } from 'lucide-react';
import { clsx } from 'clsx';

const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
}

const Sidebar = ({ isOpen, setIsOpen, activeTab, setActiveTab, theme }) => {
    const [hoveredItem, setHoveredItem] = useState(null);

    const navItems = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'chat', icon: MessageCircle, label: 'Chat' },
        { id: 'progress', icon: BarChart2, label: 'Progress' },
        { id: 'profile', icon: User, label: 'Profile' },
    ];

    const glassStyle = {
        backgroundColor: `rgba(${hexToRgb(theme.sidebarBase)}, ${theme.sidebarOpacity})`,
        borderColor: 'rgba(255, 255, 255, 0.4)', // Slightly stronger border for light mode
        color: theme.sidebarText
    };

    return (
        <aside
            style={glassStyle}
            className={clsx(
                "h-[calc(100vh-2rem)] my-4 ml-4 flex flex-col transition-all duration-300 relative z-20 rounded-3xl border backdrop-blur-xl shadow-xl",
                isOpen ? "w-64" : "w-20"
            )}
        >
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-6 mb-2">
                <div className={clsx("flex items-center gap-3", !isOpen && "hidden")}>
                    {/* Logo Box */}
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-md"
                        style={{
                            backgroundColor: theme.sidebarText, // Dark box in light mode
                            color: '#ffffff' // White text
                        }}>
                        L
                    </div>
                    {/* App Name */}
                    <span className="font-bold text-lg tracking-wide" style={{ color: theme.sidebarText }}>LexAI</span>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="hover:bg-black/5 rounded-full p-1 transition-all"
                    style={{ color: theme.sidebarText }}
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-3 space-y-2">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const isHovered = hoveredItem === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            onMouseEnter={() => setHoveredItem(item.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                            style={{
                                color: isActive ? theme.sidebarAccent : theme.sidebarText, // Pink when active, Dark when idle
                                backgroundColor: isActive ? `${theme.sidebarAccent}15` : (isHovered ? theme.sidebarHover : 'transparent'), // Light Pink bg when active
                                boxShadow: isHovered ? `0 4px 20px ${theme.sidebarAccent}20` : 'none',
                            }}
                            className="w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 group relative overflow-hidden border border-transparent"
                        >
                            {/* Active Indicator Line */}
                            {isActive && (
                                <div
                                    className="absolute left-0 top-0 w-1 h-full rounded-r-full"
                                    style={{ backgroundColor: theme.sidebarAccent }}
                                ></div>
                            )}

                            <item.icon
                                size={20}
                                strokeWidth={2}
                                className={clsx("transition-transform duration-300", isActive || isHovered ? "scale-110" : "opacity-60")}
                                // Icon Color: Uses Accent if Active, otherwise Text color
                                style={{ color: isActive ? theme.sidebarAccent : theme.sidebarText }}
                            />

                            <span className={clsx("whitespace-nowrap font-medium", isOpen ? "opacity-100" : "opacity-0 hidden")}>
                                {item.label}
                            </span>
                        </button>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 mb-2">
                <button
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl opacity-60 hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
                    style={{ color: theme.sidebarText }}
                >
                    <LogOut size={20} />
                    <span className={clsx(isOpen ? "block" : "hidden")}>Log out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;