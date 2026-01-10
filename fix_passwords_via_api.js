// Fix passwords qua Supabase Admin API
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mjwmmttjuaodhhmshvje.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyNDE3MSwiZXhwIjoyMDc4NjAwMTcxfQ.8MJFBFH_Yrm7i6dMLsc3jDbzMIW0ClYvhypjxCwnScw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const testAccounts = [
  { email: 'agent1@test.com', password: '0902000001', id: '2d1aec5d-53b6-4084-a805-df0824b41dcb' },
  { email: 'agent2@test.com', password: '0902000002', id: '1fa13183-4efe-4fcb-9f28-f03b97fa88dc' },
  { email: 'agent3@test.com', password: '0902000003', id: '1b1d17e9-6eae-4151-8015-901e8ec04d72' },
  { email: 'ctv1@test.com', password: '0903000001', id: 'b16993c9-21a7-4629-a8fc-3e023db70594' },
  { email: 'ctv2@test.com', password: '0903000002', id: '923e8908-e47e-48e1-b4de-fb34f3542a91' },
  { email: 'ctv3@test.com', password: '0903000003', id: 'f6d33795-c074-4e38-b661-05a32dcd18f5' },
];

async function main() {
  console.log('\n=== FIX PASSWORDS QUA ADMIN API ===\n');
  
  for (const acc of testAccounts) {
    console.log(`\nXử lý: ${acc.email}`);
    
    try {
      // Thử update password
      const { data, error } = await supabase.auth.admin.updateUserById(acc.id, {
        password: acc.password,
        email_confirm: true
      });
      
      if (error) {
        console.log(`  ✗ Lỗi: ${error.message}`);
      } else {
        console.log(`  ✓ Đã update password`);
      }
    } catch (err) {
      console.log(`  ✗ Exception: ${err.message}`);
    }
  }
  
  console.log('\n=== HOÀN TẤT ===\n');
}

main().catch(console.error);
