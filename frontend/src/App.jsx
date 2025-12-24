import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Home from './pages/Home'; // Renamed from Dashboard
import Chat from './pages/Chat';
import Test from './pages/Test';
import ColorPanel from './components/ColorPanel';


function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768); // Closed by default on mobile
  const [isColorPanelOpen, setIsColorPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const [theme, setTheme] = useState({
    bgFrom: '#fed7f4',
    bgVia: '#e2ebf3',
    bgTo: '#FDFDFD',
    sidebarBase: '#ffffff',
    sidebarOpacity: 0.65,
    sidebarText: '#334155',
    sidebarAccent: '#ec4899',
    sidebarHover: '#f1f5f9',
    textMain: '#1e293b',
    textSub: '#64748b',
    cardBg: '#ffffff',
    cardOpacity: 0.55,
  });

  const updateTheme = (key, value) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home theme={theme} />;
      case 'chat': return <Chat theme={theme} />;
      case 'test': return <Test theme={theme} />;
      default: return <Home theme={theme} />;
    }
  };

  return (
    // Use h-[100dvh] to fix mobile browser address bar issues
    <div
      className="flex h-[100dvh] w-full overflow-hidden font-sans text-slate-700 selection:bg-pink-200 selection:text-pink-900"
      style={{
        background: `linear-gradient(135deg, ${theme.bgFrom}, ${theme.bgVia}, ${theme.bgTo})`
      }}
    >
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
      />

      {/* Main Container: Pages control their own scroll (overflow-hidden here prevents double scrollbars) */}
      <main className="flex-1 h-full relative min-w-0 flex flex-col overflow-hidden transition-all duration-300">
        {renderContent()}
      </main>

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
