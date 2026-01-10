/**
 * TEST TRỰC TIẾP DATABASE
 * Kiểm tra dữ liệu và logic commission
 */

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
  console.log('  TEST DATABASE - HỆ THỐNG CTV/ĐẠI LÝ');
  console.log('═'.repeat(60) + '\n');

  // 1. Kiểm tra CommissionSetting
  console.log(`${c.cyan}[1] KIỂM TRA CẤU HÌNH HOA HỒNG${c.reset}`);
  console.log('-'.repeat(40));
  
  const { data: settings, error: settingsErr } = await supabase
    .from('CommissionSetting')
    .select('*')
    .order('percent', { ascending: true });

  if (settingsErr) {
    log('err', `Lỗi: ${settingsErr.message}`);
  } else if (!settings || settings.length === 0) {
    log('warn', 'Chưa có cấu hình hoa hồng! Cần chạy SQL setup.');
  } else {
    log('ok', `Có ${settings.length} cấu hình:`);
    settings.forEach(s => {
      console.log(`   ${s.role.padEnd(15)} : ${s.percent}% (${s.type}) - ${s.description || ''}`);
    });
  }

  // 2. Kiểm tra Users với role CTV/Agent/NPP
  console.log(`\n${c.cyan}[2] KIỂM TRA TÀI KHOẢN THEO VAI TRÒ${c.reset}`);
  console.log('-'.repeat(40));

  const { data: users, error: usersErr } = await supabase
    .from('User')
    .select('id, email, name, role, parentId, balance')
    .in('role', ['collaborator', 'ctv', 'agent', 'distributor', 'master_agent', 'admin'])
    .order('role');

  if (usersErr) {
    log('err', `Lỗi: ${usersErr.message}`);
  } else {
    log('ok', `Có ${users.length} tài khoản:`);
    
    const roleGroups = {};
    users.forEach(u => {
      if (!roleGroups[u.role]) roleGroups[u.role] = [];
      roleGroups[u.role].push(u);
    });

    for (const [role, list] of Object.entries(roleGroups)) {
      console.log(`\n   ${c.yellow}${role.toUpperCase()} (${list.length})${c.reset}`);
      list.forEach(u => {
        const parent = u.parentId ? users.find(p => p.id === u.parentId)?.name || u.parentId : '-';
        console.log(`   • ${u.email} | ${u.name} | Balance: ${u.balance} | Parent: ${parent}`);
      });
    }
  }

  // 3. Kiểm tra cấu trúc phân cấp
  console.log(`\n${c.cyan}[3] KIỂM TRA CẤU TRÚC PHÂN CẤP${c.reset}`);
  console.log('-'.repeat(40));

  const { data: hierarchy, error: hierErr } = await supabase
    .from('User')
    .select(`
      id, email, name, role,
      parent:parentId (id, email, name, role)
    `)
    .in('role', ['collaborator', 'ctv', 'agent', 'distributor', 'master_agent'])
    .not('parentId', 'is', null);

  if (hierErr) {
    log('err', `Lỗi: ${hierErr.message}`);
  } else if (hierarchy.length === 0) {
    log('warn', 'Chưa có cấu trúc phân cấp (không có user nào có parentId)');
  } else {
    log('ok', `Có ${hierarchy.length} quan hệ cấp trên-cấp dưới:`);
    hierarchy.forEach(u => {
      console.log(`   ${u.name} (${u.role}) → thuộc → ${u.parent?.name} (${u.parent?.role})`);
    });
  }

  // 4. Kiểm tra số lượng cấp dưới (điều kiện override)
  console.log(`\n${c.cyan}[4] KIỂM TRA ĐIỀU KIỆN OVERRIDE (cần ≥3 cấp dưới)${c.reset}`);
  console.log('-'.repeat(40));

  const { data: subCounts, error: subErr } = await supabase
    .rpc('get_sub_agent_counts');

  if (subErr) {
    // Fallback: query thủ công
    const agents = users?.filter(u => ['agent', 'distributor', 'master_agent'].includes(u.role)) || [];
    
    for (const agent of agents) {
      const { count } = await supabase
        .from('User')
        .select('*', { count: 'exact', head: true })
        .eq('parentId', agent.id);
      
      const eligible = count >= 3;
      const icon = eligible ? `${c.green}✓` : `${c.yellow}✗`;
      console.log(`   ${icon}${c.reset} ${agent.name} (${agent.role}): ${count || 0} cấp dưới ${eligible ? '→ ĐỦ điều kiện' : '→ CHƯA đủ'}`);
    }
  }

  // 5. Kiểm tra Commission records
  console.log(`\n${c.cyan}[5] KIỂM TRA HOA HỒNG ĐÃ TẠO${c.reset}`);
  console.log('-'.repeat(40));

  const { data: commissions, error: commErr } = await supabase
    .from('Commission')
    .select(`
      id, amount, percent, level, status, createdAt,
      user:userId (name, role),
      order:orderId (orderCode, totalPrice)
    `)
    .order('createdAt', { ascending: false })
    .limit(10);

  if (commErr) {
    log('err', `Lỗi: ${commErr.message}`);
  } else if (!commissions || commissions.length === 0) {
    log('info', 'Chưa có hoa hồng nào được tạo');
  } else {
    log('ok', `Có ${commissions.length} bản ghi hoa hồng gần nhất:`);
    commissions.forEach(c => {
      console.log(`   • ${c.order?.orderCode || 'N/A'} | ${c.user?.name} (${c.user?.role}) | Level ${c.level} | ${c.percent}% = ${c.amount?.toLocaleString()}đ | ${c.status}`);
    });
  }

  // 6. Kiểm tra Withdrawal
  console.log(`\n${c.cyan}[6] KIỂM TRA YÊU CẦU RÚT TIỀN${c.reset}`);
  console.log('-'.repeat(40));

  const { data: withdrawals, error: wdErr } = await supabase
    .from('Withdrawal')
    .select(`
      id, amount, status, bankName, bankAccount, createdAt,
      user:userId (name, email)
    `)
    .order('createdAt', { ascending: false })
    .limit(5);

  if (wdErr) {
    log('err', `Lỗi: ${wdErr.message}`);
  } else if (!withdrawals || withdrawals.length === 0) {
    log('info', 'Chưa có yêu cầu rút tiền nào');
  } else {
    log('ok', `Có ${withdrawals.length} yêu cầu rút tiền:`);
    withdrawals.forEach(w => {
      console.log(`   • ${w.user?.name} | ${w.amount?.toLocaleString()}đ | ${w.bankName} - ${w.bankAccount} | ${w.status}`);
    });
  }

  // 7. Kiểm tra ReferralLink
  console.log(`\n${c.cyan}[7] KIỂM TRA LINK GIỚI THIỆU${c.reset}`);
  console.log('-'.repeat(40));

  const { data: refLinks, error: refErr } = await supabase
    .from('ReferralLink')
    .select(`
      code, clickCount, orderCount, revenue, isActive,
      user:userId (name, role)
    `)
    .eq('isActive', true)
    .limit(10);

  if (refErr) {
    log('err', `Lỗi: ${refErr.message}`);
  } else if (!refLinks || refLinks.length === 0) {
    log('info', 'Chưa có link giới thiệu nào');
  } else {
    log('ok', `Có ${refLinks.length} link giới thiệu:`);
    refLinks.forEach(r => {
      console.log(`   • ${r.code} | ${r.user?.name} (${r.user?.role}) | Clicks: ${r.clickCount} | Orders: ${r.orderCount} | Revenue: ${r.revenue?.toLocaleString()}đ`);
    });
  }

  console.log('\n' + '═'.repeat(60));
  console.log('  KẾT THÚC KIỂM TRA DATABASE');
  console.log('═'.repeat(60) + '\n');
}

main().catch(console.error);
