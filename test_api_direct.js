/**
 * TEST API TRỰC TIẾP VỚI SUPABASE ADMIN
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mjwmmttjuaodhhmshvje.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyNDE3MSwiZXhwIjoyMDc4NjAwMTcxfQ.8MJFBFH_Yrm7i6dMLsc3jDbzMIW0ClYvhypjxCwnScw';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjQxNzEsImV4cCI6MjA3ODYwMDE3MX0.mkf-mS_Ufqf6Y95gSujBlALUlASCu-NyT2aAt7O3j2A';

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const c = {
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', 
  yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m', magenta: '\x1b[35m',
};

function log(type, msg) {
  const icons = { ok: `${c.green}✓`, err: `${c.red}✗`, info: `${c.blue}ℹ`, warn: `${c.yellow}⚠`, test: `${c.cyan}▶` };
  console.log(`${icons[type] || '•'}${c.reset} ${msg}`);
}

async function testCommissionLogic() {
  console.log(`\n${c.cyan}[TEST] KIỂM TRA LOGIC TÍNH HOA HỒNG${c.reset}`);
  console.log('-'.repeat(50));

  // Lấy cấu hình
  const { data: settings } = await adminClient.from('CommissionSetting').select('*');
  const settingsMap = new Map(settings?.map(s => [s.key, s]) || []);

  // Lấy user CTV1 và cấu trúc phân cấp
  const { data: ctv1 } = await adminClient
    .from('User')
    .select('id, name, role, parentId')
    .eq('email', 'ctv1@test.com')
    .single();

  if (!ctv1) {
    log('err', 'Không tìm thấy CTV1');
    return;
  }

  log('info', `CTV1: ${ctv1.name} (${ctv1.role})`);

  // Lấy Đại lý (parent)
  if (ctv1.parentId) {
    const { data: agent } = await adminClient
      .from('User')
      .select('id, name, role, parentId')
      .eq('id', ctv1.parentId)
      .single();

    if (agent) {
      log('info', `Đại lý: ${agent.name} (${agent.role})`);

      // Đếm số CTV của Đại lý
      const { count: ctvCount } = await adminClient
        .from('User')
        .select('*', { count: 'exact', head: true })
        .eq('parentId', agent.id);

      log('info', `Số CTV của Đại lý: ${ctvCount}`);

      // Lấy NPP (grandparent)
      if (agent.parentId) {
        const { data: npp } = await adminClient
          .from('User')
          .select('id, name, role')
          .eq('id', agent.parentId)
          .single();

        if (npp) {
          log('info', `NPP: ${npp.name} (${npp.role})`);

          // Đếm số Đại lý của NPP
          const { count: agentCount } = await adminClient
            .from('User')
            .select('*', { count: 'exact', head: true })
            .eq('parentId', npp.id);

          log('info', `Số Đại lý của NPP: ${agentCount}`);
        }
      }
    }
  }

  // Giả lập tính hoa hồng cho đơn 1,000,000đ
  const orderValue = 1000000;
  console.log(`\n${c.yellow}Giả lập đơn hàng ${orderValue.toLocaleString()}đ từ CTV1:${c.reset}`);

  const ctvRetail = settingsMap.get('ctv_retail')?.percent || settingsMap.get('collaborator_retail')?.percent || 10;
  const agentRetail = settingsMap.get('agent_retail')?.percent || 15;
  const nppRetail = settingsMap.get('distributor_retail')?.percent || settingsMap.get('master_agent_retail')?.percent || 20;

  const ctvAmount = orderValue * ctvRetail / 100;
  const agentOverride = orderValue * (agentRetail - ctvRetail) / 100;
  const nppOverride = orderValue * (nppRetail - agentRetail) / 100;

  console.log(`  CTV nhận (retail ${ctvRetail}%): ${ctvAmount.toLocaleString()}đ`);
  console.log(`  Đại lý nhận (override ${agentRetail - ctvRetail}%): ${agentOverride.toLocaleString()}đ ${c.yellow}(nếu có ≥3 CTV)${c.reset}`);
  console.log(`  NPP nhận (override ${nppRetail - agentRetail}%): ${nppOverride.toLocaleString()}đ ${c.yellow}(nếu có ≥3 Đại lý)${c.reset}`);
  console.log(`  ${c.green}Tổng chi hoa hồng: ${(ctvAmount + agentOverride + nppOverride).toLocaleString()}đ${c.reset}`);
}

async function testCreateOrder() {
  console.log(`\n${c.cyan}[TEST] TẠO ĐƠN HÀNG TEST${c.reset}`);
  console.log('-'.repeat(50));

  // Lấy CTV1
  const { data: ctv1 } = await adminClient
    .from('User')
    .select('id')
    .eq('email', 'ctv1@test.com')
    .single();

  // Lấy service đầu tiên
  const { data: service } = await adminClient
    .from('Service')
    .select('id, name, price')
    .eq('active', true)
    .limit(1)
    .single();

  if (!service) {
    log('warn', 'Không có service nào active');
    return null;
  }

  log('info', `Service: ${service.name} - ${service.price?.toLocaleString()}đ`);

  // Tạo đơn hàng test
  const orderCode = `TEST-${Date.now()}`;
  const { data: order, error } = await adminClient
    .from('Order')
    .insert({
      orderCode,
      customerName: 'Khách Test',
      customerPhone: '0909999999',
      customerEmail: 'test@test.com',
      address: '123 Test Street',
      city: 'Ho Chi Minh',
      serviceId: service.id,
      quantity: 1,
      unit: 'bot',
      scheduledDate: new Date().toISOString(),
      scheduledTime: '10:00',
      basePrice: service.price,
      totalPrice: service.price,
      status: 'pending',
      referrerId: ctv1?.id || null,
      referralCode: 'CTV001',
    })
    .select()
    .single();

  if (error) {
    log('err', `Lỗi tạo đơn: ${error.message}`);
    return null;
  }

  log('ok', `Tạo đơn thành công: ${order.orderCode}`);
  return order;
}

async function testConfirmOrderAndCommission(orderId) {
  console.log(`\n${c.cyan}[TEST] XÁC NHẬN ĐƠN VÀ TÍNH HOA HỒNG${c.reset}`);
  console.log('-'.repeat(50));

  if (!orderId) {
    log('warn', 'Không có orderId để test');
    return;
  }

  // Cập nhật status = confirmed
  const { error: updateErr } = await adminClient
    .from('Order')
    .update({ status: 'confirmed' })
    .eq('id', orderId);

  if (updateErr) {
    log('err', `Lỗi cập nhật: ${updateErr.message}`);
    return;
  }

  log('ok', 'Đã cập nhật status = confirmed');
  log('info', 'Lưu ý: Commission sẽ được tính khi gọi API PATCH /api/orders/[id]');

  // Kiểm tra commission đã tạo chưa
  const { data: commissions } = await adminClient
    .from('Commission')
    .select('*, user:userId(name, role)')
    .eq('orderId', orderId);

  if (commissions && commissions.length > 0) {
    log('ok', `Đã tạo ${commissions.length} commission:`);
    commissions.forEach(c => {
      console.log(`  • ${c.user?.name} (${c.user?.role}) - Level ${c.level}: ${c.percent}% = ${c.amount?.toLocaleString()}đ`);
    });
  } else {
    log('info', 'Chưa có commission (cần gọi API để trigger)');
  }
}

async function testWithdrawal() {
  console.log(`\n${c.cyan}[TEST] TẠO YÊU CẦU RÚT TIỀN${c.reset}`);
  console.log('-'.repeat(50));

  // Lấy CTV1
  const { data: ctv1 } = await adminClient
    .from('User')
    .select('id, name, balance')
    .eq('email', 'ctv1@test.com')
    .single();

  if (!ctv1) {
    log('err', 'Không tìm thấy CTV1');
    return;
  }

  log('info', `CTV1 balance: ${ctv1.balance?.toLocaleString()}đ`);

  // Tạo yêu cầu rút tiền test
  const { data: withdrawal, error } = await adminClient
    .from('Withdrawal')
    .insert({
      userId: ctv1.id,
      amount: 100000,
      bankName: 'Vietcombank',
      bankAccount: '1234567890',
      bankHolder: 'NGUYEN VAN TEST',
      status: 'pending',
      note: 'Test withdrawal',
    })
    .select()
    .single();

  if (error) {
    log('err', `Lỗi: ${error.message}`);
    return;
  }

  log('ok', `Tạo yêu cầu rút tiền: ${withdrawal.amount?.toLocaleString()}đ`);

  // Kiểm tra danh sách
  const { data: withdrawals } = await adminClient
    .from('Withdrawal')
    .select('*, user:userId(name)')
    .order('createdAt', { ascending: false })
    .limit(3);

  log('info', `Có ${withdrawals?.length || 0} yêu cầu rút tiền gần nhất`);
}

async function testReferralLink() {
  console.log(`\n${c.cyan}[TEST] KIỂM TRA REFERRAL LINK${c.reset}`);
  console.log('-'.repeat(50));

  // Lấy CTV1
  const { data: ctv1 } = await adminClient
    .from('User')
    .select('id')
    .eq('email', 'ctv1@test.com')
    .single();

  if (!ctv1) return;

  // Kiểm tra có referral link chưa
  const { data: existingLink } = await adminClient
    .from('ReferralLink')
    .select('*')
    .eq('userId', ctv1.id)
    .single();

  if (existingLink) {
    log('ok', `CTV1 đã có link: ${existingLink.code}`);
    log('info', `Clicks: ${existingLink.clickCount}, Orders: ${existingLink.orderCount}, Revenue: ${existingLink.revenue?.toLocaleString()}đ`);
  } else {
    // Tạo mới
    const code = `CTV1-${Date.now().toString(36).toUpperCase()}`;
    const { data: newLink, error } = await adminClient
      .from('ReferralLink')
      .insert({
        code,
        userId: ctv1.id,
        clickCount: 0,
        orderCount: 0,
        revenue: 0,
        isActive: true,
      })
      .select()
      .single();

    if (error) {
      log('err', `Lỗi tạo link: ${error.message}`);
    } else {
      log('ok', `Tạo link mới: ${newLink.code}`);
    }
  }
}

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log('  TEST TOÀN DIỆN HỆ THỐNG CTV/ĐẠI LÝ');
  console.log('═'.repeat(60));

  // 1. Test logic commission
  await testCommissionLogic();

  // 2. Test referral link
  await testReferralLink();

  // 3. Test tạo đơn hàng
  const order = await testCreateOrder();

  // 4. Test xác nhận đơn và commission
  if (order) {
    await testConfirmOrderAndCommission(order.id);
  }

  // 5. Test rút tiền
  await testWithdrawal();

  // 6. Chạy lại database test
  console.log(`\n${c.cyan}[FINAL] KIỂM TRA LẠI DATABASE${c.reset}`);
  console.log('-'.repeat(50));

  const { data: finalCommissions } = await adminClient
    .from('Commission')
    .select('*, user:userId(name, role), order:orderId(orderCode)')
    .order('createdAt', { ascending: false })
    .limit(5);

  if (finalCommissions && finalCommissions.length > 0) {
    log('ok', `Có ${finalCommissions.length} commission:`);
    finalCommissions.forEach(c => {
      console.log(`  • ${c.order?.orderCode} | ${c.user?.name} (${c.user?.role}) | L${c.level} | ${c.percent}% = ${c.amount?.toLocaleString()}đ | ${c.status}`);
    });
  } else {
    log('info', 'Chưa có commission nào');
  }

  console.log('\n' + '═'.repeat(60));
  console.log('  KẾT THÚC TEST');
  console.log('═'.repeat(60) + '\n');
}

main().catch(console.error);
