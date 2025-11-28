import { createClient } from '@supabase/supabase-js';

// Replace these with the values from your Supabase Dashboard -> Settings -> API
const supabaseUrl = 'https://aoeuetmhsqkclaktjvrt.supabase.co';
const supabaseKey = 'sb_publishable_gh7gpntNX9GagZwyTZCBfw_OBCVgsOC';

export const supabase = createClient(supabaseUrl, supabaseKey);