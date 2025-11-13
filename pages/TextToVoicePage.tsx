import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { VoiceClone, TtsJob, TtsSourceType, GoogleTtsVoice } from '../types';
import FileUploader from '../components/FileUploader';
import { NavLink } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { Session } from '@supabase/supabase-js';

type InputTab = 'text' | 'txt' | 'excel';
type TtsProvider = 'clone' | 'google';

interface TextToVoicePageProps {
    session: Session | null;
}

interface TtsFormProps {
    userClones: VoiceClone[];
    session: Session | null;
}

const TtsForm: React.FC<TtsFormProps> = ({ userClones, session }) => {
    const [inputTab, setInputTab] = useState<InputTab>('excel');
    const [ttsProvider, setTtsProvider] = useState<TtsProvider>('google');
    const [text, setText] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedCloneId, setSelectedCloneId] = useState<string>('');
    const [language, setLanguage] = useState('Vietnamese');
    const [segmentSize, setSegmentSize] = useState(300);
    const [rowCount, setRowCount] = useState(0);

    const [googleVoices, setGoogleVoices] = useState<GoogleTtsVoice[]>([]);
    const [isLoadingVoices, setIsLoadingVoices] = useState(false);
    const [voiceError, setVoiceError] = useState<string | null>(null);
    const [selectedLanguageFilter, setSelectedLanguageFilter] = useState('vi-VN');
    const [selectedGenderFilter, setSelectedGenderFilter] = useState<'ALL' | 'FEMALE' | 'MALE' | 'NEUTRAL'>('ALL');
    const [selectedGoogleVoice, setSelectedGoogleVoice] = useState('');

    const fetchGoogleVoices = useCallback(async () => {
        setIsLoadingVoices(true);
        setVoiceError(null);
        try {
            let voicesData: any;
            if (session) {
                const { data, error } = await supabase.functions.invoke('google-tts-voices');
                if (error) {
                    if (error.message.includes('Function not found')) throw new Error('Endpoint không tồn tại.');
                    const errorJson = JSON.parse(error.message);
                    throw new Error(errorJson.error);
                }
                voicesData = data;
            } else {
                const apiKey = localStorage.getItem('google_api_key');
                if (!apiKey) {
                    throw new Error('API key not found');
                }
                const googleApiUrl = `https://texttospeech.googleapis.com/v1/voices?key=${apiKey}`;
                const response = await fetch(googleApiUrl);
                const data = await response.json();
                if (!response.ok) {
                    const errorMessage = data?.error?.message || `Google API Error: ${response.statusText}`;
                    if (errorMessage.toLowerCase().includes("api key not valid")) {
                        throw new Error('invalid');
                    }
                    throw new Error(errorMessage);
                }
                voicesData = data;
            }

            if (voicesData.voices && Array.isArray(voicesData.voices)) {
                setGoogleVoices(voicesData.voices);
            } else {
                throw new Error('Định dạng phản hồi từ server không hợp lệ.');
            }
        } catch (error) {
             let finalErrorMessage = 'Không thể tải danh sách giọng nói.';
            if (error instanceof Error) {
                if (error.message.includes('API key not found')) {
                    finalErrorMessage = 'Vui lòng cấu hình Google Cloud API Key trong Cài đặt để tải danh sách giọng nói';
                } else if (error.message.includes('invalid')) {
                    finalErrorMessage = 'API Key không hợp lệ. Vui lòng kiểm tra lại';
                } else {
                    finalErrorMessage = error.message;
                }
            }
            setVoiceError(finalErrorMessage);
            setGoogleVoices([]);
        } finally {
            setIsLoadingVoices(false);
        }
    }, [session]);

    const handleGoogleProviderClick = useCallback(() => {
        setTtsProvider('google');
        fetchGoogleVoices();
    }, [fetchGoogleVoices]);

    useEffect(() => {
        if (ttsProvider === 'google') {
            fetchGoogleVoices();
        }
    }, [ttsProvider, fetchGoogleVoices]); 

    const availableLanguages = useMemo(() => {
        const langSet = new Set(googleVoices.flatMap(v => v.languageCodes));
        return Array.from(langSet).sort();
    }, [googleVoices]);

    const filteredVoices = useMemo(() => {
        if (googleVoices.length === 0) return [];
        return googleVoices.filter(voice => {
            const langMatch = voice.languageCodes.includes(selectedLanguageFilter);
            const genderMatch = selectedGenderFilter !== 'ALL' ? voice.ssmlGender === selectedGenderFilter : true;
            return langMatch && genderMatch;
        });
    }, [googleVoices, selectedLanguageFilter, selectedGenderFilter]);


    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        if (inputTab === 'excel') setRowCount(50); // Mock
        if (inputTab === 'txt') setRowCount(25); // Mock
    };

    const handleGenerate = async () => {
        if(ttsProvider === 'google' && googleVoices.length === 0) {
            setVoiceError('Vui lòng cấu hình Google Cloud API Key và tải danh sách giọng nói trước.');
            return;
        }

        if (inputTab === 'text' && !text) { alert('Vui lòng nhập text'); return; }
        if (inputTab !== 'text' && !selectedFile) { alert('Vui lòng chọn file'); return; }

        if (ttsProvider === 'clone' && !selectedCloneId) {
            alert('Vui lòng chọn một voice clone');
            return;
        }
        if (ttsProvider === 'google' && !selectedGoogleVoice) {
            alert('Vui lòng chọn một giọng Google TTS');
            return;
        }

        console.log('Generating voice with:', {
            provider: ttsProvider,
            source: inputTab,
            cloneId: selectedCloneId,
            googleVoice: selectedGoogleVoice,
            language,
            segmentSize,
        });
    };

    const renderInputArea = () => {
        switch (inputTab) {
            case 'text':
                return <textarea value={text} onChange={e => setText(e.target.value)} rows={8} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Nhập nội dung của bạn vào đây..."></textarea>;
            case 'txt':
                return <FileUploader onFileSelect={handleFileSelect} accept=".txt" restrictions={['Mỗi dòng trong file sẽ được xử lý riêng.']} />;
            case 'excel':
                return <FileUploader onFileSelect={handleFileSelect} accept=".xlsx, .xls" restrictions={['Mỗi hàng trong Excel sẽ được xử lý như một text riêng biệt (chỉ đọc cột đầu tiên - cột A).']} />;
        }
    }
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-1">Tạo Voice</h2>
            <p className="text-sm text-gray-500 mb-4">Tạo voice từ text bằng engine Google/Gemini.</p>
            
            <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setInputTab('text')} className={`py-2 px-1 text-sm font-medium ${inputTab === 'text' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Nhập Text</button>
                    <button onClick={() => setInputTab('txt')} className={`py-2 px-1 text-sm font-medium ${inputTab === 'txt' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Upload File TXT</button>
                    <button onClick={() => setInputTab('excel')} className={`py-2 px-1 text-sm font-medium ${inputTab === 'excel' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Import File Excel</button>
                </nav>
            </div>

            <div className="min-h-[150px] mb-6">
                {renderInputArea()}
                {selectedFile && inputTab !== 'text' && <p className="text-sm text-gray-600 mt-2">Đã chọn: <span className="font-medium">{selectedFile.name}</span></p>}
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chọn nguồn giọng</label>
                     <div className="space-y-4">
                        <div
                            onClick={() => setTtsProvider('clone')}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${ttsProvider === 'clone' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
                        >
                             <h3 className="font-semibold text-gray-800">Sử dụng Voice Clone</h3>
                        </div>

                        <div
                            onClick={handleGoogleProviderClick}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${ttsProvider === 'google' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
                        >
                            <h3 className="font-semibold text-gray-800">Chọn giọng Google TTS</h3>
                            
                            {ttsProvider === 'google' && (
                                <div className="mt-3">
                                    {isLoadingVoices && <p className="text-sm text-gray-500">Đang tải danh sách giọng nói...</p>}
                                    {voiceError && (
                                        <p className="text-sm text-red-600">
                                            {voiceError}.{' '}
                                            {voiceError.includes("Cài đặt") &&
                                            <NavLink to="/settings" className="font-bold underline hover:text-red-700">
                                                Đi đến Cài đặt
                                            </NavLink>
                                            }
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {ttsProvider === 'clone' && (
                     <div className="pt-4 border-t">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chọn voice clone của bạn</label>
                        <select value={selectedCloneId} onChange={e => setSelectedCloneId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="">-- Chọn voice clone --</option>
                            {userClones.map(clone => <option key={clone.id} value={clone.id}>{clone.name}</option>)}
                        </select>
                    </div>
                )}

                {ttsProvider === 'google' && !voiceError && !isLoadingVoices && googleVoices.length > 0 && (
                    <div className="pt-4 border-t">
                         <div className="flex justify-between items-center mb-4">
                             <h3 className="text-md font-semibold text-gray-800">Tùy chọn giọng Google TTS</h3>
                             <button onClick={fetchGoogleVoices} disabled={isLoadingVoices} className="text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50 flex items-center">
                                <svg className={`w-4 h-4 mr-1 ${isLoadingVoices ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.691L7.98 12.075M12 21a9 9 0 110-18 9 9 0 010 18z" /></svg>
                                {isLoadingVoices ? 'Đang tải...' : 'Làm mới'}
                             </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngôn ngữ</label>
                                <select value={selectedLanguageFilter} onChange={e => setSelectedLanguageFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm">
                                    {availableLanguages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                                <select value={selectedGenderFilter} onChange={e => setSelectedGenderFilter(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm">
                                    <option value="ALL">Tất cả</option>
                                    <option value="FEMALE">Nữ</option>
                                    <option value="MALE">Nam</option>
                                    <option value="NEUTRAL">Trung tính</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giọng đọc</label>
                                <select value={selectedGoogleVoice} onChange={e => setSelectedGoogleVoice(e.target.value)} className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm" disabled={filteredVoices.length === 0}>
                                    <option value="">-- Chọn giọng đọc --</option>
                                    {filteredVoices.map(voice => <option key={voice.name} value={voice.name}>{voice.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 pt-6 border-t">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngôn ngữ Output</label>
                    <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                        <option>Vietnamese (Tiếng Việt)</option>
                        <option>English (Tiếng Anh)</option>
                        <option>Thai (Tiếng Thái)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kích thước phân đoạn (ký tự)</label>
                    <input type="number" value={segmentSize} onChange={e => setSegmentSize(parseInt(e.target.value))} min="100" max="300" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    <p className="text-xs text-gray-500 mt-1">Tối thiểu: 100, Tối đa: 300 ký tự</p>
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={handleGenerate} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Generate Voice ({rowCount} row)
                </button>
            </div>
        </div>
    );
};

const TtsHistory: React.FC<{ jobs: TtsJob[] }> = ({ jobs }) => (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Lịch sử Voice</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voice Clone</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nguồn</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ký tự/Dòng</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {jobs.map(job => (
                        <tr key={job.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(job.createdAt).toLocaleString('vi-VN')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.voiceCloneName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.sourceType}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.characterCount.toLocaleString('vi-VN')} / {job.rowCount || 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.status === 'completed' ? 'bg-green-100 text-green-800' : job.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                    {job.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {job.status === 'completed' && (
                                    <div className="flex items-center justify-end space-x-3">
                                        <button className="text-indigo-600 hover:text-indigo-900">Nghe</button>
                                        <a href={job.audioUrl} download className="text-indigo-600 hover:text-indigo-900">Tải về</a>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);


const TextToVoicePage: React.FC<TextToVoicePageProps> = ({ session }) => {
    // Mock Data
    const mockUserClones: VoiceClone[] = [
        { id: '1', name: 'My Main Voice', createdAt: '203-10-26T10:00:00Z', characterUsage: 50234, status: 'ready' },
        { id: '2', name: 'Test Voice ENG', createdAt: '2023-10-25T11:30:00Z', characterUsage: 1200, status: 'ready' },
        { id: '3', name: 'Giọng đọc truyện', createdAt: '2023-10-24T09:00:00Z', characterUsage: 87500, status: 'ready' },
    ];

    const mockTtsJobs: TtsJob[] = [
        { id: 'job1', createdAt: '2023-10-26T14:30:00Z', voiceCloneName: 'My Main Voice', sourceType: TtsSourceType.EXCEL, characterCount: 12500, rowCount: 45, status: 'completed', audioUrl: '#' },
        { id: 'job2', createdAt: '2023-10-26T11:00:00Z', voiceCloneName: 'My Main Voice', sourceType: TtsSourceType.TEXT, characterCount: 300, status: 'completed', audioUrl: '#' },
        { id: 'job3', createdAt: '2023-10-25T16:00:00Z', voiceCloneName: 'Giọng đọc truyện', sourceType: TtsSourceType.TXT, characterCount: 45000, rowCount: 150, status: 'failed' },
        { id: 'job4', createdAt: '2023-10-26T15:00:00Z', voiceCloneName: 'Test Voice ENG', sourceType: TtsSourceType.TEXT, characterCount: 500, status: 'processing' },
    ];
    
    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Text to Voice</h1>
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
                 <span>Ký tự còn lại: <span className="font-semibold text-green-600">9,859,259</span></span>
                 <span>Đã sử dụng: <span className="font-semibold">140741 / 10000000</span></span>
            </div>
            
            <TtsForm userClones={mockUserClones} session={session} />
            <TtsHistory jobs={mockTtsJobs} />
        </div>
    );
};

export default TextToVoicePage;