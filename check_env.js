const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');

if (!fs.existsSync(envPath)) {
    console.log('.env file not found');
    process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n');

console.log('--- .env Analysis ---');
lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('DATABASE_URL')) {
        console.log(`Line ${i + 1}: Starts with "DATABASE_URL"`);
        console.log(`Original line length: ${line.length}`);
        console.log(`First 5 characters hex: ${Buffer.from(line.substring(0, 5)).toString('hex')}`);

        const parts = line.split('=');
        if (parts.length > 1) {
            const value = parts.slice(1).join('=');
            console.log(`Value starts with: "${value.substring(0, 5)}..."`);
            console.log(`Value first char hex: ${Buffer.from(value.substring(0, 1)).toString('hex')}`);
        }
    }
});
