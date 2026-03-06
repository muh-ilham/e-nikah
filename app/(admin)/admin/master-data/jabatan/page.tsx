"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Briefcase, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
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

export default function JabatanPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ nama: "" });
    const [submitting, setSubmitting] = useState(false);

    // Pagination & Search
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ search, page: page.toString(), limit: limit.toString() });
            const res = await fetch(`/api/admin/master-data/jabatan?${params.toString()}`);
            const json = await res.json();
            if (!json.error) {
                setData(json.data || []);
                setTotal(json.total || 0);
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
        }, 500);
        return () => clearTimeout(timer);
    }, [search, page]);

    const handleOpenAdd = () => {
        setIsEditing(false);
        setFormData({ nama: "" });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: any) => {
        setIsEditing(true);
        setCurrentId(item.id);
        setFormData({ nama: item.nama });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const method = isEditing ? "PUT" : "POST";
            const body = isEditing ? { id: currentId, ...formData } : formData;

            const res = await fetch("/api/admin/master-data/jabatan", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setFormData({ nama: "" });
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

    const handleDelete = async (id: string | number) => {
        try {
            const res = await fetch(`/api/admin/master-data/jabatan?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchData();
            } else {
                const err = await res.json();
                console.error(err.error || "Gagal menghapus");
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-primary" />
                        Master Data Jabatan
                    </h2>
                    <p className="text-sm text-slate-500 font-medium italic">Manajemen daftar jabatan struktural dan fungsional</p>
                </div>
                <Button onClick={handleOpenAdd} className="bg-primary text-[10px] font-bold h-10 gap-2">
                    <Plus className="w-4 h-4" />
                    TAMBAH JABATAN
                </Button>
            </div>

            <div className="flex gap-4 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
                <div className="flex-1 max-w-sm space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Cari Jabatan</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Ketik nama jabatan..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="h-9 text-xs pl-9"
                        />
                    </div>
                </div>
            </div>

            <Card className="border-slate-200/60 shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-b border-slate-100">
                                <TableHead className="w-[80px] text-[10px] font-bold uppercase text-slate-400 pl-6">NO</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Nama Jabatan</TableHead>
                                <TableHead className="text-right text-[10px] font-bold uppercase text-slate-400 pr-6">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={3} className="h-32 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                            ) : data.length > 0 ? (
                                data.map((item, index) => (
                                    <TableRow key={item.id} className="hover:bg-slate-50/50 border-b border-slate-50 last:border-0 transition-colors">
                                        <TableCell className="font-bold text-slate-400 pl-6 text-xs">{(page - 1) * limit + index + 1}</TableCell>
                                        <TableCell className="font-bold text-slate-900 text-xs uppercase">{item.nama}</TableCell>
                                        <TableCell className="text-right pr-6 space-x-1">
                                            <Button onClick={() => handleOpenEdit(item)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-primary">
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button onClick={() => handleDelete(item.id)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-destructive">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={3} className="h-32 text-center text-slate-400 italic text-xs">Belum ada data jabatan</TableCell></TableRow>
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
                                if (
                                    i === 0 ||
                                    i === Math.ceil(total / limit) - 1 ||
                                    (i >= page - 2 && i <= page)
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
                        <DialogTitle className="text-lg font-bold uppercase">{isEditing ? "Edit Jabatan" : "Tambah Jabatan"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold">Nama Jabatan</Label>
                            <Input
                                value={formData.nama}
                                onChange={e => setFormData({ ...formData, nama: e.target.value })}
                                placeholder="Contoh: DANRU, TABAK, DANTON, dll"
                                className="h-9 text-xs"
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={submitting} className="w-full text-xs font-bold h-9 bg-primary uppercase">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Simpan Jabatan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
