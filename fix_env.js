const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');

if (!fs.existsSync(envPath)) {
    console.log('.env file not found');
    process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n');

const newLines = lines.map(line => {
    const parts = line.split('=');
    if (parts.length > 1) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        return `${key}=${value}`;
    }
    return line;
});

fs.writeFileSync(envPath, newLines.join('\n'), 'utf8');
console.log('✅ .env file sanitized and saved');
