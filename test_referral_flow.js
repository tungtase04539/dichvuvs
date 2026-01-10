// Test Referral Flow - Kiểm tra toàn bộ luồng referral
const BASE_URL = "https://santrolyaichatgpt.com";

const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
};

function log(type, msg) {
  const icons = { pass: "✅", fail: "❌", info: "ℹ️", test: "🧪" };
  const color = type === "pass" ? colors.green : type === "fail" ? colors.red : colors.cyan;
  console.log(`${color}${icons[type] || "•"} ${msg}${colors.reset}`);
}

async function runTests() {
  console.log("\n" + "=".repeat(60));
  console.log(`${colors.cyan}🧪 TEST HỆ THỐNG REFERRAL${colors.reset}`);
  console.log("=".repeat(60) + "\n");

  let passed = 0;
  let failed = 0;

  // ========== TEST 1: Lấy thông tin referral links ==========
  log("test", "TEST 1: Kiểm tra API lấy referral links");
  try {
    // Lấy danh sách users có referral
    const usersRes = await fetch(`${BASE_URL}/api/admin/accounts`);
    if (!usersRes.ok) {
      log("info", "Cần đăng nhập admin để test - bỏ qua test này");
    }
  } catch (e) {
    log("info", "Không thể kết nối API accounts");
  }

  // ========== TEST 2: Validate referral code ==========
  log("test", "TEST 2: Validate referral code (API public)");
  try {
    // Test với mã không tồn tại
    const invalidRes = await fetch(`${BASE_URL}/api/referral/track?code=INVALID123`);
    const invalidData = await invalidRes.json();
    
    if (invalidData.valid === false) {
      log("pass", "Mã không hợp lệ trả về valid=false");
      passed++;
    } else {
      log("fail", "Mã không hợp lệ không trả về valid=false");
      failed++;
    }
  } catch (e) {
    log("fail", `Lỗi: ${e.message}`);
    failed++;
  }

  // ========== TEST 3: Track referral click ==========
  log("test", "TEST 3: Track referral click");
  
  // Đầu tiên lấy 1 mã ref hợp lệ từ DB
  let validRefCode = null;
  try {
    // Query trực tiếp để lấy mã ref
    const checkRes = await fetch(`${BASE_URL}/api/referral/track?code=REF-XTNABX`);
    const checkData = await checkRes.json();
    
    if (checkData.valid) {
      validRefCode = "REF-XTNABX";
      log("info", `Tìm thấy mã ref hợp lệ: ${validRefCode}`);
    }
  } catch (e) {
    log("info", "Không tìm được mã ref để test");
  }

  if (validRefCode) {
    try {
      const trackRes = await fetch(`${BASE_URL}/api/referral/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: validRefCode }),
      });
      const trackData = await trackRes.json();

      if (trackData.success && trackData.referrerId) {
        log("pass", `Track click thành công - referrerId: ${trackData.referrerId}`);
        passed++;
      } else if (trackData.error) {
        log("fail", `Track click lỗi: ${trackData.error}`);
        failed++;
      }
    } catch (e) {
      log("fail", `Lỗi track: ${e.message}`);
      failed++;
    }
  } else {
    log("info", "Bỏ qua test track click (không có mã ref)");
  }

  // ========== TEST 4: Kiểm tra Commission Settings ==========
  log("test", "TEST 4: Kiểm tra Commission Settings");
  try {
    const settingsRes = await fetch(`${BASE_URL}/api/admin/commission-settings`);
    
    if (settingsRes.status === 401) {
      log("info", "API cần auth - kiểm tra thủ công");
    } else {
      const settings = await settingsRes.json();
      
      if (settings.settings && settings.settings.length > 0) {
        log("pass", `Có ${settings.settings.length} cấu hình hoa hồng`);
        
        // Kiểm tra các role chính
        const roles = settings.settings.map(s => s.role);
        const hasCollaborator = roles.includes("collaborator");
        const hasAgent = roles.includes("agent");
        const hasDistributor = roles.includes("distributor");
        
        if (hasCollaborator && hasAgent && hasDistributor) {
          log("pass", "Đủ cấu hình cho collaborator, agent, distributor");
          passed++;
        } else {
          log("fail", `Thiếu cấu hình: collaborator=${hasCollaborator}, agent=${hasAgent}, distributor=${hasDistributor}`);
          failed++;
        }
        
        // In chi tiết
        settings.settings.forEach(s => {
          log("info", `  ${s.role}: ${s.percent}%`);
        });
      } else {
        log("fail", "Không có cấu hình hoa hồng");
        failed++;
      }
    }
  } catch (e) {
    log("fail", `Lỗi: ${e.message}`);
    failed++;
  }

  // ========== TEST 5: Kiểm tra trang chủ có ReferralTracker ==========
  log("test", "TEST 5: Kiểm tra trang chủ load được");
  try {
    const homeRes = await fetch(BASE_URL);
    if (homeRes.ok) {
      const html = await homeRes.text();
      // Kiểm tra có script Next.js
      if (html.includes("_next") || html.includes("__NEXT")) {
        log("pass", "Trang chủ load thành công");
        passed++;
      } else {
        log("fail", "Trang chủ không có Next.js scripts");
        failed++;
      }
    } else {
      log("fail", `Trang chủ lỗi: ${homeRes.status}`);
      failed++;
    }
  } catch (e) {
    log("fail", `Lỗi: ${e.message}`);
    failed++;
  }

  // ========== TEST 6: Kiểm tra trang với ref param ==========
  log("test", "TEST 6: Kiểm tra trang với ?ref= param");
  try {
    const refUrl = `${BASE_URL}?ref=TEST123`;
    const refRes = await fetch(refUrl);
    if (refRes.ok) {
      log("pass", "Trang load được với ref param");
      passed++;
    } else {
      log("fail", `Trang lỗi với ref param: ${refRes.status}`);
      failed++;
    }
  } catch (e) {
    log("fail", `Lỗi: ${e.message}`);
    failed++;
  }

  // ========== TEST 7: Kiểm tra API đặt hàng ==========
  log("test", "TEST 7: Kiểm tra API orders endpoint");
  try {
    const ordersRes = await fetch(`${BASE_URL}/api/orders`, {
      method: "GET",
    });
    // API có thể cần auth hoặc trả về empty
    if (ordersRes.status === 401 || ordersRes.status === 200) {
      log("pass", "API orders endpoint hoạt động");
      passed++;
    } else {
      log("fail", `API orders lỗi: ${ordersRes.status}`);
      failed++;
    }
  } catch (e) {
    log("fail", `Lỗi: ${e.message}`);
    failed++;
  }

  // ========== TỔNG KẾT ==========
  console.log("\n" + "=".repeat(60));
  console.log(`${colors.cyan}📊 TỔNG KẾT${colors.reset}`);
  console.log("=".repeat(60));
  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  console.log(`📈 Tỷ lệ: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  console.log("\n" + "-".repeat(60));
  console.log(`${colors.yellow}⚠️  CÁC TEST CẦN KIỂM TRA THỦ CÔNG:${colors.reset}`);
  console.log("1. Mở tab ẩn danh, vào " + BASE_URL + "?ref=REF-XXXXXX");
  console.log("2. Kiểm tra DevTools > Application > Local Storage có 'chatbotvn_ref'");
  console.log("3. Đặt 1 đơn hàng, kiểm tra đơn có referralCode");
  console.log("4. Admin xác nhận đơn, kiểm tra CTV có commission");
  console.log("-".repeat(60) + "\n");
}

runTests().catch(console.error);
