/**
 * TEST TOÀN DIỆN VỚI AUTHENTICATION
 * Sử dụng Supabase Auth để đăng nhập và test API
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mjwmmttjuaodhhmshvje.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjQxNzEsImV4cCI6MjA3ODYwMDE3MX0.mkf-mS_Ufqf6Y95gSujBlALUlASCu-NyT2aAt7O3j2A';
const BASE_URL = 'https://santrolyaichatgpt.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Colors
const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(type, msg) {
  const icons = { ok: `${c.green}✓`, err: `${c.red}✗`, info: `${c.blue}ℹ`, warn: `${c.yellow}⚠`, test: `${c.cyan}▶` };
  console.log(`${icons[type] || '•'}${c.reset} ${msg}`);
}

async function fetchWithAuth(url, token, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Cookie': `sb-mjwmmttjuaodhhmshvje-auth-token=${token}`,
        ...options.headers,
      },
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data, ok: res.ok };
  } catch (e) {
    return { status: 0, error: e.message, ok: false };
  }
}

async function loginAndTest(email, password, role) {
  console.log(`\n${c.magenta}${'='.repeat(50)}${c.reset}`);
  console.log(`${c.magenta}TEST ${role.toUpperCase()} (${email})${c.reset}`);
  console.log(`${c.magenta}${'='.repeat(50)}${c.reset}`);

  // Login
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    log('err', `Đăng nhập thất bại: ${authError.message}`);
    return null;
  }

  const token = authData.session?.access_token;
  log('ok', `Đăng nhập thành công! Token: ${token?.substring(0, 20)}...`);

  // Test APIs based on role
  const tests = [];

  if (role === 'admin') {
    tests.push(
      { name: 'Commission Settings (GET)', url: `${BASE_URL}/api/admin/commission-settings` },
      { name: 'Admin Withdrawals (GET)', url: `${BASE_URL}/api/admin/withdrawals` },
      { name: 'Admin Commissions (GET)', url: `${BASE_URL}/api/admin/commissions` },
      { name: 'Admin CTV Stats (GET)', url: `${BASE_URL}/api/admin/ctv-stats` },
    );
  }

  if (['npp', 'agent', 'ctv'].includes(role)) {
    tests.push(
      { name: 'CTV Stats (GET)', url: `${BASE_URL}/api/ctv/stats` },
      { name: 'CTV Commissions (GET)', url: `${BASE_URL}/api/ctv/commissions` },
      { name: 'CTV Withdrawals (GET)', url: `${BASE_URL}/api/ctv/withdrawals` },
    );
  }

  if (['npp', 'agent'].includes(role)) {
    tests.push(
      { name: 'CTV Team (GET)', url: `${BASE_URL}/api/ctv/team` },
    );
  }

  // Run tests
  for (const test of tests) {
    const result = await fetchWithAuth(test.url, token, { method: 'GET' });
    if (result.ok) {
      log('ok', `${test.name}: ${result.status} OK`);
      // Show some data
      if (result.data) {
        const preview = JSON.stringify(result.data).substring(0, 150);
        console.log(`   ${c.cyan}Data: ${preview}...${c.reset}`);
      }
    } else {
      log('err', `${test.name}: ${result.status} - ${JSON.stringify(result.data || result.error).substring(0, 100)}`);
    }
  }

  // Logout
  await supabase.auth.signOut();
  return token;
}

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log('  TEST TOÀN DIỆN HỆ THỐNG CTV/ĐẠI LÝ VỚI AUTH');
  console.log('═'.repeat(60));

  // Test Admin
  await loginAndTest('admin@admin.com', 'admin', 'admin');

  // Test NPP
  await loginAndTest('npp@test.com', '123456', 'npp');

  // Test Agent
  await loginAndTest('agent1@test.com', '123456', 'agent');

  // Test CTV
  await loginAndTest('ctv1@test.com', '123456', 'ctv');

  console.log('\n' + '═'.repeat(60));
  console.log('  KẾT THÚC TEST');
  console.log('═'.repeat(60) + '\n');
}

main().catch(console.error);
