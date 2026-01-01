require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length);
        const userCount = await prisma.user.count();
        console.log('Connection successful. User count:', userCount);

        // Check if packageType column exists by trying to select it
        try {
            const anyOrder = await prisma.order.findFirst({ select: { packageType: true } });
            console.log('packageType column exists!');
        } catch (err) {
            console.log('packageType column does NOT exist or error:', err.message);
        }

    } catch (e) {
        console.error('Connection failed:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
