// Tạo users mới qua Supabase Admin API
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mjwmmttjuaodhhmshvje.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyNDE3MSwiZXhwIjoyMDc4NjAwMTcxfQ.8MJFBFH_Yrm7i6dMLsc3jDbzMIW0ClYvhypjxCwnScw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const testAccounts = [
  { email: 'agent1@test.com', password: '0902000001', role: 'agent', name: 'Đại Lý 1' },
  { email: 'agent2@test.com', password: '0902000002', role: 'agent', name: 'Đại Lý 2' },
  { email: 'agent3@test.com', password: '0902000003', role: 'agent', name: 'Đại Lý 3' },
  { email: 'ctv1@test.com', password: '0903000001', role: 'collaborator', name: 'CTV 1' },
  { email: 'ctv2@test.com', password: '0903000002', role: 'collaborator', name: 'CTV 2' },
  { email: 'ctv3@test.com', password: '0903000003', role: 'collaborator', name: 'CTV 3' },
];

async function main() {
  console.log('\n=== TẠO USERS QUA ADMIN API ===\n');
  
  for (const acc of testAccounts) {
    console.log(`\nXử lý: ${acc.email}`);
    
    try {
      // Tạo user mới
      const { data, error } = await supabase.auth.admin.createUser({
        email: acc.email,
        password: acc.password,
        email_confirm: true,
        user_metadata: {
          role: acc.role,
          name: acc.name,
          phone: acc.password
        }
      });
      
      if (error) {
        if (error.message.includes('already been registered')) {
          console.log(`  ℹ User đã tồn tại, thử xóa và tạo lại...`);
          
          // Lấy user ID từ RPC
          const { data: users } = await supabase.rpc('get_all_users');
          const existingUser = users?.find(u => u.email === acc.email);
          
          if (existingUser) {
            console.log(`  Xóa user ID: ${existingUser.id}`);
            const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);
            
            if (deleteError) {
              console.log(`  ✗ Lỗi xóa: ${deleteError.message}`);
              continue;
            }
            
            // Tạo lại
            const { data: newData, error: newError } = await supabase.auth.admin.createUser({
              email: acc.email,
              password: acc.password,
              email_confirm: true,
              user_metadata: {
                role: acc.role,
                name: acc.name,
                phone: acc.password
              }
            });
            
            if (newError) {
              console.log(`  ✗ Lỗi tạo lại: ${newError.message}`);
            } else {
              console.log(`  ✓ Đã tạo lại user, ID: ${newData.user?.id}`);
              
              // Cập nhật ID trong bảng User
              if (newData.user?.id) {
                const { error: updateError } = await supabase
                  .from('User')
                  .update({ id: newData.user.id })
                  .eq('email', acc.email);
                
                if (updateError) {
                  console.log(`  ⚠ Lỗi sync ID: ${updateError.message}`);
                } else {
                  console.log(`  ✓ Đã sync ID vào bảng User`);
                }
              }
            }
          }
        } else {
          console.log(`  ✗ Lỗi: ${error.message}`);
        }
      } else {
        console.log(`  ✓ Đã tạo user, ID: ${data.user?.id}`);
        
        // Cập nhật ID trong bảng User
        if (data.user?.id) {
          const { error: updateError } = await supabase
            .from('User')
            .update({ id: data.user.id })
            .eq('email', acc.email);
          
          if (updateError) {
            console.log(`  ⚠ Lỗi sync ID: ${updateError.message}`);
          } else {
            console.log(`  ✓ Đã sync ID vào bảng User`);
          }
        }
      }
    } catch (err) {
      console.log(`  ✗ Exception: ${err.message}`);
    }
  }
  
  console.log('\n=== HOÀN TẤT ===\n');
}

main().catch(console.error);
