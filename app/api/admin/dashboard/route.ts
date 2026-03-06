import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const religion = searchParams.get("religion");

        const where: any = {};
        if (religion) {
            where.agama = religion.toUpperCase();
        }

        // 1. Ambil Statistik Pengajuan
        const stats = await prisma.pengajuanNikah.groupBy({
            where,
            by: ['status'],
            _count: {
                id: true,
            },
        });

        // Map status ke format yang mudah dibaca frontend
        const statusMap: Record<string, number> = {
            "Total": 0,
            "Disetujui": 0,
            "Menunggu": 0,
            "Ditolak": 0,
        };

        stats.forEach(item => {
            if (item.status === 'Disetujui') statusMap['Disetujui'] = item._count.id;
            if (item.status === 'Menunggu' || item.status === 'Diperiksa') statusMap['Menunggu'] += item._count.id;
            if (item.status === 'Ditolak') statusMap['Ditolak'] = item._count.id;
            statusMap['Total'] += item._count.id;
        });

        // 2. Statistik berdasarkan Jenis Pengajuan
        const typeStats = await prisma.pengajuanNikah.groupBy({
            where,
            by: ['jenisPengajuan'],
            _count: {
                id: true,
            },
        });

        const typeCounts: Record<string, number> = {
            "NIKAH": 0,
            "CERAI": 0,
            "TALAK": 0,
            "RUJUK": 0,
        };

        typeStats.forEach(item => {
            const type = item.jenisPengajuan?.toUpperCase();
            if (type && type in typeCounts) {
                typeCounts[type] = item._count.id;
            }
        });

        // 3. Total Prajurit
        const totalPrajurit = await prisma.user.count({
            where: { role: 'prajurit' }
        });

        // 3. Pengajuan per Agama (Pie Chart) - Tetap tampilkan semua jika admin pusat, tapi jika religion ada, mungkin hanya 1 entry
        const agamaStats = await prisma.pengajuanNikah.groupBy({
            where,
            by: ['agama'],
            _count: {
                id: true,
            }
        });

        const COLORS = {
            'ISLAM': '#1B4332',
            'KRISTEN': '#2D6A4F',
            'KATOLIK': '#16A34A',
            'HINDU': '#D4A017',
            'BUDDHA': '#F59E0B',
            'KONGHUCU': '#6B7280',
        };

        const chartAgama = agamaStats.map(item => ({
            name: item.agama,
            value: item._count.id,
            color: COLORS[item.agama as keyof typeof COLORS] || '#94a3b8'
        }));

        // 4. Pengajuan per Satuan (Bar Chart - Top 5)
        // Kita perlu join dengan ProfilPrajurit -> MasterSatuan
        const pengajuanWithSatuan = await prisma.pengajuanNikah.findMany({
            where,
            select: {
                user: {
                    select: {
                        profilPrajurit: {
                            select: {
                                satuan: {
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

        const satuanCounts: Record<string, number> = {};
        pengajuanWithSatuan.forEach(p => {
            const sName = p.user?.profilPrajurit?.satuan?.nama || "Tidak Diketahui";
            satuanCounts[sName] = (satuanCounts[sName] || 0) + 1;
        });

        const chartSatuan = Object.entries(satuanCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        // 5. Verifikasi Tertunda (5 Terakhir)
        const pendingVerifications = await prisma.pengajuanNikah.findMany({
            where: {
                ...where,
                status: { in: ['Menunggu', 'Diperiksa'] }
            },
            take: 5,
            orderBy: {
                tglPengajuan: 'desc'
            },
            select: {
                id: true,
                noRegistrasi: true,
                agama: true,
                status: true,
                user: {
                    select: {
                        name: true,
                        profilPrajurit: {
                            select: {
                                satuan: {
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

        const simplifiedPending = pendingVerifications.map(p => ({
            id: p.noRegistrasi,
            name: p.user.name,
            religion: p.agama,
            unit: p.user?.profilPrajurit?.satuan?.nama || "-",
            status: p.status,
            dbId: p.id // Untuk aksi detail
        }));

        return NextResponse.json({
            stats: {
                totalPengajuan: statusMap['Total'],
                disetujui: statusMap['Disetujui'],
                menunggu: statusMap['Menunggu'],
                ditolak: statusMap['Ditolak'],
                totalPrajurit,
                typeCounts
            },
            chartAgama,
            chartSatuan,
            pendingVerifications: simplifiedPending
        });

    } catch (error: any) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
