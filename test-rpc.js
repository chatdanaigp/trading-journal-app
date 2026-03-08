const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function test() {
  console.log('Testing RPC with dates...');
  let res1 = await supabase.rpc('get_leaderboard', { start_date: '2026-03-01', end_date: '2026-03-31' });
  console.log('With dates error:', res1.error);

  console.log('\nTesting RPC without dates (fallback)...');
  let res2 = await supabase.rpc('get_leaderboard');
  console.log('Fallback error:', res2.error);
  if (!res2.error) {
    console.log('Fallback Data Length:', res2.data?.length);
  }
}
test();
