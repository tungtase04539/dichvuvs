// Kiểm tra tài khoản test trong database
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mjwmmttjuaodhhmshvje.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyNDE3MSwiZXhwIjoyMDc4NjAwMTcxfQ.8MJFBFH_Yrm7i6dMLsc3jDbzMIW0ClYvhypjxCwnScw';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjQxNzEsImV4cCI6MjA3ODYwMDE3MX0.mkf-mS_Ufqf6Y95gSujBlALUlASCu-NyT2aAt7O3j2A';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

async function testLogin(email, password) {
  try {
    const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    await supabaseAnon.auth.signOut();
    return { success: true, userId: data.user?.id, role: data.user?.user_metadata?.role };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function main() {
  console.log('\n' + '═'.repeat(70));
  console.log(`${c.bold}  KIỂM TRA TÀI KHOẢN TEST${c.reset}`);
  console.log('═'.repeat(70));

  // 1. Lấy dữ liệu từ bảng User
  console.log(`\n${c.cyan}[1] DỮ LIỆU TRONG BẢNG USER (Prisma)${c.reset}\n`);
  
  const testEmails = ['admin@admin.com', 'npp@test.com', 'agent1@test.com', 'agent2@test.com', 
                      'agent3@test.com', 'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com'];
  
  const { data: users, error } = await supabase
    .from('User')
    .select('id, email, phone, role, name, password')
    .in('email', testEmails)
    .order('email');
  
  if (error) {
    console.log(`${c.red}Lỗi: ${error.message}${c.reset}`);
    return;
  }
  
  console.log('Email'.padEnd(25) + 'Phone'.padEnd(15) + 'Role'.padEnd(15) + 'Password (DB)'.padEnd(20) + 'ID');
  console.log('-'.repeat(100));
  
  for (const u of users) {
    const pwDisplay = u.password ? (u.password.length > 15 ? u.password.substring(0, 15) + '...' : u.password) : 'EMPTY';
    console.log(
      u.email.padEnd(25) + 
      (u.phone || 'N/A').padEnd(15) + 
      u.role.padEnd(15) + 
      pwDisplay.padEnd(20) +
      u.id.substring(0, 8) + '...'
    );
  }

  // 2. Test đăng nhập
  console.log(`\n${c.cyan}[2] TEST ĐĂNG NHẬP${c.reset}\n`);
  
  // Tạo map email -> phone từ database
  const phoneMap = new Map(users.map(u => [u.email, u.phone]));
  
  const loginTests = [
    { email: 'admin@admin.com', password: 'admin', desc: 'Admin (password=admin)' },
  ];
  
  // Thêm test cho các tài khoản khác với password = phone
  for (const u of users) {
    if (u.email !== 'admin@admin.com' && u.phone) {
      loginTests.push({
        email: u.email,
        password: u.phone,
        desc: `${u.role} (password=phone: ${u.phone})`
      });
    }
  }
  
  for (const test of loginTests) {
    const result = await testLogin(test.email, test.password);
    if (result.success) {
      console.log(`${c.green}✓${c.reset} ${test.email}: ${c.green}OK${c.reset} - ${test.desc}`);
    } else {
      console.log(`${c.red}✗${c.reset} ${test.email}: ${c.red}${result.error}${c.reset} - ${test.desc}`);
    }
  }

  // 3. Tóm tắt
  console.log(`\n${c.cyan}[3] TÓM TẮT${c.reset}\n`);
  console.log(`${c.yellow}Lưu ý:${c.reset}`);
  console.log('- Password trong bảng User KHÔNG được sử dụng cho authentication');
  console.log('- Supabase Auth (auth.users) mới là nơi lưu password thực sự');
  console.log('- Các tài khoản test cần được tạo trong auth.users với password = số điện thoại');
  console.log('');
  console.log(`${c.blue}Để fix:${c.reset} Chạy SQL trong file sql/fix-test-auth-v2.sql`);
  
  console.log('\n' + '═'.repeat(70) + '\n');
}

main().catch(console.error);
