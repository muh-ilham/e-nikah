"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Users,
    CheckCircle,
    Clock,
    XCircle,
    FileText,
    TrendingUp,
    Loader2
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from "recharts";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/dashboard")
            .then(res => res.json())
            .then(data => {
                if (!data.error) {
                    setData(data);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="font-bold animate-pulse text-sm">MEMUAT DATA DASHBOARD...</p>
            </div>
        );
    }

    const { stats, chartAgama, chartSatuan, pendingVerifications } = data || {
        stats: { totalPengajuan: 0, disetujui: 0, menunggu: 0, ditolak: 0, totalPrajurit: 0 },
        chartAgama: [],
        chartSatuan: [],
        pendingVerifications: []
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">Dashboard Admin Pusat</h2>
                    <p className="text-sm text-slate-500 font-medium">Ringkasan data pengajuan nikah seluruh matra TNI AD</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-slate-600">
                        Update Terakhir: {format(new Date(), "d MMMM yyyy", { locale: id })}
                    </span>
                </div>
            </div>

            {/* Grid Statistik Utama */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Total Pengajuan" value={stats.totalPengajuan.toString()} icon={FileText} trend="+0%" trendType="neutral" />
                <StatCard title="Disetujui" value={stats.disetujui.toString()} icon={CheckCircle} trend="+0%" trendType="positive" className="border-l-4 border-l-success" />
                <StatCard title="Menunggu" value={stats.menunggu.toString()} icon={Clock} trend="+0%" trendType="neutral" className="border-l-4 border-l-warning" />
                <StatCard title="Ditolak" value={stats.ditolak.toString()} icon={XCircle} trend="+0%" trendType="negative" className="border-l-4 border-l-destructive" />
                <StatCard title="Total Prajurit" value={stats.totalPrajurit.toString()} icon={Users} trend="+0%" trendType="positive" />
            </div>

            {/* Statistik per Jenis Layanan */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-1 bg-primary rounded-full"></div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Statistik per Jenis Layanan</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Nikah" value={stats.typeCounts?.NIKAH?.toString() || "0"} icon={FileText} trendType="neutral" className="bg-emerald-50/30" />
                    <StatCard title="Cerai" value={stats.typeCounts?.CERAI?.toString() || "0"} icon={FileText} trendType="neutral" className="bg-red-50/30" />
                    <StatCard title="Talak" value={stats.typeCounts?.TALAK?.toString() || "0"} icon={FileText} trendType="neutral" className="bg-orange-50/30" />
                    <StatCard title="Rujuk" value={stats.typeCounts?.RUJUK?.toString() || "0"} icon={FileText} trendType="neutral" className="bg-blue-50/30" />
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart Pengajuan per Agama */}
                <Card className="border-slate-200/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            Pengajuan per Agama
                        </CardTitle>
                        <CardDescription className="text-[10px]">Persentase pengajuan berdasarkan keyakinan</CardDescription>
                    </CardHeader>
                    <CardContent className="h-64">
                        {chartAgama.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartAgama}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartAgama.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="grid grid-cols-3 gap-2 mt-4">
                                    {chartAgama.map((item: any) => (
                                        <div key={item.name} className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-300 text-xs italic">Belum ada data pengajuan</div>
                        )}
                    </CardContent>
                </Card>

                {/* Bar Chart Pengajuan per Satuan */}
                <Card className="border-slate-200/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold">Pengajuan per Satuan</CardTitle>
                        <CardDescription className="text-[10px]">5 Satuan dengan pengajuan terbanyak</CardDescription>
                    </CardHeader>
                    <CardContent className="h-72">
                        {chartSatuan.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartSatuan} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: "bold", fill: "#64748b" }}
                                    />
                                    <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                    <Bar dataKey="value" fill="#d4a017" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-300 text-xs italic">Belum ada data satuan</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Tabel Ringkas Verifikasi */}
            <Card className="border-slate-200/60 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-sm font-bold">Verifikasi Tertunda</CardTitle>
                        <CardDescription className="text-[10px]">Daftar 5 pengajuan terbaru yang membutuhkan aksi</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="text-[10px] font-bold h-7 px-3 border-primary text-primary hover:bg-primary/5 transition-all">
                        LIHAT SEMUA
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100">
                                <tr>
                                    <th className="pb-3 pr-4">Reg No</th>
                                    <th className="pb-3 px-4">Nama Prajurit</th>
                                    <th className="pb-3 px-4">Agama</th>
                                    <th className="pb-3 px-4">Satuan</th>
                                    <th className="pb-3 pl-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {pendingVerifications.length > 0 ? (
                                    pendingVerifications.map((row: any) => (
                                        <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="py-4 font-bold text-slate-900 pr-4">{row.id}</td>
                                            <td className="py-4 px-4 font-medium text-slate-700 uppercase">{row.name}</td>
                                            <td className="py-4 px-4 text-slate-500 uppercase">{row.religion}</td>
                                            <td className="py-4 px-4 text-slate-500 uppercase">{row.unit}</td>
                                            <td className="py-4 pl-4 text-right">
                                                <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-primary group-hover:bg-primary/10 transition-all">
                                                    DETAIL
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-400 italic">Antrian verifikasi kosong</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
