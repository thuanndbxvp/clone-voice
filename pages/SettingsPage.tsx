import React, { useState, useEffect } from 'react';

const SettingsPage: React.FC = () => {
    const [elevenLabsKey, setElevenLabsKey] = useState('');
    const [geminiKey, setGeminiKey] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const savedElevenLabsKey = localStorage.getItem('elevenLabsApiKey') || '';
        const savedGeminiKey = localStorage.getItem('geminiApiKey') || '';
        setElevenLabsKey(savedElevenLabsKey);
        setGeminiKey(savedGeminiKey);
    }, []);

    const handleSave = () => {
        localStorage.setItem('elevenLabsApiKey', elevenLabsKey);
        localStorage.setItem('geminiApiKey', geminiKey);
        setMessage('API Keys đã được lưu thành công!');
        setTimeout(() => setMessage(''), 3000);
    };

    const getDisplayKey = (key: string) => {
        if (!key) return 'Chưa thiết lập';
        return `****-****-****-${key.slice(-4)}`;
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800">Cài đặt API</h1>
            <p className="text-sm text-gray-500 mt-1 mb-6">
                Thiết lập API Key để sử dụng cho các dịch vụ xử lý. API Keys của bạn được lưu trữ an toàn ngay trên trình duyệt.
            </p>

            {message && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
                    <p>{message}</p>
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-8">
                {/* ElevenLabs Settings */}
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

                {/* Google/Gemini Settings */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Google Cloud API (TTS & Gemini)</h2>
                    <p className="text-sm text-gray-600 mt-1">Sử dụng cho chức năng Text to Speech (TTS) và các tính năng khác của Gemini. Bạn có thể lấy API key từ Google AI Studio hoặc Google Cloud Console.</p>
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
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Lưu thay đổi
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
