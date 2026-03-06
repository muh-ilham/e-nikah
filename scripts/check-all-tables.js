const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkAll() {
    try {
        console.log("--- FULL DB CHECK ---");
        const results = {
            Users: await prisma.user.count(),
            Pangkat: await prisma.masterPangkat.count(),
            Satuan: await prisma.masterSatuan.count(),
            Jabatan: await prisma.masterJabatan.count(),
            Berkas: await prisma.masterBerkas.count(),
        };
        console.table(results);

        const pangkats = await prisma.masterPangkat.findMany({ take: 5 });
        console.log("Sample Pangkats:", pangkats.map(p => p.nama).join(", "));

        console.log("----------------------");
    } catch (e) {
        console.error("DB Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

checkAll();
