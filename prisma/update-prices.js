const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function updatePrices() {
  console.log("Updating all product prices to 29,000đ...");
  
  const result = await prisma.service.updateMany({
    data: {
      price: 29000,
    },
  });
  
  console.log(`Updated ${result.count} products to 29,000đ`);
  
  // Verify
  const services = await prisma.service.findMany({
    select: { name: true, price: true },
  });
  
  console.log("\nUpdated prices:");
  services.forEach((s) => {
    console.log(`  - ${s.name}: ${s.price.toLocaleString("vi-VN")}đ`);
  });
}

updatePrices()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

