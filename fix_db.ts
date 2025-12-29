import { PrismaClient } from '@prisma/client'

async function main() {
    const prisma = new PrismaClient()
    try {
        console.log('Testing connection...')
        const result = await prisma.$queryRaw`SELECT 1 as connected`
        console.log('Connected:', result)

        console.log('Attempting to add chatbotLink column to Service...')
        await prisma.$executeRawUnsafe('ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "chatbotLink" TEXT;')
        console.log('Column added (or already existed).')

        console.log('Reloading PostgREST schema cache...')
        await prisma.$executeRawUnsafe("NOTIFY pgrst, 'reload schema';")
        console.log('Schema reload notified.')

    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
