"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // If you have sonner installed, otherwise replace

const getPageConfig = (type: string) => {
    switch (type) {
        case 'pangkat':
            return { title: 'Master Pangkat', description: 'Kelola data kepangkatan prajurit.', hasKorps: true };
        case 'satuan':
            return { title: 'Master Satuan', description: 'Kelola data satuan tugas prajurit.', hasKorps: false };
        case 'jabatan':
            return { title: 'Master Jabatan', description: 'Kelola data jabatan prajurit.', hasKorps: false };
        case 'berkas':
            return { title: 'Master Berkas', description: 'Kelola persyaratan dokumen pengajuan nikah.', hasUrut: true, hasWajibKategori: true };
        default:
            return { title: 'Master Data', description: '' };
    }
}

export default function MasterDataPage() {
    const params = useParams();
    const router = useRouter();
    const type = params.type as string;

    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Form State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>({
        id: "",
        nama: "",
        aktif: true,
        korps: "", // for pangkat
        urut: 0, // for berkas
        wajib: true, // for berkas
        kategori: "umum", // for berkas
    });

    const config = getPageConfig(type);

    useEffect(() => {
        if (type) {
            fetchData();
        }
    }, [type]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/master/${type}`);
            const result = await res.json();
            if (res.ok) {
                setData(result);
            } else {
                toast.error(result.error || "Gagal mengambil data");
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.nama) {
            toast.error("Nama wajib diisi!");
            return;
        }

        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `/api/master/${type}/${formData.id}` : `/api/master/${type}`;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await res.json();

            if (res.ok) {
                toast.success(`Data berhasil ${isEditing ? 'diubah' : 'ditambahkan'}`);
                setIsDialogOpen(false);
                fetchData();
            } else {
                toast.error(result.error || "Terjadi kesalahan sistem");
            }
        } catch (error) {
            toast.error("Gagal menyimpan data");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

        try {
            const res = await fetch(`/api/master/${type}/${id}`, {
                method: 'DELETE',
            });
            const result = await res.json();

            if (res.ok) {
                toast.success("Data berhasil dihapus");
                fetchData();
            } else {
                toast.error(result.error || "Gagal menghapus data");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
        }
    };

    const openCreateDialog = () => {
        setIsEditing(false);
        setFormData({
            id: "",
            nama: "",
            aktif: true,
            korps: "",
            urut: (data.length || 0) + 1,
            wajib: true,
            kategori: "umum",
        });
        setIsDialogOpen(true);
    };

    const openEditDialog = (item: any) => {
        setIsEditing(true);
        setFormData({ ...item });
        setIsDialogOpen(true);
    };

    const filteredData = data.filter(item =>
        item.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.korps?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!["pangkat", "satuan", "jabatan", "berkas"].includes(type)) {
        return <div className="p-8 text-center">Halaman tidak valid</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
                        {config.title}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">{config.description}</p>
                </div>

                <Button onClick={openCreateDialog} className="bg-primary hover:bg-primary-dark shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Data
                </Button>
            </div>

            <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Cari data..."
                            className="pl-9 bg-white border-slate-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 text-sm">
                            Tidak ada data ditemukan.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="w-16 text-center">No</TableHead>
                                    <TableHead>Nama</TableHead>
                                    {config.hasKorps && <TableHead>Korps</TableHead>}
                                    {config.hasUrut && <TableHead>No. Urut</TableHead>}
                                    {config.hasWajibKategori && (
                                        <>
                                            <TableHead>Kategori</TableHead>
                                            <TableHead>Wajib</TableHead>
                                        </>
                                    )}
                                    <TableHead className="w-24 text-center">Status</TableHead>
                                    <TableHead className="w-32 text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.map((item, index) => (
                                    <TableRow key={item.id} className="hover:bg-slate-50/50">
                                        <TableCell className="text-center font-medium text-slate-500">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="font-bold text-slate-900">
                                            {item.nama}
                                        </TableCell>

                                        {config.hasKorps && (
                                            <TableCell>{item.korps || "-"}</TableCell>
                                        )}

                                        {config.hasUrut && (
                                            <TableCell>{item.urut}</TableCell>
                                        )}

                                        {config.hasWajibKategori && (
                                            <>
                                                <TableCell className="capitalize">{item.kategori}</TableCell>
                                                <TableCell>
                                                    {item.wajib ? (
                                                        <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">Wajib</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">Opsional</Badge>
                                                    )}
                                                </TableCell>
                                            </>
                                        )}

                                        <TableCell className="text-center">
                                            {item.aktif ? (
                                                <Badge className="bg-success/10 text-success border-success/20 font-bold hover:bg-success/20">
                                                    Aktif
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-slate-100 text-slate-500 border-slate-200 font-bold hover:bg-slate-200">
                                                    Nonaktif
                                                </Badge>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-right whitespace-nowrap">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEditDialog(item)}
                                                className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10 mr-1"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(item.id)}
                                                className="h-8 w-8 text-slate-500 hover:text-danger hover:bg-danger/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </Card>

            {/* Dialog Form */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Ubah' : 'Tambah'} {config.title.replace('Master ', '')}</DialogTitle>
                        <DialogDescription>
                            Isi formulir di bawah ini dengan lengkap.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nama" className="font-bold">Nama / Keterangan</Label>
                            <Input
                                id="nama"
                                value={formData.nama}
                                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                placeholder="Masukkan nama..."
                                className="bg-slate-50/50"
                            />
                        </div>

                        {config.hasKorps && (
                            <div className="grid gap-2">
                                <Label htmlFor="korps" className="font-bold">Korps (Opsional)</Label>
                                <Input
                                    id="korps"
                                    value={formData.korps || ''}
                                    onChange={(e) => setFormData({ ...formData, korps: e.target.value })}
                                    placeholder="Contoh: Inf, Kav, Arm, dll"
                                    className="bg-slate-50/50"
                                />
                            </div>
                        )}

                        {config.hasUrut && (
                            <div className="grid gap-2">
                                <Label htmlFor="urut" className="font-bold">Nomor Urut</Label>
                                <Input
                                    id="urut"
                                    type="number"
                                    value={formData.urut}
                                    onChange={(e) => setFormData({ ...formData, urut: parseInt(e.target.value) || 0 })}
                                    className="bg-slate-50/50 max-w-[100px]"
                                />
                            </div>
                        )}

                        {config.hasWajibKategori && (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="kategori" className="font-bold">Kategori Syarat</Label>
                                    <select
                                        id="kategori"
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.kategori}
                                        onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                                    >
                                        <option value="umum">Umum (Bawaan)</option>
                                        <option value="prajurit">Berkas Prajurit</option>
                                        <option value="calon">Berkas Calon Istri</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="space-y-0.5">
                                        <Label className="font-bold">Apakah Wajib?</Label>
                                        <p className="text-[11px] text-slate-500">Prajurit tidak bisa submit jika syarat wajib belum diupload.</p>
                                    </div>
                                    <Switch
                                        checked={formData.wajib}
                                        onCheckedChange={(c) => setFormData({ ...formData, wajib: c })}
                                    />
                                </div>
                            </>
                        )}

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                            <Label htmlFor="aktif" className="font-bold text-slate-700">Status Aktif</Label>
                            <Switch
                                id="aktif"
                                checked={formData.aktif}
                                onCheckedChange={(c) => setFormData({ ...formData, aktif: c })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleSave} className="bg-primary hover:bg-primary-dark">Simpan Data</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
