// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://olxbhfzyjrfxzyggdvng.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seGJoZnp5anJmeHp5Z2dkdm5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3MzA0NTEsImV4cCI6MjA1MTMwNjQ1MX0.hpV2Jlx5HmD5c-bE2D44XV_au_oaUvbtRfgdgh3KgxQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);