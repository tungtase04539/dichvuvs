/**
 * Tính commission cho các đơn hàng đã confirmed nhưng chưa có commission
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mjwmmttjuaodhhmshvje.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyNDE3MSwiZXhwIjoyMDc4NjAwMTcxfQ.8MJFBFH_Yrm7i6dMLsc3jDbzMIW0ClYvhypjxCwnScw'
);

async function main() {
  console.log('Tìm đơn hàng confirmed có referrer nhưng chưa có commission...\n');

  // Lấy đơn hàng confirmed có referrerId
  const { data: orders, error } = await supabase
    .from('Order')
    .select('id, orderCode, totalPrice, referrerId, status')
    .eq('status', 'confirmed')
    .not('referrerId', 'is', null);

  if (error) {
    console.log('Error:', error.message);
    return;
  }

  console.log(`Tìm thấy ${orders.length} đơn hàng confirmed có referrer\n`);

  // Lấy cấu hình commission
  const { data: settings } = await supabase
    .from('CommissionSetting')
    .select('*');
  
  const settingsMap = {};
  settings?.forEach(s => { settingsMap[s.key] = s.percent; });

  let created = 0;
  let skipped = 0;

  for (const order of orders) {
    // Kiểm tra đã có commission chưa
    const { data: existing } = await supabase
      .from('Commission')
      .select('id')
      .eq('orderId', order.id);

    if (existing && existing.length > 0) {
      console.log(`[SKIP] ${order.orderCode} - đã có commission`);
      skipped++;
      continue;
    }

    // Lấy thông tin referrer
    const { data: referrer } = await supabase
      .from('User')
      .select('id, name, role, email')
      .eq('id', order.referrerId)
      .single();

    if (!referrer) {
      console.log(`[SKIP] ${order.orderCode} - không tìm thấy referrer`);
      skipped++;
      continue;
    }

    // Tính commission
    const role = referrer.role;
    let retailKey = `${role}_retail`;
    if (!settingsMap[retailKey]) {
      if (role === 'collaborator' || role === 'ctv') {
        retailKey = 'ctv_retail';
      }
    }

    const percent = settingsMap[retailKey] || 10;
    const amount = (order.totalPrice * percent) / 100;
    const now = new Date().toISOString();

    // Tạo commission
    const { error: createErr } = await supabase
      .from('Commission')
      .insert({
        id: require('crypto').randomUUID(),
        orderId: order.id,
        userId: referrer.id,
        amount,
        percent,
        level: 1,
        status: 'pending',
        createdAt: now,
        updatedAt: now
      });

    if (createErr) {
      console.log(`[ERROR] ${order.orderCode}:`, createErr.message);
      continue;
    }

    // Cập nhật balance
    const { data: user } = await supabase
      .from('User')
      .select('balance')
      .eq('id', referrer.id)
      .single();

    await supabase
      .from('User')
      .update({ 
        balance: (user?.balance || 0) + amount,
        updatedAt: now
      })
      .eq('id', referrer.id);

    console.log(`[OK] ${order.orderCode} → ${referrer.email}: ${amount.toLocaleString()}đ (${percent}%)`);
    created++;
  }

  console.log(`\n========================================`);
  console.log(`Tạo mới: ${created} commission`);
  console.log(`Bỏ qua: ${skipped} đơn`);
}

main();
