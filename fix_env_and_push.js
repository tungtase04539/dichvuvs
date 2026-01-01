const fs = require('fs');
const { execSync } = require('child_process');

try {
    let content = fs.readFileSync('.env', 'utf8');
    console.log('Original line:', content.split('\n').find(l => l.startsWith('DATABASE_URL')));

    // Remove leading spaces in the value
    content = content.replace(/DATABASE_URL\s*=\s*["']?\s+/, 'DATABASE_URL="');
    // Also ensure it ends with a quote if it started with one? No, just trim it.

    // Alternative: just fix the specific pattern we saw
    content = content.replace(/DATABASE_URL=" /, 'DATABASE_URL="');

    fs.writeFileSync('.env', content);
    console.log('Fixed line:', content.split('\n').find(l => l.startsWith('DATABASE_URL')));

    console.log('Running prisma db push...');
    const output = execSync('npx prisma db push --accept-data-loss', { encoding: 'utf8' });
    console.log('Output:', output);
} catch (e) {
    console.error('Error:', e.message);
    console.error('Stderr:', e.stderr?.toString());
}
