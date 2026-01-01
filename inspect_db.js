const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- Checking Database Connectivity ---');
        await prisma.$connect();
        console.log('✅ Connected to database');

        console.log('\n--- Inspecting Order Table Columns ---');
        const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Order'
    `;
        console.log('Columns in "Order" table:');
        columns.forEach(col => console.log(` - ${col.column_name} (${col.data_type})`));

        console.log('\n--- Checking for orderPackageType specifically ---');
        const hasCol = columns.some(c => c.column_name === 'orderPackageType');
        console.log(`Has "orderPackageType" column: ${hasCol}`);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
