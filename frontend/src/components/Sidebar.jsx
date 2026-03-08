import React, { useState, useEffect, useRef } from 'react';
import { Home, MessageCircle, ClipboardList, BarChart2, LogOut, Menu, X, ChevronDown, ChevronRight, MessageSquare, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { chatService } from '../features/chat/api/chat.service';
import ConfirmationModal from './ConfirmationModal';

const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
}

const Sidebar = ({ isOpen, setIsOpen, activeTab, setActiveTab, theme, onLogout }) => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [hoveredItem, setHoveredItem] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    // Collapsible states
    const [expandedMenu, setExpandedMenu] = useState(null); // 'practice' or null
    const [activeMenu, setActiveMenu] = useState(null); // { id, x, y } or null
    const [editingChatId, setEditingChatId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [chatToDelete, setChatToDelete] = useState(null); // ID of chat to delete
    const menuRef = useRef(null);

    // ... useEffects ...

    // Handlers
    const startEditing = (chat, e) => {
        e.stopPropagation();
        setEditingChatId(chat._id);
        setEditTitle(chat.title);
        setActiveMenu(null);
    };

    const cancelEditing = () => {
        setEditingChatId(null);
        setEditTitle("");
    };

    const saveRename = async () => {
        if (!editTitle || editTitle.trim() === "") {
            cancelEditing();
            return;
        }
        try {
            await chatService.updateChat(editingChatId, editTitle.trim());
            await refreshUser();
            setEditingChatId(null);
        } catch (err) {
            console.error("Failed to rename chat", err);
            cancelEditing();
        }
    };

    const handleDelete = (chatId, e) => {
        e.stopPropagation();
        setChatToDelete(chatId);
        setActiveMenu(null);
    };

    const confirmDelete = async () => {
        if (!chatToDelete) return;
        try {
            await chatService.deleteChat(chatToDelete);
            await refreshUser();
            if (window.location.pathname.includes(chatToDelete)) {
                navigate('/');
            }
        } catch (err) {
            console.error("Failed to delete chat", err);
            alert("Failed to delete chat.");
        } finally {
            setChatToDelete(null);
        }
    };



    // Helper to get chats from user object
    // Assuming user.languages[0].chats is populated or we need to rely on what we have.
    // For now, let's just use what's in user.
    const getUserChats = () => {
        if (!user || !user.languages || user.languages.length === 0) return [];

        // 1. Identify Active Language (same sort logic as Home)
        const sorted = [...user.languages].sort((a, b) => {
            const dateA = new Date(a.last_active_at || 0);
            const dateB = new Date(b.last_active_at || 0);
            return dateB - dateA;
        });
        const activeLangCode = sorted[0].language_code;

        // 2. Find chats for this language
        const activeLangData = user.languages.find(l => l.language_code === activeLangCode);
        if (!activeLangData || !activeLangData.chats) return [];

        return activeLangData.chats.map(c => ({
            _id: typeof c === 'object' ? c._id : c,
            title: typeof c === 'object' ? (c.topic || 'New Chat') : 'Saved Chat',
            lang: activeLangCode
        })).reverse(); // Show newest first
    };

    const chats = getUserChats();

    const handleMenuClick = (e, chatId) => {
        console.log("Menu clicked for chat:", chatId);
        e.stopPropagation();
        if (activeMenu?.id === chatId) {
            console.log("Closing menu (toggle)");
            setActiveMenu(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            console.log("Opening menu at:", rect.right + 10, rect.top);
            setActiveMenu({
                id: chatId,
                x: rect.right + 10,
                y: rect.top
            });
        }
    };

    const handleNavClick = (id, hasSubmenu = false) => {
        if (hasSubmenu) {
            setExpandedMenu(expandedMenu === id ? null : id);
        } else {
            setActiveTab(id);
            if (isMobile) setIsOpen(false);
        }
    };

    const glassStyle = {
        backgroundColor: `rgba(${hexToRgb(theme.sidebarBase)}, ${theme.sidebarOpacity})`,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        color: theme.sidebarText
    };

    const renderNavItem = (item) => {
        const isActive = activeTab === item.id;
        const isExpanded = expandedMenu === item.id;
        const hasSubmenu = item.id === 'practice'; // Hardcoded for now
        const isHovered = hoveredItem === item.id;

        return (
            <div key={item.id}>
                <button
                    onClick={() => handleNavClick(item.id, hasSubmenu)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                        color: isActive ? theme.sidebarAccent : theme.sidebarText,
                        backgroundColor: isActive ? `${theme.sidebarAccent}15` : 'transparent',
                        boxShadow: (isActive || isHovered) ? `0 0 20px ${theme.sidebarAccent}40` : 'none',
                        borderColor: (isActive || isHovered) ? `${theme.sidebarAccent}30` : 'transparent'
                    }}
                    className={clsx(
                        "w-full flex items-center justify-between px-4 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden border",
                        !isActive && !isHovered && "border-transparent hover:bg-white/40"
                    )}
                >
                    <div className="flex items-center gap-4">
                        {isActive && <div className="absolute left-0 top-0 w-1 h-full rounded-r-full" style={{ backgroundColor: theme.sidebarAccent }}></div>}
                        <item.icon size={20} className={clsx("transition-transform duration-300", (isActive || isHovered) && "scale-110")} />
                        <span className={clsx("whitespace-nowrap font-medium transition-opacity duration-200", !isOpen && "md:hidden")}>{item.label}</span>
                    </div>
                    {hasSubmenu && isOpen && (
                        <div className="opacity-50">
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </div>
                    )}
                </button>

                {/* Submenu */}
                {hasSubmenu && isExpanded && isOpen && (
                    <div className="mt-2 ml-4 space-y-1 animate-fade-in">
                        <button
                            onClick={() => {
                                navigate('/chat/new');
                                if (isMobile) setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-500 hover:text-pink-500 hover:bg-pink-50 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <span className="text-lg">+</span> New Chat {chats.length > 0 && `(${chats[0].lang.toUpperCase()})`}
                        </button>

                        {chats.map(chat => (
                            <div key={chat._id} className="relative group">
                                {editingChatId === chat._id ? (
                                    <div className="px-3 py-1">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            onBlur={saveRename}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') saveRename();
                                                if (e.key === 'Escape') cancelEditing();
                                                e.stopPropagation();
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full text-sm px-2 py-1.5 bg-white border border-pink-300 rounded-md outline-none focus:ring-2 focus:ring-pink-200 text-slate-700"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => {
                                                navigate(`/chat/${chat._id}`);
                                                if (isMobile) setIsOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-slate-500 hover:text-pink-500 hover:bg-pink-50 rounded-lg flex items-center gap-2 transition-colors truncate pr-8"
                                        >
                                            <MessageSquare size={14} />
                                            <span className="truncate">{chat.title}</span>
                                        </button>

                                        <button
                                            onClick={(e) => handleMenuClick(e, chat._id)}
                                            className={clsx(
                                                "menu-trigger absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-200 transition-opacity",
                                                activeMenu?.id === chat._id ? "opacity-100 bg-slate-200" : "opacity-100 md:opacity-0 group-hover:opacity-100"
                                            )}
                                        >
                                            <MoreVertical size={14} className="text-slate-500" />
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div >
                )}
            </div >
        );
    };

    const navItems = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'practice', icon: MessageCircle, label: 'Practice' },
        { id: 'test', icon: ClipboardList, label: 'Test' },
        { id: 'progress', icon: BarChart2, label: 'Progress' },
    ];

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
                    "md:relative md:h-[calc(100vh-2rem)] md:my-4 md:ml-4 md:rounded-3xl",
                    "fixed top-0 left-0 h-full w-[250px] md:w-auto",
                    isOpen ? "translate-x-0 md:translate-x-0 md:w-[250px]" : "-translate-x-full md:translate-x-0 md:w-20"
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
                    {navItems.map(renderNavItem)}
                </nav>

                <div className="p-4 mb-2">
                    <button
                        onClick={() => {
                            if (window.confirm("Are you sure you want to log out?")) {
                                onLogout();
                            }
                        }}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl opacity-60 hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all">
                        <LogOut size={20} />
                        <span className={clsx(!isOpen && "md:hidden")}>Log out</span>
                    </button>
                </div>
            </aside>

            {/* Fixed Dropdown Portal */}
            {activeMenu && (
                <div
                    ref={menuRef}
                    style={{
                        position: 'fixed',
                        top: `${activeMenu.y}px`,
                        left: `${activeMenu.x}px`
                    }}
                    className="w-32 bg-white border border-slate-100 shadow-xl rounded-xl z-[99999] flex flex-col origin-top-left"
                >
                    <button
                        onClick={(e) => {
                            const chat = chats.find(c => c._id === activeMenu.id);
                            startEditing(chat, e);
                        }}
                        className="px-4 py-2 text-left text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700 w-full rounded-t-xl"
                    >
                        <Edit2 size={12} /> Rename
                    </button>
                    <button
                        onClick={(e) => handleDelete(activeMenu.id, e)}
                        className="px-4 py-2 text-left text-xs hover:bg-red-50 flex items-center gap-2 text-red-500 w-full rounded-b-xl"
                    >
                        <Trash2 size={12} /> Delete
                    </button>
                </div>
            )}

            <ConfirmationModal
                isOpen={!!chatToDelete}
                onClose={() => setChatToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Chat"
                message="Are you sure you want to delete this chat? This action cannot be undone."
                confirmText="Delete"
                isDangerous={true}
            />
        </>
    );
};

export default Sidebar;