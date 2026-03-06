import { getOrderApprovalTemplate, getOrderRevisionTemplate, getOrderRejectionTemplate, sendEmail } from '../lib/mail';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("--- TEST EMAIL TEMPLATES ---\n");

    const mockUser = {
        name: "Irawan Kurnia",
        nrp: "311912903212",
        pangkat: "Serda",
        satuan: "Yonif 123",
    };
    const mockNoRegistrasi = "REG-2026-03-02-12345";
    const mockJadwal = "Senin, 9 Maret 2026 Pukul 09:00";
    const mockCatatan = "Berkas N1 sampai N4 sudah lengkap dan valid. Harap hadir tepat waktu.";
    const mockCatatanRevisi = "KTP calon istri belum dilegalisir dari Disdukcapil.";

    console.log("1. HTML APPROVED:");
    const htmlApproved = getOrderApprovalTemplate(mockUser.name, mockNoRegistrasi, { pangkat: mockUser.pangkat, satuan: mockUser.satuan, nrp: mockUser.nrp }, mockJadwal, mockCatatan);
    console.log(htmlApproved.substring(0, 300) + "...\n");

    console.log("2. HTML REVISED:");
    const htmlRevised = getOrderRevisionTemplate(mockUser.name, mockNoRegistrasi, mockCatatanRevisi);
    console.log(htmlRevised.substring(0, 300) + "...\n");

    console.log("3. HTML REJECTED:");
    const htmlRejected = getOrderRejectionTemplate(mockUser.name, mockNoRegistrasi, "Usia belum memenuhi syarat minimal perkawinan.");
    console.log(htmlRejected.substring(0, 300) + "...\n");

    console.log("Mencoba kirim 1 email (Simulasi API Disetujui)...");
    await sendEmail("tester@gmail.com", "TEST API DISETUJUI", htmlApproved);
    console.log("Selesai dikirim.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
