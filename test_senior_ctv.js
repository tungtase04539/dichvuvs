// Test script cho CTV cao cấp (senior_collaborator)
// Chạy: node test_senior_ctv.js

const BASE_URL = 'https://www.santrolyaichatgpt.com';

async function testSeniorCTV() {
  console.log('=== TEST CTV CAO CẤP (senior_collaborator) ===\n');
  console.log(`Website: ${BASE_URL}\n`);

  // Test 1: Kiểm tra trang đăng nhập
  console.log('1. Kiểm tra trang đăng nhập admin...');
  try {
    const loginRes = await fetch(`${BASE_URL}/quan-tri-vien-dang-nhap`);
    console.log(`   Status: ${loginRes.status} ${loginRes.ok ? '✅' : '❌'}`);
  } catch (e) {
    console.log(`   Error: ${e.message}`);
  }

  // Test 2: Kiểm tra API products (public)
  console.log('\n2. Kiểm tra API sản phẩm...');
  try {
    const productsRes = await fetch(`${BASE_URL}/api/services`);
    const products = await productsRes.json();
    console.log(`   Status: ${productsRes.status}`);
    console.log(`   Số sản phẩm: ${products.length || 0}`);
    
    if (products.length > 0) {
      console.log('\n   Sản phẩm mẫu:');
      products.slice(0, 3).forEach(p => {
        console.log(`   - ${p.name}: ${p.price?.toLocaleString()}đ`);
        console.log(`     Video: ${p.videoUrl ? '✅ Có' : '❌ Chưa có'}`);
      });
    }
  } catch (e) {
    console.log(`   Error: ${e.message}`);
  }

  // Test 3: Kiểm tra commission settings
  console.log('\n3. Kiểm tra cấu hình hoa hồng...');
  try {
    const commRes = await fetch(`${BASE_URL}/api/commission-settings`);
    if (commRes.ok) {
      const settings = await commRes.json();
      console.log(`   Status: ${commRes.status}`);
      
      const seniorSetting = settings.find(s => s.role === 'senior_collaborator');
      if (seniorSetting) {
        console.log(`   ✅ Đã có cấu hình cho senior_collaborator: ${seniorSetting.percent}%`);
      } else {
        console.log(`   ⚠️ Chưa có cấu hình cho senior_collaborator`);
        console.log('   → Cần chạy SQL: sql/add-senior-collaborator-commission.sql');
      }
    } else {
      console.log(`   Status: ${commRes.status} (API có thể cần auth)`);
    }
  } catch (e) {
    console.log(`   Error: ${e.message}`);
  }

  console.log('\n=== HƯỚNG DẪN TEST THỦ CÔNG ===\n');
  console.log('1. Đăng nhập Admin:');
  console.log(`   URL: ${BASE_URL}/quan-tri-vien-dang-nhap`);
  console.log('   Email: admin@admin.com');
  console.log('   Password: admin\n');

  console.log('2. Test update role CTV → CTV cao cấp:');
  console.log('   - Vào: Quản lý tài khoản');
  console.log('   - Chọn một CTV → Sửa');
  console.log('   - Đổi vai trò thành "CTV cao cấp"');
  console.log('   - Lưu và kiểm tra lỗi\n');

  console.log('3. Test nút sửa video (với tài khoản CTV cao cấp):');
  console.log('   - Đăng nhập bằng tài khoản CTV cao cấp');
  console.log('   - Vào: Sản phẩm');
  console.log('   - Tìm sản phẩm CHƯA có video');
  console.log('   - Kiểm tra có nút 📹 (Video) không\n');

  console.log('4. Nếu lỗi 500 khi update role:');
  console.log('   - Kiểm tra Vercel Function Logs');
  console.log('   - Đảm bảo SUPABASE_SERVICE_ROLE_KEY đã set trong Vercel Env\n');

  console.log('5. Chạy SQL để thêm commission setting:');
  console.log('   File: sql/add-senior-collaborator-commission.sql');
  console.log('   Chạy trong Supabase SQL Editor\n');
}

testSeniorCTV().catch(console.error);
