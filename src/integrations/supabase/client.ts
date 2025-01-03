import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://olxbhfzyjrfxzyggdvng.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seGJoZnp5anJmeHp5Z2dkdm5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3MzA0NTEsImV4cCI6MjA1MTMwNjQ1MX0.hpV2Jlx5HmD5c-bE2D44XV_au_oaUvbtRfgdgh3KgxQ";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  }
});