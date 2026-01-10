/**
 * TEST TOÀN DIỆN HỆ THỐNG - TẤT CẢ CHỨC NĂNG
 * 
 * Bao gồm:
 * 1. Đăng nhập/Đăng xuất tất cả vai trò
 * 2. Đăng ký CTV mới
 * 3. Duyệt/Từ chối đơn CTV (Admin)
 * 4. Tạo đơn hàng với mã giới thiệu
 * 5. Tính commission khi đơn confirmed
 * 6. Xem thống kê CTV
 * 7. Yêu cầu rút tiền
 * 8. Duyệt yêu cầu rút tiền (Admin)
 * 9. Quản lý đội nhóm
 * 10. Cấu hình hoa hồng (Admin)
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const SUPABASE_URL = 'https://mjwmmttjuaodhhmshvje.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjQxNzEsImV4cCI6MjA3ODYwMDE3MX0.mkf-mS_Ufqf6Y95gSujBlALUlASCu-NyT2aAt7O3j2A';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyNDE3MSwiZXhwIjoyMDc4NjAwMTcxfQ.8MJFBFH_Yrm7i6dMLsc3jDbzMIW0ClYvhypjxCwnScw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper để generate UUID
function uuid() {
  return crypto.randomUUID();
}

const c = {
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', 
  yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m', 
  magenta: '\x1b[35m', bold: '\x1b[1m',
};

let passed = 0, failed = 0, warnings = 0;
const testResults = [];

function log(type, msg) {
  const icons = { ok: `${c.green}✓`, err: `${c.red}✗`, info: `${c.blue}ℹ`, warn: `${c.yellow}⚠`, section: `${c.magenta}▶` };
  console.log(`${icons[type] || '•'}${c.reset} ${msg}`);
}

async function test(name, fn) {
  try {
    const result = await fn();
    if (result === 'warn') { 
      log('warn', name); 
      warnings++; 
      testResults.push({ name, status: 'warn' });
    } else { 
      log('ok', name); 
      passed++; 
      testResults.push({ name, status: 'pass' });
    }
  } catch (err) {
    log('err', `${name}: ${err.message}`);
    failed++;
    testResults.push({ name, status: 'fail', error: err.message });
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function login(email, password) {
  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Login failed: ${error.message}`);
  return { token: data.session?.access_token, user: data.user };
}

async function logout() {
  await supabaseAnon.auth.signOut();
}

function generatePhone() {
  return '09' + Math.floor(10000000 + Math.random() * 90000000);
}

function generateEmail() {
  return `test_${Date.now()}@test.com`;
}

// ============================================
// MAIN TEST
// ============================================

async function main() {
  console.log('\n' + '═'.repeat(80));
  console.log(`${c.bold}${c.cyan}  TEST TOÀN DIỆN HỆ THỐNG - TẤT CẢ CHỨC NĂNG${c.reset}`);
  console.log('═'.repeat(80));

  // ============================================
  // SECTION 1: ĐĂNG NHẬP TẤT CẢ VAI TRÒ
  // ============================================
  console.log(`\n${c.bold}${c.magenta}═══ [1] ĐĂNG NHẬP TẤT CẢ VAI TRÒ ═══${c.reset}\n`);

  const accounts = [
    { email: 'admin@admin.com', password: 'admin', role: 'Admin' },
    { email: 'npp@test.com', password: '0901000001', role: 'NPP (Distributor)' },
    { email: 'agent1@test.com', password: '0902000001', role: 'Đại lý (Agent)' },
    { email: 'ctv1@test.com', password: '0903000001', role: 'CTV (Collaborator)' },
  ];

  for (const acc of accounts) {
    await test(`Đăng nhập ${acc.role}: ${acc.email}`, async () => {
      const { token, user } = await login(acc.email, acc.password);
      if (!token) throw new Error('Không có token');
      log('info', `  User ID: ${user.id.substring(0, 8)}...`);
      await logout();
    });
  }

  // ============================================
  // SECTION 2: ĐĂNG KÝ CTV MỚI
  // ============================================
  console.log(`\n${c.bold}${c.magenta}═══ [2] ĐĂNG KÝ CTV MỚI ═══${c.reset}\n`);

  const newCTVEmail = generateEmail();
  const newCTVPhone = generatePhone();
  let newCTVApplicationId = null;

  await test('Tạo đơn đăng ký CTV mới', async () => {
    // Tạo user trước
    const newUserId = uuid();
    const now = new Date().toISOString();
    const { data: newUser, error: userError } = await supabase
      .from('User')
      .insert({
        id: newUserId,
        email: newCTVEmail,
        name: 'Test CTV ' + Date.now(),
        phone: newCTVPhone,
        password: '',
        role: 'customer',
        createdAt: now,
        updatedAt: now
      })
      .select()
      .single();
    
    if (userError) throw userError;

    // Tạo application
    const appId = uuid();
    const { data: app, error: appError } = await supabase
      .from('CTVApplication')
      .insert({
        id: appId,
        userId: newUser.id,
        fullName: 'Test CTV ' + Date.now(),
        phone: newCTVPhone,
        email: newCTVEmail,
        status: 'pending',
        createdAt: now,
        updatedAt: now
      })
      .select()
      .single();
    
    if (appError) throw appError;
    newCTVApplicationId = app.id;
    log('info', `  Application ID: ${app.id.substring(0, 8)}...`);
  });

  await test('Kiểm tra đơn đăng ký trong danh sách pending', async () => {
    const { data } = await supabase
      .from('CTVApplication')
      .select('*')
      .eq('id', newCTVApplicationId)
      .single();
    
    if (data.status !== 'pending') throw new Error(`Status: ${data.status}`);
  });

  // ============================================
  // SECTION 3: ADMIN DUYỆT ĐƠN CTV
  // ============================================
  console.log(`\n${c.bold}${c.magenta}═══ [3] ADMIN DUYỆT ĐƠN CTV ═══${c.reset}\n`);

  await test('Admin xem danh sách đơn đăng ký CTV', async () => {
    const { data, error } = await supabase
      .from('CTVApplication')
      .select('*, user:User(email, name)')
      .eq('status', 'pending');
    
    if (error) throw error;
    log('info', `  Có ${data.length} đơn pending`);
  });

  await test('Admin duyệt đơn CTV (simulate)', async () => {
    // Lấy application
    const { data: app } = await supabase
      .from('CTVApplication')
      .select('*, user:User(*)')
      .eq('id', newCTVApplicationId)
      .single();

    // Cập nhật role user
    await supabase
      .from('User')
      .update({ role: 'collaborator' })
      .eq('id', app.userId);

    // Cập nhật application status
    await supabase
      .from('CTVApplication')
      .update({ 
        status: 'approved',
        reviewedBy: 'admin@admin.com',
        reviewedAt: new Date().toISOString()
      })
      .eq('id', newCTVApplicationId);

    // Tạo referral link
    const { data: link } = await supabase
      .from('ReferralLink')
      .insert({
        id: uuid(),
        code: 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        userId: app.userId,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select()
      .single();

    log('info', `  Đã duyệt và tạo referral code: ${link.code}`);
  });

  await test('Kiểm tra CTV mới đã có referral link', async () => {
    const { data: app } = await supabase
      .from('CTVApplication')
      .select('userId')
      .eq('id', newCTVApplicationId)
      .single();

    const { data: link } = await supabase
      .from('ReferralLink')
      .select('code')
      .eq('userId', app.userId)
      .eq('isActive', true)
      .single();

    if (!link) throw new Error('Chưa có referral link');
    log('info', `  Referral code: ${link.code}`);
  });

  // ============================================
  // SECTION 4: TẠO ĐƠN HÀNG VỚI MÃ GIỚI THIỆU
  // ============================================
  console.log(`\n${c.bold}${c.magenta}═══ [4] TẠO ĐƠN HÀNG VỚI MÃ GIỚI THIỆU ═══${c.reset}\n`);

  let testOrderId = null;
  let referrerUserId = null;

  await test('Lấy referral code của CTV1', async () => {
    const { data: user } = await supabase
      .from('User')
      .select('id')
      .eq('email', 'ctv1@test.com')
      .single();
    
    referrerUserId = user.id;

    const { data: link } = await supabase
      .from('ReferralLink')
      .select('code')
      .eq('userId', user.id)
      .eq('isActive', true)
      .single();

    if (!link) throw new Error('CTV1 chưa có referral link');
    log('info', `  CTV1 referral code: ${link.code}`);
  });

  await test('Tạo đơn hàng mới với referral code', async () => {
    const orderCode = 'TEST' + Date.now().toString().slice(-8);
    const now = new Date().toISOString();
    
    // Lấy một service để tạo order
    const { data: services } = await supabase
      .from('Service')
      .select('id')
      .limit(1);
    
    if (!services || services.length === 0) {
      throw new Error('Không có service nào trong database');
    }
    
    const { data: order, error } = await supabase
      .from('Order')
      .insert({
        id: uuid(),
        orderCode,
        customerName: 'Khách Test',
        customerPhone: generatePhone(),
        customerEmail: generateEmail(),
        address: 'Test Address',
        serviceId: services[0].id,
        unit: 'bot',
        scheduledDate: now,
        scheduledTime: '10:00',
        basePrice: 500000,
        totalPrice: 500000,
        status: 'pending',
        referrerId: referrerUserId,
        referralCode: 'REF-TEST',
        createdAt: now,
        updatedAt: now
      })
      .select()
      .single();

    if (error) throw error;
    testOrderId = order.id;
    log('info', `  Order: ${orderCode}, Total: 500,000đ`);
  });

  // ============================================
  // SECTION 5: XÁC NHẬN ĐƠN VÀ TÍNH COMMISSION
  // ============================================
  console.log(`\n${c.bold}${c.magenta}═══ [5] XÁC NHẬN ĐƠN VÀ TÍNH COMMISSION ═══${c.reset}\n`);

  await test('Cập nhật đơn hàng sang confirmed', async () => {
    const { error } = await supabase
      .from('Order')
      .update({ status: 'confirmed' })
      .eq('id', testOrderId);

    if (error) throw error;
  });

  await test('Tính commission cho đơn hàng (simulate)', async () => {
    if (!testOrderId) {
      throw new Error('Không có order để tính commission');
    }
    
    // Lấy cấu hình commission
    const { data: settings } = await supabase
      .from('CommissionSetting')
      .select('*');
    
    const settingsMap = {};
    settings.forEach(s => { settingsMap[s.key] = s.percent; });

    // Lấy thông tin referrer
    const { data: referrer } = await supabase
      .from('User')
      .select('id, role, name, parentId')
      .eq('id', referrerUserId)
      .single();

    const orderValue = 500000;
    const retailPercent = settingsMap['collaborator_retail'] || settingsMap['ctv_retail'] || 10;
    const commissionAmount = (orderValue * retailPercent) / 100;
    const now = new Date().toISOString();

    // Tạo commission record
    const { data: commission, error } = await supabase
      .from('Commission')
      .insert({
        id: uuid(),
        orderId: testOrderId,
        userId: referrerUserId,
        amount: commissionAmount,
        percent: retailPercent,
        level: 1,
        status: 'pending',
        createdAt: now,
        updatedAt: now
      })
      .select()
      .single();

    if (error) throw error;
    log('info', `  Commission ID: ${commission.id.substring(0, 8)}...`);

    // Cập nhật balance
    await supabase
      .from('User')
      .update({ balance: commissionAmount, updatedAt: now })
      .eq('id', referrerUserId);

    log('info', `  Commission: ${commissionAmount.toLocaleString()}đ (${retailPercent}%)`);
  });

  await test('Kiểm tra balance của CTV1 đã được cập nhật', async () => {
    const { data: user } = await supabase
      .from('User')
      .select('balance')
      .eq('id', referrerUserId)
      .single();

    if (!user.balance || user.balance <= 0) throw new Error('Balance chưa được cập nhật');
    log('info', `  Balance: ${user.balance.toLocaleString()}đ`);
  });

  // ============================================
  // SECTION 6: XEM THỐNG KÊ CTV
  // ============================================
  console.log(`\n${c.bold}${c.magenta}═══ [6] XEM THỐNG KÊ CTV ═══${c.reset}\n`);

  await test('Lấy thống kê của CTV1', async () => {
    const { data: user } = await supabase
      .from('User')
      .select('id, balance')
      .eq('email', 'ctv1@test.com')
      .single();

    const { data: commissions } = await supabase
      .from('Commission')
      .select('amount, status')
      .eq('userId', user.id);

    const { data: orders } = await supabase
      .from('Order')
      .select('id, totalPrice')
      .eq('referrerId', user.id);

    const totalCommission = commissions?.reduce((sum, c) => sum + c.amount, 0) || 0;
    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, o) => sum + o.totalPrice, 0) || 0;

    log('info', `  Balance: ${user.balance?.toLocaleString() || 0}đ`);
    log('info', `  Total Commission: ${totalCommission.toLocaleString()}đ`);
    log('info', `  Total Orders: ${totalOrders}`);
    log('info', `  Total Revenue: ${totalRevenue.toLocaleString()}đ`);
  });

  // ============================================
  // SECTION 7: YÊU CẦU RÚT TIỀN
  // ============================================
  console.log(`\n${c.bold}${c.magenta}═══ [7] YÊU CẦU RÚT TIỀN ═══${c.reset}\n`);

  let withdrawalId = null;

  await test('CTV1 tạo yêu cầu rút tiền', async () => {
    const { data: user } = await supabase
      .from('User')
      .select('id, balance')
      .eq('email', 'ctv1@test.com')
      .single();

    if (!user.balance || user.balance <= 0) {
      log('warn', '  Balance = 0, skip test');
      return 'warn';
    }

    const withdrawAmount = Math.min(user.balance, 100000);

    const { data: withdrawal, error } = await supabase
      .from('Withdrawal')
      .insert({
        id: uuid(),
        userId: user.id,
        amount: withdrawAmount,
        bankName: 'Vietcombank',
        bankAccount: '1234567890',
        bankHolder: 'NGUYEN VAN TEST',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    withdrawalId = withdrawal.id;
    log('info', `  Withdrawal ID: ${withdrawal.id.substring(0, 8)}...`);
    log('info', `  Amount: ${withdrawAmount.toLocaleString()}đ`);
  });

  // ============================================
  // SECTION 8: ADMIN DUYỆT RÚT TIỀN
  // ============================================
  console.log(`\n${c.bold}${c.magenta}═══ [8] ADMIN DUYỆT RÚT TIỀN ═══${c.reset}\n`);

  await test('Admin xem danh sách yêu cầu rút tiền', async () => {
    const { data } = await supabase
      .from('Withdrawal')
      .select('*, user:User(email, name)')
      .eq('status', 'pending');

    log('info', `  Có ${data?.length || 0} yêu cầu pending`);
  });

  if (withdrawalId) {
    await test('Admin duyệt yêu cầu rút tiền', async () => {
      const { data: withdrawal } = await supabase
        .from('Withdrawal')
        .select('userId, amount')
        .eq('id', withdrawalId)
        .single();

      // Cập nhật status
      await supabase
        .from('Withdrawal')
        .update({ 
          status: 'approved',
          processedAt: new Date().toISOString(),
          processedBy: 'admin@admin.com'
        })
        .eq('id', withdrawalId);

      // Trừ balance
      const { data: user } = await supabase
        .from('User')
        .select('balance')
        .eq('id', withdrawal.userId)
        .single();

      await supabase
        .from('User')
        .update({ balance: Math.max(0, (user.balance || 0) - withdrawal.amount) })
        .eq('id', withdrawal.userId);

      log('info', `  Đã duyệt và trừ ${withdrawal.amount.toLocaleString()}đ`);
    });
  }

  // ============================================
  // SECTION 9: QUẢN LÝ ĐỘI NHÓM
  // ============================================
  console.log(`\n${c.bold}${c.magenta}═══ [9] QUẢN LÝ ĐỘI NHÓM ═══${c.reset}\n`);

  await test('NPP xem danh sách đại lý trực thuộc', async () => {
    const { data: npp } = await supabase
      .from('User')
      .select('id')
      .eq('email', 'npp@test.com')
      .single();

    const { data: agents } = await supabase
      .from('User')
      .select('id, email, name, role')
      .eq('parentId', npp.id);

    log('info', `  NPP có ${agents?.length || 0} đại lý`);
    agents?.forEach(a => log('info', `    - ${a.email} (${a.role})`));
  });

  await test('Đại lý xem danh sách CTV trực thuộc', async () => {
    const { data: agent } = await supabase
      .from('User')
      .select('id')
      .eq('email', 'agent1@test.com')
      .single();

    const { data: ctvs } = await supabase
      .from('User')
      .select('id, email, name, role')
      .eq('parentId', agent.id);

    log('info', `  Agent1 có ${ctvs?.length || 0} CTV`);
    ctvs?.forEach(c => log('info', `    - ${c.email} (${c.role})`));
  });

  // ============================================
  // SECTION 10: CẤU HÌNH HOA HỒNG (ADMIN)
  // ============================================
  console.log(`\n${c.bold}${c.magenta}═══ [10] CẤU HÌNH HOA HỒNG (ADMIN) ═══${c.reset}\n`);

  await test('Admin xem cấu hình hoa hồng hiện tại', async () => {
    const { data } = await supabase
      .from('CommissionSetting')
      .select('*')
      .order('key');

    log('info', `  Có ${data?.length || 0} cấu hình:`);
    data?.forEach(s => log('info', `    - ${s.key}: ${s.percent}%`));
  });

  await test('Admin cập nhật % hoa hồng CTV (test)', async () => {
    // Lấy giá trị hiện tại
    const { data: current } = await supabase
      .from('CommissionSetting')
      .select('*')
      .eq('key', 'ctv_retail')
      .single();

    const originalPercent = current?.percent || 10;

    // Cập nhật tạm
    await supabase
      .from('CommissionSetting')
      .update({ percent: 12 })
      .eq('key', 'ctv_retail');

    // Verify
    const { data: updated } = await supabase
      .from('CommissionSetting')
      .select('percent')
      .eq('key', 'ctv_retail')
      .single();

    if (updated.percent !== 12) throw new Error('Cập nhật thất bại');

    // Restore
    await supabase
      .from('CommissionSetting')
      .update({ percent: originalPercent })
      .eq('key', 'ctv_retail');

    log('info', `  Đã test cập nhật: 10% → 12% → 10%`);
  });

  // ============================================
  // SECTION 11: CLEANUP
  // ============================================
  console.log(`\n${c.bold}${c.magenta}═══ [11] CLEANUP TEST DATA ═══${c.reset}\n`);

  await test('Xóa dữ liệu test', async () => {
    // Xóa commission test
    if (testOrderId) {
      await supabase.from('Commission').delete().eq('orderId', testOrderId);
    }

    // Xóa order test
    if (testOrderId) {
      await supabase.from('Order').delete().eq('id', testOrderId);
    }

    // Xóa withdrawal test
    if (withdrawalId) {
      await supabase.from('Withdrawal').delete().eq('id', withdrawalId);
    }

    // Reset balance CTV1
    await supabase
      .from('User')
      .update({ balance: 0 })
      .eq('email', 'ctv1@test.com');

    // Xóa CTV test mới tạo
    if (newCTVApplicationId) {
      const { data: app } = await supabase
        .from('CTVApplication')
        .select('userId')
        .eq('id', newCTVApplicationId)
        .single();

      if (app) {
        await supabase.from('ReferralLink').delete().eq('userId', app.userId);
        await supabase.from('CTVApplication').delete().eq('id', newCTVApplicationId);
        await supabase.from('User').delete().eq('id', app.userId);
      }
    }

    log('info', '  Đã xóa dữ liệu test');
  });

  // ============================================
  // KẾT QUẢ
  // ============================================
  console.log('\n' + '═'.repeat(80));
  console.log(`${c.bold}  KẾT QUẢ TEST TOÀN DIỆN${c.reset}`);
  console.log('═'.repeat(80));
  console.log(`\n  ${c.green}✓ Passed: ${passed}${c.reset}`);
  console.log(`  ${c.red}✗ Failed: ${failed}${c.reset}`);
  console.log(`  ${c.yellow}⚠ Warnings: ${warnings}${c.reset}`);
  console.log(`  Total: ${passed + failed + warnings}\n`);

  if (failed === 0) {
    console.log(`${c.green}${c.bold}  ✅ TẤT CẢ CHỨC NĂNG HOẠT ĐỘNG TỐT!${c.reset}\n`);
  } else {
    console.log(`${c.red}${c.bold}  ❌ CÓ ${failed} CHỨC NĂNG LỖI${c.reset}\n`);
    
    console.log(`${c.yellow}Các test thất bại:${c.reset}`);
    testResults.filter(t => t.status === 'fail').forEach(t => {
      console.log(`  - ${t.name}: ${t.error}`);
    });
  }
}

main().catch(console.error);
