"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    FilePlus,
    History,
    Clock,
    CheckCircle2,
    ChevronRight,
    ArrowRight,
    Loader2,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function PrajuritDashboard() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        approved: 0
    });
    const [latestPengajuan, setLatestPengajuan] = useState<any>(null);
    const [panduanBerkas, setPanduanBerkas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const roleKey = "user_prajurit";
            const storedUser = localStorage.getItem(roleKey);
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);

                    // Fetch profile
                    const resProfil = await fetch(`/api/profil/me?userId=${parsedUser.id}`);
                    const dataProfil = await resProfil.json();
                    if (resProfil.ok) {
                        setUser(dataProfil);
                    }

                    // Fetch pengajuan status/list for stats & latest
                    const resPengajuan = await fetch(`/api/prajurit/pengajuan?userId=${parsedUser.id}`);
                    const dataPengajuan = await resPengajuan.json();

                    // Fetch master berkas for panduan
                    const resBerkas = await fetch('/api/master/berkas');
                    const dataBerkas = await resBerkas.json();
                    if (resBerkas.ok) {
                        setPanduanBerkas(dataBerkas);
                    }

                    if (resPengajuan.ok && dataPengajuan.pengajuan) {
                        const p = dataPengajuan.pengajuan;
                        setLatestPengajuan(p);

                        // Because currently we only check the LATEST one via the simple API,
                        // for stats we might need more data, but let's mock it based on the latest if exists.
                        // Ideally we'd have a specific stats API.
                        setStats({
                            total: 1, // temporary mock until plural list api
                            active: (p.status === "Menunggu" || p.status === "Diperiksa" || p.status === "Revisi") ? 1 : 0,
                            approved: p.status === "Disetujui" ? 1 : 0
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch dashboard data:", error);
                }
            }
            setLoading(false);
        };

        fetchDashboardData();
    }, []);

    const profil = user?.profilPrajurit;
    const pangkat = profil?.pangkat?.nama || "Prajurit";
    const satuan = profil?.satuan?.nama || "";
    const namaUser = user?.name || "Memuat...";
    const nrp = user?.nrp || "-";

    const STATUS_MAP: Record<string, any> = {
        "Menunggu": { color: "bg-amber-100 text-amber-600 border-amber-200", label: "Menunggu Verifikasi" },
        "Diperiksa": { color: "bg-blue-100 text-blue-600 border-blue-200", label: "Sedang Diperiksa" },
        "Disetujui": { color: "bg-emerald-100 text-emerald-600 border-emerald-200", label: "Disetujui" },
        "Ditolak": { color: "bg-red-100 text-red-600 border-red-200", label: "Ditolak" },
        "Revisi": { color: "bg-orange-100 text-orange-600 border-orange-200", label: "Butuh Perbaikan" },
    };

    if (loading) {
        return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary/40" /></div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Welcome Header */}
            <div className="bg-primary rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl border border-white/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-heading font-extrabold tracking-tight">Selamat Datang, {pangkat} {namaUser}</h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-white/70 text-sm font-medium">
                        <p>NRP: {nrp}</p>
                        {satuan && (
                            <>
                                <p className="hidden md:block">•</p>
                                <p>Satuan: {satuan}</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Pengajuan"
                    value={stats.total.toString()}
                    icon={History}
                    description="Riwayat Anda"
                />
                <StatCard
                    title="Pengajuan Aktif"
                    value={stats.active.toString()}
                    icon={Clock}
                    trend={stats.active > 0 ? "Dalam Proses" : "Tidak Ada"}
                    trendType="neutral"
                />
                <StatCard
                    title="Disetujui"
                    value={stats.approved.toString()}
                    icon={CheckCircle2}
                    trend={stats.approved > 0 ? "Siap Lanjut" : "-"}
                    trendType="positive"
                />
                {/* CTA Card for New Application */}
                <Link href="/pengajuan/baru" className="group">
                    <Card className="h-full bg-secondary border-secondary hover:bg-secondary/90 transition-all cursor-pointer shadow-md active:scale-[0.98]">
                        <CardContent className="p-6 h-full flex flex-col justify-between text-primary">
                            <div className="bg-white/20 p-2 rounded-lg w-fit group-hover:scale-110 transition-transform">
                                <FilePlus className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-heading font-extrabold text-lg flex items-center gap-2">
                                    Buat Pengajuan
                                    <ArrowRight className="w-4 h-4" />
                                </h4>
                                <p className="text-primary/60 text-xs font-bold leading-tight mt-1">
                                    Mulai proses administrasi pernikahan di sini.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-heading font-extrabold text-slate-800">Pengajuan Terakhir</h3>
                        <Link href="/pengajuan" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                            Lihat Semua <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {latestPengajuan ? (
                        <Card className="border-slate-200/60 shadow-sm hover:border-primary/20 transition-all">
                            <CardContent className="p-0">
                                <Link href="/pengajuan" className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            #01
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 leading-none">{latestPengajuan.noRegistrasi}</h4>
                                            <p className="text-xs text-slate-400 mt-1">Diajukan: {format(new Date(latestPengajuan.tglPengajuan), "dd MMM yyyy", { locale: id })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end gap-8">
                                        <Badge className={`font-bold px-3 py-1 border shadow-none ${STATUS_MAP[latestPengajuan.status]?.color || "bg-slate-100"}`}>
                                            {STATUS_MAP[latestPengajuan.status]?.label || latestPengajuan.status}
                                        </Badge>
                                        <div className="hidden sm:block">
                                            <Button variant="ghost" size="sm" className="font-bold text-xs gap-2">
                                                Detail <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-3 rounded-full bg-slate-100 text-slate-400">
                                    <History className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-600">Belum Ada Pengajuan</p>
                                    <p className="text-xs text-slate-400">Riwayat pengajuan nikah Anda akan tampil di sini.</p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Status Tracker / Info Card */}
                <div className="space-y-4">
                    <h3 className="font-heading font-extrabold text-slate-800">Informasi Penting</h3>
                    <Card className="border-secondary/20 bg-secondary/5 shadow-none overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-full -mr-12 -mt-12"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-primary/80">Panduan Berkas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pb-6">
                            <p className="text-[11px] text-primary/60 font-medium leading-relaxed">
                                Pastikan seluruh dokumen asli telah dipindai (scanned) dengan jelas sebelum diunggah ke sistem.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-[10px] font-bold text-amber-600">
                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-sm shadow-amber-500/50 shrink-0"></div>
                                    Lengkapi Profil Anda Terlebih Dahulu
                                </li>
                                {panduanBerkas.length > 0 ? panduanBerkas
                                    .filter(item => {
                                        // Filter by agama
                                        const matchesAgama = !item.agama || item.agama.toLowerCase() === 'semua' || item.agama === profil?.agama;

                                        // Filter by jenis (if there's a latest pengajuan, filter by that type, otherwise show all active types)
                                        // or if we just want to show general guidelines, we might show NIKAH by default
                                        const currentType = latestPengajuan?.jenisPengajuan || "NIKAH";
                                        const matchesJenis = item.jenisPengajuan === currentType;

                                        return matchesAgama && matchesJenis;
                                    })
                                    .map((item) => (
                                        <li key={item.id} className="flex items-start gap-2 text-[10px] font-bold text-primary/80">
                                            <div className="w-1.5 h-1.5 bg-secondary rounded-full shadow-sm shadow-secondary/50 shrink-0 mt-1"></div>
                                            <span>{item.nama}</span>
                                        </li>
                                    )) : (
                                    <li className="text-[10px] text-primary/60 italic text-center py-2">Memuat panduan dokumen...</li>
                                )}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Quick Link to Profile Update */}
                    {!profil && (
                        <Link href="/lengkapi-profil">
                            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 flex items-start gap-3 mt-4 hover:bg-amber-100 transition-colors">
                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-amber-800">Profil Belum Lengkap!</p>
                                    <p className="text-[10px] text-amber-600">Lengkapi profil Anda agar dapat melakukan pengajuan nikah.</p>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
