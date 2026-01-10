// Kiểm tra users trong Supabase Auth
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mjwmmttjuaodhhmshvje.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyNDE3MSwiZXhwIjoyMDc4NjAwMTcxfQ.8MJFBFH_Yrm7i6dMLsc3jDbzMIW0ClYvhypjxCwnScw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log('\n=== KIỂM TRA SUPABASE AUTH USERS ===\n');
  
  try {
    // Lấy danh sách users từ Auth
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.log('Lỗi:', error.message);
      return;
    }
    
    console.log(`Tổng số users trong Auth: ${users.length}\n`);
    
    // Tìm các tài khoản test
    const testEmails = ['npp@test.com', 'agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                        'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com', 'admin@admin.com'];
    
    console.log('Tài khoản test trong Auth:');
    console.log('-'.repeat(80));
    
    for (const email of testEmails) {
      const user = users.find(u => u.email === email);
      if (user) {
        console.log(`✓ ${email}`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Role: ${user.user_metadata?.role || 'N/A'}`);
        console.log(`  Created: ${user.created_at}`);
        console.log(`  Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
        console.log('');
      } else {
        console.log(`✗ ${email} - KHÔNG TỒN TẠI trong Auth`);
        console.log('');
      }
    }
    
    console.log('-'.repeat(80));
    console.log('\nTất cả users trong Auth:');
    for (const user of users) {
      console.log(`- ${user.email} (${user.user_metadata?.role || 'no role'}) - ID: ${user.id.substring(0, 8)}...`);
    }
    
  } catch (err) {
    console.log('Error:', err.message);
  }
}

main();
