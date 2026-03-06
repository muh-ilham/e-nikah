"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    CheckCircle,
    Clock,
    XCircle,
    FileText,
    LayoutDashboard,
    Loader2
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminAgamaDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [chartSatuan, setChartSatuan] = useState<any[]>([]);
    const [pending, setPending] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [adminAgama, setAdminAgama] = useState<string>("");

    useEffect(() => {
        const storedUser = localStorage.getItem("user_admin_agama");
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                if (userData.agamaId) {
                    setAdminAgama(userData.agamaId);
                    fetchDashboardData(userData.agamaId);
                } else {
                    fetchDashboardData();
                }
            } catch (e) {
                fetchDashboardData();
            }
        } else {
            fetchDashboardData();
        }
    }, []);

    const fetchDashboardData = async (religion?: string) => {
        setIsLoading(true);
        try {
            const url = religion ? `/api/admin/dashboard?religion=${religion}` : "/api/admin/dashboard";
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
                setChartSatuan(data.chartSatuan || []);
                setPending(data.pendingVerifications || []);
            }
        } catch (error) {
            console.error("Gagal load dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm font-bold text-slate-500 animate-pulse uppercase tracking-widest">Memuat Dashboard {adminAgama}...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">Dashboard Admin {adminAgama || 'Agama'}</h2>
                    <p className="text-sm text-slate-500 font-medium italic">Mengelola pengajuan nikah khusus agama {adminAgama || 'terkait'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Pengajuan" value={stats?.totalPengajuan?.toString() || "0"} icon={FileText} trendType="neutral" />
                <StatCard title="Disetujui" value={stats?.disetujui?.toString() || "0"} icon={CheckCircle} trendType="positive" />
                <StatCard title="Menunggu" value={stats?.menunggu?.toString() || "0"} icon={Clock} trendType="neutral" />
                <StatCard title="Ditolak" value={stats?.ditolak?.toString() || "0"} icon={XCircle} trendType="negative" />
            </div>

            {/* Statistik per Jenis Layanan */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-1 bg-primary rounded-full"></div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider italic">Statistik per Jenis Layanan ({adminAgama})</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Nikah" value={stats?.typeCounts?.NIKAH?.toString() || "0"} icon={FileText} trendType="neutral" className="bg-emerald-50/30" />
                    <StatCard title="Cerai" value={stats?.typeCounts?.CERAI?.toString() || "0"} icon={FileText} trendType="neutral" className="bg-red-50/30" />
                    <StatCard title="Talak" value={stats?.typeCounts?.TALAK?.toString() || "0"} icon={FileText} trendType="neutral" className="bg-orange-50/30" />
                    <StatCard title="Rujuk" value={stats?.typeCounts?.RUJUK?.toString() || "0"} icon={FileText} trendType="neutral" className="bg-blue-50/30" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-slate-200/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <LayoutDashboard className="w-4 h-4 text-primary" />
                            Statistik per Satuan
                        </CardTitle>
                        <CardDescription className="text-[10px]">Distribusi pengajuan agama {adminAgama} di berbagai satuan</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80 pb-6">
                        {chartSatuan && chartSatuan.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartSatuan} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: "bold", fill: "#94a3b8" }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: "bold", fill: "#94a3b8" }}
                                    />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                                    <Bar dataKey="value" fill="#1B4332" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-300 italic text-xs">
                                Tidak ada data statistik satuan
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 shadow-sm bg-primary text-white overflow-hidden">
                    <CardHeader className="border-b border-white/10">
                        <CardTitle className="text-sm font-bold text-secondary uppercase">Antrian Menunggu</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto max-h-[400px]">
                        {pending && pending.length > 0 ? (
                            <div className="divide-y divide-white/10">
                                {pending.map((p) => (
                                    <div key={p.id} className="p-5 hover:bg-white/5 transition-colors cursor-pointer group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[9px] font-black text-secondary tracking-widest uppercase">{p.id}</span>
                                            <Badge className="bg-amber-500/20 text-amber-300 border-none text-[8px] font-bold">WAITING</Badge>
                                        </div>
                                        <h5 className="text-xs font-black truncate text-white group-hover:text-secondary transition-colors uppercase">{p.name}</h5>
                                        <p className="text-[9px] text-white/50 font-bold uppercase tracking-tighter">{p.unit}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-20 text-center text-white/20 italic text-xs flex flex-col items-center gap-2">
                                <Clock className="w-8 h-8 opacity-20" />
                                antrian kosong
                            </div>
                        )}
                    </CardContent>
                    {(pending && pending.length > 0) && (
                        <div className="p-4 border-t border-white/10 bg-white/5">
                            <Button variant="ghost" className="w-full text-[10px] font-black h-9 bg-secondary text-primary hover:bg-secondary/90 transition-all uppercase px-4 shadow-lg shadow-black/20">
                                PROSES SEMUA ANTRIAN
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
