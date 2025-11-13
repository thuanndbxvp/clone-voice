export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  voiceCloneCount: number;
  voiceCloneLimit: number;
  characterCount: number;
  characterLimit: number;
}

export interface VoiceClone {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  characterUsage: number;
  status: 'processing' | 'ready' | 'error';
}

export enum TtsSourceType {
  TEXT = 'Text',
  TXT = 'TXT',
  EXCEL = 'Excel',
}

export interface TtsJob {
  id: string;
  createdAt: string;
  voiceCloneName: string;
  sourceType: TtsSourceType;
  characterCount: number;
  rowCount?: number;
  status: 'processing' | 'completed' | 'failed';
  audioUrl?: string;
}

// Added for Google TTS Voices
export interface GoogleTtsVoice {
  name: string;
  languageCodes: string[];
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  naturalSampleRateHertz: number;
}
