const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const apps = await prisma.cTVApplication.findMany({
    where: { status: 'pending' },
    include: { user: true },
    take: 5
  });

  console.log('Pending Applications:');
  console.log(JSON.stringify(apps, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
