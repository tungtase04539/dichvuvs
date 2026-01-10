// Kiểm tra trực tiếp auth.users qua RPC
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mjwmmttjuaodhhmshvje.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyNDE3MSwiZXhwIjoyMDc4NjAwMTcxfQ.8MJFBFH_Yrm7i6dMLsc3jDbzMIW0ClYvhypjxCwnScw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log('\n=== KIỂM TRA AUTH.USERS TRỰC TIẾP ===\n');
  
  // Thử query trực tiếp auth.users qua service role
  const { data, error } = await supabase.rpc('get_all_users');
  
  if (error) {
    console.log('Lỗi RPC get_all_users:', error.message);
    console.log('\nThử cách khác...\n');
  } else {
    console.log('Users từ RPC:', data?.length || 0);
    if (data) {
      for (const u of data) {
        console.log(`- ${u.email} (${u.raw_user_meta_data?.role || 'no role'})`);
      }
    }
  }
  
  // Thử listUsers qua Admin API
  console.log('\n--- Thử Admin API listUsers ---\n');
  try {
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.log('Lỗi listUsers:', listError.message);
    } else {
      console.log(`Tìm thấy ${users.length} users trong auth.users:\n`);
      
      const testEmails = ['admin@admin.com', 'npp@test.com', 'agent1@test.com', 'agent2@test.com', 
                          'agent3@test.com', 'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com'];
      
      for (const email of testEmails) {
        const user = users.find(u => u.email === email);
        if (user) {
          console.log(`✓ ${email}`);
          console.log(`  ID: ${user.id}`);
          console.log(`  Role: ${user.user_metadata?.role || 'N/A'}`);
          console.log(`  Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
        } else {
          console.log(`✗ ${email} - KHÔNG TỒN TẠI`);
        }
      }
      
      console.log('\n--- Tất cả users ---');
      for (const u of users) {
        console.log(`- ${u.email} (${u.user_metadata?.role || 'no role'}) - ID: ${u.id.substring(0, 8)}...`);
      }
    }
  } catch (err) {
    console.log('Exception:', err.message);
  }
}

main().catch(console.error);
