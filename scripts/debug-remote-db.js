const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
    try {
        const count = await prisma.masterPangkat.count();
        const users = await prisma.user.count();
        console.log(`--- DATABASE CHECK ---`);
        console.log(`Total Pangkat: ${count}`);
        console.log(`Total Users: ${users}`);

        if (count > 0) {
            const sample = await prisma.masterPangkat.findFirst();
            console.log(`Sample Pangkat: ${sample.nama}`);
        }
        console.log(`----------------------`);
    } catch (e) {
        console.error("Gagal koneksi ke DB:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
