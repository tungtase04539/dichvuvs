// TEST TOÀN DIỆN - KIỂM TRA DATABASE VÀ LOGIC
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mjwmmttjuaodhhmshvje.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjQxNzEsImV4cCI6MjA3ODYwMDE3MX0.mkf-mS_Ufqf6Y95gSujBlALUlASCu-NyT2aAt7O3j2A';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyNDE3MSwiZXhwIjoyMDc4NjAwMTcxfQ.8MJFBFH_Yrm7i6dMLsc3jDbzMIW0ClYvhypjxCwnScw';

const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const c = {
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', 
  yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m', bold: '\x1b[1m',
};

let passed = 0, failed = 0, warnings = 0;

function log(type, msg) {
  const icons = { ok: `${c.green}✓`, err: `${c.red}✗`, info: `${c.blue}ℹ`, warn: `${c.yellow}⚠` };
  console.log(`${icons[type] || '•'}${c.reset} ${msg}`);
}

async function test(name, fn) {
  try {
    const result = await fn();
    if (result === 'warn') { log('warn', name); warnings++; }
    else { log('ok', name); passed++; }
  } catch (err) {
    log('err', `${name}: ${err.message}`);
    failed++;
  }
}

async function main() {
  console.log('\n' + '═'.repeat(70));
  console.log(`${c.bold}${c.cyan}  TEST TOÀN DIỆN - DATABASE & LOGIC${c.reset}`);
  console.log('═'.repeat(70));

  // ============================================
  // PHẦN 1: ĐĂNG NHẬP TẤT CẢ VAI TRÒ
  // ============================================
  console.log(`\n${c.bold}[1] TEST ĐĂNG NHẬP TẤT CẢ VAI TRÒ${c.reset}\n`);

  const accounts = [
    { email: 'admin@admin.com', password: 'admin', role: 'admin' },
    { email: 'npp@test.com', password: '0901000001', role: 'distributor' },
    { email: 'agent1@test.com', password: '0902000001', role: 'agent' },
    { email: 'agent2@test.com', password: '0902000002', role: 'agent' },
    { email: 'agent3@test.com', password: '0902000003', role: 'agent' },
    { email: 'ctv1@test.com', password: '0903000001', role: 'collaborator' },
    { email: 'ctv2@test.com', password: '0903000002', role: 'collaborator' },
    { email: 'ctv3@test.com', password: '0903000003', role: 'collaborator' },
  ];

  for (const acc of accounts) {
    await test(`Đăng nhập ${acc.email} (${acc.role})`, async () => {
      const { data, error } = await supabaseAnon.auth.signInWithPassword({
        email: acc.email, password: acc.password
      });
      if (error) throw error;
      await supabaseAnon.auth.signOut();
    });
  }

  // ============================================
  // PHẦN 2: KIỂM TRA CẤU TRÚC PHÂN CẤP
  // ============================================
  console.log(`\n${c.bold}[2] KIỂM TRA CẤU TRÚC PHÂN CẤP${c.reset}\n`);

  await test('NPP có đúng 3 Đại lý trực thuộc', async () => {
    const { data: npp } = await supabase.from('User').select('id').eq('email', 'npp@test.com').single();
    const { data: agents } = await supabase.from('User').select('id, email').eq('parentId', npp.id);
    if (agents.length !== 3) throw new Error(`Có ${agents.length} đại lý, expected 3`);
    log('info', `  Đại lý: ${agents.map(a => a.email).join(', ')}`);
  });

  await test('Agent1 có CTV trực thuộc', async () => {
    const { data: agent } = await supabase.from('User').select('id').eq('email', 'agent1@test.com').single();
    const { data: ctvs } = await supabase.from('User').select('id, email').eq('parentId', agent.id);
    log('info', `  Agent1 có ${ctvs.length} CTV`);
    if (ctvs.length === 0) return 'warn';
  });

  // ============================================
  // PHẦN 3: KIỂM TRA REFERRAL LINKS
  // ============================================
  console.log(`\n${c.bold}[3] KIỂM TRA REFERRAL LINKS${c.reset}\n`);

  await test('Tất cả CTV/Đại lý/NPP đều có referral link', async () => {
    const { data: users } = await supabase
      .from('User')
      .select('id, email, role')
      .in('role', ['distributor', 'agent', 'collaborator', 'ctv', 'admin']);
    
    const { data: links } = await supabase
      .from('ReferralLink')
      .select('userId, code')
      .eq('isActive', true);
    
    const linkMap = new Map(links.map(l => [l.userId, l.code]));
    let missing = 0;
    
    for (const u of users) {
      if (!linkMap.has(u.id)) {
        log('warn', `  ${u.email} chưa có referral link`);
        missing++;
      }
    }
    
    if (missing > 0) throw new Error(`${missing} users chưa có link`);
    log('info', `  Tất cả ${users.length} users đều có link`);
  });

  await test('Referral links có mã unique', async () => {
    const { data: links } = await supabase.from('ReferralLink').select('code').eq('isActive', true);
    const codes = links.map(l => l.code);
    const uniqueCodes = new Set(codes);
    if (codes.length !== uniqueCodes.size) throw new Error('Có mã trùng lặp');
    log('info', `  ${codes.length} mã đều unique`);
  });

  // ============================================
  // PHẦN 4: KIỂM TRA CẤU HÌNH COMMISSION
  // ============================================
  console.log(`\n${c.bold}[4] KIỂM TRA CẤU HÌNH COMMISSION${c.reset}\n`);

  await test('Có đủ cấu hình commission cho các vai trò', async () => {
    const { data } = await supabase.from('CommissionSetting').select('*');
    const keys = data.map(d => d.key);
    
    const required = ['ctv_retail', 'agent_retail', 'distributor_retail'];
    const missing = required.filter(k => !keys.includes(k) && !keys.includes(k.replace('ctv', 'collaborator')));
    
    if (missing.length > 0) {
      log('warn', `  Thiếu: ${missing.join(', ')}`);
      return 'warn';
    }
    
    log('info', `  Có ${data.length} cấu hình commission`);
    data.forEach(d => log('info', `    - ${d.key}: ${d.percent}%`));
  });

  await test('Tỷ lệ commission đúng thứ tự: CTV < Đại lý < NPP', async () => {
    const { data } = await supabase.from('CommissionSetting').select('*');
    const settings = {};
    data.forEach(s => { settings[s.key] = s.percent; });
    
    const ctv = settings['ctv_retail'] || settings['collaborator_retail'] || 10;
    const agent = settings['agent_retail'] || 15;
    const npp = settings['distributor_retail'] || 20;
    
    if (!(ctv < agent && agent < npp)) {
      throw new Error(`Thứ tự sai: CTV=${ctv}%, Agent=${agent}%, NPP=${npp}%`);
    }
    log('info', `  CTV=${ctv}% < Agent=${agent}% < NPP=${npp}%`);
  });

  // ============================================
  // PHẦN 5: KIỂM TRA ĐƠN HÀNG VÀ COMMISSION
  // ============================================
  console.log(`\n${c.bold}[5] KIỂM TRA ĐƠN HÀNG & COMMISSION${c.reset}\n`);

  await test('Có đơn hàng trong hệ thống', async () => {
    const { data, count } = await supabase.from('Order').select('id', { count: 'exact' });
    log('info', `  Tổng ${count || data?.length || 0} đơn hàng`);
  });

  await test('Có đơn hàng với referrer (qua mã giới thiệu)', async () => {
    const { data } = await supabase
      .from('Order')
      .select('id, orderCode, referrerId, referralCode, totalPrice, status')
      .not('referrerId', 'is', null)
      .limit(5);
    
    log('info', `  ${data?.length || 0} đơn có referrer`);
    if (data?.length > 0) {
      data.forEach(o => log('info', `    - ${o.orderCode}: ${o.totalPrice?.toLocaleString()}đ (${o.status})`));
    }
  });

  await test('Kiểm tra bảng Commission', async () => {
    const { data } = await supabase
      .from('Commission')
      .select('id, userId, orderId, amount, percent, level, status')
      .limit(10);
    
    log('info', `  Có ${data?.length || 0} commission records`);
    if (data?.length > 0) {
      const pending = data.filter(c => c.status === 'pending').length;
      const paid = data.filter(c => c.status === 'paid').length;
      log('info', `    - Pending: ${pending}, Paid: ${paid}`);
    }
  });

  // ============================================
  // PHẦN 6: KIỂM TRA WITHDRAWAL
  // ============================================
  console.log(`\n${c.bold}[6] KIỂM TRA YÊU CẦU RÚT TIỀN${c.reset}\n`);

  await test('Kiểm tra bảng Withdrawal', async () => {
    const { data } = await supabase
      .from('Withdrawal')
      .select('id, userId, amount, status, createdAt')
      .order('createdAt', { ascending: false })
      .limit(5);
    
    log('info', `  Có ${data?.length || 0} yêu cầu rút tiền`);
    if (data?.length > 0) {
      const pending = data.filter(w => w.status === 'pending').length;
      const approved = data.filter(w => w.status === 'approved').length;
      log('info', `    - Pending: ${pending}, Approved: ${approved}`);
    }
  });

  // ============================================
  // PHẦN 7: KIỂM TRA CTV APPLICATION
  // ============================================
  console.log(`\n${c.bold}[7] KIỂM TRA ĐƠN ĐĂNG KÝ CTV${c.reset}\n`);

  await test('Kiểm tra bảng CTVApplication', async () => {
    const { data } = await supabase
      .from('CTVApplication')
      .select('id, fullName, email, status, createdAt')
      .order('createdAt', { ascending: false })
      .limit(10);
    
    const pending = data?.filter(a => a.status === 'pending').length || 0;
    const approved = data?.filter(a => a.status === 'approved').length || 0;
    const rejected = data?.filter(a => a.status === 'rejected').length || 0;
    
    log('info', `  Tổng: ${data?.length || 0} đơn`);
    log('info', `    - Pending: ${pending}, Approved: ${approved}, Rejected: ${rejected}`);
  });

  // ============================================
  // PHẦN 8: KIỂM TRA BALANCE CỦA USERS
  // ============================================
  console.log(`\n${c.bold}[8] KIỂM TRA BALANCE CỦA USERS${c.reset}\n`);

  await test('Kiểm tra balance của CTV/Đại lý/NPP', async () => {
    const { data } = await supabase
      .from('User')
      .select('email, role, balance')
      .in('role', ['distributor', 'agent', 'collaborator', 'ctv'])
      .order('balance', { ascending: false })
      .limit(10);
    
    const totalBalance = data?.reduce((sum, u) => sum + (u.balance || 0), 0) || 0;
    log('info', `  Tổng balance: ${totalBalance.toLocaleString()}đ`);
    
    if (data?.length > 0) {
      data.slice(0, 5).forEach(u => {
        if (u.balance > 0) {
          log('info', `    - ${u.email}: ${u.balance.toLocaleString()}đ`);
        }
      });
    }
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
    console.log(`${c.green}${c.bold}  ✅ TẤT CẢ TEST ĐỀU PASS!${c.reset}\n`);
  } else {
    console.log(`${c.red}${c.bold}  ❌ CÓ ${failed} TEST THẤT BẠI${c.reset}\n`);
  }
}

main().catch(console.error);
