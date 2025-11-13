// Fix: Replaced the non-standard triple-slash directive with a manual declaration 
// for the Deno global to ensure compatibility with standard TypeScript tooling.
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Follow this guide to create a Supabase edge function:
// https://supabase.com/docs/guides/functions/quickstart

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for preflight and actual requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the user from the token
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
        return new Response(JSON.stringify({ error: 'User not authenticated' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
        });
    }

    // Fetch the Google API key from the provider_credentials table
    // RLS policy should be in place to ensure user can only fetch their own key
    const { data: credential, error: dbError } = await supabaseClient
      .from('provider_credentials')
      .select('api_key')
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .single()

    if (dbError || !credential || !credential.api_key) {
      console.error('Database Error or Key not found:', dbError?.message);
      return new Response(JSON.stringify({ error: 'Google API key not found. Please set it in the Settings page.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const apiKey = credential.api_key;
    const googleApiUrl = `https://texttospeech.googleapis.com/v1/voices?key=${apiKey}`;
    
    // Call the Google TTS API
    const response = await fetch(googleApiUrl);
    const data = await response.json();

    if (!response.ok) {
        const errorMessage = data?.error?.message || `Google API Error: ${response.statusText}`;
        console.error('Google API Error:', errorMessage);
        if (errorMessage.toLowerCase().includes("api key not valid")) {
             return new Response(JSON.stringify({ error: 'The provided Google API Key is invalid.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400, // Using 400 as client needs to fix the key
             })
        }
        throw new Error(errorMessage);
    }

    // Return the list of voices
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Generic Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})