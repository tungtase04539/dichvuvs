const fs = require('fs');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

const envConfig = dotenv.parse(fs.readFileSync('.env'));
const databaseUrl = envConfig.DATABASE_URL;

console.log('Database URL start:', databaseUrl?.substring(0, 10));

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl
        }
    }
});

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
