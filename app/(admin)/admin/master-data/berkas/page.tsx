"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Pencil, Trash2, Loader2, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function BerkasPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        nama: "",
        wajib: true,
        kategori: "umum",
        jenisPengajuan: "NIKAH",
        agama: "semua",
        urut: 0,
        aktif: true
    });
    const [submitting, setSubmitting] = useState(false);

    // Filter & Pagination States
    const [search, setSearch] = useState("");
    const [filterKategori, setFilterKategori] = useState("semua");
    const [filterJenis, setFilterJenis] = useState("semua");
    const [filterAgama, setFilterAgama] = useState("semua");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    // Delete Confirmation State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                search,
                kategori: filterKategori,
                jenisPengajuan: filterJenis,
                agama: filterAgama,
                page: page.toString(),
                limit: limit.toString()
            });
            const res = await fetch(`/api/admin/master-data/berkas?${params.toString()}`);
            const json = await res.json();
            if (!json.error) {
                setData(json.data);
                setTotal(json.total);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [search, filterKategori, filterJenis, filterAgama, page]);

    const handleOpenAdd = () => {
        setIsEditing(false);
        setFormData({
            nama: "",
            wajib: true,
            kategori: "umum",
            jenisPengajuan: "NIKAH",
            agama: "semua",
            urut: data.length + 1,
            aktif: true
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: any) => {
        setIsEditing(true);
        setCurrentId(item.id);
        setFormData({
            nama: item.nama,
            wajib: item.wajib,
            kategori: item.kategori,
            jenisPengajuan: item.jenisPengajuan || "NIKAH",
            agama: item.agama || "semua",
            urut: item.urut,
            aktif: item.aktif
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const method = isEditing ? "PUT" : "POST";
            const body = isEditing ? { id: currentId, ...formData } : formData;

            const res = await fetch("/api/admin/master-data/berkas", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setIsModalOpen(false);
                await fetchData();
            } else {
                const err = await res.json();
                console.error(err.error || "Gagal menyimpan data");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!idToDelete) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/admin/master-data/berkas?id=${idToDelete}`, { method: "DELETE" });
            if (res.ok) {
                setIsDeleteModalOpen(false);
                fetchData();
            } else {
                const err = await res.json();
                alert(err.error || "Gagal menghapus");
            }
        } catch (e) {
            console.error(e);
            alert("Terjadi kesalahan sistem");
        } finally {
            setSubmitting(false);
            setIdToDelete(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <FileText className="w-6 h-6 text-primary" />
                        Master Data Berkas
                    </h2>
                    <p className="text-sm text-slate-500 font-medium italic">Pengaturan jenis dokumen persyaratan nikah</p>
                </div>
                <Button onClick={handleOpenAdd} className="bg-primary text-[10px] font-bold h-10 gap-2">
                    <Plus className="w-4 h-4" />
                    TAMBAH BERKAS
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
                <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Cari Nama</Label>
                    <Input
                        placeholder="Ketik nama berkas..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="h-9 text-xs"
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Kategori</Label>
                    <Select value={filterKategori} onValueChange={(v) => { setFilterKategori(v); setPage(1); }}>
                        <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Semua Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="semua">Semua Kategori</SelectItem>
                            <SelectItem value="umum">Umum</SelectItem>
                            <SelectItem value="prajurit">Prajurit</SelectItem>
                            <SelectItem value="calon">Calon Istri</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Jenis</Label>
                    <Select value={filterJenis} onValueChange={(v) => { setFilterJenis(v); setPage(1); }}>
                        <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Semua Jenis" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="semua">Semua Jenis</SelectItem>
                            <SelectItem value="NIKAH">NIKAH</SelectItem>
                            <SelectItem value="CERAI">CERAI</SelectItem>
                            <SelectItem value="TALAK">TALAK</SelectItem>
                            <SelectItem value="RUJUK">RUJUK</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Agama</Label>
                    <Select value={filterAgama} onValueChange={(v) => { setFilterAgama(v); setPage(1); }}>
                        <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Semua Agama" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="semua">Semua Agama</SelectItem>
                            <SelectItem value="Islam">Islam</SelectItem>
                            <SelectItem value="Protestan">Protestan</SelectItem>
                            <SelectItem value="Katolik">Katolik</SelectItem>
                            <SelectItem value="Hindu">Hindu</SelectItem>
                            <SelectItem value="Buddha">Buddha</SelectItem>
                            <SelectItem value="Khonghucu">Khonghucu</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card className="border-slate-200/60 shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-b border-slate-100">
                                <TableHead className="w-[60px] text-[10px] font-bold uppercase text-slate-400 pl-6">URUT</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Nama Dokumen</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Kategori</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Jenis</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Agama</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Wajib</TableHead>
                                <TableHead className="text-right text-[10px] font-bold uppercase text-slate-400 pr-6">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={7} className="h-32 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                            ) : data.length > 0 ? (
                                data.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-slate-50/50 border-b border-slate-50 last:border-0 transition-colors">
                                        <TableCell className="font-bold text-slate-400 pl-6 text-xs">{item.urut}</TableCell>
                                        <TableCell className="font-bold text-slate-900 text-xs">{item.nama}</TableCell>
                                        <TableCell className="text-xs font-bold text-primary uppercase">{item.kategori}</TableCell>
                                        <TableCell className="text-[10px] font-bold">
                                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase">{item.jenisPengajuan}</span>
                                        </TableCell>
                                        <TableCell className="text-[10px] font-bold">
                                            <span className={`px-2 py-0.5 rounded border uppercase ${item.agama && item.agama !== 'semua' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                {item.agama || 'Semua'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {item.wajib ? <Check className="w-4 h-4 text-success" /> : <X className="w-4 h-4 text-slate-300" />}
                                        </TableCell>
                                        <TableCell className="text-right pr-6 space-x-1">
                                            <Button onClick={() => handleOpenEdit(item)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-primary">
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setIdToDelete(item.id);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-slate-400 hover:text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={7} className="h-32 text-center text-slate-400 italic text-xs">Belum ada data berkas</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            {total > 0 && (
                <div className="flex items-center justify-between px-2 py-4">
                    <p className="text-xs text-slate-500 font-medium">
                        Menampilkan <span className="font-bold text-slate-900">{(page - 1) * limit + 1}</span> - <span className="font-bold text-slate-900">{Math.min(page * limit, total)}</span> dari <span className="font-bold text-slate-900">{total}</span> data
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="h-8 gap-1 text-[10px] font-bold"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">SEBELUMNYA</span>
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.ceil(total / limit) }).map((_, i) => {
                                // Tampilkan maksimal 5 halaman (halaman saat ini dan 2 halaman di sekitarnya)
                                if (
                                    i === 0 || // halaman pertama
                                    i === Math.ceil(total / limit) - 1 || // halaman akhir
                                    (i >= page - 2 && i <= page) // 2 halaman di sekitar halaman aktif
                                ) {
                                    return (
                                        <Button
                                            key={i}
                                            variant={page === i + 1 ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setPage(i + 1)}
                                            className={`w-8 h-8 p-0 text-[10px] font-bold ${page === i + 1 ? 'bg-primary text-primary-foreground shadow-sm' : ''}`}
                                        >
                                            {i + 1}
                                        </Button>
                                    );
                                } else if (
                                    i === 1 && page > 3 ||
                                    i === Math.ceil(total / limit) - 2 && page < Math.ceil(total / limit) - 2
                                ) {
                                    return <span key={i} className="px-2 text-slate-400">...</span>;
                                }
                                return null;
                            })}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === Math.ceil(total / limit) || total === 0}
                            onClick={() => setPage(page + 1)}
                            className="h-8 gap-1 text-[10px] font-bold"
                        >
                            <span className="hidden sm:inline">SELANJUTNYA</span>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold uppercase">{isEditing ? "Edit Berkas" : "Tambah Berkas"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold">Nama Dokumen</Label>
                            <Input
                                value={formData.nama}
                                onChange={e => setFormData({ ...formData, nama: e.target.value })}
                                placeholder="Contoh: KTP Calon Istri, Akte Kelahiran, dll"
                                className="h-9 text-xs"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold">Jenis Pengajuan</Label>
                                <Select
                                    value={formData.jenisPengajuan}
                                    onValueChange={v => setFormData({ ...formData, jenisPengajuan: v })}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Pilih Jenis" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NIKAH">NIKAH</SelectItem>
                                        <SelectItem value="CERAI">CERAI</SelectItem>
                                        <SelectItem value="TALAK">TALAK</SelectItem>
                                        <SelectItem value="RUJUK">RUJUK</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold">Agama</Label>
                                <Select
                                    value={formData.agama}
                                    onValueChange={v => setFormData({ ...formData, agama: v })}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Pilih Agama" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="semua">Semua Agama</SelectItem>
                                        <SelectItem value="Islam">Islam</SelectItem>
                                        <SelectItem value="Protestan">Protestan</SelectItem>
                                        <SelectItem value="Katolik">Katolik</SelectItem>
                                        <SelectItem value="Hindu">Hindu</SelectItem>
                                        <SelectItem value="Buddha">Buddha</SelectItem>
                                        <SelectItem value="Khonghucu">Khonghucu</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold">Kategori Dokumen</Label>
                                <Select
                                    value={formData.kategori}
                                    onValueChange={v => setFormData({ ...formData, kategori: v })}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Pilih Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="umum">Umum</SelectItem>
                                        <SelectItem value="prajurit">Prajurit</SelectItem>
                                        <SelectItem value="calon">Calon Istri</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold">Urutan Tampil</Label>
                                <Input
                                    type="number"
                                    value={formData.urut}
                                    onChange={e => setFormData({ ...formData, urut: parseInt(e.target.value) })}
                                    className="h-9 text-xs"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                            <Switch
                                id="wajib"
                                checked={formData.wajib}
                                onCheckedChange={(checked) => setFormData({ ...formData, wajib: checked })}
                            />
                            <Label htmlFor="wajib" className="text-xs font-bold cursor-pointer">Wajib diunggah oleh prajurit</Label>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="submit" disabled={submitting} className="w-full text-xs font-bold h-9 bg-primary uppercase">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Simpan Berkas
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
                            <Trash2 className="w-5 h-5" />
                            KONFIRMASI HAPUS
                        </DialogTitle>
                        <DialogDescription className="text-xs font-medium pt-2">
                            Apakah Anda yakin ingin menghapus data berkas ini? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="text-xs font-bold h-9 bg-slate-50 uppercase">
                            Batal
                        </Button>
                        <Button onClick={handleDelete} disabled={submitting} variant="destructive" className="text-xs font-bold h-9 uppercase">
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Ya, Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
