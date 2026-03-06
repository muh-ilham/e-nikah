"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    History,
    Search,
    Eye,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function RiwayatPengajuanPage() {
    const [riwayat, setRiwayat] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchRiwayat = async () => {
            try {
                const userStr = localStorage.getItem("user_prajurit");
                if (userStr) {
                    const u = JSON.parse(userStr);
                    const res = await fetch(`/api/prajurit/pengajuan?userId=${u.id}&list=true`);
                    if (res.ok) {
                        const data = await res.json();
                        setRiwayat(data.pengajuan || []);
                    }
                }
            } catch (error) {
                console.error("Failed fetching history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRiwayat();
    }, []);

    const STATUS_MAP: Record<string, any> = {
        "Menunggu": { icon: Clock, color: "bg-amber-100 text-amber-700 border-amber-200" },
        "Diperiksa": { icon: Loader2, color: "bg-blue-100 text-blue-700 border-blue-200", spin: true },
        "Disetujui": { icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
        "Ditolak": { icon: XCircle, color: "bg-red-100 text-red-700 border-red-200" },
        "Revisi": { icon: AlertCircle, color: "bg-orange-100 text-orange-700 border-orange-200" },
    };

    const filteredRiwayat = riwayat.filter(item =>
        item.noRegistrasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.namaCalon.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.jenisPengajuan.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary/40" /></div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <History className="w-6 h-6 text-primary" />
                        Riwayat Pengajuan
                    </h2>
                    <p className="text-sm text-slate-500 font-medium italic">Daftar seluruh permohonan yang pernah Anda ajukan.</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari no. rekam atau nama..."
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="font-bold text-slate-700">No. Rekam</TableHead>
                            <TableHead className="font-bold text-slate-700">Jenis</TableHead>
                            <TableHead className="font-bold text-slate-700">Nama Calon</TableHead>
                            <TableHead className="font-bold text-slate-700">Tanggal</TableHead>
                            <TableHead className="font-bold text-slate-700">Status</TableHead>
                            <TableHead className="text-right font-bold text-slate-700">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRiwayat.length > 0 ? (
                            filteredRiwayat.map((item) => {
                                const status = STATUS_MAP[item.status] || STATUS_MAP["Menunggu"];
                                const Icon = status.icon;
                                return (
                                    <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-bold text-slate-900">{item.noRegistrasi}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-bold text-[10px] uppercase">
                                                {item.jenisPengajuan}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium text-slate-600">{item.namaCalon}</TableCell>
                                        <TableCell className="text-sm text-slate-500 italic">
                                            {format(new Date(item.tglPengajuan), "dd MMM yyyy", { locale: id })}
                                        </TableCell>
                                        <TableCell>
                                            <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1.5 ${status.color} border`}>
                                                <Icon className={`w-3 h-3 ${status.spin ? 'animate-spin' : ''}`} />
                                                {item.status}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/pengajuan?id=${item.id}`}>
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-primary">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-slate-400 italic text-sm">
                                    Belum ada data riwayat pengajuan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 leading-relaxed italic">
                    Halaman ini menampilkan riwayat seluruh pengajuan yang telah Anda kirimkan. Klik ikon mata untuk melihat detail status terbaru pada halaman utama pengajuan.
                </p>
            </div>
        </div>
    );
}
