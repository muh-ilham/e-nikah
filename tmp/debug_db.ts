import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Debugging User Deletion ---')
    const users = await prisma.user.findMany({
        include: {
            profilPrajurit: true,
            pengajuanNikah: {
                include: {
                    berkas: true
                }
            }
        }
    })

    console.log(`Total users: ${users.length}`)

    for (const user of users) {
        console.log(`User: ${user.name} (${user.email}) - ID: ${user.id}`)
        console.log(`  Role: ${user.role}, Status: ${user.status}`)
        console.log(`  ProfilPrajurit: ${user.profilPrajurit ? 'Yes' : 'No'}`)
        console.log(`  PengajuanNikah count: ${user.pengajuanNikah.length}`)

        // Check if this user is a verifier in any PengajuanNikah
        const verifiedByThisUser = await (prisma as any).pengajuanNikah.findMany({
            where: {
                adminVerifikatorId: user.id
            }
        })

        if (verifiedByThisUser.length > 0) {
            console.log(`  CRITICAL: This user has verified ${verifiedByThisUser.length} applications.`)
            // Check if there is a formal relation that would block deletion
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
