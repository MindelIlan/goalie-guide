import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://olxbhfzyjrfxzyggdvng.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seGJoZnp5anJmeHp5Z2dkdm5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3MzA0NTEsImV4cCI6MjA1MTMwNjQ1MX0.hpV2Jlx5HmD5c-bE2D44XV_au_oaUvbtRfgdgh3KgxQ';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Improved health check function
export const checkSupabaseHealth = async () => {
  try {
    // Use a lightweight query that doesn't fetch actual data
    const { count, error } = await supabase
      .from('goals')
      .select('*', { count: 'exact', head: true });
      
    if (error) throw error;
    console.log('Supabase connection healthy');
    return true;
  } catch (error) {
    console.error('Supabase health check failed:', error);
    return false;
  }
};