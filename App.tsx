import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import VoiceClonesPage from './pages/VoiceClonesPage';
import TextToVoicePage from './pages/TextToVoicePage';
import SettingsPage from './pages/SettingsPage';
import { supabase } from './supabase/client';
import { Session } from '@supabase/supabase-js';

const LoginPage: React.FC = () => {
    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-sm w-full">
                <h1 className="text-2xl font-bold mb-4">Chào mừng tới StudyAI86 TTS</h1>
                <p className="mb-6 text-gray-600">Vui lòng đăng nhập để tiếp tục.</p>
                <button 
                    onClick={handleLogin} 
                    className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                    Đăng nhập với Google
                </button>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
    });

    return () => {
        authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  
  if (loading) {
      return <div className="flex items-center justify-center h-screen">Đang tải...</div>
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <HashRouter>
      <div className="flex h-screen bg-gray-100 font-sans">
        <Sidebar user={session.user} onLogout={handleLogout} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/voice-clones" replace />} />
              <Route path="/voice-clones" element={<VoiceClonesPage />} />
              <Route path="/text-to-voice" element={<TextToVoicePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* Add other routes here */}
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
