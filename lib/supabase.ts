
import { createClient } from '@supabase/supabase-js';

// In Vite, environment variables must be prefixed with VITE_ to be accessible
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL 
  || 'https://rwzzmixgxvazvxpvkygv.supabase.co';

const supabaseKey = import.meta.env.VITE_SUPABASE_KEY 
  || 'sb_publishable_pAf8uLK2cT-Vg9sEHgKJ_Q_EnPZVdqu';

export const supabase = createClient(supabaseUrl, supabaseKey);
