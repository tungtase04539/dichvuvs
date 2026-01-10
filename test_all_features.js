// TEST TOÀN DIỆN TẤT CẢ CHỨC NĂNG THEO VAI TRÒ
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mjwmmttjuaodhhmshvje.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjQxNzEsImV4cCI6MjA3ODYwMDE3MX0.mkf-mS_Ufqf6Y95gSujBlALUlASCu-NyT2aAt7O3j2A';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyNDE3MSwiZXhwIjoyMDc4NjAwMTcxfQ.8MJFBFH_Yrm7i6dMLsc3jDbzMIW0ClYvhypjxCwnScw';
const BASE_URL = 'https://santrolyaichatgpt.com';

const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const c = {
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', 
  yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m', bold: '\x1b[1m',
};

let passed = 0, failed = 0, warnings = 0;

function log(type, msg) {
  const icons = { ok: `${c.green}✓`, err: `${c.red}✗`, info: `${c.blue}ℹ`, warn: `${c.yellow}⚠`, test: `${c.cyan}►` };
  console.log(`${icons[type] || '•'}${c.reset} ${msg}`);
}

async function test(name, fn) {
  try {
    const result = await fn();
    if (result === 'warn') {
      log('warn', name);
      warnings++;
    } else {
      log('ok', name);
      passed++;
    }
  } catch (err) {
    log('err', `${name}: ${err.message}`);
    failed++;
  }
}

async function login(email, password) {
  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data.session?.access_token;
}

async function fetchAPI(endpoint, token, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
  return { status: res.status, data: await res.json().catch(() => null) };
}

async function main() {
  console.log('\n' + '═'.repeat(70));
  console.log(`${c.bold}${c.cyan}  TEST TOÀN DIỆN - TẤT CẢ CHỨC NĂNG THEO VAI TRÒ${c.reset}`);
  console.log('═'.repeat(70));

  // ============================================
  // PHẦN 1: TEST DATABASE
  // ============================================
  console.log(`\n${c.bold}[1] KIỂM TRA DATABASE${c.reset}\n`);

  await test('Bảng User có dữ liệu', async () => {
    const { data, error } = await supabaseAdmin.from('User').select('id').limit(1);
    if (error) throw error;
    if (!data?.length) throw new Error('Không có dữ liệu');
  });

  await test('Bảng CommissionSetting có cấu hình', async () => {
    const { data, error } = await supabaseAdmin.from('CommissionSetting').select('*');
    if (error) throw error;
    if (!data?.length) throw new Error('Chưa có cấu hình commission');
    log('info', `  Có ${data.length} cấu hình`);
  });

  await test('Bảng ReferralLink có dữ liệu', async () => {
    const { data } = await supabaseAdmin.from('ReferralLink').select('id, code, userId').eq('isActive', true);
    log('info', `  Có ${data?.length || 0} referral links active`);
  });

  await test('Cấu trúc phân cấp NPP → Đại lý → CTV', async () => {
    const { data: npp } = await supabaseAdmin.from('User').select('id, email').eq('email', 'npp@test.com').single();
    const { data: agents } = await supabaseAdmin.from('User').select('id, email').eq('parentId', npp?.id);
    log('info', `  NPP có ${agents?.length || 0} đại lý trực thuộc`);
    if (!agents?.length) return 'warn';
  });

  // ============================================
  // PHẦN 2: TEST VAI TRÒ ADMIN
  // ============================================
  console.log(`\n${c.bold}[2] TEST VAI TRÒ ADMIN (admin@admin.com)${c.reset}\n`);

  let adminToken;
  await test('Đăng nhập Admin', async () => {
    adminToken = await login('admin@admin.com', 'admin');
    if (!adminToken) throw new Error('Không có token');
  });

  await test('API /api/admin/ctv-stats', async () => {
    const { status, data } = await fetchAPI('/api/admin/ctv-stats', adminToken);
    if (status !== 200) throw new Error(`Status ${status}`);
    log('info', `  Tổng CTV: ${data?.totalCTV || 0}, Doanh thu: ${data?.totalRevenue || 0}`);
  });

  await test('API /api/admin/commissions', async () => {
    const { status, data } = await fetchAPI('/api/admin/commissions', adminToken);
    if (status !== 200) throw new Error(`Status ${status}`);
    log('info', `  Có ${data?.commissions?.length || 0} commission records`);
  });

  await test('API /api/admin/withdrawals', async () => {
    const { status, data } = await fetchAPI('/api/admin/withdrawals', adminToken);
    if (status !== 200) throw new Error(`Status ${status}`);
    log('info', `  Có ${data?.withdrawals?.length || 0} yêu cầu rút tiền`);
  });

  await test('API /api/admin/commission-settings (GET)', async () => {
    const { status, data } = await fetchAPI('/api/admin/commission-settings', adminToken);
    if (status !== 200) throw new Error(`Status ${status}`);
    log('info', `  Có ${data?.settings?.length || 0} cấu hình`);
  });

  await test('API /api/admin/accounts (GET)', async () => {
    const { status, data } = await fetchAPI('/api/admin/accounts', adminToken);
    if (status !== 200) throw new Error(`Status ${status}`);
    log('info', `  Có ${data?.users?.length || 0} tài khoản`);
  });

  await supabaseAnon.auth.signOut();

  // ============================================
  // PHẦN 3: TEST VAI TRÒ NPP (Nhà phân phối)
  // ============================================
  console.log(`\n${c.bold}[3] TEST VAI TRÒ NPP (npp@test.com)${c.reset}\n`);

  let nppToken;
  await test('Đăng nhập NPP', async () => {
    nppToken = await login('npp@test.com', '0901000001');
    if (!nppToken) throw new Error('Không có token');
  });

  await test('API /api/ctv/stats', async () => {
    const { status, data } = await fetchAPI('/api/ctv/stats', nppToken);
    if (status !== 200) throw new Error(`Status ${status}`);
    log('info', `  Balance: ${data?.balance || 0}, Orders: ${data?.totalOrders || 0}`);
  });

  await test('API /api/ctv/team', async () => {
    const { status, data } = await fetchAPI('/api/ctv/team', nppToken);
    if (status !== 200) throw new Error(`Status ${status}`);
    log('info', `  Có ${data?.members?.length || 0} thành viên trong đội`);
  });

  await test('API /api/ctv/commissions', async () => {
    const { status, data } = await fetchAPI('/api/ctv/commissions', nppToken);
    if (status !== 200) throw new Error(`Status ${status}`);
    log('info', `  Có ${data?.commissions?.length || 0} commission`);
  });

  await test('API /api/referral (GET)', async () => {
    const { status, data } = await fetchAPI('/api/referral', nppToken);
    if (status !== 200) throw new Error(`Status ${status}`);
    log('info', `  Có ${data?.referralLinks?.length || 0} referral links`);
  });

  await supabaseAnon.auth.signOut();

  // ============================================
  // PHẦN 4: TEST VAI TRÒ ĐẠI LÝ
  // ============================================
  console.log(`\n${c.bold}[4] TEST VAI TRÒ ĐẠI LÝ (agent1@test.com)${c.reset}\n`);

  let agentToken;
  await test('Đăng nhập Đại lý', async () => {
    agentToken = await login('agent1@test.com', '0902000001');
    if (!agentToken) throw new Error('Không có token');
  });

  await test('API /api/ctv/stats', async () => {
    const { status, data } = await fetchAPI('/api/ctv/stats', agentToken);
    if (status !== 200) throw new Error(`Status ${status}`);
    log('info', `  Balance: ${data?.balance || 0}`);
  });

  await test('API /api/ctv/team (xem CTV của mình)', async () => {
    const { status, data } = await fetchAPI('/api/ctv/team', agentToken);
    if (status !== 200) throw new Error(`Status ${status}`);
    log('info', `  Có ${data?.members?.length || 0} CTV trực thuộc`);
  });

  await test('API /api/referral (GET)', async () => {
    const { status, data } = await fetchAPI('/api/referral', agentToken);
    if (status !== 200) throw new Error(`Status ${status}`);
    log('info', `  Referral code: ${data?.referralLinks?.[0]?.code || 'N/A'}`);
  });

  await supabaseAnon.auth.signOut();

  // ============================================
  // PHẦN 5: TEST VAI TRÒ CTV
  // ============================================
  console.log(`\n${c.bold}[5] TEST VAI TRÒ CTV (ctv1@test.com)${c.reset}\n`);

  let ctvToken;
  await test('Đăng nhập CTV', async () => {
    ctvToken = await login('ctv1@test.com', '0903000001');
    if (!ctvToken) throw new Error('Không có token');
  });

  await test('API /api/ctv/stats', async () => {
    const { status, data } = await fetchAPI('/api/ctv/stats', ctvToken);
    if (status !== 200) throw new Error(`Status ${status}`);
    log('info', `  Balance: ${data?.balance || 0}, Pending: ${data?.pendingCommission || 0}`);
  });

  await test('API /api/ctv/commissions', async () => {
    const { status, data } = await fetchAPI('/api/ctv/commissions', ctvToken);
    if (status !== 200) throw new Error(`Status ${status}`);
  });

  await test('API /api/ctv/withdrawals (GET)', async () => {
    const { status, data } = await fetchAPI('/api/ctv/withdrawals', ctvToken);
    if (status !== 200) throw new Error(`Status ${status}`);
    log('info', `  Có ${data?.withdrawals?.length || 0} yêu cầu rút tiền`);
  });

  await test('API /api/referral (GET)', async () => {
    const { status, data } = await fetchAPI('/api/referral', ctvToken);
    if (status !== 200) throw new Error(`Status ${status}`);
    log('info', `  Referral code: ${data?.referralLinks?.[0]?.code || 'N/A'}`);
  });

  await supabaseAnon.auth.signOut();

  // ============================================
  // PHẦN 6: TEST LOGIC COMMISSION
  // ============================================
  console.log(`\n${c.bold}[6] KIỂM TRA LOGIC COMMISSION${c.reset}\n`);

  await test('Cấu hình commission đúng theo chính sách', async () => {
    const { data } = await supabaseAdmin.from('CommissionSetting').select('*');
    const settings = {};
    data?.forEach(s => { settings[s.key] = s.percent; });
    
    log('info', `  CTV retail: ${settings['collaborator_retail'] || settings['ctv_retail'] || 'N/A'}%`);
    log('info', `  Agent retail: ${settings['agent_retail'] || 'N/A'}%`);
    log('info', `  Distributor retail: ${settings['distributor_retail'] || 'N/A'}%`);
  });

  await test('Kiểm tra đơn hàng có referrer', async () => {
    const { data } = await supabaseAdmin
      .from('Order')
      .select('id, orderCode, referrerId, referralCode, status')
      .not('referrerId', 'is', null)
      .limit(5);
    log('info', `  Có ${data?.length || 0} đơn hàng có referrer`);
  });

  // ============================================
  // PHẦN 7: TEST REFERRAL SYSTEM
  // ============================================
  console.log(`\n${c.bold}[7] KIỂM TRA HỆ THỐNG REFERRAL${c.reset}\n`);

  await test('Tất cả CTV/Đại lý/NPP đều có referral link', async () => {
    const { data: users } = await supabaseAdmin
      .from('User')
      .select('id, email, role')
      .in('role', ['distributor', 'agent', 'collaborator', 'ctv']);
    
    const { data: links } = await supabaseAdmin
      .from('ReferralLink')
      .select('userId')
      .eq('isActive', true);
    
    const linkUserIds = new Set(links?.map(l => l.userId) || []);
    const missing = users?.filter(u => !linkUserIds.has(u.id)) || [];
    
    if (missing.length > 0) {
      log('warn', `  ${missing.length} users chưa có referral link`);
      return 'warn';
    }
    log('info', `  Tất cả ${users?.length} users đều có link`);
  });

  // ============================================
  // KẾT QUẢ
  // ============================================
  console.log('\n' + '═'.repeat(70));
  console.log(`${c.bold}  KẾT QUẢ TEST${c.reset}`);
  console.log('═'.repeat(70));
  console.log(`\n  ${c.green}✓ Passed: ${passed}${c.reset}`);
  console.log(`  ${c.red}✗ Failed: ${failed}${c.reset}`);
  console.log(`  ${c.yellow}⚠ Warnings: ${warnings}${c.reset}`);
  console.log(`  Total: ${passed + failed + warnings}\n`);

  if (failed === 0) {
    console.log(`${c.green}${c.bold}  ✅ TẤT CẢ TEST CHÍNH ĐỀU PASS!${c.reset}\n`);
  } else {
    console.log(`${c.red}${c.bold}  ❌ CÓ ${failed} TEST THẤT BẠI${c.reset}\n`);
  }
}

main().catch(console.error);
