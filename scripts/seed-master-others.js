require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Master Satuan & Jabatan...');

    const satuans = [
        'Mabesad', 'Kostrad', 'Kopassus', 'Kodam I/BB', 'Kodam II/Swj',
        'Kodam III/Slw', 'Kodam IV/Dip', 'Kodam V/Brw', 'Kodam VI/Mlw',
        'Kodam IX/Udy', 'Kodam XII/Tpr', 'Kodam XIII/Mdk', 'Kodam XIV/Hsn',
        'Kodam XVI/Ptm', 'Kodam XVII/Cen', 'Kodam XVIII/Ksr', 'Kodam Jaya', 'Kodam IM'
    ];

    const jabatans = [
        'Danramil', 'Babinsa', 'Danyon', 'Dandim', 'Danrem', 'Pangdam',
        'Kasad', 'Pasi Intel', 'Pasi Ops', 'Pasi Pers', 'Pasi Log', 'Pasi Ter',
        'Danton', 'Danki', 'Pasi', 'Kasi', 'Asisten', 'Dir', 'Dansat'
    ];

    for (const s of satuans) {
        await prisma.masterSatuan.upsert({
            where: { nama: s },
            update: {},
            create: { nama: s }
        });
    }

    for (const j of jabatans) {
        await prisma.masterJabatan.upsert({
            where: { nama: j },
            update: {},
            create: { nama: j }
        });
    }

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
