import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ldiiiklxjokzhtnmfjcx.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkaWlpa2x4am9remh0bm1mamN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQyOTc3NywiZXhwIjoyMTAyMDA1Nzc3fQ.IoNtkKtvM_rqgsGcL9uoGD03Vu5t7bVKyYxc90-05dc';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function test() {
  console.log('Testing Supabase REST API connection...');
  const { data, error } = await supabase.from('User').select('*');
  console.log('Result data:', data);
  console.log('Result error:', error);
}

test();
