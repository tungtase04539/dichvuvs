import { PrismaClient } from '@prisma/client'
import { calculateAndCreateCommissions } from './lib/commission'

const prisma = new PrismaClient()

async function main() {
  console.log('--- START VERIFICATION ---')

  const testSuffix = Date.now().toString().slice(-4)
  const ctvEmail = `ctv_${testSuffix}@test.com`
  const agentEmail = `agent_${testSuffix}@test.com`
  const nppEmail = `npp_${testSuffix}@test.com`

  // 1. Create hierarchy: NPP -> Agent -> CTV
  console.log('1. Creating user hierarchy...')
  
  const npp = await prisma.user.create({
    data: {
      email: nppEmail,
      name: `NPP ${testSuffix}`,
      password: 'password123',
      role: 'distributor',
    }
  })

  // NPP needs 3 agents to be eligible for override, but per user request we might want to check if it works without that
  // Let's create exactly 3 to be sure it works first, then we can test without
  console.log('   Creating 2 more sub-agents for NPP to meet the 3-sub-agent rule...')
  for (let i = 0; i < 2; i++) {
    await prisma.user.create({
      data: {
        email: `dummy_agent_${i}_${testSuffix}@test.com`,
        name: `Dummy Agent ${i}`,
        password: 'password123',
        role: 'agent',
        parentId: npp.id
      }
    })
  }

  const agent = await prisma.user.create({
    data: {
      email: agentEmail,
      name: `Agent ${testSuffix}`,
      password: 'password123',
      role: 'agent',
      parentId: npp.id
    }
  })

  // Agent needs 3 CTVs
  console.log('   Creating 2 more sub-CTVs for Agent to meet the 3-sub-CTV rule...')
  for (let i = 0; i < 2; i++) {
    await prisma.user.create({
      data: {
        email: `dummy_ctv_${i}_${testSuffix}@test.com`,
        name: `Dummy CTV ${i}`,
        password: 'password123',
        role: 'collaborator',
        parentId: agent.id
      }
    })
  }

  const ctv = await prisma.user.create({
    data: {
      email: ctvEmail,
      name: `CTV ${testSuffix}`,
      password: 'password123',
      role: 'collaborator',
      parentId: agent.id
    }
  })

  // 2. Create a service
  console.log('2. Ensuring a service exists...')
  let service = await prisma.service.findFirst()
  if (!service) {
    service = await prisma.service.create({
      data: {
        name: 'Test Service',
        slug: `test-service-${testSuffix}`,
        description: 'Test Description',
        price: 1000000,
      }
    })
  }

  // 3. Create an order
  console.log('3. Creating order...')
  const order = await prisma.order.create({
    data: {
      orderCode: `TEST-${testSuffix}`,
      customerName: 'Test Customer',
      customerPhone: '0901234567',
      address: 'Test Address',
      unit: 'Tháng',
      scheduledDate: new Date(),
      scheduledTime: '08:00',
      basePrice: 1000000,
      totalPrice: 1000000,
      status: 'pending',
      referrerId: ctv.id,
      serviceId: service.id
    }
  })

  // 4. Update order to confirmed to trigger commission (manual trigger of the lib function)
  console.log('4. Calculating commissions...')
  const commissions = await calculateAndCreateCommissions(order.id)
  
  console.log(`   Created ${commissions.length} commission records.`)
  
  // 5. Verify results
  console.log('5. Verifying results...')
  for (const c of commissions) {
    const user = await prisma.user.findUnique({ where: { id: c.userId } })
    console.log(`   - User: ${c.userName} (${c.role})`)
    console.log(`     Level: ${c.level}, Type: ${c.type}`)
    console.log(`     Amount: ${c.amount.toLocaleString()}đ (%: ${c.percent})`)
    console.log(`     User Balance: ${user?.balance?.toLocaleString()}đ`)
  }

  console.log('--- VERIFICATION COMPLETE ---')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
