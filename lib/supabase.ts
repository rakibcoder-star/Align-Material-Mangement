import { createClient } from '@supabase/supabase-js';

// Safe access to environment variables to prevent "Cannot read properties of undefined" errors.
// In a standard Vite build, these are injected. If the bundler is bypassed, we use defaults.
const getEnv = () => {
  try {
    return (import.meta as any).env || {};
  } catch {
    return {};
  }
};

const env = getEnv();

const supabaseUrl = env.VITE_SUPABASE_URL 
  || 'https://rwzzmixgxvazvxpvkygv.supabase.co';

const supabaseKey = env.VITE_SUPABASE_KEY 
  || 'sb_publishable_pAf8uLK2cT-Vg9sEHgKJ_Q_EnPZVdqu';

export const supabase = createClient(supabaseUrl, supabaseKey);