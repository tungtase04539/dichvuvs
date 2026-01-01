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
    if (line.startsWith('DATABASE_URL=')) {
        let value = line.split('=')[1].trim();
        // Remove trailing backslash
        if (value.endsWith('\\')) {
            value = value.slice(0, -1);
        }
        // Fix double // if it's there (e.g. postgresql://postgres:// -> postgresql://postgres@)
        // Actually, if it's postgresql://postgres://, the second // might be where the password was meant to be.
        // Let's just remove the first redundant // if it's postgresql://USER://HOST
        value = value.replace(/(\w+):\/\/(.+):\/\/([^/]+)/, '$1://$2@$3');
        return `DATABASE_URL=${value}`;
    }
    return line;
});

fs.writeFileSync(envPath, newLines.join('\n'), 'utf8');
console.log('✅ .env file repaired');
console.log('New lines (parts):');
newLines.forEach(l => console.log(l.substring(0, 30) + '...'));
