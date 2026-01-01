const { execSync } = require('child_process');

try {
    console.log('Running prisma db push...');
    const output = execSync('npx prisma db push --accept-data-loss', { encoding: 'utf8' });
    console.log('Output:', output);
} catch (e) {
    console.error('Error:', e.message);
    console.error('Stderr:', e.stderr?.toString());
    console.error('Stdout:', e.stdout?.toString());
}
