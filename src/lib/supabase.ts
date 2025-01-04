import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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