// Test đăng nhập trực tiếp qua Supabase REST API
const https = require('https');

const SUPABASE_URL = 'mjwmmttjuaodhhmshvje.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd21tdHRqdWFvZGhobXNodmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjQxNzEsImV4cCI6MjA3ODYwMDE3MX0.mkf-mS_Ufqf6Y95gSujBlALUlASCu-NyT2aAt7O3j2A';

function testLogin(email, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      email,
      password
    });

    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: '/auth/v1/token?grant_type=password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('\n=== TEST ĐĂNG NHẬP TRỰC TIẾP ===\n');
  
  const testCases = [
    { email: 'npp@test.com', password: '123456' },
    { email: 'agent1@test.com', password: '123456' },
    { email: 'ctv1@test.com', password: '123456' },
    { email: 'admin@admin.com', password: 'admin' },
    { email: 'admin@vesinhhcm.vn', password: 'admin123' }, // Thử các password phổ biến
    { email: 'legendarytvst@gmail.com', password: '123456' },
  ];
  
  for (const tc of testCases) {
    console.log(`Testing: ${tc.email}`);
    try {
      const result = await testLogin(tc.email, tc.password);
      if (result.status === 200 && result.data.access_token) {
        console.log(`  ✓ Đăng nhập thành công!`);
        console.log(`  User ID: ${result.data.user?.id?.substring(0, 8)}...`);
        console.log(`  Role: ${result.data.user?.user_metadata?.role || 'N/A'}`);
      } else {
        console.log(`  ✗ Thất bại: ${result.data.error || result.data.error_description || result.data.msg || JSON.stringify(result.data)}`);
      }
    } catch (err) {
      console.log(`  ✗ Error: ${err.message}`);
    }
    console.log('');
  }
}

main();
