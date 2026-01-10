// Lấy đúng IDs từ database
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mjwmmttjuaodhhmshvje.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyNDE3MSwiZXhwIjoyMDc4NjAwMTcxfQ.8MJFBFH_Yrm7i6dMLsc3jDbzMIW0ClYvhypjxCwnScw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log('\n=== LẤY ĐÚNG IDs TỪ DATABASE ===\n');
  
  // Lấy từ bảng User
  const { data: users } = await supabase
    .from('User')
    .select('id, email, role')
    .in('email', ['admin@admin.com', 'npp@test.com', 'agent1@test.com', 'ctv1@test.com'])
    .order('email');
  
  console.log('Từ bảng User (Prisma):');
  for (const u of users || []) {
    console.log(`${u.email}: ${u.id} (${u.role})`);
  }
  
  // Lấy từ auth.users qua RPC
  console.log('\nTừ auth.users (qua RPC get_all_users):');
  const { data: authUsers } = await supabase.rpc('get_all_users');
  
  const testEmails = ['admin@admin.com', 'npp@test.com', 'agent1@test.com', 'ctv1@test.com'];
  for (const email of testEmails) {
    const au = authUsers?.find(u => u.email === email);
    if (au) {
      console.log(`${email}: ${au.id}`);
    } else {
      console.log(`${email}: KHÔNG TÌM THẤY`);
    }
  }
  
  // So sánh IDs
  console.log('\n=== SO SÁNH IDs ===');
  for (const email of testEmails) {
    const dbUser = users?.find(u => u.email === email);
    const authUser = authUsers?.find(u => u.email === email);
    
    const dbId = dbUser?.id || 'N/A';
    const authId = authUser?.id || 'N/A';
    const match = dbId === authId ? '✓ MATCH' : '✗ MISMATCH';
    
    console.log(`\n${email}:`);
    console.log(`  DB:   ${dbId}`);
    console.log(`  Auth: ${authId}`);
    console.log(`  ${match}`);
  }
}

main().catch(console.error);
