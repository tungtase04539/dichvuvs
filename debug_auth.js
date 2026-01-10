// Debug chi tiết auth.users
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mjwmmttjuaodhhmshvje.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyNDE3MSwiZXhwIjoyMDc4NjAwMTcxfQ.8MJFBFH_Yrm7i6dMLsc3jDbzMIW0ClYvhypjxCwnScw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log('\n=== DEBUG AUTH.USERS ===\n');
  
  // Query trực tiếp auth.users và auth.identities
  const { data: authData, error: authError } = await supabase.rpc('debug_auth_users');
  
  if (authError) {
    console.log('RPC không tồn tại, thử query trực tiếp...\n');
  }
  
  // Kiểm tra chi tiết từng user qua getUserById
  const testUsers = [
    { email: 'npp@test.com', id: '69308392-6a54-4465-8c4c-df001db0578c' },
    { email: 'agent1@test.com', id: '2d1aec5d-53b6-4084-a805-df0824b41dcb' },
    { email: 'ctv1@test.com', id: 'b16993c9-21a7-4629-a8fc-3e023db70594' },
    { email: 'admin@admin.com', id: '7c1d3a05-1734-4c06-bd83-aeba5ad6b60a' },
  ];
  
  for (const tu of testUsers) {
    console.log(`\n--- ${tu.email} ---`);
    
    try {
      const { data, error } = await supabase.auth.admin.getUserById(tu.id);
      
      if (error) {
        console.log(`Lỗi getUserById: ${error.message}`);
      } else if (data.user) {
        const u = data.user;
        console.log(`ID: ${u.id}`);
        console.log(`Email: ${u.email}`);
        console.log(`Role (metadata): ${u.user_metadata?.role || 'N/A'}`);
        console.log(`Confirmed: ${u.email_confirmed_at ? 'Yes' : 'No'}`);
        console.log(`Identities: ${u.identities?.length || 0}`);
        if (u.identities?.length > 0) {
          for (const i of u.identities) {
            console.log(`  - Provider: ${i.provider}, ID: ${i.id?.substring(0, 8)}...`);
          }
        }
      } else {
        console.log('User không tồn tại');
      }
    } catch (err) {
      console.log(`Exception: ${err.message}`);
    }
  }
  
  // So sánh với admin@admin.com (đang hoạt động)
  console.log('\n\n=== SO SÁNH VỚI ADMIN (ĐANG HOẠT ĐỘNG) ===');
  
  const { data: adminData } = await supabase.auth.admin.getUserById('7c1d3a05-1734-4c06-bd83-aeba5ed6b60');
  if (adminData?.user) {
    console.log('\nadmin@admin.com:');
    console.log(JSON.stringify(adminData.user, null, 2));
  }
}

main().catch(console.error);
