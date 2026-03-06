"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    CheckCircle,
    Search,
    Eye,
    MessageSquare,
    ClipboardCheck,
    Loader2,
    Calendar,
    Check,
    X,
    AlertCircle,
    FileText,
    Download,
    Shield,
    Heart,
    User
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminAgamaVerifikasiPage() {
    const [pengajuan, setPengajuan] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [adminAgama, setAdminAgama] = useState<string>("");

    // Detail / Modal State
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [verifLoading, setVerifLoading] = useState(false);

    // Verif Form
    const [verifData, setVerifData] = useState({
        status: "",
        catatanAdmin: "",
        jadwalKedatangan: ""
    });

    useEffect(() => {
        const storedUser = localStorage.getItem("user_admin_agama");
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.agamaId) {
                setAdminAgama(userData.agamaId);
                fetchData(userData.agamaId);
            } else {
                fetchData();
            }
        } else {
            fetchData();
        }
    }, []);

    const fetchData = async (religion?: string) => {
        setIsLoading(true);
        try {
            const url = religion ? `/api/admin/pengajuan?religion=${religion}` : "/api/admin/pengajuan";
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setPengajuan(data);
            }
        } catch (error) {
            console.error("Gagal load data pengajuan:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDetail = (item: any) => {
        setSelectedItem(item);
        setVerifData({
            status: item.status,
            catatanAdmin: item.catatanAdmin || "",
            jadwalKedatangan: item.jadwalKedatangan ? format(new Date(item.jadwalKedatangan), "yyyy-MM-dd'T'HH:mm") : ""
        });
        setIsDetailOpen(true);
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!verifData.catatanAdmin && (newStatus === "Ditolak" || newStatus === "Revisi")) {
            toast.error("Catatan wajib diisi jika ditolak atau revisi!");
            return;
        }

        if (newStatus === "Disetujui" && !verifData.jadwalKedatangan) {
            toast.error("Jadwal kedatangan wajib diisi jika disetujui!");
            return;
        }

        setVerifLoading(true);
        try {
            const res = await fetch(`/api/admin/pengajuan/${selectedItem.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...verifData,
                    status: newStatus
                })
            });

            if (res.ok) {
                toast.success(`Pengajuan berhasil ${newStatus.toLowerCase()}`);
                setIsDetailOpen(false);
                fetchData(adminAgama);
            } else {
                const err = await res.json();
                toast.error(err.error || "Gagal memperbarui status");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setVerifLoading(false);
        }
    };

    const STATUS_STYLE: Record<string, string> = {
        "Menunggu": "bg-amber-100 text-amber-700 border-amber-200",
        "Diperiksa": "bg-blue-100 text-blue-700 border-blue-200",
        "Disetujui": "bg-emerald-100 text-emerald-700 border-emerald-200",
        "Ditolak": "bg-red-100 text-red-700 border-red-200",
        "Revisi": "bg-orange-100 text-orange-700 border-orange-200",
    };

    const filteredData = pengajuan.filter(p =>
        p.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.noRegistrasi?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div>
                <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <ClipboardCheck className="w-6 h-6 text-primary" />
                    Daftar Verifikasi Agama
                </h2>
                <p className="text-sm text-slate-500 font-medium italic">Antrian pemeriksaan berkas khusus agama {adminAgama || 'Semua'}</p>
            </div>

            <Card className="border-slate-200/60 shadow-sm">
                <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
                    <div className="relative max-w-xs w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Cari nama atau No. Reg..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-white border-slate-200 text-xs font-bold h-9"
                        />
                    </div>
                    {adminAgama && (
                        <Badge variant="outline" className="border-primary text-primary font-bold text-[10px] px-3 bg-primary/5 uppercase">
                            LINGKUP AGAMA: {adminAgama}
                        </Badge>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
                            <p className="text-xs text-slate-400 font-medium animate-pulse">Memuat data pengajuan...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50/50 text-[10px] uppercase text-slate-500 font-bold border-b border-slate-100">
                                    <tr>
                                        <th className="py-4 px-6 text-slate-400">#</th>
                                        <th className="py-4 px-6">ID REG</th>
                                        <th className="py-4 px-6">NAMA PRAJURIT</th>
                                        <th className="py-4 px-6">TGL PENGAJUAN</th>
                                        <th className="py-4 px-6">STATUS</th>
                                        <th className="py-4 px-6 text-right">AKSI</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredData.map((row, idx) => (
                                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="py-4 px-6 text-slate-300 font-medium">{idx + 1}</td>
                                            <td className="py-4 px-6 font-black text-slate-900 tracking-tighter">{row.noRegistrasi}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 uppercase group-hover:text-primary transition-colors">{row.user?.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">{row.user?.profilPrajurit?.pangkat?.nama || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                                                    <Calendar className="w-3 h-3 text-slate-400" />
                                                    {format(new Date(row.tglPengajuan), "dd MMM yyyy", { locale: localeId })}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Badge
                                                    className={cn(
                                                        "text-[9px] font-black px-2 py-0.5 border shadow-none uppercase",
                                                        STATUS_STYLE[row.status] || "bg-amber-50 text-amber-600 border-amber-100"
                                                    )}
                                                >
                                                    {row.status}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <Button size="sm" onClick={() => handleOpenDetail(row)} className="h-8 text-[10px] font-bold bg-primary uppercase px-4">
                                                    Verifikasi
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredData.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-2 opacity-30">
                                                    <ClipboardCheck className="w-12 h-12" />
                                                    <p className="text-sm font-bold uppercase tracking-widest italic">Tidak ada antrian verifikasi</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal Detail & Verifikasi */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            Detail Pengajuan: {selectedItem?.noRegistrasi}
                            <Badge className={cn("text-[10px] ml-2 font-bold", STATUS_STYLE[selectedItem?.status])}>
                                {selectedItem?.status}
                            </Badge>
                        </DialogTitle>
                        <DialogDescription>
                            Review data prajurit, calon istri, dan berkas persyaratan di bawah ini.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedItem && (
                        <div className="space-y-6 py-4">
                            {/* Header Section with Photo */}
                            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start bg-slate-50 p-6 rounded-xl border border-slate-100">
                                <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-md ring-1 ring-slate-200 shrink-0">
                                    {selectedItem.user.profilPrajurit?.fotoUrl ? (
                                        <img src={selectedItem.user.profilPrajurit.fotoUrl} alt={selectedItem.user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                                            <User className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-3 text-center md:text-left">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-slate-900">{selectedItem.user.name}</h3>
                                        <p className="text-sm font-medium text-slate-500">{selectedItem.user.email}</p>
                                    </div>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                        <Badge className="bg-primary hover:bg-primary font-bold">{selectedItem.user.role?.toUpperCase()}</Badge>
                                        <Badge variant="outline" className="border-slate-300 font-bold uppercase">{selectedItem.status}</Badge>
                                        <Badge className="bg-secondary text-primary hover:bg-secondary font-bold uppercase">{selectedItem.agama || adminAgama}</Badge>
                                    </div>
                                    <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                                            <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200 text-[10px]">NRP</Badge>
                                            {selectedItem.user.nrp}
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 uppercase">
                                            {selectedItem.user.profilPrajurit?.pangkat?.nama} ({selectedItem.user.profilPrajurit?.pangkat?.korps || '-'})
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Kiri: Data Identitas */}
                                <div className="md:col-span-2 space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {/* Data Prajurit */}
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold text-primary uppercase border-b border-primary/10 pb-2 flex items-center gap-2">
                                                <Shield className="w-3.5 h-3.5" /> Data Prajurit (Pemohon)
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="text-[10px] text-slate-400 uppercase font-black">Agama</Label>
                                                        <p className="text-xs font-bold text-slate-800 uppercase">{selectedItem.user.agamaId || selectedItem.agama || "-"}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-[10px] text-slate-400 uppercase font-black">Nomor HP</Label>
                                                        <p className="text-xs font-bold text-slate-800">{selectedItem.user.profilPrajurit?.hp || "-"}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-[10px] text-slate-400 uppercase font-black">Satuan / Jabatan</Label>
                                                    <p className="text-xs font-bold text-slate-800">
                                                        {selectedItem.user.profilPrajurit?.satuan?.nama || "-"} / {selectedItem.user.profilPrajurit?.jabatan?.nama || "-"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label className="text-[10px] text-slate-400 uppercase font-black">Alamat Domisili</Label>
                                                    <p className="text-xs font-medium text-slate-600 leading-relaxed">{selectedItem.user.profilPrajurit?.alamat || "-"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Data Calon Istri */}
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold text-rose-500 uppercase border-b border-rose-100 pb-2 flex items-center gap-2">
                                                <Heart className="w-3.5 h-3.5" /> Data Calon Istri
                                            </h4>
                                            <div className="space-y-3">
                                                <div>
                                                    <Label className="text-[10px] text-slate-400 uppercase font-black">Nama Lengkap</Label>
                                                    <p className="text-sm font-bold text-slate-800">{selectedItem.namaCalon}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-[10px] text-slate-400 uppercase font-black">TTL / Umur</Label>
                                                    <p className="text-xs font-bold text-slate-800">
                                                        {selectedItem.tempatLahirCalon}, {format(new Date(selectedItem.tglLahirCalon), "dd MMM yyyy")}
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="text-[10px] text-slate-400 uppercase font-black">Pekerjaan</Label>
                                                        <p className="text-xs font-bold text-slate-800">{selectedItem.pekerjaanCalon}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-[10px] text-slate-400 uppercase font-black">Suku</Label>
                                                        <p className="text-xs font-bold text-slate-800">{selectedItem.sukuCalon}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-[10px] text-slate-400 uppercase font-black">Alamat</Label>
                                                    <p className="text-xs font-medium text-slate-600 line-clamp-2 leading-relaxed">{selectedItem.alamatCalon}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Berkas Terlampir */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-slate-800 uppercase border-b border-slate-100 pb-2 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-primary" /> Berkas Persyaratan ({selectedItem.berkas?.length || 0})
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {selectedItem.berkas?.map((b: any) => (
                                                <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white group hover:border-primary/30 transition-all">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center shrink-0">
                                                            <FileText className="w-4 h-4 text-slate-400" />
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="text-[11px] font-bold text-slate-700 truncate">{b.masterBerkas?.nama}</p>
                                                            <p className="text-[9px] text-emerald-600 font-bold uppercase">{b.status}</p>
                                                        </div>
                                                    </div>
                                                    <a href={b.fileUrl} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Download className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Kanan: Panel Verifikasi */}
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-6">
                                    <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-primary" /> Panel Keputusan
                                    </h4>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold">Catatan Admin / Verifikator</Label>
                                            <Textarea
                                                placeholder="Tuliskan catatan revisi atau instruksi kedatangan..."
                                                className="min-h-[120px] bg-white text-xs"
                                                value={verifData.catatanAdmin}
                                                onChange={(e) => setVerifData({ ...verifData, catatanAdmin: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> Jadwal Kedatangan
                                            </Label>
                                            <Input
                                                type="datetime-local"
                                                className="bg-white text-sm"
                                                value={verifData.jadwalKedatangan}
                                                onChange={(e) => setVerifData({ ...verifData, jadwalKedatangan: e.target.value })}
                                            />
                                            <p className="text-[10px] text-slate-500 italic">Wajib diisi jika status "Disetujui".</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4 border-t border-slate-200">
                                        <Button
                                            onClick={() => handleStatusUpdate("Disetujui")}
                                            disabled={verifLoading}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold h-10 shadow-sm shadow-emerald-200"
                                        >
                                            <Check className="w-4 h-4 mr-2" /> SETUJUI PENGAJUAN
                                        </Button>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => handleStatusUpdate("Revisi")}
                                                disabled={verifLoading}
                                                className="border-orange-200 text-orange-600 hover:bg-orange-50 font-bold"
                                            >
                                                <AlertCircle className="w-4 h-4 mr-2" /> REVISI
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleStatusUpdate("Ditolak")}
                                                disabled={verifLoading}
                                                className="border-red-200 text-red-600 hover:bg-red-50 font-bold"
                                            >
                                                <X className="w-4 h-4 mr-2" /> TOLAK
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}


