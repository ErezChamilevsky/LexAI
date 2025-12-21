import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Settings, X, Palette } from 'lucide-react';
import { clsx } from 'clsx';

// Helper for the Accordion inside the panel
const ColorSection = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-white/10">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-sm font-bold text-white uppercase tracking-wider hover:bg-white/5 transition-colors"
            >
                {title}
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {isOpen && <div className="p-4 space-y-4 bg-black/20 animate-fade-in">{children}</div>}
        </div>
    );
};

// Helper inputs (same as before)
const ColorInput = ({ label, value, onChange }) => (
    <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[10px] text-white/70 uppercase tracking-wide">
            <span>{label}</span>
            <span className="font-mono opacity-50">{value}</span>
        </div>
        <div className="flex items-center gap-2">
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-none p-0 bg-transparent"
            />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 bg-white/10 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-white/30 font-mono"
            />
        </div>
    </div>
);

const OpacitySlider = ({ label, value, onChange }) => (
    <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[10px] text-white/70 uppercase tracking-wide">
            <span>{label}</span>
            <span>{Math.round(value * 100)}%</span>
        </div>
        <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full accent-pink-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
        />
    </div>
);

// --- MAIN COMPONENT ---
const ColorPanel = ({ theme, updateTheme, isOpen, setIsOpen }) => {
    return (
        <div
            className={clsx(
                "h-full bg-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col transition-all duration-300 relative custom-scrollbar",
                isOpen ? "w-80" : "w-14"
            )}
        >
            {/* --- Toggle Header --- */}
            <div className={clsx("flex items-center p-4 border-b border-white/10 h-16", isOpen ? "justify-between" : "justify-center")}>

                {/* Title (Only visible when open) */}
                <div className={clsx("flex items-center gap-2 overflow-hidden transition-all duration-200", isOpen ? "w-auto opacity-100" : "w-0 opacity-0")}>
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest whitespace-nowrap">
                        Studio
                    </h2>
                </div>

                {/* Toggle Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-white/70 hover:text-pink-400 transition-colors"
                >
                    {isOpen ? <X size={20} /> : <Settings size={20} />}
                </button>
            </div>

            {/* --- Vertical Label (Only visible when Closed) --- */}
            {!isOpen && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="transform -rotate-90 text-white/40 text-xs font-bold tracking-[0.3em] uppercase whitespace-nowrap flex items-center gap-4">
                        <span className="w-8 h-px bg-white/20"></span>
                        Customize
                        <span className="w-8 h-px bg-white/20"></span>
                    </div>
                </div>
            )}

            {/* --- Content Area (Only visible when Open) --- */}
            <div className={clsx("flex-1 overflow-y-auto custom-scrollbar transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0 pointer-events-none hidden")}>

                {/* Intro */}
                <div className="p-6 text-center border-b border-white/10 bg-white/5">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl mx-auto flex items-center justify-center mb-3 shadow-lg shadow-pink-500/20">
                        <Palette size={20} className="text-white" />
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">
                        Tweak the colors to match your brand identity. Changes reflect instantly.
                    </p>
                </div>

                {/* 1. Background Settings */}
                <ColorSection title="Background">
                    <ColorInput label="Top Left (From)" value={theme.bgFrom} onChange={(v) => updateTheme('bgFrom', v)} />
                    <ColorInput label="Middle (Via)" value={theme.bgVia} onChange={(v) => updateTheme('bgVia', v)} />
                    <ColorInput label="Bottom Right (To)" value={theme.bgTo} onChange={(v) => updateTheme('bgTo', v)} />
                </ColorSection>

                {/* 2. Sidebar Settings */}
                <ColorSection title="Sidebar Glass">
                    <ColorInput label="Glass Tint" value={theme.sidebarBase} onChange={(v) => updateTheme('sidebarBase', v)} />
                    <OpacitySlider label="Glass Opacity" value={theme.sidebarOpacity} onChange={(v) => updateTheme('sidebarOpacity', v)} />
                    <div className="h-px bg-white/10 my-2"></div>
                    <ColorInput label="Text Color" value={theme.sidebarText} onChange={(v) => updateTheme('sidebarText', v)} />
                    <ColorInput label="Active Pink" value={theme.sidebarAccent} onChange={(v) => updateTheme('sidebarAccent', v)} />
                </ColorSection>

                {/* 3. Dashboard Settings */}
                <ColorSection title="Dashboard">
                    <ColorInput label="Title Color" value={theme.dashTitle} onChange={(v) => updateTheme('dashTitle', v)} />
                    <ColorInput label="Subtitle Color" value={theme.dashSub} onChange={(v) => updateTheme('dashSub', v)} />
                    <div className="h-px bg-white/10 my-2"></div>
                    <ColorInput label="Card Tint" value={theme.cardBg} onChange={(v) => updateTheme('cardBg', v)} />
                    <OpacitySlider label="Card Opacity" value={theme.cardOpacity} onChange={(v) => updateTheme('cardOpacity', v)} />
                    <ColorInput label="Glow Color" value={theme.cardHover} onChange={(v) => updateTheme('cardHover', v)} />
                </ColorSection>
            </div>
        </div>
    );
};

export default ColorPanel;