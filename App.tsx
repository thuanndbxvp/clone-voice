
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import VoiceClonesPage from './pages/VoiceClonesPage';
import TextToVoicePage from './pages/TextToVoicePage';
import SettingsPage from './pages/SettingsPage';

// Mock user data for demonstration
const mockUser = {
  name: 'Admin',
  avatarUrl: 'https://picsum.photos/100',
  email: 'admin@example.com',
};

const App: React.FC = () => {
  const [user, setUser] = useState<typeof mockUser | null>(mockUser);

  // In a real app, you would use Supabase Auth to manage the user session.
  // For now, we simulate login/logout.
  const handleLogout = () => {
    setUser(null);
    // In a real app: await supabase.auth.signOut();
  };
  
  // A simple login simulation for demonstration
  if (!user) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-4">Đăng nhập</h1>
                <p className="mb-6 text-gray-600">Vui lòng đăng nhập để tiếp tục.</p>
                <button 
                    onClick={() => setUser(mockUser)} 
                    className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                    Đăng nhập với Google (Mô phỏng)
                </button>
            </div>
        </div>
    );
  }

  return (
    <HashRouter>
      <div className="flex h-screen bg-gray-100 font-sans">
        <Sidebar user={user} onLogout={handleLogout} />
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
