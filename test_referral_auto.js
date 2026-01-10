// Test tự động tạo referral link khi approve CTV hoặc tạo user mới
// Chạy: node test_referral_auto.js

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

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log('  TEST REFERRAL LINKS - KIỂM TRA HỆ THỐNG');
  console.log('═'.repeat(60) + '\n');
  
  // 1. Kiểm tra tất cả users có vai trò CTV/Đại lý/NPP đều có referral link
  console.log(`${c.cyan}1. Kiểm tra users có referral link:${c.reset}\n`);
  
  const eligibleRoles = ['admin', 'master_agent', 'distributor', 'agent', 'collaborator', 'ctv'];
  
  const { data: users } = await supabase
    .from('User')
    .select('id, email, role, name')
    .in('role', eligibleRoles);

  const { data: links } = await supabase
    .from('ReferralLink')
    .select('userId, code, isActive')
    .eq('isActive', true);

  const linksMap = new Map((links || []).map(l => [l.userId, l.code]));
  
  let allHaveLinks = true;
  for (const user of users || []) {
    const code = linksMap.get(user.id);
    if (code) {
      log('ok', `${user.email} (${user.role}): ${code}`);
    } else {
      log('err', `${user.email} (${user.role}): KHÔNG CÓ LINK!`);
      allHaveLinks = false;
    }
  }

  console.log('');
  if (allHaveLinks) {
    log('ok', `Tất cả ${users?.length || 0} users đều có referral link`);
  } else {
    log('err', 'Có users chưa có referral link!');
  }

  // 2. Kiểm tra cấu trúc phân cấp
  console.log(`\n${c.cyan}2. Kiểm tra cấu trúc phân cấp:${c.reset}\n`);
  
  const { data: hierarchy } = await supabase
    .from('User')
    .select('id, email, role, parentId')
    .in('role', eligibleRoles)
    .order('role');

  const userMap = new Map((hierarchy || []).map(u => [u.id, u]));
  
  for (const user of hierarchy || []) {
    if (user.parentId) {
      const parent = userMap.get(user.parentId);
      if (parent) {
        log('info', `${user.email} (${user.role}) → cấp trên: ${parent.email} (${parent.role})`);
      }
    } else if (user.role !== 'admin') {
      log('warn', `${user.email} (${user.role}) không có cấp trên`);
    }
  }

  // 3. Thống kê
  console.log(`\n${c.cyan}3. Thống kê:${c.reset}\n`);
  
  const roleCount = {};
  for (const user of users || []) {
    roleCount[user.role] = (roleCount[user.role] || 0) + 1;
  }
  
  console.log('  Số lượng theo vai trò:');
  for (const [role, count] of Object.entries(roleCount)) {
    console.log(`    - ${role}: ${count}`);
  }
  
  console.log(`\n  Tổng referral links: ${links?.length || 0}`);
  
  console.log('\n' + '═'.repeat(60));
  console.log(`${c.green}TEST HOÀN TẤT${c.reset}`);
  console.log('═'.repeat(60) + '\n');
}

main().catch(console.error);
