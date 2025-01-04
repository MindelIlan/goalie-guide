import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://olxbhfzyjrfxzyggdvng.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seGJoZnp5anJmeHp5Z2dkdm5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY4OTQxNjAsImV4cCI6MjAyMjQ3MDE2MH0.2eX5WnxqMUlkLcvkTRqpZHMxk8XsQd_U-xtAiLGCBhY';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Cache-Control': 'no-cache'
    }
  }
});

// Helper function to check Supabase health
export const checkSupabaseHealth = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) throw error;
    console.log('Supabase connection healthy');
    return true;
  } catch (error) {
    console.error('Supabase health check failed:', error);
    return false;
  }
};

// Helper function to check authentication status
export const checkAuthStatus = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session?.user;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
};