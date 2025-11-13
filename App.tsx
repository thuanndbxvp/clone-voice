import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import VoiceClonesPage from './pages/VoiceClonesPage';
import TextToVoicePage from './pages/TextToVoicePage';
import SettingsPage from './pages/SettingsPage';
import { supabase } from './supabase/client';
import { Session } from '@supabase/supabase-js';

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

  return (
    <HashRouter>
      <div className="flex h-screen bg-gray-100 font-sans">
        <Sidebar user={session?.user || null} onLogout={handleLogout} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/voice-clones" replace />} />
              <Route path="/voice-clones" element={<VoiceClonesPage session={session} />} />
              <Route path="/text-to-voice" element={<TextToVoicePage session={session} />} />
              <Route path="/settings" element={<SettingsPage session={session} />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;