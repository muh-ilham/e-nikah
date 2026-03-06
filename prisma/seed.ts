import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding Master Data...");

    // Seed Master Pangkat
    const pangkats = [
        { nama: "Pratu", korps: "Inf" },
        { nama: "Prada", korps: "Inf" },
        { nama: "Serda", korps: "Inf" },
        { nama: "Sertu", korps: "Inf" },
        { nama: "Letda", korps: "Inf" },
        { nama: "Lettu", korps: "Inf" },
        { nama: "Kapten", korps: "Inf" },
    ];

    for (const p of pangkats) {
        await prisma.masterPangkat.upsert({
            where: { nama: p.nama },
            update: {},
            create: p,
        });
    }

    // Seed Master Satuan
    const satuans = [
        { nama: "Kodam Jaya" },
        { nama: "Kopassus" },
        { nama: "Kostrad" },
        { nama: "Yonif Mekanis 201/JY" },
        { nama: "Puspen TNI" },
    ];

    for (const s of satuans) {
        await prisma.masterSatuan.upsert({
            where: { nama: s.nama },
            update: {},
            create: s,
        });
    }

    // Seed Master Jabatan
    const jabatans = [
        { nama: "Danru" },
        { nama: "Danton" },
        { nama: "Danki" },
        { nama: "Staf Personel" },
        { nama: "Dandim" },
    ];

    for (const j of jabatans) {
        await prisma.masterJabatan.upsert({
            where: { nama: j.nama },
            update: {},
            create: j,
        });
    }

    // Seed Master Berkas
    const berkas = [
        { nama: "KTP Calon Istri", wajib: true, kategori: "calon", urut: 1 },
        { nama: "Kartu Keluarga", wajib: true, kategori: "umum", urut: 2 },
        { nama: "Surat Izin Komandan", wajib: true, kategori: "prajurit", urut: 3 },
        { nama: "SKCK Calon Istri", wajib: true, kategori: "calon", urut: 4 },
        { nama: "Surat Keterangan Bersih Diri", wajib: true, kategori: "umum", urut: 5 },
    ];

    for (const b of berkas) {
        await prisma.masterBerkas.create({
            data: b,
        });
    }

    // Seed Initial Admin
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await prisma.user.upsert({
        where: { email: "admin@tniad.mil.id" },
        update: {},
        create: {
            name: "Super Admin",
            email: "admin@tniad.mil.id",
            role: "admin_pusat",
            nrp: "12345678",
            password: hashedPassword,
            status: "approved"
        },
    });

    console.log("Seeding Completed Successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
