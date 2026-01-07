const { PrismaClient } = require('@prisma/client');

async function main() {
    // Hardcode the URL to avoid dotenv/env loading issues during initialization
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: "postgresql://postgres:postgres@localhost:5432/postgres"
            }
        }
    });

    try {
        console.log('Attempting to add columns to Service table...');

        // Add isTrial
        await prisma.$executeRawUnsafe(`ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "isTrial" BOOLEAN DEFAULT false`);
        console.log('Processed isTrial column.');

        // Add trialCode
        await prisma.$executeRawUnsafe(`ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "trialCode" TEXT`);
        console.log('Processed trialCode column.');

        console.log('Database update successful!');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
