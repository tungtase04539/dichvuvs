// Test Referral trực tiếp với Database
const fs = require('fs');
const path = require('path');

// Load env manually
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Thiếu SUPABASE credentials trong .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
  console.log(`${colors.cyan}🧪 TEST HỆ THỐNG REFERRAL (Database)${colors.reset}`);
  console.log("=".repeat(60) + "\n");

  let passed = 0;
  let failed = 0;

  // ========== TEST 1: Kiểm tra ReferralLink table ==========
  log("test", "TEST 1: Kiểm tra bảng ReferralLink");
  try {
    const { data: links, error } = await supabase
      .from("ReferralLink")
      .select("*")
      .limit(10);

    if (error) throw error;

    if (links && links.length > 0) {
      log("pass", `Có ${links.length} referral links trong DB`);
      passed++;
      
      // In chi tiết
      links.forEach(link => {
        log("info", `  ${link.code} - clicks: ${link.clickCount}, orders: ${link.orderCount}`);
      });
    } else {
      log("fail", "Không có referral link nào");
      failed++;
    }
  } catch (e) {
    log("fail", `Lỗi: ${e.message}`);
    failed++;
  }

  // ========== TEST 2: Kiểm tra CommissionSetting ==========
  log("test", "TEST 2: Kiểm tra bảng CommissionSetting");
  try {
    const { data: settings, error } = await supabase
      .from("CommissionSetting")
      .select("*");

    if (error) throw error;

    if (settings && settings.length > 0) {
      log("pass", `Có ${settings.length} cấu hình hoa hồng`);
      passed++;
      
      // Kiểm tra các role
      const roles = settings.map(s => s.role);
      const hasCollaborator = roles.includes("collaborator");
      const hasAgent = roles.includes("agent");
      const hasDistributor = roles.includes("distributor");
      
      settings.forEach(s => {
        log("info", `  ${s.role}: ${s.percent}% (${s.type})`);
      });

      if (hasCollaborator && hasAgent && hasDistributor) {
        log("pass", "Đủ cấu hình cho 3 cấp: CTV, Đại lý, NPP");
        passed++;
      } else {
        log("fail", `Thiếu cấu hình: CTV=${hasCollaborator}, Đại lý=${hasAgent}, NPP=${hasDistributor}`);
        failed++;
      }
    } else {
      log("fail", "Không có cấu hình hoa hồng");
      failed++;
    }
  } catch (e) {
    log("fail", `Lỗi: ${e.message}`);
    failed++;
  }

  // ========== TEST 3: Kiểm tra User với role CTV/Agent/Distributor ==========
  log("test", "TEST 3: Kiểm tra Users có role CTV/Đại lý/NPP");
  try {
    const { data: users, error } = await supabase
      .from("User")
      .select("id, email, role, name")
      .in("role", ["collaborator", "agent", "distributor"]);

    if (error) throw error;

    if (users && users.length > 0) {
      log("pass", `Có ${users.length} users với role CTV/Đại lý/NPP`);
      passed++;
      
      const byRole = {};
      users.forEach(u => {
        byRole[u.role] = (byRole[u.role] || 0) + 1;
      });
      
      Object.entries(byRole).forEach(([role, count]) => {
        log("info", `  ${role}: ${count} users`);
      });
    } else {
      log("fail", "Không có user nào với role CTV/Đại lý/NPP");
      failed++;
    }
  } catch (e) {
    log("fail", `Lỗi: ${e.message}`);
    failed++;
  }

  // ========== TEST 4: Kiểm tra mỗi CTV/Agent/NPP có referral link ==========
  log("test", "TEST 4: Kiểm tra mỗi CTV/Đại lý/NPP có referral link");
  try {
    const { data: users, error: userError } = await supabase
      .from("User")
      .select("id, email, role")
      .in("role", ["collaborator", "agent", "distributor"]);

    if (userError) throw userError;

    const { data: links, error: linkError } = await supabase
      .from("ReferralLink")
      .select("userId, code");

    if (linkError) throw linkError;

    const userIdsWithLinks = new Set(links.map(l => l.userId));
    const usersWithoutLinks = users.filter(u => !userIdsWithLinks.has(u.id));

    if (usersWithoutLinks.length === 0) {
      log("pass", "Tất cả CTV/Đại lý/NPP đều có referral link");
      passed++;
    } else {
      log("fail", `${usersWithoutLinks.length} users chưa có referral link:`);
      usersWithoutLinks.forEach(u => {
        log("info", `  ${u.email} (${u.role})`);
      });
      failed++;
    }
  } catch (e) {
    log("fail", `Lỗi: ${e.message}`);
    failed++;
  }

  // ========== TEST 5: Kiểm tra Order có referralCode ==========
  log("test", "TEST 5: Kiểm tra Orders có referralCode");
  try {
    const { data: orders, error } = await supabase
      .from("Order")
      .select("id, orderCode, referralCode, referrerId, status, totalPrice")
      .not("referralCode", "is", null)
      .limit(10);

    if (error) throw error;

    if (orders && orders.length > 0) {
      log("pass", `Có ${orders.length} đơn hàng có referralCode`);
      passed++;
      
      orders.forEach(o => {
        log("info", `  ${o.orderCode}: ref=${o.referralCode}, status=${o.status}, ${o.totalPrice}đ`);
      });
    } else {
      log("info", "Chưa có đơn hàng nào có referralCode (cần test thủ công)");
    }
  } catch (e) {
    log("fail", `Lỗi: ${e.message}`);
    failed++;
  }

  // ========== TEST 6: Kiểm tra Commission records ==========
  log("test", "TEST 6: Kiểm tra Commission records");
  try {
    const { data: commissions, error } = await supabase
      .from("Commission")
      .select("id, userId, orderId, amount, percent, status, type")
      .limit(10);

    if (error) throw error;

    if (commissions && commissions.length > 0) {
      log("pass", `Có ${commissions.length} commission records`);
      passed++;
      
      const byStatus = {};
      commissions.forEach(c => {
        byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      });
      
      Object.entries(byStatus).forEach(([status, count]) => {
        log("info", `  ${status}: ${count} records`);
      });
    } else {
      log("info", "Chưa có commission nào (cần test đặt hàng + xác nhận)");
    }
  } catch (e) {
    log("fail", `Lỗi: ${e.message}`);
    failed++;
  }

  // ========== TEST 7: Kiểm tra ReferralClick records ==========
  log("test", "TEST 7: Kiểm tra ReferralClick tracking");
  try {
    const { data: clicks, error } = await supabase
      .from("ReferralClick")
      .select("id, referralLinkId, createdAt")
      .order("createdAt", { ascending: false })
      .limit(5);

    if (error) throw error;

    if (clicks && clicks.length > 0) {
      log("pass", `Có ${clicks.length} click records gần đây`);
      passed++;
      
      clicks.forEach(c => {
        log("info", `  Click at ${new Date(c.createdAt).toLocaleString()}`);
      });
    } else {
      log("info", "Chưa có click nào được track (cần test thủ công)");
    }
  } catch (e) {
    log("fail", `Lỗi: ${e.message}`);
    failed++;
  }

  // ========== TEST 8: Test track click API simulation ==========
  log("test", "TEST 8: Lấy mã ref để test");
  try {
    const { data: link, error } = await supabase
      .from("ReferralLink")
      .select("code, userId, clickCount")
      .eq("isActive", true)
      .limit(1)
      .single();

    if (error) throw error;

    if (link) {
      log("pass", `Mã ref để test: ${link.code}`);
      log("info", `  Current clickCount: ${link.clickCount}`);
      log("info", `  Test URL: http://localhost:3000?ref=${link.code}`);
      passed++;
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
  console.log(`${colors.yellow}📋 HƯỚNG DẪN TEST THỦ CÔNG:${colors.reset}`);
  console.log("1. Mở browser ẩn danh");
  console.log("2. Vào http://localhost:3000?ref=REF-XXXXXX (thay mã ref ở trên)");
  console.log("3. Mở DevTools > Application > Local Storage");
  console.log("4. Kiểm tra có key 'chatbotvn_ref' với đúng mã ref");
  console.log("5. Đặt 1 đơn hàng");
  console.log("6. Đăng nhập Admin, xác nhận đơn");
  console.log("7. Đăng nhập CTV/Đại lý, kiểm tra có commission");
  console.log("-".repeat(60) + "\n");
}

runTests().catch(console.error);
