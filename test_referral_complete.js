// Test Referral Complete - Kiểm tra chi tiết hệ thống referral
const BASE_URL = "https://santrolyaichatgpt.com";

const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(type, msg) {
  const icons = { pass: "✅", fail: "❌", info: "ℹ️", test: "🧪", warn: "⚠️" };
  const color = type === "pass" ? colors.green : type === "fail" ? colors.red : type === "warn" ? colors.yellow : colors.cyan;
  console.log(`${color}${icons[type] || "•"} ${msg}${colors.reset}`);
}

async function runTests() {
  console.log("\n" + "=".repeat(70));
  console.log(`${colors.cyan}${colors.bold}🧪 TEST HOÀN CHỈNH HỆ THỐNG REFERRAL${colors.reset}`);
  console.log(`${colors.cyan}URL: ${BASE_URL}${colors.reset}`);
  console.log("=".repeat(70) + "\n");

  let passed = 0;
  let failed = 0;
  const results = [];

  // ========== PHẦN 1: TEST API REFERRAL ==========
  console.log(`\n${colors.bold}📌 PHẦN 1: API REFERRAL${colors.reset}\n`);

  // Test 1.1: Validate mã ref không hợp lệ
  log("test", "1.1: Validate mã ref KHÔNG hợp lệ");
  try {
    const res = await fetch(`${BASE_URL}/api/referral/track?code=INVALID_CODE_123`);
    const data = await res.json();
    if (data.valid === false) {
      log("pass", "Mã không hợp lệ → valid=false");
      passed++;
      results.push({ test: "1.1", status: "PASS" });
    } else {
      log("fail", "Mã không hợp lệ không trả về valid=false");
      failed++;
      results.push({ test: "1.1", status: "FAIL" });
    }
  } catch (e) {
    log("fail", `Lỗi: ${e.message}`);
    failed++;
    results.push({ test: "1.1", status: "FAIL", error: e.message });
  }

  // Test 1.2: Validate mã ref hợp lệ
  log("test", "1.2: Validate mã ref HỢP LỆ (REF-XTNABX)");
  let validRefCode = "REF-XTNABX";
  let referrerId = null;
  try {
    const res = await fetch(`${BASE_URL}/api/referral/track?code=${validRefCode}`);
    const data = await res.json();
    if (data.valid === true && data.referrerName) {
      log("pass", `Mã hợp lệ → valid=true, referrer: ${data.referrerName}`);
      passed++;
      results.push({ test: "1.2", status: "PASS", referrer: data.referrerName });
    } else {
      log("fail", `Response: ${JSON.stringify(data)}`);
      failed++;
      results.push({ test: "1.2", status: "FAIL" });
    }
  } catch (e) {
    log("fail", `Lỗi: ${e.message}`);
    failed++;
    results.push({ test: "1.2", status: "FAIL", error: e.message });
  }

  // Test 1.3: Track click
  log("test", "1.3: Track referral click");
  let clickCountBefore = 0;
  try {
    const res = await fetch(`${BASE_URL}/api/referral/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: validRefCode }),
    });
    const data = await res.json();
    if (data.success && data.referrerId) {
      referrerId = data.referrerId;
      log("pass", `Track click OK → referrerId: ${referrerId}`);
      passed++;
      results.push({ test: "1.3", status: "PASS", referrerId });
    } else {
      log("fail", `Response: ${JSON.stringify(data)}`);
      failed++;
      results.push({ test: "1.3", status: "FAIL" });
    }
  } catch (e) {
    log("fail", `Lỗi: ${e.message}`);
    failed++;
    results.push({ test: "1.3", status: "FAIL", error: e.message });
  }

  // ========== PHẦN 2: TEST TRANG WEB ==========
  console.log(`\n${colors.bold}📌 PHẦN 2: TRANG WEB${colors.reset}\n`);

  // Test 2.1: Trang chủ
  log("test", "2.1: Trang chủ load được");
  try {
    const res = await fetch(BASE_URL);
    if (res.ok) {
      const html = await res.text();
      if (html.includes("_next") || html.includes("Next.js")) {
        log("pass", "Trang chủ OK (Next.js)");
        passed++;
        results.push({ test: "2.1", status: "PASS" });
      } else {
        log("warn", "Trang chủ load nhưng không phải Next.js");
        passed++;
        results.push({ test: "2.1", status: "PASS" });
      }
    } else {
      log("fail", `HTTP ${res.status}`);
      failed++;
      results.push({ test: "2.1", status: "FAIL" });
    }
  } catch (e) {
    log("fail", `Lỗi: ${e.message}`);
    failed++;
    results.push({ test: "2.1", status: "FAIL", error: e.message });
  }

  // Test 2.2: Trang với ref param
  log("test", "2.2: Trang với ?ref= param");
  try {
    const res = await fetch(`${BASE_URL}?ref=${validRefCode}`);
    if (res.ok) {
      log("pass", `Trang load OK với ?ref=${validRefCode}`);
      passed++;
      results.push({ test: "2.2", status: "PASS" });
    } else {
      log("fail", `HTTP ${res.status}`);
      failed++;
      results.push({ test: "2.2", status: "FAIL" });
    }
  } catch (e) {
    log("fail", `Lỗi: ${e.message}`);
    failed++;
    results.push({ test: "2.2", status: "FAIL", error: e.message });
  }

  // Test 2.3: Trang sản phẩm với ref
  log("test", "2.3: Trang sản phẩm với ?ref= param");
  try {
    const res = await fetch(`${BASE_URL}/san-pham?ref=${validRefCode}`);
    if (res.ok) {
      log("pass", "Trang sản phẩm load OK với ref");
      passed++;
      results.push({ test: "2.3", status: "PASS" });
    } else {
      log("fail", `HTTP ${res.status}`);
      failed++;
      results.push({ test: "2.3", status: "FAIL" });
    }
  } catch (e) {
    log("fail", `Lỗi: ${e.message}`);
    failed++;
    results.push({ test: "2.3", status: "FAIL", error: e.message });
  }

  // Test 2.4: Trang đặt hàng
  log("test", "2.4: Trang đặt hàng");
  try {
    const res = await fetch(`${BASE_URL}/dat-hang`);
    if (res.ok) {
      log("pass", "Trang đặt hàng load OK");
      passed++;
      results.push({ test: "2.4", status: "PASS" });
    } else {
      log("fail", `HTTP ${res.status}`);
      failed++;
      results.push({ test: "2.4", status: "FAIL" });
    }
  } catch (e) {
    log("fail", `Lỗi: ${e.message}`);
    failed++;
    results.push({ test: "2.4", status: "FAIL", error: e.message });
  }

  // ========== PHẦN 3: TEST API ORDERS ==========
  console.log(`\n${colors.bold}📌 PHẦN 3: API ORDERS${colors.reset}\n`);

  // Test 3.1: API orders endpoint
  log("test", "3.1: API /api/orders endpoint");
  try {
    const res = await fetch(`${BASE_URL}/api/orders`);
    if (res.status === 200 || res.status === 401) {
      log("pass", `API orders hoạt động (status: ${res.status})`);
      passed++;
      results.push({ test: "3.1", status: "PASS" });
    } else {
      log("fail", `HTTP ${res.status}`);
      failed++;
      results.push({ test: "3.1", status: "FAIL" });
    }
  } catch (e) {
    log("fail", `Lỗi: ${e.message}`);
    failed++;
    results.push({ test: "3.1", status: "FAIL", error: e.message });
  }

  // ========== PHẦN 4: TEST TRANG ADMIN ==========
  console.log(`\n${colors.bold}📌 PHẦN 4: TRANG ADMIN${colors.reset}\n`);

  // Test 4.1: Trang đăng nhập admin
  log("test", "4.1: Trang đăng nhập admin");
  try {
    const res = await fetch(`${BASE_URL}/quan-tri-vien-dang-nhap`);
    if (res.ok) {
      log("pass", "Trang đăng nhập admin load OK");
      passed++;
      results.push({ test: "4.1", status: "PASS" });
    } else {
      log("fail", `HTTP ${res.status}`);
      failed++;
      results.push({ test: "4.1", status: "FAIL" });
    }
  } catch (e) {
    log("fail", `Lỗi: ${e.message}`);
    failed++;
    results.push({ test: "4.1", status: "FAIL", error: e.message });
  }

  // Test 4.2: API auth/me
  log("test", "4.2: API /api/auth/me");
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`);
    if (res.status === 200 || res.status === 401) {
      log("pass", `API auth/me hoạt động (status: ${res.status})`);
      passed++;
      results.push({ test: "4.2", status: "PASS" });
    } else {
      log("fail", `HTTP ${res.status}`);
      failed++;
      results.push({ test: "4.2", status: "FAIL" });
    }
  } catch (e) {
    log("fail", `Lỗi: ${e.message}`);
    failed++;
    results.push({ test: "4.2", status: "FAIL", error: e.message });
  }

  // ========== TỔNG KẾT ==========
  console.log("\n" + "=".repeat(70));
  console.log(`${colors.bold}📊 TỔNG KẾT KẾT QUẢ TEST${colors.reset}`);
  console.log("=".repeat(70));
  
  const passRate = Math.round((passed / (passed + failed)) * 100);
  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  console.log(`📈 Tỷ lệ thành công: ${passRate}%`);

  if (passRate >= 80) {
    console.log(`\n${colors.green}${colors.bold}🎉 HỆ THỐNG REFERRAL HOẠT ĐỘNG TỐT!${colors.reset}`);
  } else if (passRate >= 50) {
    console.log(`\n${colors.yellow}${colors.bold}⚠️ CÓ MỘT SỐ VẤN ĐỀ CẦN KIỂM TRA${colors.reset}`);
  } else {
    console.log(`\n${colors.red}${colors.bold}❌ HỆ THỐNG CÓ NHIỀU LỖI${colors.reset}`);
  }

  // ========== HƯỚNG DẪN TEST THỦ CÔNG ==========
  console.log("\n" + "-".repeat(70));
  console.log(`${colors.yellow}${colors.bold}📋 HƯỚNG DẪN TEST THỦ CÔNG (Cần browser):${colors.reset}`);
  console.log("-".repeat(70));
  console.log(`
${colors.cyan}BƯỚC 1: Test Click Tracking${colors.reset}
  1. Mở tab ẩn danh (Ctrl+Shift+N)
  2. Vào: ${BASE_URL}?ref=${validRefCode}
  3. Mở DevTools (F12) → Application → Local Storage
  4. Kiểm tra có key 'chatbotvn_ref' với code = ${validRefCode}

${colors.cyan}BƯỚC 2: Test Đặt Hàng${colors.reset}
  1. Trong cùng tab ẩn danh, vào trang Đặt hàng
  2. Điền thông tin và đặt 1 đơn
  3. Ghi lại mã đơn hàng

${colors.cyan}BƯỚC 3: Test Commission${colors.reset}
  1. Đăng nhập Admin: ${BASE_URL}/quan-tri-vien-dang-nhap
     - Email: admin@admin.com
     - Password: admin
  2. Vào Đơn hàng → Tìm đơn vừa tạo
  3. Kiểm tra đơn có referralCode = ${validRefCode}
  4. Xác nhận đơn hàng

${colors.cyan}BƯỚC 4: Kiểm tra Hoa hồng${colors.reset}
  1. Đăng nhập tài khoản Đại lý: agent1@test.com / 0902000001
  2. Vào Dashboard CTV → Hoa hồng
  3. Kiểm tra có commission mới (15% giá trị đơn)
`);
  console.log("-".repeat(70) + "\n");
}

runTests().catch(console.error);
