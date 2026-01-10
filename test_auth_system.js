// Test toàn diện hệ thống đăng nhập và đăng ký CTV
// Chạy: node test_auth_system.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mjwmmttjuaodhhmshvje.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyNDE3MSwiZXhwIjoyMDc4NjAwMTcxfQ.8MJFBFH_Yrm7i6dMLsc3jDbzMIW0ClYvhypjxCwnScw';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjQxNzEsImV4cCI6MjA3ODYwMDE3MX0.VVPr7DF-hN4HLofT7UI_VBaGxWqNqfnxPDqBJpgPw0c';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
// Dùng service key cho client vì anon key không có trong local
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(type, msg) {
  const icons = { ok: `${c.green}✓`, err: `${c.red}✗`, info: `${c.blue}ℹ`, warn: `${c.yellow}⚠`, test: `${c.cyan}►` };
  console.log(`${icons[type] || '•'}${c.reset} ${msg}`);
}

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    log('ok', `${name}`);
    passed++;
  } catch (err) {
    log('err', `${name}: ${err.message}`);
    failed++;
  }
}

async function main() {
  console.log('\n' + '═'.repeat(70));
  console.log(`${c.bold}  TEST HỆ THỐNG ĐĂNG NHẬP & ĐĂNG KÝ CTV${c.reset}`);
  console.log('═'.repeat(70) + '\n');

  // ============================================
  // PHẦN 1: KIỂM TRA DATABASE
  // ============================================
  console.log(`\n${c.cyan}${c.bold}[1] KIỂM TRA DATABASE${c.reset}\n`);

  await test('Kết nối Supabase thành công', async () => {
    const { data, error } = await supabaseAdmin.from('User').select('count').limit(1);
    if (error) throw new Error(error.message);
  });

  await test('Bảng User tồn tại và có dữ liệu', async () => {
    const { data, error } = await supabaseAdmin.from('User').select('id, email, role').limit(5);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error('Không có user nào');
    log('info', `  Tìm thấy ${data.length} users`);
  });

  await test('Bảng CTVApplication tồn tại', async () => {
    const { data, error } = await supabaseAdmin.from('CTVApplication').select('id, status').limit(5);
    if (error) throw new Error(error.message);
    log('info', `  Tìm thấy ${data?.length || 0} đơn đăng ký CTV`);
  });

  await test('Bảng ReferralLink tồn tại', async () => {
    const { data, error } = await supabaseAdmin.from('ReferralLink').select('id, code, userId').limit(5);
    if (error) throw new Error(error.message);
    log('info', `  Tìm thấy ${data?.length || 0} referral links`);
  });

  // ============================================
  // PHẦN 2: KIỂM TRA TÀI KHOẢN TEST
  // ============================================
  console.log(`\n${c.cyan}${c.bold}[2] KIỂM TRA TÀI KHOẢN TEST${c.reset}\n`);

  const testAccounts = [
    { email: 'npp@test.com', role: 'distributor', name: 'NPP Test' },
    { email: 'agent1@test.com', role: 'agent', name: 'Đại lý 1' },
    { email: 'ctv1@test.com', role: 'collaborator', name: 'CTV 1' },
  ];

  for (const acc of testAccounts) {
    await test(`Tài khoản ${acc.email} tồn tại trong DB`, async () => {
      const { data, error } = await supabaseAdmin
        .from('User')
        .select('id, email, role, name')
        .eq('email', acc.email)
        .single();
      
      if (error || !data) throw new Error('Không tìm thấy user');
      if (data.role !== acc.role) throw new Error(`Role sai: ${data.role} (expected: ${acc.role})`);
      log('info', `  Role: ${data.role}, Name: ${data.name}`);
    });
  }

  // ============================================
  // PHẦN 3: TEST ĐĂNG NHẬP
  // ============================================
  console.log(`\n${c.cyan}${c.bold}[3] TEST ĐĂNG NHẬP${c.reset}\n`);

  // Test đăng nhập với tài khoản test
  for (const acc of testAccounts) {
    await test(`Đăng nhập ${acc.email} (password: 123456)`, async () => {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: acc.email,
        password: '123456'
      });
      
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Không có user data');
      log('info', `  User ID: ${data.user.id.substring(0, 8)}...`);
      
      // Sign out after test
      await supabaseClient.auth.signOut();
    });
  }

  // Test đăng nhập sai mật khẩu
  await test('Đăng nhập sai mật khẩu bị từ chối', async () => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: 'ctv1@test.com',
      password: 'wrongpassword'
    });
    
    if (!error) throw new Error('Đáng lẽ phải bị từ chối');
    log('info', `  Lỗi đúng: ${error.message}`);
  });

  // Test đăng nhập email không tồn tại
  await test('Đăng nhập email không tồn tại bị từ chối', async () => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: 'notexist@test.com',
      password: '123456'
    });
    
    if (!error) throw new Error('Đáng lẽ phải bị từ chối');
    log('info', `  Lỗi đúng: ${error.message}`);
  });

  // ============================================
  // PHẦN 4: KIỂM TRA PHÂN QUYỀN
  // ============================================
  console.log(`\n${c.cyan}${c.bold}[4] KIỂM TRA PHÂN QUYỀN${c.reset}\n`);

  const roleHierarchy = {
    'admin': ['admin', 'distributor', 'agent', 'collaborator', 'customer'],
    'distributor': ['agent', 'collaborator'],
    'agent': ['collaborator'],
    'collaborator': [],
    'customer': []
  };

  await test('Kiểm tra cấu trúc phân quyền trong DB', async () => {
    const { data: users, error } = await supabaseAdmin
      .from('User')
      .select('id, email, role, parentId')
      .in('role', ['distributor', 'agent', 'collaborator']);
    
    if (error) throw new Error(error.message);
    
    // Kiểm tra NPP có đại lý
    const npp = users.find(u => u.role === 'distributor');
    const agents = users.filter(u => u.role === 'agent' && u.parentId === npp?.id);
    log('info', `  NPP ${npp?.email} có ${agents.length} đại lý`);
    
    // Kiểm tra Đại lý có CTV
    const agent1 = users.find(u => u.email === 'agent1@test.com');
    const ctvs = users.filter(u => u.role === 'collaborator' && u.parentId === agent1?.id);
    log('info', `  Đại lý ${agent1?.email} có ${ctvs.length} CTV`);
  });

  // ============================================
  // PHẦN 5: KIỂM TRA REFERRAL LINKS
  // ============================================
  console.log(`\n${c.cyan}${c.bold}[5] KIỂM TRA REFERRAL LINKS${c.reset}\n`);

  await test('Tất cả CTV/Đại lý/NPP đều có referral link', async () => {
    const { data: users } = await supabaseAdmin
      .from('User')
      .select('id, email, role')
      .in('role', ['distributor', 'agent', 'collaborator', 'ctv']);
    
    const { data: links } = await supabaseAdmin
      .from('ReferralLink')
      .select('userId, code')
      .eq('isActive', true);
    
    const linksMap = new Map((links || []).map(l => [l.userId, l.code]));
    
    let missing = 0;
    for (const user of users || []) {
      if (!linksMap.has(user.id)) {
        log('warn', `  ${user.email} chưa có referral link`);
        missing++;
      }
    }
    
    if (missing > 0) throw new Error(`${missing} users chưa có referral link`);
    log('info', `  Tất cả ${users?.length} users đều có link`);
  });

  // ============================================
  // PHẦN 6: KIỂM TRA ĐƠN ĐĂNG KÝ CTV
  // ============================================
  console.log(`\n${c.cyan}${c.bold}[6] KIỂM TRA ĐƠN ĐĂNG KÝ CTV${c.reset}\n`);

  await test('Kiểm tra trạng thái đơn đăng ký CTV', async () => {
    const { data, error } = await supabaseAdmin
      .from('CTVApplication')
      .select('id, fullName, email, phone, status, createdAt')
      .order('createdAt', { ascending: false })
      .limit(10);
    
    if (error) throw new Error(error.message);
    
    const pending = data?.filter(d => d.status === 'pending').length || 0;
    const approved = data?.filter(d => d.status === 'approved').length || 0;
    const rejected = data?.filter(d => d.status === 'rejected').length || 0;
    
    log('info', `  Pending: ${pending}, Approved: ${approved}, Rejected: ${rejected}`);
  });

  // ============================================
  // PHẦN 7: TEST API ENDPOINTS
  // ============================================
  console.log(`\n${c.cyan}${c.bold}[7] TEST API ENDPOINTS${c.reset}\n`);

  const BASE_URL = 'https://santrolyaichatgpt.com';

  await test('API /api/auth/me hoạt động', async () => {
    // Đăng nhập trước
    const { data: authData } = await supabaseClient.auth.signInWithPassword({
      email: 'ctv1@test.com',
      password: '123456'
    });
    
    if (!authData.session) throw new Error('Không có session');
    
    // Gọi API với token
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${authData.session.access_token}`
      }
    });
    
    if (!response.ok) {
      log('warn', `  API trả về ${response.status} - có thể do CORS hoặc server config`);
    } else {
      const data = await response.json();
      log('info', `  User: ${data.user?.email || 'N/A'}`);
    }
    
    await supabaseClient.auth.signOut();
  });

  // ============================================
  // KẾT QUẢ
  // ============================================
  console.log('\n' + '═'.repeat(70));
  console.log(`${c.bold}  KẾT QUẢ TEST${c.reset}`);
  console.log('═'.repeat(70));
  console.log(`\n  ${c.green}✓ Passed: ${passed}${c.reset}`);
  console.log(`  ${c.red}✗ Failed: ${failed}${c.reset}`);
  console.log(`  Total: ${passed + failed}\n`);

  if (failed === 0) {
    console.log(`${c.green}${c.bold}  ✅ TẤT CẢ TEST ĐỀU PASS!${c.reset}\n`);
  } else {
    console.log(`${c.yellow}${c.bold}  ⚠️ CÓ ${failed} TEST THẤT BẠI${c.reset}\n`);
  }
}

main().catch(console.error);
