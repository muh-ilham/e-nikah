const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const pangkatTNIAD = [
    // Perwira Tinggi
    { nama: 'Jenderal TNI', korps: '' },
    { nama: 'Letnan Jenderal TNI (Letjen)', korps: '' },
    { nama: 'Mayor Jenderal TNI (Mayjen)', korps: '' },
    { nama: 'Brigadir Jenderal TNI (Brigjen)', korps: '' },
    // Perwira Menengah
    { nama: 'Kolonel', korps: '' },
    { nama: 'Letnan Kolonel (Letkol)', korps: '' },
    { nama: 'Mayor', korps: '' },
    // Perwira Pertama
    { nama: 'Kapten', korps: '' },
    { nama: 'Letnan Satu (Lettu)', korps: '' },
    { nama: 'Letnan Dua (Letda)', korps: '' },
    // Bintara Tinggi
    { nama: 'Pembantu Letnan Satu (Peltu)', korps: '' },
    { nama: 'Pembantu Letnan Dua (Pelda)', korps: '' },
    // Bintara
    { nama: 'Sersan Mayor (Serma)', korps: '' },
    { nama: 'Sersan Kepala (Serka)', korps: '' },
    { nama: 'Sersan Satu (Sertu)', korps: '' },
    { nama: 'Sersan Dua (Serda)', korps: '' },
    // Tamtama Kepala
    { nama: 'Kopral Kepala (Kopka)', korps: '' },
    { nama: 'Kopral Satu (Koptu)', korps: '' },
    { nama: 'Kopral Dua (Kopda)', korps: '' },
    // Tamtama
    { nama: 'Prajurit Kepala (Praka)', korps: '' },
    { nama: 'Prajurit Satu (Pratu)', korps: '' },
    { nama: 'Prajurit Dua (Prada)', korps: '' }
];

async function main() {
    console.log('Menambahkan data pangkat TNI AD...');
    let count = 0;
    for (const p of pangkatTNIAD) {
        try {
            await prisma.masterPangkat.upsert({
                where: { nama: p.nama },
                update: {}, // do nothing if exists
                create: {
                    nama: p.nama,
                    korps: p.korps,
                    aktif: true
                }
            });
            count++;
            console.log(`Berhasil menambahkan/memastikan pangkat: ${p.nama}`);
        } catch (error) {
            console.error(`Gagal memproses pangkat ${p.nama}:`, error.message);
        }
    }
    console.log(`Selesai memproses ${count} pangkat TNI AD.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
