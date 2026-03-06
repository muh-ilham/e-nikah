const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const pangkats = await prisma.masterPangkat.findMany({ take: 20 });
    console.log("Pangkat:");
    console.log(pangkats);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
