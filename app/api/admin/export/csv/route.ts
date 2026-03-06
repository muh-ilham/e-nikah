import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const pengajuan = await prisma.pengajuanNikah.findMany({
            include: {
                user: {
                    include: {
                        profilPrajurit: {
                            include: { pangkat: true, satuan: true, jabatan: true }
                        }
                    }
                },
                calonPasangan: true
            },
            orderBy: { createdAt: 'desc' }
        });

        const headers = [
            "No Registrasi",
            "Status",
            "Tanggal Pengajuan",
            "Jadwal Kedatangan",
            "Nama Prajurit",
            "NRP",
            "Pangkat",
            "Satuan",
            "Nama Pasangan",
            "NIK Pasangan"
        ];

        const rows = pengajuan.map(p => {
            const prajurit = p.user?.profilPrajurit;
            return [
                p.noRegistrasi,
                p.status,
                p.tglPengajuan ? format(new Date(p.tglPengajuan), "yyyy-MM-dd") : "-",
                p.jadwalKedatangan ? format(new Date(p.jadwalKedatangan), "yyyy-MM-dd HH:mm") : "-",
                p.user?.name || "-",
                p.user?.nrp || "-",
                prajurit?.pangkat?.nama || "-",
                prajurit?.satuan?.nama || "-",
                p.calonPasangan?.namaLengkap || "-",
                p.calonPasangan?.nik || "-"
            ].map(String).map(s => `"${s.replace(/"/g, '""')}"`).join(",");
        });

        const csvContent = [headers.join(","), ...rows].join("\n");

        return new NextResponse(csvContent, {
            headers: {
                "Content-Disposition": `attachment; filename="ekspor_pengajuan_${new Date().toISOString().split('T')[0]}.csv"`,
                "Content-Type": "text/csv",
            }
        });
    } catch (error) {
        console.error("Export CSV Error:", error);
        return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
    }
}
