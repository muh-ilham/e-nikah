import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        // --- 1. Ambil data dari Frontend ---
        const userId = formData.get("userId") as string;

        if (!userId) {
            return NextResponse.json({ error: "Sesi tidak valid / User ID hilang" }, { status: 400 });
        }

        // Cek User dan Profil untuk dapat info krusial (seperti Agama untuk filter Admin Agama)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { profilPrajurit: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
        }

        const agamaPrajurit = user.profilPrajurit?.agama || "Islam"; // Default or fallback

        const pengajuanId = formData.get("pengajuanId") as string; // Optional for revision

        // Cek apakah user sudah punya pengajuan yang aktif (jika bukan mode update/revisi)
        if (!pengajuanId) {
            const existingActive = await prisma.pengajuanNikah.findFirst({
                where: {
                    userId,
                    status: { in: ["Menunggu", "Diperiksa"] } // "Revisi" dibolehkan jika via mode update
                }
            });

            if (existingActive) {
                return NextResponse.json({ error: "Anda sudah memiliki pengajuan aktif yang sedang diproses." }, { status: 400 });
            }
        }

        const namaCalon = formData.get("namaCalon") as string;
        const tempatLahirCalon = formData.get("tempatLahirCalon") as string;
        const tglLahirCalonStr = formData.get("tglLahirCalon") as string;
        const agamaCalon = formData.get("agamaCalon") as string;
        const pekerjaanCalon = formData.get("pekerjaanCalon") as string;
        const sukuCalon = formData.get("sukuCalon") as string;
        const alamatCalon = formData.get("alamatCalon") as string;
        const jenisPengajuan = formData.get("jenisPengajuan") as string || "NIKAH";

        // --- 2. Buat atau Update Record PengajuanNikah ---
        let pengajuan;
        if (pengajuanId) {
            // Update existing
            pengajuan = await prisma.pengajuanNikah.update({
                where: { id: pengajuanId },
                data: {
                    status: "Menunggu", // Reset status ke Menunggu saat diperbaiki
                    namaCalon,
                    tempatLahirCalon,
                    tglLahirCalon: new Date(tglLahirCalonStr),
                    agamaCalon,
                    pekerjaanCalon,
                    sukuCalon,
                    alamatCalon,
                    jenisPengajuan,
                    catatanAdmin: null, // Bersihkan catatan lama
                    jadwalKedatangan: null // Bersihkan jadwal lama jika ada
                }
            });
        } else {
            // Generate Registration Number Only for NEW
            const count = await prisma.pengajuanNikah.count();
            const year = new Date().getFullYear();
            const noRegistrasi = `REG-${year}-${(count + 1).toString().padStart(4, '0')}`;

            pengajuan = await prisma.pengajuanNikah.create({
                data: {
                    noRegistrasi,
                    userId,
                    agama: agamaPrajurit,
                    status: "Menunggu",
                    namaCalon,
                    tempatLahirCalon,
                    tglLahirCalon: new Date(tglLahirCalonStr),
                    agamaCalon,
                    pekerjaanCalon,
                    sukuCalon,
                    alamatCalon,
                    jenisPengajuan
                }
            });
        }

        // --- 3. Handle File Uploads dinamis berdasarkan Master Berkas ---
        const masterBerkas = await prisma.masterBerkas.findMany({ where: { aktif: true } });

        const uploadDir = path.join(process.cwd(), "public", "uploads", "pengajuan", pengajuan.id);
        await fs.mkdir(uploadDir, { recursive: true });

        const berkasPromises = masterBerkas.map(async (berkas) => {
            const file = formData.get(`file_${berkas.id}`) as File | null;

            if (file && file.size > 0) {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                const fileName = `${berkas.nama.replace(/[^a-zA-Z0-9]/g, "_")}-${Date.now()}${path.extname(file.name)}`;
                const filePath = path.join(uploadDir, fileName);

                // Cek apakah sudah ada berkas lama untuk masterBerkas ini di pengajuan ini
                const existingBerkas = await prisma.berkasPengajuan.findFirst({
                    where: {
                        pengajuanId: pengajuan.id,
                        masterBerkasId: berkas.id
                    }
                });

                if (existingBerkas) {
                    // Hapus file fisik lama jika ada
                    try {
                        const oldPath = path.join(process.cwd(), "public", existingBerkas.fileUrl);
                        if (await fs.stat(oldPath).catch(() => null)) {
                            await fs.unlink(oldPath);
                        }
                    } catch (e) {
                        console.error("Gagal hapus file lama", e);
                    }

                    // Update record
                    await fs.writeFile(filePath, buffer);
                    const fileUrl = `/uploads/pengajuan/${pengajuan.id}/${fileName}`;

                    return prisma.berkasPengajuan.update({
                        where: { id: existingBerkas.id },
                        data: {
                            fileUrl,
                            status: "Pending" // Reset status ke Pending agar diperiksa ulang
                        }
                    });
                } else {
                    // Create new
                    await fs.writeFile(filePath, buffer);
                    const fileUrl = `/uploads/pengajuan/${pengajuan.id}/${fileName}`;

                    return prisma.berkasPengajuan.create({
                        data: {
                            pengajuanId: pengajuan.id,
                            masterBerkasId: berkas.id,
                            fileUrl,
                            status: "Pending"
                        }
                    });
                }
            }
        });

        // Tunggu semua file tersimpan ke DB
        await Promise.all(berkasPromises);

        return NextResponse.json({ success: true, pengajuan });
    } catch (error: any) {
        console.error("Error creating pengajuan:", error);
        return NextResponse.json({ error: "Terjadi kesalahan sistem saat memproses pengajuan" }, { status: 500 });
    }
}

// GET untuk mengambil data pengajuan user saat ini
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: "User ID diperlukan" }, { status: 400 });
    }

    try {
        const list = searchParams.get('list') === 'true';
        const id = searchParams.get('id');

        const includeData = {
            user: {
                include: {
                    profilPrajurit: {
                        include: {
                            pangkat: true,
                            jabatan: true,
                            satuan: true
                        }
                    }
                }
            },
            berkas: {
                include: {
                    masterBerkas: true
                }
            }
        };

        if (id) {
            const pengajuan = await prisma.pengajuanNikah.findUnique({
                where: { id },
                include: includeData
            });

            // Authorization check
            if (pengajuan && pengajuan.userId !== userId) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
            }

            return NextResponse.json({ pengajuan });
        }

        if (list) {
            const pengajuan = await prisma.pengajuanNikah.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                include: includeData
            });
            return NextResponse.json({ pengajuan });
        }

        const pengajuan = await prisma.pengajuanNikah.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' }, // Ambil yang paling baru
            include: includeData
        });

        return NextResponse.json({ pengajuan });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
