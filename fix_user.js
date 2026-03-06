const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
    const update = await prisma.user.update({
        where: { email: "alwaimatul@gmail.com" },
        data: { email: "alwalimatul@gmail.com" }
    });
    console.log("UPDATED_USER:", JSON.stringify(update, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
