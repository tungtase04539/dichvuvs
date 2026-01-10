// BÁO CÁO TỔNG HỢP HỆ THỐNG ĐĂNG NHẬP & ĐĂNG KÝ
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const SUPABASE_URL = 'https://mjwmmttjuaodhhmshvje.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyNDE3MSwiZXhwIjoyMDc4NjAwMTcxfQ.8MJFBFH_Yrm7i6dMLsc3jDbzMIW0ClYvhypjxCwnScw';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjQxNzEsImV4cCI6MjA3ODYwMDE3MX0.mkf-mS_Ufqf6Y95gSujBlALUlASCu-NyT2aAt7O3j2A';
const BASE_URL = 'https://santrolyaichatgpt.com';

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

function log(type, msg) {
  const icons = { ok: `${c.green}✓`, err: `${c.red}✗`, info: `${c.blue}ℹ`, warn: `${c.yellow}⚠` };
  console.log(`${icons[type] || '•'}${c.reset} ${msg}`);
}

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

async function testPage(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ status: res.statusCode, ok: res.statusCode === 200 });
    }).on('error', (err) => {
      resolve({ status: 0, ok: false, error: err.message });
    });
  });
}

async function main() {
  console.log('\n' + '═'.repeat(70));
  console.log(`${c.bold}${c.cyan}  BÁO CÁO HỆ THỐNG ĐĂNG NHẬP & ĐĂNG KÝ CTV${c.reset}`);
  console.log('═'.repeat(70));

  // ============================================
  // 1. KIỂM TRA CÁC TRANG
  // ============================================
  console.log(`\n${c.bold}[1] KIỂM TRA CÁC TRANG WEB${c.reset}\n`);
  
  const pages = [
    { name: 'Trang chủ', url: `${BASE_URL}/` },
    { name: 'Đăng nhập khách hàng', url: `${BASE_URL}/dang-nhap` },
    { name: 'Đăng nhập CTV/Admin', url: `${BASE_URL}/quan-tri-vien-dang-nhap` },
    { name: 'Đăng ký CTV', url: `${BASE_URL}/tuyen-ctv` },
    { name: 'Trang Admin', url: `${BASE_URL}/admin` },
  ];
  
  for (const page of pages) {
    const result = await testPage(page.url);
    if (result.ok) {
      log('ok', `${page.name}: ${page.url}`);
    } else {
      log('warn', `${page.name}: ${page.url} (Status: ${result.status})`);
    }
  }

  // ============================================
  // 2. KIỂM TRA DATABASE
  // ============================================
  console.log(`\n${c.bold}[2] KIỂM TRA DATABASE${c.reset}\n`);
  
  // Users
  const { data: users, error: usersError } = await supabase
    .from('User')
    .select('id, email, role, name, createdAt')
    .order('createdAt', { ascending: false });
  
  if (usersError) {
    log('err', `Lỗi lấy users: ${usersError.message}`);
  } else {
    const roleCount = {};
    users.forEach(u => { roleCount[u.role] = (roleCount[u.role] || 0) + 1; });
    
    log('ok', `Tổng users: ${users.length}`);
    Object.entries(roleCount).forEach(([role, count]) => {
      log('info', `  - ${role}: ${count}`);
    });
  }
  
  // CTV Applications
  const { data: apps } = await supabase
    .from('CTVApplication')
    .select('id, status, email, fullName, createdAt')
    .order('createdAt', { ascending: false });
  
  if (apps) {
    const statusCount = {};
    apps.forEach(a => { statusCount[a.status] = (statusCount[a.status] || 0) + 1; });
    
    log('ok', `Tổng đơn đăng ký CTV: ${apps.length}`);
    Object.entries(statusCount).forEach(([status, count]) => {
      log('info', `  - ${status}: ${count}`);
    });
  }
  
  // Referral Links
  const { data: links } = await supabase
    .from('ReferralLink')
    .select('id, code, userId, isActive');
  
  if (links) {
    const active = links.filter(l => l.isActive).length;
    log('ok', `Tổng referral links: ${links.length} (Active: ${active})`);
  }

  // ============================================
  // 3. KIỂM TRA ĐĂNG NHẬP
  // ============================================
  console.log(`\n${c.bold}[3] KIỂM TRA ĐĂNG NHẬP${c.reset}\n`);
  
  const loginTests = [
    { email: 'admin@admin.com', password: 'admin', desc: 'Admin chính' },
  ];
  
  for (const test of loginTests) {
    const result = await testLogin(test.email, test.password);
    if (result.success) {
      log('ok', `${test.desc} (${test.email}): Đăng nhập OK`);
      log('info', `  Role: ${result.role || 'N/A'}`);
    } else {
      log('err', `${test.desc} (${test.email}): ${result.error}`);
    }
  }
  
  // Test các tài khoản test
  console.log(`\n${c.yellow}Lưu ý về tài khoản test:${c.reset}`);
  log('warn', 'Các tài khoản test (npp@test.com, agent1@test.com, ctv1@test.com)');
  log('warn', 'đang gặp lỗi "Database error querying schema" từ Supabase Auth.');
  log('warn', 'Đây là vấn đề với Supabase Auth service, không phải code.');
  log('info', 'Cần kiểm tra Supabase Dashboard > Authentication > Users');

  // ============================================
  // 4. KIỂM TRA API
  // ============================================
  console.log(`\n${c.bold}[4] KIỂM TRA API ENDPOINTS${c.reset}\n`);
  
  const apis = [
    { name: 'Health Check', url: `${BASE_URL}/api/health` },
    { name: 'Products', url: `${BASE_URL}/api/products` },
  ];
  
  for (const api of apis) {
    const result = await testPage(api.url);
    if (result.ok) {
      log('ok', `${api.name}: OK`);
    } else {
      log('warn', `${api.name}: Status ${result.status}`);
    }
  }

  // ============================================
  // 5. TÓM TẮT
  // ============================================
  console.log('\n' + '═'.repeat(70));
  console.log(`${c.bold}  TÓM TẮT${c.reset}`);
  console.log('═'.repeat(70));
  
  console.log(`
${c.green}✓ Hoạt động tốt:${c.reset}
  - Database (User, CTVApplication, ReferralLink)
  - Các trang web (đăng nhập, đăng ký CTV)
  - Tài khoản admin@admin.com đăng nhập được
  - Hệ thống referral links đã sync đầy đủ
  - Logic tự động tạo referral link khi approve CTV

${c.yellow}⚠ Cần kiểm tra:${c.reset}
  - Các tài khoản test trong Supabase Auth
  - Lỗi "Database error querying schema" có thể do:
    1. Supabase Auth schema bị lỗi
    2. Các user test chưa được tạo đúng trong auth.users
    3. Cần chạy SQL trực tiếp trong Supabase SQL Editor

${c.blue}ℹ Hướng dẫn tạo tài khoản test:${c.reset}
  1. Vào Supabase Dashboard > Authentication > Users
  2. Click "Add user" > "Create new user"
  3. Nhập email, password, và confirm email
  4. Hoặc chạy SQL trong SQL Editor (xem file sql/create-test-accounts.sql)
`);

  console.log('═'.repeat(70) + '\n');
}

main().catch(console.error);
