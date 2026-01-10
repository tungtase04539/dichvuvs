/**
 * TEST HỆ THỐNG REFERRAL
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mjwmmttjuaodhhmshvje.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyNDE3MSwiZXhwIjoyMDc4NjAwMTcxfQ.8MJFBFH_Yrm7i6dMLsc3jDbzMIW0ClYvhypjxCwnScw';

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const c = { reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m' };

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log('  PHÂN TÍCH HỆ THỐNG REFERRAL');
  console.log('═'.repeat(60) + '\n');

  // 1. Lấy tất cả users có thể tạo ref
  const { data: users } = await db.from('User')
    .select('id, email, name, role, parentId')
    .in('role', ['distributor', 'master_agent', 'agent', 'collaborator', 'ctv'])
    .order('role');

  // 2. Lấy tất cả referral links
  const { data: links } = await db.from('ReferralLink')
    .select('*, user:userId(name, email, role)')
    .eq('isActive', true);

  console.log(`${c.cyan}[1] USERS CÓ THỂ TẠO REFERRAL LINK${c.reset}`);
  console.log('-'.repeat(50));
  
  const roleGroups = {};
  users?.forEach(u => {
    if (!roleGroups[u.role]) roleGroups[u.role] = [];
    roleGroups[u.role].push(u);
  });

  for (const [role, list] of Object.entries(roleGroups)) {
    console.log(`\n${c.yellow}${role.toUpperCase()} (${list.length})${c.reset}`);
    list.forEach(u => {
      const hasLink = links?.find(l => l.userId === u.id);
      const linkStatus = hasLink ? `${c.green}✓ ${hasLink.code}${c.reset}` : `${c.red}✗ Chưa có link${c.reset}`;
      console.log(`  • ${u.name} (${u.email}) - ${linkStatus}`);
    });
  }

  // 3. Phân tích cấu trúc phân cấp và referral
  console.log(`\n${c.cyan}[2] CẤU TRÚC PHÂN CẤP VÀ REFERRAL${c.reset}`);
  console.log('-'.repeat(50));

  // Tìm NPP
  const npps = users?.filter(u => u.role === 'distributor' || u.role === 'master_agent') || [];
  
  for (const npp of npps) {
    const nppLink = links?.find(l => l.userId === npp.id);
    console.log(`\n${c.green}NPP: ${npp.name}${c.reset}`);
    console.log(`  Link: ${nppLink?.code || 'CHƯA CÓ'}`);
    
    // Tìm đại lý của NPP
    const agents = users?.filter(u => u.parentId === npp.id && u.role === 'agent') || [];
    console.log(`  Đại lý (${agents.length}):`);
    
    for (const agent of agents) {
      const agentLink = links?.find(l => l.userId === agent.id);
      console.log(`    └─ ${agent.name} - Link: ${agentLink?.code || 'CHƯA CÓ'}`);
      
      // Tìm CTV của đại lý
      const ctvs = users?.filter(u => u.parentId === agent.id) || [];
      for (const ctv of ctvs) {
        const ctvLink = links?.find(l => l.userId === ctv.id);
        console.log(`        └─ ${ctv.name} - Link: ${ctvLink?.code || 'CHƯA CÓ'}`);
      }
    }
  }

  // 4. Kiểm tra đơn hàng có referrer
  console.log(`\n${c.cyan}[3] ĐƠN HÀNG CÓ REFERRER${c.reset}`);
  console.log('-'.repeat(50));

  const { data: ordersWithRef } = await db.from('Order')
    .select('orderCode, totalPrice, status, referralCode, referrer:referrerId(name, role)')
    .not('referrerId', 'is', null)
    .order('createdAt', { ascending: false })
    .limit(10);

  if (ordersWithRef && ordersWithRef.length > 0) {
    console.log(`Có ${ordersWithRef.length} đơn gần nhất có referrer:`);
    ordersWithRef.forEach(o => {
      console.log(`  • ${o.orderCode} | ${o.totalPrice?.toLocaleString()}đ | ${o.status} | Ref: ${o.referrer?.name} (${o.referrer?.role}) | Code: ${o.referralCode}`);
    });
  } else {
    console.log(`${c.yellow}Chưa có đơn hàng nào có referrer${c.reset}`);
  }

  // 5. Thống kê referral link
  console.log(`\n${c.cyan}[4] THỐNG KÊ REFERRAL LINK${c.reset}`);
  console.log('-'.repeat(50));

  const activeLinks = links?.filter(l => l.isActive) || [];
  const totalClicks = activeLinks.reduce((sum, l) => sum + (l.clickCount || 0), 0);
  const totalOrders = activeLinks.reduce((sum, l) => sum + (l.orderCount || 0), 0);
  const totalRevenue = activeLinks.reduce((sum, l) => sum + (l.revenue || 0), 0);

  console.log(`  Tổng link active: ${activeLinks.length}`);
  console.log(`  Tổng clicks: ${totalClicks}`);
  console.log(`  Tổng orders: ${totalOrders}`);
  console.log(`  Tổng revenue: ${totalRevenue.toLocaleString()}đ`);
  console.log(`  Conversion rate: ${totalClicks > 0 ? ((totalOrders / totalClicks) * 100).toFixed(1) : 0}%`);

  // 6. Đề xuất cải thiện
  console.log(`\n${c.cyan}[5] ĐỀ XUẤT CẢI THIỆN${c.reset}`);
  console.log('-'.repeat(50));

  const usersWithoutLink = users?.filter(u => !links?.find(l => l.userId === u.id)) || [];
  if (usersWithoutLink.length > 0) {
    console.log(`${c.yellow}⚠ ${usersWithoutLink.length} user chưa có referral link:${c.reset}`);
    usersWithoutLink.forEach(u => {
      console.log(`  • ${u.name} (${u.role}) - ${u.email}`);
    });
  }

  console.log('\n' + '═'.repeat(60) + '\n');
}

main().catch(console.error);
