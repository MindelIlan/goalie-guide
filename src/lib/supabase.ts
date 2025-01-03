import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://olxbhfzyjrfxzyggdvng.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seGJoZnp5anJmeHp5Z2dkdm5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3MzA0NTEsImV4cCI6MjA1MTMwNjQ1MX0.hpV2Jlx5HmD5c-bE2D44XV_au_oaUvbtRfgdgh3KgxQ';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Improved health check function with better error handling
export const checkSupabaseHealth = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No active session found');
      return false;
    }

    const { data, error } = await supabase.from('goals')
      .select('count', { count: 'exact', head: true });
      
    if (error) {
      console.error('Supabase health check failed:', error);
      return false;
    }
    
    console.log('Supabase connection healthy');
    return true;
  } catch (error) {
    console.error('Supabase health check failed:', error);
    return false;
  }
};

// Add a helper function to check auth status
export const checkAuthStatus = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Auth status check failed:', error);
      return false;
    }
    return !!session;
  } catch (error) {
    console.error('Auth status check failed:', error);
    return false;
  }
};