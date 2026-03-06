import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const user = await prisma.user.findFirst({
        where: {
            OR: [{ email: "alwalimatul@gmail.com" }, { nrp: "alwalimatul@gmail.com" }]
        }
    });
    console.log(JSON.stringify(user, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
