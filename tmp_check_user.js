const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, nrp: true, role: true, status: true }
    });
    console.log(JSON.stringify(users));
}
main().finally(() => prisma.$disconnect());
