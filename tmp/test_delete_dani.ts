import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Testing Real User Deletion ---')
    const userId = 'cmm7hml5g0005uq8k4u1x2g0i' // dani@gmail.com

    // Try to delete the real user
    try {
        console.log(`Attempting to delete user ${userId}...`)
        const result = await prisma.user.delete({
            where: { id: userId }
        })
        console.log('SUCCESS: User deleted successfully!')
    } catch (error: any) {
        console.error('FAILED: Delete user error:')
        console.error(error.message)
        if (error.code === 'P2003') {
            console.error('FOREIGN KEY CONSTRAINT DETECTED!')
            console.error(error.meta)
        }
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
