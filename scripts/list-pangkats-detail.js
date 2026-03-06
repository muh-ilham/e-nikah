const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function list() {
    try {
        const pangkats = await prisma.masterPangkat.findMany();
        console.log(`--- PANGKAT LIST (${pangkats.length}) ---`);
        pangkats.forEach(p => {
            console.log(`- [${p.id}] ${p.nama} (${p.korps || 'no korps'}) | Aktif: ${p.aktif}`);
        });
        console.log(`------------------------------`);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

list();
