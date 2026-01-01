const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);

if (!dbUrlMatch) {
    console.error('DATABASE_URL not found in .env');
    process.exit(1);
}

const connectionString = dbUrlMatch[1].trim();
console.log('Testing connection to:', connectionString.substring(0, 20) + '...');

const client = new Client({ connectionString });

async function test() {
    try {
        await client.connect();
        console.log('✅ PostgreSQL connection successful!');
        const res = await client.query('SELECT NOW()');
        console.log('Server time:', res.rows[0].now);
    } catch (err) {
        console.error('❌ PostgreSQL connection failed:', err.message);
    } finally {
        await client.end();
    }
}

test();
