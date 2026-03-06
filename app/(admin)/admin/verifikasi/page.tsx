// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    Filter,
    CheckCircle,
    Eye,
    ArrowUpDown,
    Loader2,
    Calendar,
    FileText,
    Check,
    X,
    AlertCircle,
    Download,
    Shield,
    Heart,
    User,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function VerifikasiPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "tglPengajuan", direction: "desc" });
    const [filterConfig, setFilterConfig] = useState({ status: "All", agama: "All" });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/pengajuan?t=${Date.now()}`, { cache: 'no-store' });
            const result = await res.json();
            if (res.ok) {
                setData(result);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Gagal mengambil data pengajuan");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Reset pagination when filter/search/sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterConfig, sortConfig]);

    const handleOpenDetail = async (item: any) => {
        setSelectedItem(item);
        setIsDetailOpen(true);
        // Fetch full data (including Base64) to avoid large payload in list
        try {
            const res = await fetch(`/api/admin/pengajuan/${item.id}?t=${Date.now()}`);
            if (res.ok) {
                const fullData = await res.json();
                setSelectedItem(fullData);
                setVerifData({
                    status: fullData.status,
                    catatanAdmin: fullData.catatanAdmin || "",
                    jadwalKedatangan: fullData.jadwalKedatangan ? format(new Date(fullData.jadwalKedatangan), "yyyy-MM-dd'T'HH:mm") : ""
                });
            }
        } catch (error) {
            console.error("Fetch detail error:", error);
            toast.error("Gagal mengambil detail berkas");
        }
    };

    const handleViewFile = (fileUrl: string) => {
        if (!fileUrl) {
            toast.error("File tidak tersedia");
            return;
        }

        try {
            if (!fileUrl.startsWith('data:')) {
                window.open(fileUrl, '_blank');
                return;
            }

            const arr = fileUrl.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/pdf';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            const blob = new Blob([u8arr], { type: mime });
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');
            setTimeout(() => URL.revokeObjectURL(blobUrl), 10000); // Cleanup after 10s
        } catch (error) {
            console.error("Error viewing file", error);
            toast.error("Format file tidak valid atau rusak");
        }
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
                fetchData();
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

    const filteredData = data.filter(item => {
        // Search query
        const matchesSearch =
            item.noRegistrasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.user.nrp?.toLowerCase().includes(searchQuery.toLowerCase());

        // Filter Status
        const matchesStatus = filterConfig.status === "All" || item.status === filterConfig.status;

        // Filter Agama
        const matchesAgama = filterConfig.agama === "All" || item.agama === filterConfig.agama;

        return matchesSearch && matchesStatus && matchesAgama;
    }).sort((a, b) => {
        if (!sortConfig.key) return 0;

        let aValue, bValue;
        if (sortConfig.key === "name") {
            aValue = a.user.name;
            bValue = b.user.name;
        } else if (sortConfig.key === "satuan") {
            aValue = a.user.profilPrajurit?.satuan?.nama || "";
            bValue = b.user.profilPrajurit?.satuan?.nama || "";
        } else {
            aValue = a[sortConfig.key];
            bValue = b[sortConfig.key];
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
        }));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-primary" />
                        Verifikasi Pengajuan
                    </h2>
                    <p className="text-sm text-slate-500 font-medium italic">Manajemen verifikasi berkas pengajuan nikah global</p>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="text-[10px] font-bold h-9 border-slate-200">
                                <ArrowUpDown className="w-3.5 h-3.5 mr-2" />
                                {sortConfig.direction === 'asc' ? 'URUTKAN: A-Z' : 'URUTKAN: Z-A'}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xs">
                            <DialogHeader>
                                <DialogTitle className="text-sm font-bold">Urutkan Data</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-1 gap-2">
                                <Button variant={sortConfig.key === 'tglPengajuan' ? 'default' : 'outline'} className="text-xs justify-start" onClick={() => handleSort('tglPengajuan')}>Tanggal Pengajuan</Button>
                                <Button variant={sortConfig.key === 'noRegistrasi' ? 'default' : 'outline'} className="text-xs justify-start" onClick={() => handleSort('noRegistrasi')}>No. Registrasi</Button>
                                <Button variant={sortConfig.key === 'name' ? 'default' : 'outline'} className="text-xs justify-start" onClick={() => handleSort('name')}>Nama Prajurit</Button>
                                <Button variant={sortConfig.key === 'satuan' ? 'default' : 'outline'} className="text-xs justify-start" onClick={() => handleSort('satuan')}>Satuan</Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-primary text-[10px] font-bold h-9 gap-2">
                                <Filter className="w-3.5 h-3.5" />
                                {filterConfig.status !== 'All' || filterConfig.agama !== 'All' ? 'FILTER AKTIF' : 'FILTER LANJUTAN'}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xs">
                            <DialogHeader>
                                <DialogTitle className="text-sm font-bold">Filter Lanjutan</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase text-slate-400">Status</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {["All", "Menunggu", "Diperiksa", "Disetujui", "Ditolak", "Revisi"].map(s => (
                                            <Button
                                                key={s}
                                                variant={filterConfig.status === s ? "default" : "outline"}
                                                className="text-[10px] h-7"
                                                onClick={() => setFilterConfig(prev => ({ ...prev, status: s }))}
                                            >
                                                {s}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase text-slate-400">Agama</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {["All", "ISLAM", "PROTESTAN", "KATOLIK", "HINDU", "BUDHA", "KHONGHUCU"].map(a => (
                                            <Button
                                                key={a}
                                                variant={filterConfig.agama === a ? "default" : "outline"}
                                                className="text-[10px] h-7"
                                                onClick={() => setFilterConfig(prev => ({ ...prev, agama: a }))}
                                            >
                                                {a}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <Button variant="ghost" className="w-full text-xs text-red-500 font-bold h-8" onClick={() => setFilterConfig({ status: "All", agama: "All" })}>RESET FILTER</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Cari No. Registrasi, Nama atau NRP..."
                            className="pl-9 bg-white border-slate-200 text-xs font-bold h-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/50 text-[10px] uppercase text-slate-500 font-bold border-b border-slate-100">
                                <tr>
                                    <th className="py-4 px-6">ID REGISTRASI</th>
                                    <th className="py-4 px-6">NAMA PRAJURIT</th>
                                    <th className="py-4 px-6">SATUAN</th>
                                    <th className="py-4 px-6">JENIS</th>
                                    <th className="py-4 px-6">AGAMA</th>
                                    <th className="py-4 px-6">TANGGAL</th>
                                    <th className="py-4 px-6">STATUS</th>
                                    <th className="py-4 px-6 text-right">AKSI</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary/30" />
                                        </td>
                                    </tr>
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                                            Tidak ada data pengajuan.
                                        </td>
                                    </tr>
                                ) : paginatedData.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="py-4 px-6 font-bold text-slate-900">{row.noRegistrasi}</td>
                                        <td className="py-4 px-6">
                                            <div className="font-bold text-slate-700">{row.user.name}</div>
                                            <div className="text-[10px] text-slate-400">NRP: {row.user.nrp}</div>
                                        </td>
                                        <td className="py-4 px-6 text-slate-500 font-medium whitespace-nowrap">
                                            {row.user.profilPrajurit?.satuan?.nama || row.user.profilPrajurit?.satuanId || "-"}
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge variant="outline" className={`text-[9px] font-bold border-0 px-2 py-0.5 ${row.jenisPengajuan === 'NIKAH' ? 'bg-rose-50 text-rose-600' :
                                                row.jenisPengajuan === 'CERAI' ? 'bg-red-50 text-red-600' :
                                                    row.jenisPengajuan === 'TALAK' ? 'bg-amber-50 text-amber-600' :
                                                        'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                {row.jenisPengajuan || "NIKAH"}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge variant="outline" className="text-[9px] font-bold border-slate-200 text-slate-600">
                                                {row.agama || "-"}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6 text-slate-500 font-medium">
                                            {format(new Date(row.tglPengajuan), "dd MMM yyyy")}
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge className={cn("text-[9px] font-extrabold px-2 py-0.5 border shadow-none", STATUS_STYLE[row.status])}>
                                                {row.status.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenDetail(row)}
                                                className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 text-primary transition-all"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {!loading && filteredData.length > 0 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
                            <div className="text-xs text-slate-500 font-medium">
                                Menampilkan <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> dari <span className="font-bold text-slate-900">{filteredData.length}</span> data
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="h-8 px-2 text-[10px] font-bold"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                                </Button>

                                <div className="hidden sm:flex items-center">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                                        if (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        ) {
                                            return (
                                                <Button
                                                    key={page}
                                                    variant={currentPage === page ? "default" : "ghost"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`h-8 w-8 p-0 text-[10px] font-bold ${currentPage === page ? '' : 'text-slate-500'}`}
                                                >
                                                    {page}
                                                </Button>
                                            );
                                        }
                                        if (page === currentPage - 2 || page === currentPage + 2) {
                                            return <span key={page} className="px-1 text-slate-400 text-xs text-center min-w-[32px]">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="h-8 px-2 text-[10px] font-bold"
                                >
                                    Next <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
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
                                        <Badge className="bg-secondary text-primary hover:bg-secondary font-bold uppercase">{selectedItem.agama}</Badge>
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
                                            <FileText className="w-4 h-4 text-primary" /> Berkas Persyaratan ({selectedItem.berkas.length})
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {selectedItem.berkas.map((b: any) => (
                                                <div
                                                    key={b.id}
                                                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white group hover:border-primary/30 transition-all cursor-pointer"
                                                    onClick={() => handleViewFile(b.fileUrl)}
                                                >
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                                                            <FileText className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="text-[11px] font-bold text-slate-700 truncate group-hover:text-primary transition-colors">{b.masterBerkas.nama}</p>
                                                            <p className="text-[9px] text-emerald-600 font-bold uppercase">{b.status}</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-all"
                                                        onClick={(e) => { e.stopPropagation(); handleViewFile(b.fileUrl); }}
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Button>
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
