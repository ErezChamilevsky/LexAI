import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Test from './pages/Test';
import LandingPage from './pages/LandingPage'; // Import the new Landing Page
import ColorPanel from './components/ColorPanel';
import { useAuth } from './features/auth/hooks/useAuth'; // Import the Auth hook

import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

function App() {
  const { isAuthenticated, handleGoogleLogin, isLoading, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isColorPanelOpen, setIsColorPanelOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab based on current path
  const getActiveTab = (path) => {
    if (path.startsWith('/chat')) return 'chat';
    if (path.startsWith('/test')) return 'test';
    if (path === '/') return 'home';
    return '';
  };

  const activeTab = getActiveTab(location.pathname);

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

  // Show loading state while checking for stored token
  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;

  // If not authenticated, only show the Landing Page
  if (!isAuthenticated) {
    return (
      <LandingPage
        onLoginSuccess={(token) => handleGoogleLogin(token)}
      />
    );
  }

  // If authenticated, show the main application layout
  return (
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
        setActiveTab={(id) => {
          if (id === 'home') navigate('/');
          else if (id === 'chat') navigate('/chat/general'); // Keeping this for backward compatibility if called directly
          else if (id === 'practice') navigate('/chat/general'); // New ID from Sidebar
          else if (id === 'test') navigate('/test');
          else if (id === 'progress') navigate('/progress'); // Todo
        }}
        theme={theme}
        onLogout={logout}
      />

      <main className="flex-1 h-full relative min-w-0 flex flex-col overflow-hidden transition-all duration-300">
        <Routes>
          <Route path="/" element={<Home theme={theme} />} />
          <Route path="/chat/:id" element={<Chat theme={theme} />} />
          <Route path="/test" element={<Test theme={theme} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
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