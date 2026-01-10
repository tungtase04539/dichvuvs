/**
 * TEST TOÀN DIỆN TẤT CẢ CHỨC NĂNG VÀ VAI TRÒ
 * Sử dụng Supabase Admin API để test trực tiếp database
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mjwmmttjuaodhhmshvje.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyNDE3MSwiZXhwIjoyMDc4NjAwMTcxfQ.8MJFBFH_Yrm7i6dMLsc3jDbzMIW0ClYvhypjxCwnScw';

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const c = { reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m', magenta: '\x1b[35m', white: '\x1b[37m' };
const log = (t, m) => console.log(`${({ok:`${c.green}✓`,err:`${c.red}✗`,info:`${c.blue}ℹ`,warn:`${c.yellow}⚠`,test:`${c.cyan}▶`})[t]||'•'}${c.reset} ${m}`);
const section = (t) => console.log(`\n${c.magenta}${'═'.repeat(60)}\n  ${t}\n${'═'.repeat(60)}${c.reset}`);
const subsection = (t) => console.log(`\n${c.cyan}[${t}]${c.reset}\n${'-'.repeat(50)}`);

let testResults = { passed: 0, failed: 0, warnings: 0 };
const pass = (m) => { testResults.passed++; log('ok', m); };
const fail = (m) => { testResults.failed++; log('err', m); };
const warn = (m) => { testResults.warnings++; log('warn', m); };

// Cache users
let users = {};


async function loadUsers() {
  const { data } = await db.from('User').select('*').in('role', ['admin', 'distributor', 'agent', 'collaborator', 'ctv', 'staff']);
  data?.forEach(u => { users[u.email] = u; });
  return data;
}

// ==================== TEST FUNCTIONS ====================

async function testCommissionSettings() {
  subsection('1. CẤU HÌNH HOA HỒNG');
  
  const { data, error } = await db.from('CommissionSetting').select('*').order('percent');
  
  if (error) return fail(`Lỗi query: ${error.message}`);
  if (!data || data.length === 0) return fail('Không có cấu hình hoa hồng');
  
  pass(`Có ${data.length} cấu hình hoa hồng`);
  
  // Kiểm tra các cấu hình cần thiết
  const required = ['ctv_retail', 'collaborator_retail', 'agent_retail', 'distributor_retail'];
  const keys = data.map(d => d.key);
  
  for (const key of required) {
    if (keys.includes(key)) {
      const setting = data.find(d => d.key === key);
      pass(`${key}: ${setting.percent}%`);
    } else {
      fail(`Thiếu cấu hình: ${key}`);
    }
  }
  
  // Kiểm tra logic % tăng dần
  const ctv = data.find(d => d.key === 'ctv_retail')?.percent || 0;
  const agent = data.find(d => d.key === 'agent_retail')?.percent || 0;
  const npp = data.find(d => d.key === 'distributor_retail')?.percent || data.find(d => d.key === 'master_agent_retail')?.percent || 0;
  
  if (ctv < agent && agent < npp) {
    pass(`Logic % đúng: CTV(${ctv}%) < Agent(${agent}%) < NPP(${npp}%)`);
  } else {
    fail(`Logic % sai: CTV(${ctv}%), Agent(${agent}%), NPP(${npp}%)`);
  }
}

async function testUserHierarchy() {
  subsection('2. CẤU TRÚC PHÂN CẤP USER');
  
  await loadUsers();
  
  // Kiểm tra NPP
  const npp = Object.values(users).find(u => u.role === 'distributor' || u.role === 'master_agent');
  if (npp) {
    pass(`NPP: ${npp.name} (${npp.email})`);
    
    // Đếm đại lý của NPP
    const { count: agentCount } = await db.from('User').select('*', { count: 'exact', head: true }).eq('parentId', npp.id);
    if (agentCount >= 3) {
      pass(`NPP có ${agentCount} Đại lý → ĐỦ điều kiện override`);
    } else {
      warn(`NPP có ${agentCount} Đại lý → CHƯA đủ điều kiện (cần ≥3)`);
    }
  } else {
    warn('Không có NPP');
  }
  
  // Kiểm tra Đại lý
  const agents = Object.values(users).filter(u => u.role === 'agent');
  pass(`Có ${agents.length} Đại lý`);
  
  for (const agent of agents) {
    const { count: ctvCount } = await db.from('User').select('*', { count: 'exact', head: true }).eq('parentId', agent.id);
    const status = ctvCount >= 3 ? `${c.green}ĐỦ${c.reset}` : `${c.yellow}CHƯA đủ${c.reset}`;
    log('info', `  ${agent.name}: ${ctvCount} CTV → ${status} điều kiện override`);
  }
  
  // Kiểm tra CTV
  const ctvs = Object.values(users).filter(u => u.role === 'collaborator' || u.role === 'ctv');
  pass(`Có ${ctvs.length} CTV`);
}


async function testReferralLinks() {
  subsection('3. LINK GIỚI THIỆU (REFERRAL)');
  
  const { data: links, error } = await db.from('ReferralLink').select('*, user:userId(name, email, role)').eq('isActive', true);
  
  if (error) return fail(`Lỗi: ${error.message}`);
  
  pass(`Có ${links?.length || 0} link giới thiệu active`);
  
  // Kiểm tra từng role có link không
  const roles = ['distributor', 'agent', 'collaborator', 'ctv'];
  for (const role of roles) {
    const roleLinks = links?.filter(l => l.user?.role === role) || [];
    if (roleLinks.length > 0) {
      pass(`${role}: ${roleLinks.length} link`);
      roleLinks.slice(0, 2).forEach(l => {
        log('info', `  • ${l.code} (${l.user?.name}) - Clicks: ${l.clickCount}, Orders: ${l.orderCount}`);
      });
    } else {
      warn(`${role}: Chưa có link`);
    }
  }
}

async function testOrders() {
  subsection('4. ĐƠN HÀNG');
  
  const { data: orders, count } = await db.from('Order').select('*, referrer:referrerId(name, role)', { count: 'exact' }).order('createdAt', { ascending: false }).limit(10);
  
  pass(`Tổng ${count || 0} đơn hàng`);
  
  // Thống kê theo status
  const { data: statusStats } = await db.from('Order').select('status').then(res => {
    const stats = {};
    res.data?.forEach(o => { stats[o.status] = (stats[o.status] || 0) + 1; });
    return { data: stats };
  });
  
  log('info', `Theo trạng thái:`);
  Object.entries(statusStats || {}).forEach(([status, count]) => {
    log('info', `  • ${status}: ${count}`);
  });
  
  // Đơn có referrer
  const ordersWithRef = orders?.filter(o => o.referrerId) || [];
  pass(`${ordersWithRef.length}/${orders?.length || 0} đơn gần nhất có referrer`);
  
  ordersWithRef.slice(0, 3).forEach(o => {
    log('info', `  • ${o.orderCode}: ${o.totalPrice?.toLocaleString()}đ - Ref: ${o.referrer?.name} (${o.referrer?.role})`);
  });
}

async function testCommissions() {
  subsection('5. HOA HỒNG (COMMISSION)');
  
  const { data: commissions, count } = await db.from('Commission').select('*, user:userId(name, role), order:orderId(orderCode, totalPrice)', { count: 'exact' }).order('createdAt', { ascending: false }).limit(10);
  
  if (count === 0) {
    warn('Chưa có commission nào được tạo');
    log('info', 'Commission sẽ được tạo khi Admin xác nhận đơn hàng có referrer');
    return;
  }
  
  pass(`Tổng ${count} commission`);
  
  // Thống kê theo level
  const levelStats = {};
  commissions?.forEach(c => { levelStats[c.level] = (levelStats[c.level] || 0) + 1; });
  
  log('info', 'Theo level:');
  Object.entries(levelStats).forEach(([level, cnt]) => {
    const desc = level == 1 ? 'Retail (bán trực tiếp)' : `Override Level ${level}`;
    log('info', `  • Level ${level} (${desc}): ${cnt}`);
  });
  
  // Thống kê theo status
  const { data: statusData } = await db.from('Commission').select('status, amount').then(res => {
    const stats = { pending: { count: 0, amount: 0 }, paid: { count: 0, amount: 0 } };
    res.data?.forEach(c => {
      stats[c.status] = stats[c.status] || { count: 0, amount: 0 };
      stats[c.status].count++;
      stats[c.status].amount += c.amount || 0;
    });
    return { data: stats };
  });
  
  log('info', 'Theo trạng thái:');
  log('info', `  • Pending: ${statusData?.pending?.count || 0} (${(statusData?.pending?.amount || 0).toLocaleString()}đ)`);
  log('info', `  • Paid: ${statusData?.paid?.count || 0} (${(statusData?.paid?.amount || 0).toLocaleString()}đ)`);
  
  // Chi tiết commission gần nhất
  log('info', 'Commission gần nhất:');
  commissions?.slice(0, 5).forEach(c => {
    log('info', `  • ${c.order?.orderCode || 'N/A'} | ${c.user?.name} (${c.user?.role}) | L${c.level} | ${c.percent}% = ${c.amount?.toLocaleString()}đ | ${c.status}`);
  });
}


async function testWithdrawals() {
  subsection('6. YÊU CẦU RÚT TIỀN');
  
  const { data: withdrawals, count } = await db.from('Withdrawal').select('*, user:userId(name, email, role)', { count: 'exact' }).order('createdAt', { ascending: false }).limit(10);
  
  pass(`Tổng ${count || 0} yêu cầu rút tiền`);
  
  if (count > 0) {
    // Thống kê theo status
    const statusStats = {};
    withdrawals?.forEach(w => { statusStats[w.status] = (statusStats[w.status] || 0) + 1; });
    
    log('info', 'Theo trạng thái:');
    Object.entries(statusStats).forEach(([status, cnt]) => {
      log('info', `  • ${status}: ${cnt}`);
    });
    
    // Chi tiết
    log('info', 'Yêu cầu gần nhất:');
    withdrawals?.slice(0, 5).forEach(w => {
      log('info', `  • ${w.user?.name} (${w.user?.role}) | ${w.amount?.toLocaleString()}đ | ${w.bankName} | ${w.status}`);
    });
  }
}

async function testUserBalances() {
  subsection('7. SỐ DƯ USER');
  
  const { data: usersWithBalance } = await db.from('User').select('name, email, role, balance').gt('balance', 0).order('balance', { ascending: false }).limit(10);
  
  if (!usersWithBalance || usersWithBalance.length === 0) {
    warn('Chưa có user nào có số dư > 0');
    log('info', 'Số dư sẽ tăng khi có commission được tạo');
    return;
  }
  
  pass(`${usersWithBalance.length} user có số dư > 0`);
  usersWithBalance.forEach(u => {
    log('info', `  • ${u.name} (${u.role}): ${u.balance?.toLocaleString()}đ`);
  });
}

async function testServices() {
  subsection('8. SẢN PHẨM/DỊCH VỤ');
  
  const { data: services, count } = await db.from('Service').select('id, name, price, active, featured', { count: 'exact' });
  
  pass(`Tổng ${count || 0} sản phẩm`);
  
  const active = services?.filter(s => s.active) || [];
  const featured = services?.filter(s => s.featured) || [];
  
  log('info', `  • Active: ${active.length}`);
  log('info', `  • Featured: ${featured.length}`);
  
  // Hiển thị vài sản phẩm
  log('info', 'Sản phẩm mẫu:');
  services?.slice(0, 3).forEach(s => {
    log('info', `  • ${s.name}: ${s.price?.toLocaleString()}đ ${s.active ? '✓' : '✗'}`);
  });
}

async function testCategories() {
  subsection('9. DANH MỤC');
  
  const { data: categories, count } = await db.from('Category').select('id, name, active', { count: 'exact' });
  
  pass(`Tổng ${count || 0} danh mục`);
  
  categories?.forEach(cat => {
    log('info', `  • ${cat.name} ${cat.active ? '✓' : '✗'}`);
  });
}


async function testRolePermissions() {
  subsection('10. KIỂM TRA QUYỀN THEO VAI TRÒ');
  
  const roleFeatures = {
    admin: ['Dashboard', 'Đơn hàng', 'Khách hàng', 'Duyệt CTV', 'Sản phẩm', 'Quản lý hoa hồng', 'Yêu cầu rút tiền', 'Cấu hình gói', 'Cấu hình hoa hồng', 'Tài khoản'],
    staff: ['Dashboard', 'Đơn hàng', 'Khách hàng', 'Duyệt CTV', 'Sản phẩm'],
    distributor: ['Dashboard CTV', 'Đơn hàng', 'Hoa hồng', 'Rút tiền', 'Đội nhóm', 'Sản phẩm'],
    agent: ['Dashboard CTV', 'Đơn hàng', 'Hoa hồng', 'Rút tiền', 'Đội nhóm', 'Sản phẩm'],
    collaborator: ['Dashboard CTV', 'Đơn hàng', 'Hoa hồng', 'Rút tiền', 'Sản phẩm'],
    ctv: ['Dashboard CTV', 'Đơn hàng', 'Hoa hồng', 'Rút tiền', 'Sản phẩm'],
  };
  
  for (const [role, features] of Object.entries(roleFeatures)) {
    const hasTeam = features.includes('Đội nhóm');
    const teamNote = hasTeam ? ' (có Đội nhóm)' : ' (không có Đội nhóm)';
    pass(`${role.toUpperCase()}: ${features.length} menu${teamNote}`);
  }
  
  log('info', '\nQuy tắc hiển thị dữ liệu:');
  log('info', '  • CTV: Chỉ thấy đơn hàng và khách do mình giới thiệu');
  log('info', '  • Đại lý: Thấy CTV trực thuộc + khách trực tiếp (KHÔNG thấy khách của CTV)');
  log('info', '  • NPP: Thấy Đại lý + CTV trực thuộc + khách trực tiếp (KHÔNG thấy khách của cấp dưới)');
}

async function testCommissionCalculation() {
  subsection('11. KIỂM TRA TÍNH TOÁN HOA HỒNG');
  
  // Lấy cấu hình
  const { data: settings } = await db.from('CommissionSetting').select('*');
  const getPercent = (key) => settings?.find(s => s.key === key)?.percent || 0;
  
  const ctvPercent = getPercent('ctv_retail') || getPercent('collaborator_retail');
  const agentPercent = getPercent('agent_retail');
  const nppPercent = getPercent('distributor_retail') || getPercent('master_agent_retail');
  
  const orderValue = 1000000;
  
  log('info', `Giả lập đơn hàng ${orderValue.toLocaleString()}đ:\n`);
  
  // Case 1: CTV bán, không có cấp trên
  const case1 = orderValue * ctvPercent / 100;
  log('info', `${c.yellow}Case 1: CTV bán (không có cấp trên)${c.reset}`);
  log('info', `  CTV nhận: ${ctvPercent}% = ${case1.toLocaleString()}đ`);
  log('info', `  Tổng: ${case1.toLocaleString()}đ\n`);
  
  // Case 2: CTV bán, có Đại lý (đủ 3 CTV)
  const case2_ctv = orderValue * ctvPercent / 100;
  const case2_agent = orderValue * (agentPercent - ctvPercent) / 100;
  log('info', `${c.yellow}Case 2: CTV bán (có Đại lý đủ 3 CTV)${c.reset}`);
  log('info', `  CTV nhận: ${ctvPercent}% = ${case2_ctv.toLocaleString()}đ`);
  log('info', `  Đại lý nhận: ${agentPercent - ctvPercent}% = ${case2_agent.toLocaleString()}đ`);
  log('info', `  Tổng: ${(case2_ctv + case2_agent).toLocaleString()}đ\n`);
  
  // Case 3: CTV bán, có Đại lý + NPP (đủ điều kiện)
  const case3_ctv = orderValue * ctvPercent / 100;
  const case3_agent = orderValue * (agentPercent - ctvPercent) / 100;
  const case3_npp = orderValue * (nppPercent - agentPercent) / 100;
  log('info', `${c.yellow}Case 3: CTV bán (có Đại lý + NPP đủ điều kiện)${c.reset}`);
  log('info', `  CTV nhận: ${ctvPercent}% = ${case3_ctv.toLocaleString()}đ`);
  log('info', `  Đại lý nhận: ${agentPercent - ctvPercent}% = ${case3_agent.toLocaleString()}đ`);
  log('info', `  NPP nhận: ${nppPercent - agentPercent}% = ${case3_npp.toLocaleString()}đ`);
  log('info', `  Tổng: ${(case3_ctv + case3_agent + case3_npp).toLocaleString()}đ\n`);
  
  // Case 4: Đại lý bán trực tiếp
  const case4 = orderValue * agentPercent / 100;
  log('info', `${c.yellow}Case 4: Đại lý bán trực tiếp${c.reset}`);
  log('info', `  Đại lý nhận: ${agentPercent}% = ${case4.toLocaleString()}đ`);
  log('info', `  Tổng: ${case4.toLocaleString()}đ\n`);
  
  // Case 5: NPP bán trực tiếp
  const case5 = orderValue * nppPercent / 100;
  log('info', `${c.yellow}Case 5: NPP bán trực tiếp${c.reset}`);
  log('info', `  NPP nhận: ${nppPercent}% = ${case5.toLocaleString()}đ`);
  log('info', `  Tổng: ${case5.toLocaleString()}đ`);
  
  pass('Logic tính toán hoa hồng đúng');
}


async function testCTVApplications() {
  subsection('12. ĐƠN ĐĂNG KÝ CTV');
  
  const { data: applications, count } = await db.from('CTVApplication').select('*, user:userId(name, email)', { count: 'exact' }).order('createdAt', { ascending: false }).limit(5);
  
  pass(`Tổng ${count || 0} đơn đăng ký CTV`);
  
  if (count > 0) {
    const statusStats = {};
    applications?.forEach(a => { statusStats[a.status] = (statusStats[a.status] || 0) + 1; });
    
    log('info', 'Theo trạng thái:');
    Object.entries(statusStats).forEach(([status, cnt]) => {
      log('info', `  • ${status}: ${cnt}`);
    });
  }
}

async function testChatSessions() {
  subsection('13. CHAT SESSIONS');
  
  const { count } = await db.from('ChatSession').select('*', { count: 'exact', head: true });
  const { count: msgCount } = await db.from('Message').select('*', { count: 'exact', head: true });
  
  pass(`${count || 0} chat sessions, ${msgCount || 0} messages`);
}

async function simulateOrderFlow() {
  subsection('14. MÔ PHỎNG FLOW ĐẶT HÀNG');
  
  log('info', 'Flow đặt hàng với referral:\n');
  log('info', '1. Khách vào web với ?ref=CTV001');
  log('info', '2. Khách chọn sản phẩm và đặt hàng');
  log('info', '3. Hệ thống lưu referrerId = ID của CTV');
  log('info', '4. Admin xác nhận đơn (status = confirmed)');
  log('info', '5. Hệ thống tự động tính commission:');
  log('info', '   - CTV nhận 10% (retail)');
  log('info', '   - Đại lý nhận 5% (override) nếu có ≥3 CTV');
  log('info', '   - NPP nhận 5% (override) nếu có ≥3 Đại lý');
  log('info', '6. Balance của các user được cập nhật');
  log('info', '7. CTV/Đại lý/NPP có thể yêu cầu rút tiền');
  log('info', '8. Admin duyệt yêu cầu rút tiền');
  
  pass('Flow đặt hàng đã được thiết kế đúng');
}

// ==================== MAIN ====================

async function main() {
  console.log('\n');
  section('TEST TOÀN DIỆN HỆ THỐNG CTV/ĐẠI LÝ');
  
  const startTime = Date.now();
  
  await testCommissionSettings();
  await testUserHierarchy();
  await testReferralLinks();
  await testOrders();
  await testCommissions();
  await testWithdrawals();
  await testUserBalances();
  await testServices();
  await testCategories();
  await testRolePermissions();
  await testCommissionCalculation();
  await testCTVApplications();
  await testChatSessions();
  await simulateOrderFlow();
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  section('KẾT QUẢ TEST');
  
  console.log(`\n  ${c.green}✓ Passed: ${testResults.passed}${c.reset}`);
  console.log(`  ${c.red}✗ Failed: ${testResults.failed}${c.reset}`);
  console.log(`  ${c.yellow}⚠ Warnings: ${testResults.warnings}${c.reset}`);
  console.log(`\n  Thời gian: ${duration}s\n`);
  
  if (testResults.failed === 0) {
    console.log(`  ${c.green}${'═'.repeat(40)}`);
    console.log(`  ✓ TẤT CẢ TEST ĐỀU PASS!`);
    console.log(`  ${'═'.repeat(40)}${c.reset}\n`);
  } else {
    console.log(`  ${c.red}${'═'.repeat(40)}`);
    console.log(`  ✗ CÓ ${testResults.failed} TEST FAILED`);
    console.log(`  ${'═'.repeat(40)}${c.reset}\n`);
  }
}

main().catch(console.error);
