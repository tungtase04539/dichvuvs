// Script để tạo referral links cho tất cả users có vai trò CTV/Đại lý/NPP mà chưa có link
// Chạy: node sync_referral_links.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mjwmmttjuaodhhmshvje.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyNDE3MSwiZXhwIjoyMDc4NjAwMTcxfQ.8MJFBFH_Yrm7i6dMLsc3jDbzMIW0ClYvhypjxCwnScw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(type, msg) {
  const icons = { ok: `${c.green}✓`, err: `${c.red}✗`, info: `${c.blue}ℹ`, warn: `${c.yellow}⚠` };
  console.log(`${icons[type] || '•'}${c.reset} ${msg}`);
}

function generateReferralCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "REF-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function createReferralLinkForUser(userId, userEmail, userRole) {
  try {
    // Kiểm tra đã có referral link chưa
    const { data: existingLink } = await supabase
      .from('ReferralLink')
      .select('*')
      .eq('userId', userId)
      .eq('isActive', true)
      .single();

    if (existingLink) {
      log('info', `User ${userEmail} đã có referral link: ${existingLink.code}`);
      return existingLink;
    }

    // Generate unique code
    let code = "";
    let attempts = 0;
    do {
      code = generateReferralCode();
      const { data: exists } = await supabase
        .from('ReferralLink')
        .select('id')
        .eq('code', code)
        .single();
      if (!exists) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      log('err', `Không thể tạo mã unique cho user ${userEmail}`);
      return null;
    }

    // Tạo referral link
    const { data: referralLink, error } = await supabase
      .from('ReferralLink')
      .insert({
        id: crypto.randomUUID(),
        code,
        userId,
        isActive: true,
        clickCount: 0,
        orderCount: 0,
        revenue: 0
      })
      .select()
      .single();

    if (error) {
      log('err', `Lỗi tạo link cho ${userEmail}: ${error.message}`);
      return null;
    }

    log('ok', `Đã tạo referral link ${code} cho ${userEmail} (${userRole})`);
    return referralLink;
  } catch (error) {
    log('err', `Error creating referral link: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log('  SYNC REFERRAL LINKS - TẠO LINK CHO USERS CHƯA CÓ');
  console.log('═'.repeat(60) + '\n');
  
  const eligibleRoles = ['admin', 'master_agent', 'distributor', 'agent', 'collaborator', 'ctv'];
  
  // Lấy tất cả users có vai trò phù hợp
  const { data: users, error: usersError } = await supabase
    .from('User')
    .select('id, email, role, name')
    .in('role', eligibleRoles);

  if (usersError) {
    log('err', `Lỗi lấy danh sách users: ${usersError.message}`);
    return;
  }

  log('info', `Tìm thấy ${users.length} users có vai trò CTV/Đại lý/NPP\n`);

  // Lấy danh sách users đã có referral link
  const userIds = users.map(u => u.id);
  const { data: existingLinks } = await supabase
    .from('ReferralLink')
    .select('userId, code')
    .in('userId', userIds)
    .eq('isActive', true);
  
  const usersWithLinksSet = new Set((existingLinks || []).map(l => l.userId));
  
  // Lọc ra users chưa có link
  const usersWithoutLinks = users.filter(u => !usersWithLinksSet.has(u.id));
  
  console.log(`${c.cyan}Thống kê:${c.reset}`);
  console.log(`  - Đã có link: ${usersWithLinksSet.size}`);
  console.log(`  - Chưa có link: ${usersWithoutLinks.length}\n`);
  
  if (usersWithoutLinks.length === 0) {
    log('ok', 'Tất cả users đã có referral link!');
    return;
  }

  console.log(`${c.cyan}Đang tạo referral links...${c.reset}\n`);
  
  // Tạo link cho từng user
  let created = 0;
  for (const user of usersWithoutLinks) {
    const link = await createReferralLinkForUser(user.id, user.email, user.role);
    if (link && !existingLinks?.find(l => l.userId === user.id)) {
      created++;
    }
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log(`${c.cyan}KẾT QUẢ:${c.reset}`);
  console.log(`  Tổng users: ${users.length}`);
  console.log(`  Đã có link từ trước: ${usersWithLinksSet.size}`);
  console.log(`  Mới tạo: ${created}`);
  console.log(`  Thất bại: ${usersWithoutLinks.length - created}`);
  console.log('═'.repeat(60) + '\n');
}

main().catch(console.error);
