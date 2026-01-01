const { Prisma } = require('@prisma/client');
console.log('Order model fields:', Object.keys(Prisma.OrderScalarFieldEnum).join(', '));
