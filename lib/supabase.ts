
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rwzzmixgxvazvxpvkygv.supabase.co';
const supabaseKey = 'sb_publishable_pAf8uLK2cT-Vg9sEHgKJ_Q_EnPZVdqu';

export const supabase = createClient(supabaseUrl, supabaseKey);
