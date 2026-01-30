
import { createClient } from '@supabase/supabase-js';

// On Render, these can be set in the Environment Variables dashboard
const supabaseUrl = (typeof process !== 'undefined' && process.env?.SUPABASE_URL) 
  || 'https://rwzzmixgxvazvxpvkygv.supabase.co';

const supabaseKey = (typeof process !== 'undefined' && process.env?.SUPABASE_KEY) 
  || 'sb_publishable_pAf8uLK2cT-Vg9sEHgKJ_Q_EnPZVdqu';

export const supabase = createClient(supabaseUrl, supabaseKey);
