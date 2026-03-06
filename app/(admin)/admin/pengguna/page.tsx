// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, ShieldCheck, Mail, Search, FileEdit, X, Save, Edit3, Loader2, Plus, Trash2, Shield, User, Lock, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function PenggunaPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Master Data
    const [masterPangkat, setMasterPangkat] = useState<any[]>([]);
    const [masterSatuan, setMasterSatuan] = useState<any[]>([]);
    const [masterJabatan, setMasterJabatan] = useState<any[]>([]);

    // Detail Modal State
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<any>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Review Modal State
    const [userToReview, setUserToReview] = useState<any>(null);
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [addFormData, setAddFormData] = useState<any>({
        name: "",
        email: "",
        role: "prajurit",
        nrp: "",
        agamaId: ""
    });
    const [isSaving, setIsSaving] = useState(false);
    const [masterAgama, setMasterAgama] = useState<any[]>([]);

    useEffect(() => {
        fetchUsers();
        fetchMasterData();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMasterData = async () => {
        try {
            const [resPangkat, resSatuan, resJabatan, resAgama] = await Promise.all([
                fetch("/api/master/pangkat"),
                fetch("/api/master/satuan"),
                fetch("/api/master/jabatan"),
                fetch("/api/master/agama"),
            ]);

            if (resPangkat.ok) setMasterPangkat(await resPangkat.json());
            if (resSatuan.ok) setMasterSatuan(await resSatuan.json());
            if (resJabatan.ok) setMasterJabatan(await resJabatan.json());
            if (resAgama.ok) setMasterAgama(await resAgama.json());
        } catch (e) {
            console.error("Failed fetching master data:", e);
        }
    }

    const handleApproval = async (id: string, newStatus: string) => {
        setIsReviewDialogOpen(false); // Close modal if open
        try {
            const res = await fetch(`/api/admin/users/${id}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                toast.success(`Akun berhasil ${newStatus === 'approved' ? 'disetujui' : 'ditolak'}`);
                fetchUsers();
            }
        } catch (error) {
            toast.error("Gagal update status");
        }
    };

    const openReview = (user: any) => {
        setUserToReview(user);
        setIsReviewDialogOpen(true);
    };

    const openDetail = (user: any) => {
        setSelectedUser(user);
        setFormData({
            name: user.name || "",
            nrp: user.nrp || "",
            email: user.email || "",
            password: user.password || "",
            role: user.role || "prajurit",
            agamaId: user.agamaId || "",
            hp: user.profilPrajurit?.hp || "",
            alamat: user.profilPrajurit?.alamat || "",
            pangkatId: user.profilPrajurit?.pangkatId || "",
            satuanId: user.profilPrajurit?.satuanId || "",
            jabatanId: user.profilPrajurit?.jabatanId || "",
        });
        setEditMode(false);
        setIsDialogOpen(true);
    };

    const handleSaveDetail = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success("Profil dan akun berhasil diperbarui!");
                setEditMode(false);
                fetchUsers(); // Refresh grid
                setIsDialogOpen(false);
            } else {
                toast.error("Gagal menyimpan perubahan");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(addFormData),
            });

            if (res.ok) {
                toast.success("Pengguna berhasil ditambahkan!");
                setIsAddDialogOpen(false);
                setAddFormData({ name: "", email: "", role: "prajurit", nrp: "", agamaId: "", password: "" });
                fetchUsers();
            } else {
                const err = await res.json();
                toast.error(err.error || "Gagal menambahkan pengguna");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        setIsDeleteDialogOpen(false);
        const toastId = toast.loading("Menghapus pengguna...");
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
            const data = await res.json();

            if (res.ok) {
                toast.success("Pengguna berhasil dihapus", { id: toastId });
                fetchUsers();
            } else {
                toast.error(data.error || "Gagal menghapus pengguna", { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan sistem saat menghapus", { id: toastId });
        }
    };

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        setCurrentPage(1); // Reset to page 1 on search change
    }, [search]);

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.nrp?.includes(search)
    );

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary" />
                        Manajemen Pengguna
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Kelola data akun prajurit dan admin agama.</p>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary text-[10px] font-bold h-10 gap-2">
                    <Plus className="w-4 h-4" />
                    TAMBAH PENGGUNA
                </Button>
            </div>

            <Card className="border-slate-200/60 shadow-sm">
                <CardHeader className="border-b border-slate-50 pb-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari berdasarkan nama atau NRP..."
                            className="pl-9 bg-slate-50 border-slate-200 text-sm h-10"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary/40" /></div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 text-sm">Belum ada prajurit terdaftar yang cocok.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-x divide-y divide-slate-100">
                            {paginatedUsers.map((user) => (
                                <div key={user.id} className="p-6 hover:bg-slate-50/80 transition-colors group relative flex flex-col justify-between h-full">
                                    <div>
                                        <div className="flex items-start justify-between">
                                            <Avatar className="w-12 h-12 border-2 border-white shadow-sm ring-1 ring-slate-100 overflow-hidden">
                                                {user.profilPrajurit?.fotoUrl ? (
                                                    <img src={user.profilPrajurit.fotoUrl} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <AvatarFallback className="bg-primary text-secondary font-bold text-xs">{user.name.charAt(0)}</AvatarFallback>
                                                )}
                                            </Avatar>
                                            <Badge
                                                className={cn(
                                                    "text-[9px] font-extrabold px-2 py-0.5 uppercase",
                                                    user.status === "approved" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                                                        user.status === "pending" ? "bg-amber-100 text-amber-700 border-amber-200" :
                                                            "bg-red-100 text-red-700 border-red-200"
                                                )}
                                            >
                                                {user.status}
                                            </Badge>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            <Badge variant="outline" className="text-[8px] font-bold uppercase border-primary/20 text-primary bg-primary/5">
                                                {user.role.replace('_', ' ')}
                                            </Badge>
                                            {user.agamaId && (
                                                <Badge variant="outline" className="text-[8px] font-bold uppercase border-secondary/20 text-secondary bg-secondary/5">
                                                    {user.agamaId}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="mt-4 space-y-1">
                                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">{user.name}</h4>
                                            <div className="flex flex-col gap-1 text-slate-500 text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <Badge className="text-[8px] bg-slate-100 text-slate-600 px-1">NRP</Badge>
                                                    <span className="font-medium">{user.nrp || '-'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Mail className="w-3 h-3 text-slate-400" />
                                                    <span className="font-medium truncate max-w-[150px]">{user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                                        {user.status === "pending" ? (
                                            <Button
                                                onClick={() => openReview(user)}
                                                size="sm"
                                                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold h-8 uppercase shadow-sm"
                                            >
                                                Verifikasi Akun
                                            </Button>
                                        ) : (
                                            <>
                                                <Button variant="secondary" size="sm" onClick={() => openDetail(user)} className="flex-1 h-8 text-[10px] font-black gap-2 uppercase">
                                                    <FileEdit className="w-3 h-3" />
                                                    PROFIL
                                                </Button>
                                                {user.status === "rejected" && (
                                                    <Button
                                                        onClick={() => handleApproval(user.id, "approved")}
                                                        size="sm"
                                                        className="flex-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 text-[10px] font-bold h-8 uppercase"
                                                    >
                                                        Setujui Kembali
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setUserToDelete(user);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                    className="h-9 w-9 p-0 text-slate-400 hover:text-destructive hover:bg-red-50 border border-transparent hover:border-red-100 transition-all rounded-full"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {!isLoading && filteredUsers.length > 0 && totalPages > 1 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="text-xs font-bold gap-1 bg-white"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Sebelumnya
                            </Button>

                            <div className="text-xs font-medium text-slate-500">
                                Halaman <span className="font-bold text-slate-900">{currentPage}</span> dari <span className="font-bold text-slate-900">{totalPages}</span>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="text-xs font-bold gap-1 bg-white"
                            >
                                Selanjutnya
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog Detail Profil */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[700px] h-[90vh] sm:h-auto overflow-y-auto">
                    <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
                        <DialogTitle className="text-xl font-heading font-extrabold flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                            Detail & Manajemen Akun
                        </DialogTitle>
                        {selectedUser?.status === "approved" && (
                            <Button
                                variant={editMode ? "ghost" : "outline"}
                                size="sm"
                                className="h-8"
                                onClick={() => setEditMode(!editMode)}
                            >
                                {editMode ? <X className="w-4 h-4 text-slate-500" /> : <><Edit3 className="w-4 h-4 mr-2" /> Edit</>}
                            </Button>
                        )}
                    </DialogHeader>

                    {selectedUser && (
                        <div className="space-y-6 py-4">
                            {/* Header Section with Photo */}
                            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start bg-slate-50 p-6 rounded-xl border border-slate-100">
                                <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-md ring-1 ring-slate-200 shrink-0">
                                    {selectedUser.profilPrajurit?.fotoUrl ? (
                                        <img src={selectedUser.profilPrajurit.fotoUrl} alt={selectedUser.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                                            <User className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-3 text-center md:text-left">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-slate-900">{selectedUser.name}</h3>
                                        <p className="text-sm font-medium text-slate-500">{selectedUser.email}</p>
                                    </div>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                        <Badge className="bg-primary hover:bg-primary font-bold">{selectedUser.role.toUpperCase()}</Badge>
                                        <Badge variant="outline" className="border-slate-300 font-bold uppercase">{selectedUser.status}</Badge>
                                        {selectedUser.agamaId && <Badge className="bg-secondary text-primary hover:bg-secondary font-bold">{selectedUser.agamaId}</Badge>}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black text-primary uppercase tracking-widest border-l-4 border-primary pl-2">Informasi Akun</h5>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Role Pengguna</Label>
                                        {editMode ? (
                                            <Select value={formData.role} onValueChange={v => setFormData({ ...formData, role: v })}>
                                                <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="prajurit">PRAJURIT</SelectItem>
                                                    <SelectItem value="admin_agama">ADMIN AGAMA</SelectItem>
                                                    <SelectItem value="admin_pusat">ADMIN PUSAT</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <p className="text-sm font-bold bg-slate-100 px-3 py-2 rounded border border-slate-200 uppercase">{selectedUser.role}</p>
                                        )}
                                    </div>

                                    {formData.role === 'admin_agama' && editMode && (
                                        <div className="space-y-2 animate-in slide-in-from-top-2">
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase">Kelola Agama</Label>
                                            <Select value={formData.agamaId} onValueChange={v => setFormData({ ...formData, agamaId: v })}>
                                                <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Pilih Agama" /></SelectTrigger>
                                                <SelectContent>
                                                    {masterAgama.map(a => <SelectItem key={a.id} value={a.id}>{a.nama}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase text-red-500">Password Akun</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                            <Input
                                                type={editMode ? "text" : "password"}
                                                readOnly={!editMode}
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                className={cn(
                                                    "pl-10 h-10 text-sm font-mono",
                                                    !editMode ? "bg-slate-50 border-dashed border-slate-300" : "bg-white border-red-200 focus:ring-red-500"
                                                )}
                                            />
                                        </div>
                                        {editMode && <p className="text-[9px] text-slate-500 font-medium italic">* Perubahan password bersifat langsung dan tidak terenkripsi (untuk demo).</p>}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black text-secondary uppercase tracking-widest border-l-4 border-secondary pl-2">Informasi Prajurit</h5>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase">NRP / NIP</Label>
                                        {editMode ? (
                                            <Input value={formData.nrp} onChange={e => setFormData({ ...formData, nrp: e.target.value })} className="h-10" />
                                        ) : (
                                            <p className="text-sm font-semibold">{selectedUser.nrp || "-"}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Pangkat / Korps</Label>
                                        {editMode ? (
                                            <Select
                                                value={formData.pangkatId}
                                                onValueChange={(val) => setFormData({ ...formData, pangkatId: val })}
                                            >
                                                <SelectTrigger className="h-10"><SelectValue placeholder="Pilih Pangkat" /></SelectTrigger>
                                                <SelectContent>
                                                    {masterPangkat.map((p) => (
                                                        <SelectItem key={p.id} value={p.id}>{p.nama} {p.korps ? `(${p.korps})` : ''}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <p className="text-sm font-semibold">
                                                {selectedUser.profilPrajurit?.pangkat?.nama || "-"} {selectedUser.profilPrajurit?.pangkat?.korps ? `(${selectedUser.profilPrajurit?.pangkat?.korps})` : ''}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Jabatan Sekarang</Label>
                                        {editMode ? (
                                            <Select
                                                value={formData.jabatanId}
                                                onValueChange={(val) => setFormData({ ...formData, jabatanId: val })}
                                            >
                                                <SelectTrigger className="h-10"><SelectValue placeholder="Pilih Jabatan" /></SelectTrigger>
                                                <SelectContent>
                                                    {masterJabatan.map((j) => (
                                                        <SelectItem key={j.id} value={j.id}>{j.nama}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <p className="text-sm font-semibold">{selectedUser.profilPrajurit?.jabatan?.nama || "-"}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Satuan Induk / Kesatuan</Label>
                                        {editMode ? (
                                            <Select
                                                value={formData.satuanId}
                                                onValueChange={(val) => setFormData({ ...formData, satuanId: val })}
                                            >
                                                <SelectTrigger className="h-10"><SelectValue placeholder="Pilih Satuan" /></SelectTrigger>
                                                <SelectContent>
                                                    {masterSatuan.map((s) => (
                                                        <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <p className="text-sm font-semibold">{selectedUser.profilPrajurit?.satuan?.nama || "-"}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-slate-300 pl-2">Kontak & Lokasi</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Nomor HP</Label>
                                        {editMode ? (
                                            <Input value={formData.hp} onChange={e => setFormData({ ...formData, hp: e.target.value })} className="h-10" />
                                        ) : (
                                            <p className="text-sm font-semibold">{selectedUser.profilPrajurit?.hp || "-"}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Alamat Domisili</Label>
                                        {editMode ? (
                                            <Input value={formData.alamat} onChange={e => setFormData({ ...formData, alamat: e.target.value })} className="h-10" />
                                        ) : (
                                            <p className="text-sm font-semibold leading-relaxed">{selectedUser.profilPrajurit?.alamat || "-"}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {editMode && (
                                <div className="pt-4 border-t flex justify-end gap-3 mt-8">
                                    <Button variant="outline" onClick={() => setEditMode(false)} disabled={isSaving} className="h-11 px-6 font-bold">Batal</Button>
                                    <Button onClick={handleSaveDetail} disabled={isSaving} className="bg-primary h-11 px-10 font-black gap-2 shadow-lg shadow-primary/20">
                                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                        SIMPAN SEMUA PERUBAHAN
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Dialog Tambah Pengguna */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[700px] h-[90vh] sm:h-auto overflow-y-auto">
                    <DialogHeader className="border-b pb-4">
                        <DialogTitle className="text-xl font-heading font-extrabold flex items-center gap-2">
                            <Plus className="w-6 h-6 text-primary" />
                            Tambah Pengguna Baru
                        </DialogTitle>
                        <DialogDescription className="text-xs font-medium text-slate-500">
                            Buat akun baru dengan profil lengkap untuk Prajurit atau Admin.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddUser} className="space-y-6 py-4">
                        {/* Section Header: Foto & Info Utama */}
                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start bg-slate-50 p-6 rounded-xl border border-slate-100">
                            <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-200 shrink-0 bg-white flex items-center justify-center relative group">
                                {addFormData.fotoUrl ? (
                                    <img src={addFormData.fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-slate-200" />
                                )}
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap</Label>
                                    <Input
                                        required
                                        value={addFormData.name}
                                        onChange={e => setAddFormData({ ...addFormData, name: e.target.value })}
                                        placeholder="Nama Lengkap"
                                        className="h-10 text-sm focus:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Email Akun</Label>
                                    <Input
                                        type="email"
                                        required
                                        value={addFormData.email}
                                        onChange={e => setAddFormData({ ...addFormData, email: e.target.value })}
                                        placeholder="email@prajurit.mil.id"
                                        className="h-10 text-sm focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Kiri: Akses & Keamanan */}
                            <div className="space-y-4">
                                <h5 className="text-[10px] font-black text-primary uppercase tracking-widest border-l-4 border-primary pl-2">Akses & Keamanan</h5>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Role Pengguna</Label>
                                    <Select
                                        value={addFormData.role}
                                        onValueChange={(val) => setAddFormData({ ...addFormData, role: val })}
                                    >
                                        <SelectTrigger className="h-10 text-sm focus:ring-primary/20">
                                            <SelectValue placeholder="Pilih Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="prajurit">PRAJURIT</SelectItem>
                                            <SelectItem value="admin_agama">ADMIN AGAMA</SelectItem>
                                            <SelectItem value="admin_pusat">ADMIN PUSAT</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {addFormData.role === "admin_agama" && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Kelola Agama</Label>
                                        <Select
                                            required
                                            value={addFormData.agamaId}
                                            onValueChange={(val) => setAddFormData({ ...addFormData, agamaId: val })}
                                        >
                                            <SelectTrigger className="h-10 text-sm focus:ring-primary/20">
                                                <SelectValue placeholder="Pilih Agama" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {masterAgama.map(a => (
                                                    <SelectItem key={a.id} value={a.id}>{a.nama}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase text-red-500">Password (Default: 123456)</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        <Input
                                            type="text"
                                            value={addFormData.password}
                                            onChange={e => setAddFormData({ ...addFormData, password: e.target.value })}
                                            placeholder="******"
                                            className="h-10 pl-10 text-sm font-mono bg-white border-red-100"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">URL Foto Profil</Label>
                                    <Input
                                        value={addFormData.fotoUrl}
                                        onChange={e => setAddFormData({ ...addFormData, fotoUrl: e.target.value })}
                                        placeholder="https://link-foto.jpg"
                                        className="h-10 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Kanan: Data Identitas */}
                            <div className="space-y-4">
                                <h5 className="text-[10px] font-black text-secondary uppercase tracking-widest border-l-4 border-secondary pl-2">Data Identitas</h5>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">NRP / NIP</Label>
                                    <Input
                                        value={addFormData.nrp}
                                        onChange={e => setAddFormData({ ...addFormData, nrp: e.target.value })}
                                        placeholder="Input NRP"
                                        className="h-10 text-sm focus:ring-secondary/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Pangkat / Korps</Label>
                                    <Select
                                        value={addFormData.pangkatId}
                                        onValueChange={(val) => setAddFormData({ ...addFormData, pangkatId: val })}
                                    >
                                        <SelectTrigger className="h-10 text-sm">
                                            <SelectValue placeholder="Pilih Pangkat" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {masterPangkat.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>{p.nama} {p.korps ? `(${p.korps})` : ''}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Jabatan</Label>
                                    <Select
                                        value={addFormData.jabatanId}
                                        onValueChange={(val) => setAddFormData({ ...addFormData, jabatanId: val })}
                                    >
                                        <SelectTrigger className="h-10 text-sm">
                                            <SelectValue placeholder="Pilih Jabatan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {masterJabatan.map((j) => (
                                                <SelectItem key={j.id} value={j.id}>{j.nama}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Satuan</Label>
                                    <Select
                                        value={addFormData.satuanId}
                                        onValueChange={(val) => setAddFormData({ ...addFormData, satuanId: val })}
                                    >
                                        <SelectTrigger className="h-10 text-sm">
                                            <SelectValue placeholder="Pilih Satuan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {masterSatuan.map((s) => (
                                                <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-slate-300 pl-2">Kontak & Lokasi</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Nomor HP</Label>
                                    <Input
                                        value={addFormData.hp}
                                        onChange={e => setAddFormData({ ...addFormData, hp: e.target.value })}
                                        placeholder="0812..."
                                        className="h-10 text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Alamat Domisili</Label>
                                    <Input
                                        value={addFormData.alamat}
                                        onChange={e => setAddFormData({ ...addFormData, alamat: e.target.value })}
                                        placeholder="Alamat Lengkap"
                                        className="h-10 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-6 border-t gap-3">
                            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="h-11 px-6 font-bold">
                                BATAL
                            </Button>
                            <Button type="submit" disabled={isSaving} className="bg-primary h-11 px-10 font-black gap-2 shadow-lg shadow-primary/20">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                SIMPAN PENGGUNA BARU
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog Hapus Pengguna */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-heading font-extrabold flex items-center gap-2 text-destructive">
                            <Trash2 className="w-5 h-5" />
                            Hapus Pengguna
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-500 font-medium pt-2">
                            Hapus pengguna <strong>{userToDelete?.name}</strong> secara permanen? Seluruh data profil dan pengajuan nikah yang terkait juga akan dihapus dan tidak dapat dikembalikan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="font-bold">
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={() => handleDeleteUser(userToDelete?.id)} className="font-bold">
                            Ya, Hapus Permanen
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog Verifikasi Pengguna (Pending) */}
            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogContent className="sm:max-w-[800px] h-[90vh] sm:h-auto overflow-y-auto">
                    <DialogHeader className="border-b pb-4">
                        <DialogTitle className="text-xl font-heading font-extrabold flex items-center gap-2 text-amber-600">
                            <Shield className="w-6 h-6" />
                            Verifikasi Pendafataran Akun Baru
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500">
                            Mohon periksa dan validasi data prajurit berikut sebelum memberikan akses ke sistem E-NIKAH.
                        </DialogDescription>
                    </DialogHeader>

                    {userToReview && (
                        <div className="space-y-6 mt-4">
                            {/* Warning Box */}
                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">
                                <div className="mt-0.5 shrink-0">
                                    <ShieldCheck className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-amber-900 text-sm mb-1 uppercase tracking-wider">Perhatian: Verifikasi SISFOPERS</h4>
                                    <p className="text-sm text-amber-800 leading-relaxed">
                                        Sebelum <strong>menyetujui</strong> akun prajurit ini, pastikan Anda telah mengecek kesesuaian data identitas (NRP, Nama, Pangkat, Satuan) di sistem SISFOPERS. Jika data valid dan sesuai, silakan setujui. Jika ditemukan ketidaksesuaian atau data palsu, segera tolak atau hapus pendaftaran ini.
                                    </p>
                                </div>
                            </div>

                            {/* Detil Data Prajurit */}
                            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Data Detail Prajurit
                                    </h3>
                                </div>
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-[120px_1fr] gap-2 text-sm border-b border-dashed border-slate-200 pb-2">
                                            <span className="font-bold text-slate-500">Nama Lengkap</span>
                                            <span className="font-semibold text-slate-900 capitalize">{userToReview.name}</span>
                                        </div>
                                        <div className="grid grid-cols-[120px_1fr] gap-2 text-sm border-b border-dashed border-slate-200 pb-2">
                                            <span className="font-bold text-slate-500">NRP / NIP</span>
                                            <span className="font-semibold text-slate-900">{userToReview.nrp || '-'}</span>
                                        </div>
                                        <div className="grid grid-cols-[120px_1fr] gap-2 text-sm border-b border-dashed border-slate-200 pb-2">
                                            <span className="font-bold text-slate-500">Role Sistem</span>
                                            <span className="font-bold uppercase text-primary">{userToReview.role}</span>
                                        </div>
                                        <div className="grid grid-cols-[120px_1fr] gap-2 text-sm border-b border-dashed border-slate-200 pb-2">
                                            <span className="font-bold text-slate-500">Email Login</span>
                                            <span className="font-semibold text-slate-900">{userToReview.email}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-[100px_1fr] gap-2 text-sm border-b border-dashed border-slate-200 pb-2">
                                            <span className="font-bold text-slate-500">Pangkat</span>
                                            <span className="font-semibold text-slate-900 uppercase">{userToReview.profilPrajurit?.pangkat?.nama || "-"} {userToReview.profilPrajurit?.pangkat?.korps ? `(${userToReview.profilPrajurit?.pangkat?.korps})` : ''}</span>
                                        </div>
                                        <div className="grid grid-cols-[100px_1fr] gap-2 text-sm border-b border-dashed border-slate-200 pb-2">
                                            <span className="font-bold text-slate-500">Jabatan</span>
                                            <span className="font-semibold text-slate-900 uppercase">{userToReview.profilPrajurit?.jabatan?.nama || "-"}</span>
                                        </div>
                                        <div className="grid grid-cols-[100px_1fr] gap-2 text-sm border-b border-dashed border-slate-200 pb-2">
                                            <span className="font-bold text-slate-500">Satuan</span>
                                            <span className="font-semibold text-slate-900 uppercase">{userToReview.profilPrajurit?.satuan?.nama || "-"}</span>
                                        </div>
                                        <div className="grid grid-cols-[100px_1fr] gap-2 text-sm border-b border-dashed border-slate-200 pb-2">
                                            <span className="font-bold text-slate-500">Agama</span>
                                            <span className="font-semibold text-slate-900 uppercase">{userToReview.agamaId || "-"}</span>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 grid grid-cols-[120px_1fr] md:grid-cols-[120px_1fr_100px_1fr] gap-2 text-sm bg-slate-100 p-3 rounded mt-2">
                                        <span className="font-bold text-slate-500">No. HP</span>
                                        <span className="font-semibold text-slate-900">{userToReview.profilPrajurit?.hp || "-"}</span>
                                        <span className="font-bold text-slate-500">Alamat</span>
                                        <span className="font-semibold text-slate-900">{userToReview.profilPrajurit?.alamat || "-"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-8 pt-4 border-t gap-3 sm:justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setIsReviewDialogOpen(false)}
                            className="font-bold"
                        >
                            Tutup
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleApproval(userToReview?.id, "rejected")}
                            className="border-red-200 text-red-600 hover:bg-red-50 font-bold px-8 shadow-sm"
                        >
                            <X className="w-4 h-4 mr-2" />
                            TOLAK AKUN
                        </Button>
                        <Button
                            onClick={() => handleApproval(userToReview?.id, "approved")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-md"
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            SETUJUI AKUN
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
