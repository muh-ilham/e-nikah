import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Testing Deletion of All Users (with Rollback) ---')
    const users = await prisma.user.findMany()

    for (const user of users) {
        try {
            if (user.role === 'admin_pusat') {
                console.log(`Skipping admin_pusat ${user.email} (would lock us out)`)
                continue;
            }
            console.log(`Testing deletion for user ${user.email} (role: ${user.role})...`)

            // We do NOT use $transaction for rollback because SQLite doesn't support nested transactions well 
            // or we just don't have PRAGMA foreign_keys = ON inside the transaction properly in Prisma sometimes.
            // But let's actually delete one by one and create them back if needed? 
            // No, we can just do a dry-run checking for related records that might block it.

            // But wait! Earlier when I ran the script on Dani, it WORKED. Dani had PengajuanNikah.
            // What if the user who fails to delete is an ADMIN AGAMA (e.g., putu wayang / hindu@gmail.com)?
            // Admin Agama acts as `adminVerifikatorId` on `PengajuanNikah`.

            // Let's check if they act as adminVerifikatorId
            const verifiedByThem = await prisma.pengajuanNikah.findMany({
                where: { adminVerifikatorId: user.id }
            })

            if (verifiedByThem.length > 0) {
                console.log(`User ${user.email} acts as adminVerifikatorId for ${verifiedByThem.length} pengajuan.`)
                // Try deleting inside a transaction with rollback
                try {
                    await prisma.$transaction(async (tx) => {
                        await tx.user.delete({ where: { id: user.id } })
                        throw new Error('ROLLBACK')
                    })
                } catch (e: any) {
                    if (e.message !== 'ROLLBACK') {
                        console.log('  -> FAILED TO DELETE:', e.message)
                    } else {
                        console.log('  -> Deletion would succeed.')
                    }
                }
            } else {
                console.log(`  -> No adminVerifikatorId records for this user.`)
                // Test normal deletion
                try {
                    await prisma.$transaction(async (tx) => {
                        await tx.user.delete({ where: { id: user.id } })
                        throw new Error('ROLLBACK')
                    })
                } catch (e: any) {
                    if (e.message !== 'ROLLBACK') {
                        console.log('  -> FAILED TO DELETE:', e.message)
                    } else {
                        console.log('  -> Deletion would succeed.')
                    }
                }
            }
        } catch (e) {
            console.log('Error processing user', user.email)
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
