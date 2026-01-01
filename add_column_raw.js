require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Adding orderPackageType column...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "orderPackageType" TEXT DEFAULT 'standard'`);
        console.log('Column added successfully.');
    } catch (e) {
        console.error('Failed to add column:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
