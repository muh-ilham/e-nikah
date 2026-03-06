import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Testing API Delete Logic via Prisma ---')

    // 1. Create a dummy user
    const dummyUser = await prisma.user.create({
        data: {
            name: 'Delete Test User',
            email: 'delete-test-' + Date.now() + '@example.com',
            password: 'password123',
            role: 'prajurit',
            status: 'approved'
        }
    })
    console.log(`Created dummy user: ${dummyUser.id}`)

    // 2. Create ProfilPrajurit (to test cascade)
    const profil = await prisma.profilPrajurit.create({
        data: {
            userId: dummyUser.id,
            hp: '08123456789'
        }
    })
    console.log(`Created profile for dummy user: ${profil.id}`)

    // 3. Try to delete the user
    try {
        console.log(`Attempting to delete user ${dummyUser.id}...`)
        const result = await prisma.user.delete({
            where: { id: dummyUser.id }
        })
        console.log('SUCCESS: User deleted successfully!')
    } catch (error: any) {
        console.error('FAILED: Delete user error:')
        console.error(error)
        if (error.code === 'P2003') {
            console.error('FOREIGN KEY CONSTRAINT DETECTED!')
        }
    }

    // 4. Try to delete a REAL user that might have blockers (e.g. based on my research)
    // I saw "muhammad ilham" earlier. Let's see if he has pengajuanNikah.
    const realUser = await prisma.user.findFirst({
        where: { name: { contains: 'ilham' } },
        include: { pengajuanNikah: true }
    })

    if (realUser) {
        console.log(`\nChecking real user: ${realUser.name} (${realUser.id})`)
        console.log(`PengajuanNikah count: ${realUser.pengajuanNikah.length}`)

        // We won't actually delete a real user unless we are sure.
        // But we can check if there are other relations.
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
