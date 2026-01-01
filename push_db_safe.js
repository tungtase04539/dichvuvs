require('dotenv').config();
const { execSync } = require('child_process');

try {
    console.log('DATABASE_URL found:', !!process.env.DATABASE_URL);
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is missing in .env');
        process.exit(1);
    }
    const output = execSync('npx prisma db push --accept-data-loss', {
        encoding: 'utf8',
        env: { ...process.env }
    });
    console.log('Output:', output);
} catch (e) {
    console.error('Error:', e.message);
    console.error('Stdout:', e.stdout);
    console.error('Stderr:', e.stderr);
}
