import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePrices() {
  console.log('Updating all product prices to 29,000đ...');
  
  const { data, error } = await supabase
    .from('Service')
    .update({ price: 29000 })
    .neq('id', '');
  
  if (error) {
    console.error('Error updating prices:', error);
    return;
  }
  
  // Verify
  const { data: services } = await supabase
    .from('Service')
    .select('name, price');
  
  console.log('\nUpdated prices:');
  services?.forEach((s) => {
    console.log(`  - ${s.name}: ${s.price.toLocaleString('vi-VN')}đ`);
  });
  
  console.log('\n✅ Done! All prices updated to 29,000đ');
}

updatePrices();

