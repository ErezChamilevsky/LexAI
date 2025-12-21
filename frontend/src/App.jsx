import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ColorPanel from './components/ColorPanel';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isColorPanelOpen, setIsColorPanelOpen] = useState(false); // Closed by default for cleaner view
  const [activeTab, setActiveTab] = useState('home');

  // --- THEME STATE (Updated for Light Mode) ---
  const [theme, setTheme] = useState({
    // 1. Your Custom Pastel Background
    bgFrom: '#fff0fb',
    bgVia: '#cbdef0',
    bgTo: '#FDFDFD',

    // 2. Sidebar (Light Mode: White Glass + Dark Text)
    sidebarBase: '#ffffff',
    sidebarOpacity: 0.60,      // Higher opacity for "Frosted" look
    sidebarText: '#334155',    // Slate 700 (Dark for contrast)
    sidebarAccent: '#ec4899',  // Pink 500
    sidebarHover: '#f1f5f9',   // Light Gray hover

    // 3. Dashboard Text (Dark for contrast)
    dashTitle: '#1e293b',      // Slate 800
    dashSub: '#475569',        // Slate 600

    // 4. Cards (White Glass)
    cardBg: '#ffffff',
    cardOpacity: 0.50,
    cardHover: '#3b82f6'       // Blue 500 Glow
  });

  const updateTheme = (key, value) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div
      // REMOVED "text-white" so dark text works. Added "text-slate-700" as base.
      className="flex h-screen w-full overflow-hidden font-sans selection:bg-pink-200 selection:text-pink-900"
      style={{
        background: `linear-gradient(135deg, ${theme.bgFrom}, ${theme.bgVia}, ${theme.bgTo})`
      }}
    >

      {/* 1. Sidebar (Left) */}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
      />

      {/* 2. Main Content (Center) */}
      <main className="flex-1 h-full relative p-4 pl-0 min-w-0 transition-all duration-300">
        <Dashboard theme={theme} />
      </main>

      {/* 3. Editor Panel (Right) */}
      <ColorPanel
        theme={theme}
        updateTheme={updateTheme}
        isOpen={isColorPanelOpen}
        setIsOpen={setIsColorPanelOpen}
      />

    </div>
  );
}

export default App;