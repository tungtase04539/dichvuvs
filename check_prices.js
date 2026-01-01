const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSettings() {
    try {
        const settings = await prisma.setting.findMany();
        console.log('--- Current Settings ---');
        console.log(JSON.stringify(settings, null, 2));

        const services = await prisma.service.findMany({
            select: { id: true, name: true, price: true }
        });
        console.log('--- Services ---');
        console.log(JSON.stringify(services, null, 2));

        const recentOrders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            limit: 5,
            select: { id: true, orderCode: true, totalPrice: true, orderPackageType: true, notes: true }
        });
        console.log('--- Recent Orders ---');
        console.log(JSON.stringify(recentOrders, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkSettings();
