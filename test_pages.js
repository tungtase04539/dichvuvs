/**
 * TEST CÁC TRANG WEB
 */

const BASE_URL = 'https://santrolyaichatgpt.com';

const pages = [
  { url: '/', name: 'Trang chủ' },
  { url: '/san-pham', name: 'Sản phẩm' },
  { url: '/dang-nhap', name: 'Đăng nhập khách' },
  { url: '/quan-tri-vien-dang-nhap', name: 'Đăng nhập Admin/CTV' },
  { url: '/admin', name: 'Admin Dashboard' },
  { url: '/admin/ctv-dashboard', name: 'CTV Dashboard' },
  { url: '/admin/hoa-hong', name: 'Hoa hồng' },
  { url: '/admin/rut-tien', name: 'Rút tiền' },
  { url: '/admin/doi-nhom', name: 'Đội nhóm' },
  { url: '/admin/cau-hinh-hoa-hong', name: 'Cấu hình hoa hồng' },
  { url: '/admin/quan-ly-rut-tien', name: 'Quản lý rút tiền' },
];

const c = {
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', cyan: '\x1b[36m',
};

async function testPage(url, name) {
  try {
    const res = await fetch(BASE_URL + url, { redirect: 'manual' });
    const status = res.status;
    
    if (status === 200) {
      console.log(`${c.green}✓${c.reset} ${name} (${url}): ${status} OK`);
      return true;
    } else if (status === 307 || status === 302 || status === 301) {
      const location = res.headers.get('location');
      console.log(`${c.yellow}→${c.reset} ${name} (${url}): ${status} Redirect → ${location}`);
      return true;
    } else {
      console.log(`${c.red}✗${c.reset} ${name} (${url}): ${status}`);
      return false;
    }
  } catch (e) {
    console.log(`${c.red}✗${c.reset} ${name} (${url}): ${e.message}`);
    return false;
  }
}

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log('  TEST CÁC TRANG WEB');
  console.log('═'.repeat(60) + '\n');

  let passed = 0;
  for (const page of pages) {
    if (await testPage(page.url, page.name)) passed++;
  }

  console.log(`\n${c.cyan}Kết quả: ${passed}/${pages.length} trang OK${c.reset}\n`);
}

main();
