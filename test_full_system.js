/**
 * TEST TOÀN DIỆN HỆ THỐNG CTV/ĐẠI LÝ
 * 
 * Chạy: node test_full_system.js
 * 
 * Yêu cầu: Cần có các tài khoản test trong database
 */

const BASE_URL = 'https://santrolyaichatgpt.com';

// Test accounts
const ACCOUNTS = {
  admin: { email: 'admin@admin.com', password: 'admin' },
  npp: { email: 'npp@test.com', password: '123456' },
  agent: { email: 'agent1@test.com', password: '123456' },
  ctv: { email: 'ctv1@test.com', password: '123456' },
};

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(type, message) {
  const icons = {
    success: `${colors.green}✓${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    info: `${colors.blue}ℹ${colors.reset}`,
    warn: `${colors.yellow}⚠${colors.reset}`,
    test: `${colors.cyan}▶${colors.reset}`,
  };
  console.log(`${icons[type] || '•'} ${message}`);
}

async function testAPI(name, url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const status = response.status;
    let data = null;
    
    try {
      data = await response.json();
    } catch (e) {
      data = { raw: await response.text() };
    }
    
    if (status >= 200 && status < 300) {
      log('success', `${name}: ${status} OK`);
      return { success: true, status, data };
    } else if (status === 401) {
      log('warn', `${name}: ${status} Unauthorized (cần đăng nhập)`);
      return { success: false, status, data };
    } else {
      log('error', `${name}: ${status} - ${JSON.stringify(data).substring(0, 100)}`);
      return { success: false, status, data };
    }
  } catch (error) {
    log('error', `${name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST TOÀN DIỆN HỆ THỐNG CTV/ĐẠI LÝ');
  console.log('='.repeat(60) + '\n');

  // 1. Test Public APIs
  console.log(`\n${colors.cyan}[1] TEST PUBLIC APIs${colors.reset}`);
  console.log('-'.repeat(40));
  
  await testAPI('Health Check', `${BASE_URL}/api/health`);
  await testAPI('Products List', `${BASE_URL}/api/products`);
  await testAPI('Categories', `${BASE_URL}/api/categories`);

  // 2. Test Protected APIs (sẽ trả về 401)
  console.log(`\n${colors.cyan}[2] TEST PROTECTED APIs (expect 401)${colors.reset}`);
  console.log('-'.repeat(40));
  
  await testAPI('Commission Settings', `${BASE_URL}/api/admin/commission-settings`);
  await testAPI('CTV Stats', `${BASE_URL}/api/ctv/stats`);
  await testAPI('CTV Team', `${BASE_URL}/api/ctv/team`);
  await testAPI('CTV Commissions', `${BASE_URL}/api/ctv/commissions`);
  await testAPI('Admin Withdrawals', `${BASE_URL}/api/admin/withdrawals`);

  // 3. Summary
  console.log('\n' + '='.repeat(60));
  console.log('HƯỚNG DẪN TEST THỦ CÔNG');
  console.log('='.repeat(60));
  
  console.log(`
${colors.yellow}Vì cần authentication, hãy test thủ công theo các bước sau:${colors.reset}

${colors.cyan}[A] TEST ADMIN (admin@admin.com / admin)${colors.reset}
1. Đăng nhập: ${BASE_URL}/quan-tri-vien-dang-nhap
2. Vào Dashboard: ${BASE_URL}/admin
3. Kiểm tra menu có đầy đủ:
   - Dashboard
   - Đơn hàng
   - Khách hàng
   - Duyệt CTV
   - Sản phẩm
   - Quản lý hoa hồng
   - Yêu cầu rút tiền
   - Cấu hình gói
   - Cấu hình hoa hồng ← MỚI
   - Tài khoản
4. Vào ${BASE_URL}/admin/cau-hinh-hoa-hong
   - Kiểm tra hiển thị 3 cấp: CTV 10%, Đại lý 15%, NPP 20%
   - Thử chỉnh sửa % và lưu

${colors.cyan}[B] TEST NPP (npp@test.com / 123456)${colors.reset}
1. Đăng nhập: ${BASE_URL}/dang-nhap
2. Tự động redirect sang: ${BASE_URL}/admin/ctv-dashboard
3. Kiểm tra menu có:
   - Dashboard CTV
   - Đơn hàng
   - Hoa hồng
   - Rút tiền
   - Đội nhóm ← Phải có vì là NPP
   - Sản phẩm
4. Vào ${BASE_URL}/admin/doi-nhom
   - Kiểm tra hiển thị 3 Đại lý cấp dưới
   - Kiểm tra thông báo "Đủ điều kiện nhận Override"

${colors.cyan}[C] TEST ĐẠI LÝ (agent1@test.com / 123456)${colors.reset}
1. Đăng nhập: ${BASE_URL}/dang-nhap
2. Vào ${BASE_URL}/admin/doi-nhom
   - Kiểm tra hiển thị 3 CTV cấp dưới
   - Kiểm tra thông báo "Đủ điều kiện nhận Override"

${colors.cyan}[D] TEST CTV (ctv1@test.com / 123456)${colors.reset}
1. Đăng nhập: ${BASE_URL}/dang-nhap
2. Kiểm tra menu KHÔNG có "Đội nhóm" (CTV không có cấp dưới)
3. Vào ${BASE_URL}/admin/ctv-dashboard
   - Kiểm tra hiển thị số dư, hoa hồng
   - Kiểm tra link giới thiệu

${colors.cyan}[E] TEST FLOW ĐẶT HÀNG + HOA HỒNG${colors.reset}
1. Mở tab ẩn danh, vào ${BASE_URL}/?ref=CTV001
2. Đặt 1 đơn hàng
3. Đăng nhập Admin, vào Đơn hàng, xác nhận đơn
4. Kiểm tra:
   - CTV1 nhận 10% hoa hồng
   - Đại lý 1 nhận 5% override (vì có 3 CTV)
   - NPP nhận 5% override (vì có 3 Đại lý)

${colors.cyan}[F] TEST RÚT TIỀN${colors.reset}
1. Đăng nhập CTV, vào ${BASE_URL}/admin/rut-tien
2. Tạo yêu cầu rút tiền
3. Đăng nhập Admin, vào ${BASE_URL}/admin/quan-ly-rut-tien
4. Duyệt yêu cầu rút tiền
`);

  console.log('='.repeat(60));
}

// Run
runTests().catch(console.error);
