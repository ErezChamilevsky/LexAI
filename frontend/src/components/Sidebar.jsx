import React, { useState, useEffect } from 'react';
import { Home, MessageCircle, ClipboardList, BarChart2, LogOut, Menu, X } from 'lucide-react';
import { clsx } from 'clsx';

const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
}

const Sidebar = ({ isOpen, setIsOpen, activeTab, setActiveTab, theme, onLogout }) => {
    const [hoveredItem, setHoveredItem] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const navItems = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'chat', icon: MessageCircle, label: 'Practice' },
        { id: 'test', icon: ClipboardList, label: 'Test' },
        { id: 'progress', icon: BarChart2, label: 'Progress' },
    ];

    const glassStyle = {
        backgroundColor: `rgba(${hexToRgb(theme.sidebarBase)}, ${theme.sidebarOpacity})`,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        color: theme.sidebarText
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile Toggle Button */}
            <div className="md:hidden fixed top-0 left-0 w-full p-4 z-30 flex items-center justify-between pointer-events-none">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="pointer-events-auto p-2 rounded-xl bg-white/50 backdrop-blur-md shadow-sm border border-white/50 text-slate-700"
                >
                    <Menu size={24} />
                </button>
            </div>

            <aside
                style={glassStyle}
                className={clsx(
                    "flex flex-col transition-all duration-300 border backdrop-blur-xl shadow-xl z-50 flex-shrink-0",
                    // Desktop: Relative, taller, rounded
                    "md:relative md:h-[calc(100vh-2rem)] md:my-4 md:ml-4 md:rounded-3xl",
                    // Mobile: Fixed full height
                    "fixed top-0 left-0 h-full w-64 md:w-auto",
                    // WIDTH LOGIC: Set to 250px for desktop
                    isOpen ? "translate-x-0 md:translate-x-0 md:w-[230px]" : "-translate-x-full md:translate-x-0 md:w-20"
                )}
            >
                {/* Header */}
                <div className="h-20 flex items-center justify-between px-6 mb-2 mt-4 md:mt-0">
                    <div className={clsx("flex items-center gap-3", !isOpen && "md:hidden")}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-md"
                            style={{ backgroundColor: theme.sidebarText, color: '#ffffff' }}>
                            L
                        </div>
                        <span className="font-bold text-lg tracking-wide">LexAI</span>
                    </div>

                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-1 hover:bg-black/5 rounded-full">
                        <X size={24} />
                    </button>

                    <button onClick={() => setIsOpen(!isOpen)} className="hidden md:block hover:bg-black/5 rounded-full p-1 transition-colors">
                        <Menu size={24} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        const isHovered = hoveredItem === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    if (isMobile) setIsOpen(false);
                                }}
                                onMouseEnter={() => setHoveredItem(item.id)}
                                onMouseLeave={() => setHoveredItem(null)}
                                style={{
                                    color: isActive ? theme.sidebarAccent : theme.sidebarText,
                                    backgroundColor: isActive ? `${theme.sidebarAccent}15` : 'transparent',
                                    // GLOW EFFECT: Adds a colored shadow and border on hover/active
                                    boxShadow: (isActive || isHovered) ? `0 0 20px ${theme.sidebarAccent}40` : 'none',
                                    borderColor: (isActive || isHovered) ? `${theme.sidebarAccent}30` : 'transparent'
                                }}
                                className={clsx(
                                    "w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden border",
                                    // Removed generic hover:bg-white/40 to let the glow stand out more, 
                                    // but kept a slight border transition
                                    !isActive && !isHovered && "border-transparent hover:bg-white/40"
                                )}
                            >
                                {isActive && <div className="absolute left-0 top-0 w-1 h-full rounded-r-full" style={{ backgroundColor: theme.sidebarAccent }}></div>}
                                <item.icon size={20} className={clsx("transition-transform duration-300", (isActive || isHovered) && "scale-110")} />
                                <span className={clsx("whitespace-nowrap font-medium transition-opacity duration-200", !isOpen && "md:hidden")}>{item.label}</span>
                            </button>
                        )
                    })}
                </nav>

                <div className="p-4 mb-2">
                    <button 
                        onClick={() => {
                            if (window.confirm("Are you sure you want to log out?")) {
                                onLogout(); // Triggers the useAuth logout logic
                            }
                        }}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl opacity-60 hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all">
                        <LogOut size={20} />
                        <span className={clsx(!isOpen && "md:hidden")}>Log out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;