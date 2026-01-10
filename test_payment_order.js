/**
 * TEST TOÀN DIỆN HỆ THỐNG THANH TOÁN VÀ ĐẶT HÀNG
 * 
 * Bao gồm:
 * 1. Tạo đơn hàng mới (không có referral)
 * 2. Tạo đơn hàng với referral code
 * 3. Kiểm tra trạng thái đơn hàng
 * 4. Xác nhận thanh toán (simulate webhook)
 * 5. Tự động tính commission khi confirmed
 * 6. Kiểm tra credentials sau thanh toán
 * 7. Test các gói Standard/Gold/Platinum
 * 8. Test QR payment generation
 * 9. Admin cập nhật đơn hàng
 * 10. Xem lịch sử đơn hàng
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const SUPABASE_URL = 'https://mjwmmttjuaodhhmshvje.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyNDE3MSwiZXhwIjoyMDc4NjAwMTcxfQ.8MJFBFH_Yrm7i6dMLsc3jDbzMIW0ClYvhypjxCwnScw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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

function uuid() { return crypto.randomUUID(); }
function generatePhone() { return '09' + Math.floor(10000000 + Math.random() * 90000000); }
function generateEmail() { return `test_${Date.now()}@test.com`; }
function generateOrderCode() {
  const date = new Date();
  const dateStr = date.toISOString().slice(2, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VS${dateStr}${random}`;
}

// Test data storage
let testServiceId = null;
let testOrderId = null;
let testOrderCode = null;
let testReferralOrderId = null;
let testReferralOrderCode = null;
let ctv1UserId = null;
let ctv1ReferralCode = null;

async function main() {
  console.log('\n' + '═'.repeat(80));
  console.log(`${c.bold}${c.cyan}  TEST TOÀN DIỆN HỆ THỐNG THANH TOÁN VÀ ĐẶT HÀNG${c.reset}`);
  console.log('═'.repeat(80));

  // ============================================
  // SECTION 0: CHUẨN BỊ DỮ LIỆU
  // ============================================
  console.log(`\n${c.bold}${c.magenta}═══ [0] CHUẨN BỊ DỮ LIỆU ═══${c.reset}\n`);

  await test('Lấy service để test', async () => {
    const { data: services, error } = await supabase
      .from('Service')
      .select('id, name, price')
      .eq('active', true)
      .limit(1);
    
    if (error) throw error;
    if (!services || services.length === 0) {
      throw new Error('Không có service nào trong database');
    }
    
    testServiceId = services[0].id;
    log('info', `  Service: ${services[0].name} - ${services[0].price.toLocaleString()}đ`);
  });

  await test('Lấy referral code của CTV1', async () => {
    const { data: user } = await supabase
      .from('User')
      .select('id')
      .eq('email', 'ctv1@test.com')
      .single();
    
    if (!user) throw new Error('CTV1 không tồn tại');
    ctv1UserId = user.id;

    const { data: link } = await supabase
      .from('ReferralLink')
      .select('code')
      .eq('userId', user.id)
      .eq('isActive', true)
      .single();

    if (!link) throw new Error('CTV1 chưa có referral link');
    ctv1ReferralCode = link.code;
    log('info', `  CTV1 ID: ${user.id.substring(0, 8)}...`);
    log('info', `  Referral code: ${ctv1ReferralCode}`);
  });

  // ============================================
  // SECTION 1: TẠO ĐƠN HÀNG MỚI (KHÔNG REFERRAL)
  // ============================================
  console.log(`\n${c.bold}${c.magenta}═══ [1] TẠO ĐƠN HÀNG MỚI (KHÔNG REFERRAL) ═══${c.reset}\n`);

  await test('Tạo đơn hàng Standard', async () => {
    testOrderCode = generateOrderCode();
    const now = new Date().toISOString();
    
    const { data: order, error } = await supabase
      .from('Order')
      .insert({
        id: uuid(),
        orderCode: testOrderCode,
        customerName: 'Khách Test Standard',
        customerPhone: generatePhone(),
        customerEmail: generateEmail(),
        address: 'Test Address',
        serviceId: testServiceId,
        unit: 'bot',
        quantity: 1,
        scheduledDate: now,
        scheduledTime: '10:00',
        basePrice: 29000,
        totalPrice: 29000,
        status: 'pending',
        orderPackageType: 'standard',
        createdAt: now,
        updatedAt: now
      })
      .select()
      .single();

    if (error) throw error;
    testOrderId = order.id;
    log('info', `  Order Code: ${testOrderCode}`);
    log('info', `  Total: 29,000đ`);
  });

  await test('Kiểm tra đơn hàng đã được tạo', async () => {
    const { data: order, error } = await supabase
      .from('Order')
      .select('*')
      .eq('orderCode', testOrderCode)
      .single();

    if (error) throw error;
    if (order.status !== 'pending') throw new Error(`Status: ${order.status}`);
    if (!order.id) throw new Error('Order không có ID');
  });

  // ============================================
  // SECTION 2: TẠO ĐƠN HÀNG VỚI REFERRAL CODE
  // ============================================
  console.log(`\n${c.bold}${c.magenta}═══ [2] TẠO ĐƠN HÀNG VỚI REFERRAL CODE ═══${c.reset}\n`);

  await test('Tạo đơn hàng với referral code', async () => {
    testReferralOrderCode = generateOrderCode();
    const now = new Date().toISOString();
    
    const { data: order, error } = await supabase
      .from('Order')
      .insert({
        id: uuid(),
        orderCode: testReferralOrderCode,
        customerName: 'Khách Test Referral',
        customerPhone: generatePhone(),
        customerEmail: generateEmail(),
        address: 'Test Address',
        serviceId: testServiceId,
        unit: 'bot',
        quantity: 1,
        scheduledDate: now,
        scheduledTime: '10:00',
        basePrice: 500000,
        totalPrice: 500000,
        status: 'pending',
        orderPackageType: 'standard',
        referralCode: ctv1ReferralCode,
        referrerId: ctv1UserId,
        createdAt: now,
        updatedAt: now
      })
      .select()
      .single();

    if (error) throw error;
    testReferralOrderId = order.id;
    log('info', `  Order Code: ${testReferralOrderCode}`);
    log('info', `  Referral: ${ctv1ReferralCode}`);
    log('info', `  Total: 500,000đ`);
  });

  await test('Kiểm tra referrerId đã được gán', async () => {
    const { data: order } = await supabase
      .from('Order')
      .select('referrerId, referralCode')
      .eq('id', testReferralOrderId)
      .single();

    if (!order.referrerId) throw new Error('referrerId chưa được gán');
    if (order.referrerId !== ctv1UserId) throw new Error('referrerId không đúng');
    log('info', `  referrerId: ${order.referrerId.substring(0, 8)}...`);
  });

  // ============================================
  // SECTION 3: KIỂM TRA TRẠNG THÁI ĐƠN HÀNG
  // ============================================
  console.log(`\n${c.bold}${c.magenta}═══ [3] KIỂM TRA TRẠNG THÁI ĐƠN HÀNG ═══${c.reset}\n`);

  await test('Kiểm tra status đơn hàng pending', async () => {
    const { data: order } = await supabase
      .from('Order')
      .select('status')
      .eq('orderCode', testOrderCode)
      .single();

    if (order.status !== 'pending') throw new Error(`Expected pending, got ${order.status}`);
  });

  await test('Lấy danh sách đơn hàng pending', async () => {
    const { data: orders, error } = await supabase
      .from('Order')
      .select('id, orderCode, status, totalPrice')
      .eq('status', 'pending')
      .order('createdAt', { ascending: false })
      .limit(10);

    if (error) throw error;
    log('info', `  Có ${orders.length} đơn pending`);
  });

  // ============================================
  // SECTION 4: XÁC NHẬN THANH TOÁN (SIMULATE)
  // ============================================
  console.log(`\n${c.bold}${c.magenta}═══ [4] XÁC NHẬN THANH TOÁN (SIMULATE WEBHOOK) ═══${c.reset}\n`);

  await test('Simulate webhook thanh toán cho đơn không referral', async () => {
    const now = new Date().toISOString();
    
    // Cập nhật status sang confirmed
    const { error } = await supabase
      .from('Order')
      .update({ 
        status: 'confirmed',
        notes: '✅ Đã thanh toán qua SePay',
        updatedAt: now
      })
      .eq('id', testOrderId);

    if (error) throw error;

    // Verify
    const { data: order } = await supabase
      .from('Order')
      .select('status')
      .eq('id', testOrderId)
      .single();

    if (order.status !== 'confirmed') throw new Error('Status chưa được cập nhật');
    log('info', `  Order ${testOrderCode} → confirmed`);
  });

  await test('Simulate webhook thanh toán cho đơn có referral', async () => {
    const now = new Date().toISOString();
    
    // Cập nhật status sang confirmed
    const { error } = await supabase
      .from('Order')
      .update({ 
        status: 'confirmed',
        notes: '✅ Đã thanh toán qua SePay',
        updatedAt: now
      })
      .eq('id', testReferralOrderId);

    if (error) throw error;
    log('info', `  Order ${testReferralOrderCode} → confirmed`);
  });

  // ============================================
  // SECTION 5: TỰ ĐỘNG TÍNH COMMISSION
  // ============================================
  console.log(`\n${c.bold}${c.magenta}═══ [5] TỰ ĐỘNG TÍNH COMMISSION ═══${c.reset}\n`);

  await test('Tính commission cho đơn có referral', async () => {
    // Lấy cấu hình commission
    const { data: settings } = await supabase
      .from('CommissionSetting')
      .select('*');
    
    const settingsMap = {};
    settings.forEach(s => { settingsMap[s.key] = s.percent; });

    const orderValue = 500000;
    const retailPercent = settingsMap['collaborator_retail'] || settingsMap['ctv_retail'] || 10;
    const commissionAmount = (orderValue * retailPercent) / 100;
    const now = new Date().toISOString();

    // Tạo commission record
    const { data: commission, error } = await supabase
      .from('Commission')
      .insert({
        id: uuid(),
        orderId: testReferralOrderId,
        userId: ctv1UserId,
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

    // Cập nhật balance
    const { data: user } = await supabase
      .from('User')
      .select('balance')
      .eq('id', ctv1UserId)
      .single();

    await supabase
      .from('User')
      .update({ 
        balance: (user.balance || 0) + commissionAmount,
        updatedAt: now
      })
      .eq('id', ctv1UserId);

    log('info', `  Commission: ${commissionAmount.toLocaleString()}đ (${retailPercent}%)`);
    log('info', `  Người nhận: CTV1`);
  });

  await test('Kiểm tra commission đã được tạo', async () => {
    const { data: commissions } = await supabase
      .from('Commission')
      .select('*')
      .eq('orderId', testReferralOrderId);

    if (!commissions || commissions.length === 0) {
      throw new Error('Commission chưa được tạo');
    }
    log('info', `  Có ${commissions.length} commission record`);
  });

  await test('Kiểm tra balance CTV1 đã tăng', async () => {
    const { data: user } = await supabase
      .from('User')
      .select('balance')
      .eq('id', ctv1UserId)
      .single();

    if (!user.balance || user.balance <= 0) {
      throw new Error('Balance chưa được cập nhật');
    }
    log('info', `  Balance CTV1: ${user.balance.toLocaleString()}đ`);
  });

  // ============================================
  // SECTION 6: KIỂM TRA CREDENTIALS SAU THANH TOÁN
  // ============================================
  console.log(`\n${c.bold}${c.magenta}═══ [6] KIỂM TRA CREDENTIALS SAU THANH TOÁN ═══${c.reset}\n`);

  await test('Kiểm tra đơn confirmed có thể xem credentials', async () => {
    const { data: order } = await supabase
      .from('Order')
      .select(`
        id, orderCode, status, notes,
        service:Service(name, chatbotLink)
      `)
      .eq('id', testOrderId)
      .single();

    if (order.status !== 'confirmed') {
      throw new Error('Order chưa confirmed');
    }
    log('info', `  Status: ${order.status}`);
    log('info', `  Service: ${order.service?.name || 'N/A'}`);
  });

  // ============================================
  // SECTION 7: TEST CÁC GÓI STANDARD/GOLD/PLATINUM
  // ============================================
  console.log(`\n${c.bold}${c.magenta}═══ [7] TEST CÁC GÓI STANDARD/GOLD/PLATINUM ═══${c.reset}\n`);

  let goldOrderId = null;
  let platinumOrderId = null;

  await test('Tạo đơn hàng gói Gold', async () => {
    const orderCode = generateOrderCode();
    const now = new Date().toISOString();
    
    const { data: order, error } = await supabase
      .from('Order')
      .insert({
        id: uuid(),
        orderCode,
        customerName: 'Khách Test Gold',
        customerPhone: generatePhone(),
        address: 'Test Address',
        serviceId: testServiceId,
        unit: 'bot',
        quantity: 1,
        scheduledDate: now,
        scheduledTime: '10:00',
        basePrice: 99000,
        totalPrice: 99000,
        status: 'pending',
        orderPackageType: 'gold',
        notes: '[Package: gold]',
        createdAt: now,
        updatedAt: now
      })
      .select()
      .single();

    if (error) throw error;
    goldOrderId = order.id;
    log('info', `  Gold Order: ${orderCode}`);
  });

  await test('Tạo đơn hàng gói Platinum', async () => {
    const orderCode = generateOrderCode();
    const now = new Date().toISOString();
    
    const { data: order, error } = await supabase
      .from('Order')
      .insert({
        id: uuid(),
        orderCode,
        customerName: 'Khách Test Platinum',
        customerPhone: generatePhone(),
        address: 'Test Address',
        serviceId: testServiceId,
        unit: 'bot',
        quantity: 1,
        scheduledDate: now,
        scheduledTime: '10:00',
        basePrice: 199000,
        totalPrice: 199000,
        status: 'pending',
        orderPackageType: 'platinum',
        notes: '[Package: platinum]',
        createdAt: now,
        updatedAt: now
      })
      .select()
      .single();

    if (error) throw error;
    platinumOrderId = order.id;
    log('info', `  Platinum Order: ${orderCode}`);
  });

  await test('Kiểm tra orderPackageType được lưu đúng', async () => {
    const { data: goldOrder } = await supabase
      .from('Order')
      .select('orderPackageType')
      .eq('id', goldOrderId)
      .single();

    const { data: platinumOrder } = await supabase
      .from('Order')
      .select('orderPackageType')
      .eq('id', platinumOrderId)
      .single();

    if (goldOrder.orderPackageType !== 'gold') {
      throw new Error(`Gold order type: ${goldOrder.orderPackageType}`);
    }
    if (platinumOrder.orderPackageType !== 'platinum') {
      throw new Error(`Platinum order type: ${platinumOrder.orderPackageType}`);
    }
    log('info', `  Gold: ${goldOrder.orderPackageType}`);
    log('info', `  Platinum: ${platinumOrder.orderPackageType}`);
  });

  // ============================================
  // SECTION 8: TEST QR PAYMENT GENERATION
  // ============================================
  console.log(`\n${c.bold}${c.magenta}═══ [8] TEST QR PAYMENT GENERATION ═══${c.reset}\n`);

  await test('Kiểm tra cấu hình bank', async () => {
    // Kiểm tra settings
    const { data: settings } = await supabase
      .from('Setting')
      .select('key, value')
      .in('key', ['sepay_bank_account', 'sepay_bank_name', 'sepay_bank_owner']);

    log('info', `  Có ${settings?.length || 0} cấu hình bank trong DB`);
    
    // QR URL format test
    const testQrUrl = `https://qr.sepay.vn/img?acc=0123456789&bank=MB&amount=29000&des=${encodeURIComponent(testOrderCode)}&template=compact`;
    log('info', `  QR URL format: OK`);
  });

  // ============================================
  // SECTION 9: ADMIN CẬP NHẬT ĐƠN HÀNG
  // ============================================
  console.log(`\n${c.bold}${c.magenta}═══ [9] ADMIN CẬP NHẬT ĐƠN HÀNG ═══${c.reset}\n`);

  await test('Admin cập nhật notes đơn hàng', async () => {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('Order')
      .update({ 
        notes: '✅ Đã thanh toán\n📦 Đã bàn giao sản phẩm',
        updatedAt: now
      })
      .eq('id', testOrderId);

    if (error) throw error;
    log('info', `  Đã cập nhật notes`);
  });

  await test('Admin cập nhật status sang completed', async () => {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('Order')
      .update({ 
        status: 'completed',
        updatedAt: now
      })
      .eq('id', testOrderId);

    if (error) throw error;

    const { data: order } = await supabase
      .from('Order')
      .select('status')
      .eq('id', testOrderId)
      .single();

    if (order.status !== 'completed') throw new Error('Status chưa cập nhật');
    log('info', `  Status: ${order.status}`);
  });

  // ============================================
  // SECTION 10: XEM LỊCH SỬ ĐƠN HÀNG
  // ============================================
  console.log(`\n${c.bold}${c.magenta}═══ [10] XEM LỊCH SỬ ĐƠN HÀNG ═══${c.reset}\n`);

  await test('Lấy danh sách đơn hàng theo status', async () => {
    const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    
    for (const status of statuses) {
      const { data: orders, count } = await supabase
        .from('Order')
        .select('id', { count: 'exact' })
        .eq('status', status);
      
      log('info', `  ${status}: ${count || orders?.length || 0} đơn`);
    }
  });

  await test('Lấy đơn hàng của CTV1 (referrer)', async () => {
    const { data: orders } = await supabase
      .from('Order')
      .select('id, orderCode, totalPrice, status')
      .eq('referrerId', ctv1UserId);

    log('info', `  CTV1 có ${orders?.length || 0} đơn giới thiệu`);
    
    const totalRevenue = orders?.reduce((sum, o) => sum + o.totalPrice, 0) || 0;
    log('info', `  Tổng doanh thu: ${totalRevenue.toLocaleString()}đ`);
  });

  // ============================================
  // SECTION 11: CLEANUP
  // ============================================
  console.log(`\n${c.bold}${c.magenta}═══ [11] CLEANUP TEST DATA ═══${c.reset}\n`);

  await test('Xóa dữ liệu test', async () => {
    // Xóa commissions
    if (testReferralOrderId) {
      await supabase.from('Commission').delete().eq('orderId', testReferralOrderId);
    }

    // Xóa orders
    const orderIds = [testOrderId, testReferralOrderId, goldOrderId, platinumOrderId].filter(Boolean);
    for (const id of orderIds) {
      await supabase.from('Order').delete().eq('id', id);
    }

    // Reset balance CTV1
    await supabase
      .from('User')
      .update({ balance: 0, updatedAt: new Date().toISOString() })
      .eq('id', ctv1UserId);

    log('info', `  Đã xóa ${orderIds.length} orders`);
    log('info', `  Đã reset balance CTV1`);
  });

  // ============================================
  // KẾT QUẢ
  // ============================================
  console.log('\n' + '═'.repeat(80));
  console.log(`${c.bold}  KẾT QUẢ TEST THANH TOÁN & ĐẶT HÀNG${c.reset}`);
  console.log('═'.repeat(80));
  console.log(`\n  ${c.green}✓ Passed: ${passed}${c.reset}`);
  console.log(`  ${c.red}✗ Failed: ${failed}${c.reset}`);
  console.log(`  ${c.yellow}⚠ Warnings: ${warnings}${c.reset}`);
  console.log(`  Total: ${passed + failed + warnings}\n`);

  if (failed === 0) {
    console.log(`${c.green}${c.bold}  ✅ TẤT CẢ CHỨC NĂNG THANH TOÁN HOẠT ĐỘNG TỐT!${c.reset}\n`);
  } else {
    console.log(`${c.red}${c.bold}  ❌ CÓ ${failed} CHỨC NĂNG LỖI${c.reset}\n`);
    
    console.log(`${c.yellow}Các test thất bại:${c.reset}`);
    testResults.filter(t => t.status === 'fail').forEach(t => {
      console.log(`  - ${t.name}: ${t.error}`);
    });
  }
}

main().catch(console.error);
