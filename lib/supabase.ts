
import { createClient } from '@supabase/supabase-js';

// Safe access to environment variables to prevent "Cannot read properties of undefined" errors.
// In Vite, these are injected at build/dev time. If missing, we fall back to defaults.
const env = (import.meta as any).env || {};

const supabaseUrl = env.VITE_SUPABASE_URL 
  || 'https://rwzzmixgxvazvxpvkygv.supabase.co';

const supabaseKey = env.VITE_SUPABASE_KEY 
  || 'sb_publishable_pAf8uLK2cT-Vg9sEHgKJ_Q_EnPZVdqu';

export const supabase = createClient(supabaseUrl, supabaseKey);
