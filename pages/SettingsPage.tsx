import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { Session } from '@supabase/supabase-js';

interface SettingsPageProps {
  session: Session | null;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ session }) => {
    const [elevenLabsKey, setElevenLabsKey] = useState('');
    const [geminiKey, setGeminiKey] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchKeys = async () => {
            setLoading(true);
            if (session) {
                const { data, error } = await supabase
                    .from('provider_credentials')
                    .select('provider, api_key')
                    .eq('user_id', session.user.id);

                if (error) {
                    console.error('Error fetching API keys:', error);
                    setMessage(`Lỗi khi tải API keys: ${error.message}`);
                } else if (data) {
                    const elevenLabs = data.find(c => c.provider === 'elevenlabs');
                    const google = data.find(c => c.provider === 'google');
                    setElevenLabsKey(elevenLabs?.api_key || '');
                    setGeminiKey(google?.api_key || '');
                }
            } else {
                setElevenLabsKey(localStorage.getItem('elevenlabs_api_key') || '');
                setGeminiKey(localStorage.getItem('google_api_key') || '');
            }
            setLoading(false);
        };
        fetchKeys();
    }, [session]);

    const handleSave = async () => {
        setSaving(true);
        if (session) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setMessage('Lỗi: Không tìm thấy người dùng. Vui lòng đăng nhập lại.');
                setSaving(false);
                return;
            }

            const credentials = [
                { user_id: user.id, provider: 'elevenlabs', api_key: elevenLabsKey },
                { user_id: user.id, provider: 'google', api_key: geminiKey }
            ];

            const { error } = await supabase.from('provider_credentials').upsert(credentials, {
                onConflict: 'user_id, provider'
            });

            if (error) {
                setMessage(`Lỗi khi lưu: ${error.message}`);
            } else {
                setMessage('API Keys đã được lưu thành công!');
            }
        } else {
            localStorage.setItem('elevenlabs_api_key', elevenLabsKey);
            localStorage.setItem('google_api_key', geminiKey);
            setMessage('API Keys đã được lưu vào bộ nhớ cục bộ của trình duyệt.');
        }
        setSaving(false);
        setTimeout(() => setMessage(''), 3000);
    };

    const getDisplayKey = (key: string) => {
        if (!key) return 'Chưa thiết lập';
        return `****-****-****-${key.slice(-4)}`;
    };

    if (loading) {
        return (
             <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800">Cài đặt API</h1>
                 <div className="mt-6 text-center">Đang tải cài đặt...</div>
             </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800">Cài đặt API</h1>
            <p className="text-sm text-gray-500 mt-1 mb-6">
                Thiết lập API Key để sử dụng cho các dịch vụ xử lý. 
                {!session && " Khi chưa đăng nhập, keys sẽ được lưu tại trình duyệt của bạn."}
                {session && " API Keys của bạn được lưu trữ an toàn trong cơ sở dữ liệu."}
            </p>

            {message && (
                <div className={`p-4 mb-6 rounded-md ${message.startsWith('Lỗi') ? 'bg-red-100 border-l-4 border-red-500 text-red-700' : 'bg-green-100 border-l-4 border-green-500 text-green-700'}`} role="alert">
                    <p>{message}</p>
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-8">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">ElevenLabs API</h2>
                    <p className="text-sm text-gray-600 mt-1">Sử dụng để Clone Voice. Bạn có thể lấy API key từ trang quản trị của ElevenLabs.</p>
                    <div className="mt-4">
                        <label htmlFor="elevenlabs-key" className="block text-sm font-medium text-gray-700">
                            API Key
                        </label>
                        <input
                            type="password"
                            id="elevenlabs-key"
                            value={elevenLabsKey}
                            onChange={(e) => setElevenLabsKey(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Nhập API Key của bạn"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            Trạng thái hiện tại: <span className="font-medium">{getDisplayKey(elevenLabsKey)}</span>
                        </p>
                    </div>
                </div>

                <div className="border-t border-gray-200"></div>

                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Google Cloud API (TTS & Gemini)</h2>
                    <p className="text-sm text-gray-600 mt-1">Sử dụng cho chức năng Text to Speech (TTS). Bạn có thể lấy API key từ Google Cloud Console.</p>
                    <div className="mt-4">
                        <label htmlFor="gemini-key" className="block text-sm font-medium text-gray-700">
                            API Key
                        </label>
                        <input
                            type="password"
                            id="gemini-key"
                            value={geminiKey}
                            onChange={(e) => setGeminiKey(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Nhập API Key của bạn"
                        />
                         <p className="mt-2 text-xs text-gray-500">
                            Trạng thái hiện tại: <span className="font-medium">{getDisplayKey(geminiKey)}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </div>
            
            {session && (
                 <div className="mt-8 text-sm text-gray-600 bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800">Về việc thiết lập cơ sở dữ liệu</h3>
                    <p className="mt-2">Để tính năng này hoạt động, bạn cần tạo một bảng tên là `provider_credentials` trong Supabase với các cột sau:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>`id` (uuid, primary key)</li>
                        <li>`user_id` (uuid, foreign key to `auth.users.id`)</li>
                        <li>`provider` (text, ví dụ: 'google', 'elevenlabs')</li>
                        <li>`api_key` (text)</li>
                        <li>`created_at` (timestamp with time zone)</li>
                    </ul>
                    <p className="mt-2">Bạn cũng cần tạo một ràng buộc UNIQUE trên (`user_id`, `provider`) và kích hoạt Row Level Security (RLS) để đảm bảo người dùng chỉ có thể truy cập key của chính họ.</p>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
