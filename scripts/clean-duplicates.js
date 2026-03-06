const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDuplicates(modelName, field = 'nama') {
    const records = await prisma[modelName].findMany();
    const seen = new Set();
    const duplicates = [];

    for (const record of records) {
        // Normalisasi untuk membandingkan case-insensitive
        const key = record[field].toLowerCase().trim();
        if (seen.has(key)) {
            duplicates.push(record.id);
        } else {
            seen.add(key);
        }
    }

    if (duplicates.length > 0) {
        console.log(`Menemukan ${duplicates.length} duplikat di tabel ${modelName}. Menghapus...`);
        try {
            await prisma[modelName].deleteMany({
                where: {
                    id: { in: duplicates }
                }
            });
            console.log(`Berhasil menghapus duplikat dari tabel ${modelName}.`);
        } catch (error) {
            console.error(`Gagal menghapus duplikat di ${modelName}:`, error.message);
        }
    } else {
        console.log(`Tidak ditemukan duplikat di tabel ${modelName}.`);
    }
}

async function main() {
    console.log('--- Memulai pembersihan data duplikat ---');
    await cleanDuplicates('masterPangkat');
    await cleanDuplicates('masterJabatan');
    await cleanDuplicates('masterSatuan');
    console.log('--- Selesai ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
