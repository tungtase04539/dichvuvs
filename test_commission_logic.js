/**
 * Test Commission Logic - Chính sách mới
 * Chạy: node test_commission_logic.js
 * 
 * Cấu trúc:
 * - Cấp 1: CTV = 10% bán trực tiếp
 * - Cấp 2: Đại lý = 15% bán trực tiếp + 5% override từ CTV (cần ≥3 CTV)
 * - Cấp 3: NPP = 20% bán trực tiếp + 5% override từ Đại lý (cần ≥3 Đại lý)
 */

// Giả lập cấu hình commission (chỉ cần retail, override tính tự động)
const commissionSettings = [
  { key: 'ctv_retail', role: 'ctv', type: 'retail', percent: 10 },
  { key: 'collaborator_retail', role: 'collaborator', type: 'retail', percent: 10 },
  { key: 'agent_retail', role: 'agent', type: 'retail', percent: 15 },
  { key: 'distributor_retail', role: 'distributor', type: 'retail', percent: 20 },
  { key: 'master_agent_retail', role: 'master_agent', type: 'retail', percent: 20 },
];

const settingsMap = new Map(commissionSettings.map(s => [s.key, s]));
const MIN_SUB_AGENTS = 3; // Điều kiện tối thiểu để nhận override

function getRetailPercent(role) {
  const key = `${role}_retail`;
  const setting = settingsMap.get(key);
  if (setting) return setting.percent;
  // Fallback
  if (role === 'collaborator' || role === 'ctv') return settingsMap.get('ctv_retail')?.percent || 10;
  return 0;
}

function calculateCommission(orderValue, referrerRole, parent = null, grandParent = null) {
  const results = [];
  
  // Level 1: Người giới thiệu trực tiếp (Retail)
  const retailPercent = getRetailPercent(referrerRole);
  if (retailPercent > 0) {
    results.push({
      level: 1,
      role: referrerRole,
      type: 'retail',
      percent: retailPercent,
      amount: orderValue * retailPercent / 100
    });
  }
  
  // Level 2: Cấp trên (Override) - chỉ khi có đủ cấp dưới
  if (parent && parent.subAgentCount >= MIN_SUB_AGENTS) {
    const parentRetailPercent = getRetailPercent(parent.role);
    const overridePercent = parentRetailPercent - retailPercent;
    
    if (overridePercent > 0) {
      results.push({
        level: 2,
        role: parent.role,
        type: 'override',
        percent: overridePercent,
        amount: orderValue * overridePercent / 100,
        note: `(${parentRetailPercent}% - ${retailPercent}% = ${overridePercent}%)`
      });
    }
  } else if (parent) {
    results.push({
      level: 2,
      role: parent.role,
      type: 'override',
      percent: 0,
      amount: 0,
      note: `(Chưa đủ ${MIN_SUB_AGENTS} cấp dưới, có ${parent.subAgentCount})`
    });
  }
  
  // Level 3: NPP (Override từ Đại lý) - chỉ khi có đủ Đại lý
  if (grandParent && grandParent.subAgentCount >= MIN_SUB_AGENTS && parent) {
    const grandParentRetailPercent = getRetailPercent(grandParent.role);
    const parentRetailPercent = getRetailPercent(parent.role);
    const overridePercent = grandParentRetailPercent - parentRetailPercent;
    
    if (overridePercent > 0) {
      results.push({
        level: 3,
        role: grandParent.role,
        type: 'override',
        percent: overridePercent,
        amount: orderValue * overridePercent / 100,
        note: `(${grandParentRetailPercent}% - ${parentRetailPercent}% = ${overridePercent}%)`
      });
    }
  }
  
  return results;
}

// Test cases
console.log('='.repeat(70));
console.log('TEST COMMISSION LOGIC - CHÍNH SÁCH MỚI');
console.log('='.repeat(70));

const orderValue = 1000000; // 1 triệu đồng

console.log(`\nGiá trị đơn hàng: ${orderValue.toLocaleString()}đ`);
console.log(`Điều kiện nhận Override: Cần ≥${MIN_SUB_AGENTS} cấp dưới\n`);

// Test 1: CTV bán trực tiếp (không có cấp trên)
console.log('--- Test 1: CTV bán trực tiếp (không có cấp trên) ---');
const test1 = calculateCommission(orderValue, 'ctv');
test1.forEach(r => {
  console.log(`  Level ${r.level} (${r.role} - ${r.type}): ${r.percent}% = ${r.amount.toLocaleString()}đ ${r.note || ''}`);
});
console.log(`  → Tổng chi: ${test1.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}đ`);

// Test 2: CTV bán, Đại lý có 2 CTV (chưa đủ điều kiện)
console.log('\n--- Test 2: CTV bán, Đại lý có 2 CTV (chưa đủ điều kiện) ---');
const test2 = calculateCommission(orderValue, 'ctv', { role: 'agent', subAgentCount: 2 });
test2.forEach(r => {
  console.log(`  Level ${r.level} (${r.role} - ${r.type}): ${r.percent}% = ${r.amount.toLocaleString()}đ ${r.note || ''}`);
});
console.log(`  → Tổng chi: ${test2.filter(r => r.amount > 0).reduce((sum, r) => sum + r.amount, 0).toLocaleString()}đ`);

// Test 3: CTV bán, Đại lý có 3 CTV (đủ điều kiện)
console.log('\n--- Test 3: CTV bán, Đại lý có 3 CTV (đủ điều kiện) ---');
const test3 = calculateCommission(orderValue, 'ctv', { role: 'agent', subAgentCount: 3 });
test3.forEach(r => {
  console.log(`  Level ${r.level} (${r.role} - ${r.type}): ${r.percent}% = ${r.amount.toLocaleString()}đ ${r.note || ''}`);
});
console.log(`  → Tổng chi: ${test3.filter(r => r.amount > 0).reduce((sum, r) => sum + r.amount, 0).toLocaleString()}đ`);

// Test 4: Đại lý bán trực tiếp
console.log('\n--- Test 4: Đại lý bán trực tiếp ---');
const test4 = calculateCommission(orderValue, 'agent');
test4.forEach(r => {
  console.log(`  Level ${r.level} (${r.role} - ${r.type}): ${r.percent}% = ${r.amount.toLocaleString()}đ ${r.note || ''}`);
});
console.log(`  → Tổng chi: ${test4.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}đ`);

// Test 5: CTV bán, có Đại lý (3 CTV) + NPP (3 Đại lý)
console.log('\n--- Test 5: CTV bán, có Đại lý (3 CTV) + NPP (3 Đại lý) ---');
const test5 = calculateCommission(
  orderValue, 
  'ctv', 
  { role: 'agent', subAgentCount: 3 },
  { role: 'distributor', subAgentCount: 3 }
);
test5.forEach(r => {
  console.log(`  Level ${r.level} (${r.role} - ${r.type}): ${r.percent}% = ${r.amount.toLocaleString()}đ ${r.note || ''}`);
});
console.log(`  → Tổng chi: ${test5.filter(r => r.amount > 0).reduce((sum, r) => sum + r.amount, 0).toLocaleString()}đ`);

// Test 6: Đại lý bán, có NPP (3 Đại lý)
console.log('\n--- Test 6: Đại lý bán, có NPP (3 Đại lý) ---');
const test6 = calculateCommission(
  orderValue, 
  'agent', 
  { role: 'distributor', subAgentCount: 3 }
);
test6.forEach(r => {
  console.log(`  Level ${r.level} (${r.role} - ${r.type}): ${r.percent}% = ${r.amount.toLocaleString()}đ ${r.note || ''}`);
});
console.log(`  → Tổng chi: ${test6.filter(r => r.amount > 0).reduce((sum, r) => sum + r.amount, 0).toLocaleString()}đ`);

// Test 7: NPP bán trực tiếp
console.log('\n--- Test 7: NPP bán trực tiếp ---');
const test7 = calculateCommission(orderValue, 'distributor');
test7.forEach(r => {
  console.log(`  Level ${r.level} (${r.role} - ${r.type}): ${r.percent}% = ${r.amount.toLocaleString()}đ ${r.note || ''}`);
});
console.log(`  → Tổng chi: ${test7.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}đ`);

console.log('\n' + '='.repeat(70));
console.log('SUMMARY - Cấu hình hoa hồng (Admin có thể chỉnh sửa):');
console.log('='.repeat(70));
commissionSettings.forEach(s => {
  console.log(`  ${s.role.padEnd(15)} : ${s.percent}% (${s.type})`);
});
console.log('');
console.log('Công thức Override = % cấp trên - % cấp dưới');
console.log('  Đại lý override từ CTV: 15% - 10% = 5%');
console.log('  NPP override từ Đại lý: 20% - 15% = 5%');
console.log('='.repeat(70));
