const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    const email = "admin@enikah.mil.id";
    const password = "admin123";
    const nrp = "000000";

    console.log("Membuat user admin default di Supabase...");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            role: "admin_pusat",
            status: "approved",
        },
        create: {
            email,
            name: "Admin Pusat Demo",
            nrp,
            password: hashedPassword,
            role: "admin_pusat",
            status: "approved",
            profilPrajurit: {
                create: {}
            }
        }
    });

    console.log("-----------------------------------------");
    console.log("BERHASIL! User Admin telah siap:");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("-----------------------------------------");
    console.log("Silakan login di website online Anda.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
