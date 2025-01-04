import { createClient } from '@supabase/supabase-js';

// Check if environment variables are defined
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true
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