import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your actual Supabase URL and Anon Key
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

if (supabaseUrl === 'https://your-project-id.supabase.co' || supabaseAnonKey === 'your-supabase-anon-key') {
    console.warn('Supabase URL and Anon Key are not set. Please replace the placeholder values in supabase/client.ts. The application will not function correctly until you do so.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);