import React from 'react';
import { NavLink } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
}

const LogoIcon = () => (
    <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path d="M12 10.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
        <path d="M12 7.5c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 8c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
    </svg>
);

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
  { name: 'Packages', path: '/packages', icon: 'M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 0h-4V4h4v2z' },
  { name: 'Voice Clones', path: '/voice-clones', icon: 'M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H8v-2h4V8h2v4h4v2z' },
  { name: 'Text to Voice', path: '/text-to-voice', icon: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 12H5V8h10v8z' },
  { name: 'Cài đặt', path: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

const adminItems = [
    { name: 'Admin Panel', path: '/admin', icon: 'M13 13h-2v-2h2v2zm0-4h-2V7h2v2zm4 4h-2v-2h2v2zM3 21h18V3H3v18zM5 5h14v14H5V5z' },
]

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const baseLinkClass = "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors";
  const inactiveLinkClass = "text-gray-300 hover:bg-gray-700 hover:text-white";
  const activeLinkClass = "bg-gray-900 text-white";
  
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
        provider: 'google',
    });
  };

  const UserProfileSection: React.FC = () => {
    if (!user) {
        return (
             <div className="px-4 py-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-3">Bạn đang dùng với tư cách khách. Đăng nhập để lưu dữ liệu.</p>
                <button 
                    onClick={handleLogin} 
                    className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                    Đăng nhập với Google
                </button>
            </div>
        )
    }

    const userName = user.user_metadata?.full_name || user.email;
    const avatarUrl = user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'A')}&background=random`;
    
    return (
        <div className="px-4 py-4 border-t border-gray-700">
            <div className="flex items-center">
            <img className="h-10 w-10 rounded-full object-cover" src={avatarUrl} alt="User Avatar" />
            <div className="ml-3">
                <p className="text-sm font-medium text-white truncate">{userName}</p>
            </div>
            </div>
            <button onClick={onLogout} className="w-full mt-4 flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Đăng xuất
            </button>
        </div>
    );
  };

  return (
    <div className="flex flex-col w-64 bg-gray-800 text-white">
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <LogoIcon/>
        <span className="ml-3 text-xl font-semibold">StudyAI86 TTS</span>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
          >
            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
            {item.name}
          </NavLink>
        ))}
        <div className="pt-4">
            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Quản trị</h3>
            <div className="mt-2 space-y-2">
            {adminItems.map(item => (
                <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
                >
                    <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
                    {item.name}
                </NavLink>
            ))}
            </div>
        </div>
      </nav>
      <UserProfileSection />
    </div>
  );
};

export default Sidebar;
