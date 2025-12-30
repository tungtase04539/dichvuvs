const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPrismaAdmins() {
    const users = await prisma.user.findMany({
        where: {
            role: {
                in: ['admin', 'staff']
            }
        }
    });

    console.log('--- Prisma Admins ---');
    users.forEach(u => {
        console.log(`Email: ${u.email} | Role: ${u.role}`);
    });

    await prisma.$disconnect();
}

checkPrismaAdmins();
