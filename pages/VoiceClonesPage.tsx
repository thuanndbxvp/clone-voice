import React, { useState } from 'react';
import { VoiceClone } from '../types';
import FileUploader from '../components/FileUploader';
import { NavLink } from 'react-router-dom';
import { supabase } from '../supabase/client';

const UserStatsHeader: React.FC = () => (
    <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Voice Clones</h1>
            <p className="text-sm text-gray-500">Quản lý và tạo voice clone của bạn</p>
        </div>
        <div className="flex items-center space-x-6 text-sm mt-4 sm:mt-0">
            <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span>Voice Clones: <span className="font-semibold">10 / 100</span></span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                <span>Ký tự: <span className="font-semibold">138539 / 1000000</span></span>
            </div>
            <div className="bg-gray-200 px-3 py-1 rounded-full font-medium">
                Gói: Enterprise
            </div>
        </div>
    </div>
);

const CreateCloneForm: React.FC<{ onCloneCreate: (name: string, description: string, file: File) => void }> = ({ onCloneCreate }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileSelect = (selectedFile: File) => {
        setError('');
        // Validation logic
        const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/x-m4a'];
        if (!allowedTypes.includes(selectedFile.type)) {
            setError('Định dạng file không hợp lệ. Vui lòng chọn MP3, WAV, hoặc M4A.');
            return;
        }
        if (selectedFile.size > 50 * 1024 * 1024) { // 50MB
            setError('Kích thước file không được vượt quá 50MB.');
            return;
        }
        // Duration check would require a library like music-metadata-browser
        // For this demo, we'll assume it's valid.
        setFile(selectedFile);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError('Bạn phải đăng nhập để thực hiện hành động này.');
            setLoading(false);
            return;
        }
        
        const { data: credential, error: dbError } = await supabase
            .from('provider_credentials')
            .select('api_key')
            .eq('user_id', user.id)
            .eq('provider', 'elevenlabs')
            .single();
            
        if (dbError || !credential || !credential.api_key) {
            setError('Vui lòng thiết lập API Key của ElevenLabs trong trang Cài đặt trước khi tạo voice clone.');
            setLoading(false);
            return;
        }

        if (!name || !file) {
            setError('Vui lòng nhập Tên Voice Clone và chọn một file audio.');
            setLoading(false);
            return;
        }

        onCloneCreate(name, description, file);
        // Reset form
        setName('');
        setDescription('');
        setFile(null);
        setLoading(false);
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4 rounded-t-lg flex items-center">
                <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M18 3a1 1 0 00-1.447-.894L4.447 8.106A1 1 0 004 9v2a1 1 0 00.553.894l12.106 6A1 1 0 0018 17V3zM6 10.732V9.268L14.268 5v10L6 10.732z"></path></svg>
                <div>
                    <h2 className="text-lg font-semibold">Tạo Voice Clone Mới</h2>
                    <p className="text-sm opacity-90">Sử dụng engine của ElevenLabs để tạo giọng nói chất lượng cao.</p>
                </div>
            </div>
            
            <div className="p-6">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        {error}
                         {error.includes("Cài đặt") && <NavLink to="/settings" className="font-bold underline ml-2">Đi đến Cài đặt</NavLink>}
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên Voice Clone</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="PhapPhapIndia" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả (Tùy chọn)</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Mô tả chi tiết về voice clone này..."></textarea>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">File Voice</label>
                        <FileUploader 
                            onFileSelect={handleFileSelect} 
                            accept="audio/mpeg,audio/wav,audio/x-m4a"
                            restrictions={['Hỗ trợ MP3, WAV, M4A (tối đa 50MB)', 'Độ dài audio: 11 giây - 40 giây']}
                        />
                        {file && <p className="text-sm text-gray-600 mt-2">Đã chọn: <span className="font-medium">{file.name}</span></p>}
                    </div>
                </div>
                <div className="mt-8 flex justify-end">
                    <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                        {loading ? 'Đang xử lý...' : 'Tạo voice clone'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const VoiceCloneList: React.FC<{ clones: VoiceClone[] }> = ({ clones }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Danh sách Voice Clones</h3>
        <div className="space-y-4">
            {clones.map(clone => (
                <div key={clone.id} className="p-4 border rounded-lg flex flex-wrap items-center justify-between">
                    <div>
                        <p className="font-bold">{clone.name}</p>
                        <p className="text-sm text-gray-600">{clone.description || 'Không có mô tả'}</p>
                        <p className="text-xs text-gray-400 mt-1">Tạo ngày: {new Date(clone.createdAt).toLocaleDateString('vi-VN')} | Ký tự đã dùng: {clone.characterUsage.toLocaleString('vi-VN')}</p>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 md:mt-0">
                        <button className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200">Sử dụng</button>
                        <button className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200">Đổi tên</button>
                        <button className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200">Xóa</button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const Disclaimer: React.FC = () => (
    <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
            <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            </div>
            <div className="ml-3">
                <p className="text-sm font-bold text-yellow-800">ĐIỀU KHOẢN MIỄN TRỪ TRÁCH NHIỆM</p>
                <p className="mt-1 text-sm text-yellow-700">Vui lòng đọc và đồng ý với các điều khoản miễn trừ trách nhiệm trước khi tạo voice clone. Bạn xác nhận rằng bạn có toàn quyền hợp pháp để sử dụng giọng nói được tải lên.</p>
            </div>
        </div>
    </div>
);


const VoiceClonesPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'system' | 'user'>('user');
    
    // Mock data
    const userClones: VoiceClone[] = [
        { id: '1', name: 'My Main Voice', description: 'Giọng đọc chính cho các video', createdAt: '2023-10-26T10:00:00Z', characterUsage: 50234, status: 'ready' },
        { id: '2', name: 'Test Voice ENG', description: 'Giọng tiếng Anh test', createdAt: '2023-10-25T11:30:00Z', characterUsage: 1200, status: 'ready' },
    ];
    
    const handleCreateClone = (name: string, description: string, file: File) => {
        console.log("Creating clone:", { name, description, fileName: file.name });
        // TODO: Call Supabase service to upload file and create DB record.
        // Show loading/progress indicator.
    };

    return (
        <div className="max-w-7xl mx-auto">
            <UserStatsHeader />
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('system')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'system' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        Voice Clones Có Sẵn (0)
                    </button>
                    <button onClick={() => setActiveTab('user')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'user' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        Voice Clones Của Bạn (10)
                    </button>
                </nav>
            </div>
            <div className="mt-8">
                {activeTab === 'user' && (
                    <>
                        <CreateCloneForm onCloneCreate={handleCreateClone} />
                        <VoiceCloneList clones={userClones} />
                        <Disclaimer />
                    </>
                )}
                 {activeTab === 'system' && (
                    <div className="text-center py-12 text-gray-500">
                        <p>Chưa có voice clone có sẵn.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceClonesPage;