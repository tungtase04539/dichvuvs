const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');

if (!fs.existsSync(envPath)) {
    console.log('.env file not found');
    process.exit(1);
}

const buffer = fs.readFileSync(envPath);
console.log('--- Raw Hex of first 100 bytes ---');
console.log(buffer.slice(0, 100).toString('hex'));

const content = buffer.toString('utf8');
console.log('\n--- Literal Content (first 200 chars) ---');
console.log(content.substring(0, 200).replace(/\r/g, '\\r').replace(/\n/g, '\\n'));
