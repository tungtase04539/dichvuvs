// Tạo/sửa các tài khoản test trong Supabase Auth
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mjwmmttjuaodhhmshvje.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyNDE3MSwiZXhwIjoyMDc4NjAwMTcxfQ.8MJFBFH_Yrm7i6dMLsc3jDbzMIW0ClYvhypjxCwnScw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(type, msg) {
  const icons = { ok: `${c.green}✓`, err: `${c.red}✗`, info: `${c.blue}ℹ`, warn: `${c.yellow}⚠` };
  console.log(`${icons[type] || '•'}${c.reset} ${msg}`);
}

const testAccounts = [
  { email: 'npp@test.com', password: '123456', role: 'distributor', name: 'Nhà Phân Phối Test' },
  { email: 'agent1@test.com', password: '123456', role: 'agent', name: 'Đại Lý 1' },
  { email: 'agent2@test.com', password: '123456', role: 'agent', name: 'Đại Lý 2' },
  { email: 'agent3@test.com', password: '123456', role: 'agent', name: 'Đại Lý 3' },
  { email: 'ctv1@test.com', password: '123456', role: 'collaborator', name: 'CTV 1' },
  { email: 'ctv2@test.com', password: '123456', role: 'collaborator', name: 'CTV 2' },
  { email: 'ctv3@test.com', password: '123456', role: 'collaborator', name: 'CTV 3' },
];

async function main() {
  console.log('\n=== TẠO/SỬA TÀI KHOẢN TEST TRONG SUPABASE AUTH ===\n');
  
  // Lấy user IDs từ bảng User
  const { data: dbUsers, error: dbError } = await supabase
    .from('User')
    .select('id, email, role, name')
    .in('email', testAccounts.map(a => a.email));
  
  if (dbError) {
    log('err', `Lỗi lấy users từ DB: ${dbError.message}`);
    return;
  }
  
  const dbUserMap = new Map(dbUsers.map(u => [u.email, u]));
  
  for (const acc of testAccounts) {
    console.log(`\nXử lý: ${acc.email}`);
    
    const dbUser = dbUserMap.get(acc.email);
    if (!dbUser) {
      log('warn', `  Không tìm thấy trong bảng User`);
      continue;
    }
    
    log('info', `  DB User ID: ${dbUser.id}`);
    
    // Thử tạo user trong Auth với ID từ DB
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: acc.email,
      password: acc.password,
      email_confirm: true,
      user_metadata: {
        role: acc.role,
        name: acc.name
      }
    });
    
    if (createError) {
      if (createError.message.includes('already been registered') || createError.status === 422) {
        log('info', `  User đã tồn tại trong Auth, thử cập nhật...`);
        
        // Tìm user trong Auth
        // Không thể listUsers do lỗi, thử update trực tiếp bằng email
        // Sử dụng admin API để reset password
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          dbUser.id,
          {
            password: acc.password,
            email_confirm: true,
            user_metadata: {
              role: acc.role,
              name: acc.name
            }
          }
        );
        
        if (updateError) {
          log('err', `  Lỗi cập nhật: ${updateError.message}`);
        } else {
          log('ok', `  Đã cập nhật password và metadata`);
        }
      } else {
        log('err', `  Lỗi tạo: ${createError.message}`);
      }
    } else {
      log('ok', `  Đã tạo user mới trong Auth`);
      log('info', `  Auth User ID: ${createData.user?.id}`);
      
      // Nếu ID khác, cần sync
      if (createData.user?.id !== dbUser.id) {
        log('warn', `  ID không khớp! Auth: ${createData.user?.id}, DB: ${dbUser.id}`);
        log('info', `  Cập nhật ID trong bảng User...`);
        
        const { error: updateDbError } = await supabase
          .from('User')
          .update({ id: createData.user.id })
          .eq('email', acc.email);
        
        if (updateDbError) {
          log('err', `  Lỗi cập nhật DB: ${updateDbError.message}`);
        } else {
          log('ok', `  Đã sync ID`);
        }
      }
    }
  }
  
  console.log('\n=== HOÀN TẤT ===\n');
}

main().catch(console.error);
