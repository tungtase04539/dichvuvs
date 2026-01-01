const fs = require('fs');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

const envConfig = dotenv.parse(fs.readFileSync('.env'));
const databaseUrl = envConfig.DATABASE_URL;

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl
        }
    }
});

async function main() {
    try {
        const columns = await prisma.$queryRawUnsafe(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'Order'
    `);
        console.log('Columns in Order table:', columns.map(c => c.column_name).join(', '));
    } catch (e) {
        console.error('Failed to list columns:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
