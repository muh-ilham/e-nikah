import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
    try {
        const users = await prisma.user.findMany({ take: 5 });
        console.log("Users available:", users.map(u => ({ id: u.id, name: u.name, email: u.email })));

        if (users.length === 0) {
            console.log("No users to test deletion with.");
            return;
        }

        const targetId = users[0].id;
        console.log(`Attempting to delete user with ID: ${targetId} (${users[0].name})`);

        const deleted = await prisma.user.delete({
            where: { id: targetId }
        });
        console.log("Deletion successful:", deleted);
    } catch (error: any) {
        console.error("Deletion FAILED!");
        console.error("Error Message:", error.message);
        console.error("Error Code:", error.code);
        console.error("Full Error:", JSON.stringify(error, null, 2));
    } finally {
        await prisma.$disconnect();
    }
}

test();
