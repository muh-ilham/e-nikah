import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function getGolonganFromPangkat(namaPangkat?: string) {
    if (!namaPangkat) return "Tamtama"; // default

    const nama = namaPangkat.toLowerCase();

    if (nama.includes("pns") || nama.includes("golongan") || nama.includes("pengatur") || nama.includes("penata") || nama.includes("juru")) {
        return "PNS";
    }

    // Perwira
    if (
        nama.includes("letda") || nama.includes("lettu") || nama.includes("kapten") ||
        nama.includes("major") || nama.includes("mayor") || nama.includes("letkol") || nama.includes("kolonel") ||
        nama.includes("jenderal") || nama.includes("brigjen") || nama.includes("mayjen") || nama.includes("letjen")
    ) {
        return "Perwira";
    }

    // Bintara
    if (
        nama.includes("serda") || nama.includes("sertu") || nama.includes("serka") || nama.includes("serma") ||
        nama.includes("pelda") || nama.includes("peltu")
    ) {
        return "Bintara";
    }

    // Tamtama (Pra, Kop)
    return "Tamtama";
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const yearParam = searchParams.get("year");
        const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

        // Ambil semua pengajuan di tahun yang diminta
        // Kita juga bisa hanya memfilter yang disetujui, tapi laporan biasanya menampilkan semua, atau yang ada tglPengajuan-nya.
        // Berdasarkan Dashboard, "Total Nikah" mungkin adalah yang "Disetujui" atau semua? 
        // Kita ambil semua dulu untuk rekapitulasi.

        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

        const pengajuanList = await prisma.pengajuanNikah.findMany({
            where: {
                tglPengajuan: {
                    gte: startDate,
                    lte: endDate,
                }
            },
            select: {
                tglPengajuan: true,
                jenisPengajuan: true,
                user: {
                    select: {
                        profilPrajurit: {
                            select: {
                                pangkat: {
                                    select: {
                                        nama: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Struktur respon data chart/tabel
        // [Jenis (NIKAH, CERAI, dll)][Golongan][Bulan (1-12)]
        const reportData: Record<string, Record<string, number[]>> = {
            "NIKAH": { "Perwira": Array(12).fill(0), "Bintara": Array(12).fill(0), "Tamtama": Array(12).fill(0), "PNS": Array(12).fill(0) },
            "CERAI": { "Perwira": Array(12).fill(0), "Bintara": Array(12).fill(0), "Tamtama": Array(12).fill(0), "PNS": Array(12).fill(0) },
            "TALAK": { "Perwira": Array(12).fill(0), "Bintara": Array(12).fill(0), "Tamtama": Array(12).fill(0), "PNS": Array(12).fill(0) },
            "RUJUK": { "Perwira": Array(12).fill(0), "Bintara": Array(12).fill(0), "Tamtama": Array(12).fill(0), "PNS": Array(12).fill(0) }
        };

        const summary = {
            totalNikah: 0,
            totalCeraiTalakRujuk: 0
        };

        pengajuanList.forEach((p) => {
            const date = new Date(p.tglPengajuan);
            const monthIndex = date.getMonth(); // 0 - 11
            const jenis = p.jenisPengajuan?.toUpperCase() || "NIKAH";

            const namaPangkat = p.user?.profilPrajurit?.pangkat?.nama;
            const golongan = getGolonganFromPangkat(namaPangkat);

            if (reportData[jenis]) {
                reportData[jenis][golongan][monthIndex] += 1;
            }

            if (jenis === "NIKAH") {
                summary.totalNikah += 1;
            } else {
                summary.totalCeraiTalakRujuk += 1;
            }
        });

        return NextResponse.json({
            year,
            summary,
            table: reportData
        });

    } catch (error: any) {
        console.error("Laporan API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
