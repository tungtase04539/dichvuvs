/**
 * Tạo lại admin@admin.com trong Supabase Auth
 * Chạy sau khi đã xóa user corrupt qua SQL
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mjwmmttjuaodhhmshvje.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyNDE3MSwiZXhwIjoyMDc4NjAwMTcxfQ.8MJFBFH_Yrm7i6dMLsc3jDbzMIW0ClYvhypjxCwnScw'
);

async function main() {
  console.log('Creating admin@admin.com in Supabase Auth...\n');

  // 1. Tạo user trong auth
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@admin.com',
    password: 'admin',
    email_confirm: true,
    user_metadata: { name: 'Admin', role: 'admin' }
  });

  if (error) {
    console.log('❌ Error creating auth user:', error.message);
    console.log('\nNếu lỗi "already registered", hãy chạy SQL sau trong Supabase Dashboard:');
    console.log('----------------------------------------');
    console.log(`DELETE FROM auth.identities WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'admin@admin.com'
);
DELETE FROM auth.users WHERE email = 'admin@admin.com';`);
    console.log('----------------------------------------');
    return;
  }

  console.log('✅ Created auth user:', data.user.id);

  // 2. Cập nhật ID trong User table
  const { error: updateError } = await supabase
    .from('User')
    .update({ id: data.user.id })
    .eq('email', 'admin@admin.com');

  if (updateError) {
    console.log('⚠️ Update User table error:', updateError.message);
    console.log('Có thể do foreign key constraint. Thử cập nhật thủ công.');
  } else {
    console.log('✅ Updated User table ID');
  }

  // 3. Test đăng nhập
  console.log('\nTesting login...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'admin@admin.com',
    password: 'admin'
  });

  if (loginError) {
    console.log('❌ Login failed:', loginError.message);
  } else {
    console.log('✅ Login successful!');
    console.log('   User ID:', loginData.user.id);
    console.log('   Email:', loginData.user.email);
  }
}

main();
