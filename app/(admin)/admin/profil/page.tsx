// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    User,
    Mail,
    Shield,
    Loader2,
    Save,
    X,
    Edit3,
    Camera,
    Lock
} from "lucide-react";
import { toast } from "sonner";

export default function AdminProfilPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
    });
    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        setLoading(true);
        const roleKey = "user_admin_pusat"; // Hardcoded for this admin-specific page
        const storedUser = localStorage.getItem(roleKey);
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                const res = await fetch(`/api/profil/me?userId=${parsedUser.id}`);
                const data = await res.json();
                if (res.ok) {
                    setUser(data);
                    setFormData({
                        name: data.name || "",
                        email: data.email || "",
                    });
                    setPreviewImage(data.profilPrajurit?.fotoUrl || data.fotoUrl || null);
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        }
        setLoading(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFotoFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setSaveLoading(true);
        try {
            const data = new FormData();
            data.append("userId", user.id);
            data.append("name", formData.name);
            // Admin update doesn't need military fields
            if (fotoFile) {
                data.append("foto", fotoFile);
            }

            const res = await fetch("/api/profil/update", {
                method: "POST",
                body: data,
            });

            if (res.ok) {
                toast.success("Profil berhasil diperbarui!");
                setIsEditing(false);
                setFotoFile(null);
                fetchUserData();
                // Trigger topbar refresh by updating localstorage minimal info if needed
                const roleKey = "user_admin_pusat";
                const stored = JSON.parse(localStorage.getItem(roleKey) || "{}");
                localStorage.setItem(roleKey, JSON.stringify({ ...stored, name: formData.name }));
            } else {
                const err = await res.json();
                toast.error(err.error || "Gagal memperbarui profil.");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan.");
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) {
        return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary/40" /></div>;
    }

    if (!user) {
        return <div className="p-12 text-center text-slate-500">Gagal memuat profil.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">Profil Administrator</h2>
                    <p className="text-sm text-slate-500 font-medium italic">Kelola informasi akun dan pengaturan profil Anda</p>
                </div>
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="bg-primary hover:bg-primary/90 text-white font-bold gap-2 rounded-xl h-11 px-6 shadow-lg shadow-primary/20">
                        <Edit3 className="w-4 h-4" /> EDIT PROFIL
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => { setIsEditing(false); setPreviewImage(user.profilPrajurit?.fotoUrl || user.fotoUrl || null); }} className="font-bold rounded-xl h-11 px-6">
                            BATAL
                        </Button>
                        <Button onClick={handleSave} disabled={saveLoading} className="bg-secondary text-primary hover:bg-secondary/90 font-bold gap-2 rounded-xl h-11 px-6 shadow-lg shadow-secondary/20">
                            {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} SIMPAN
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="border-slate-200/60 shadow-sm overflow-hidden rounded-3xl">
                    <CardContent className="p-8 flex flex-col items-center text-center">
                        <div className="relative group mb-6">
                            <div className="w-32 h-32 rounded-3xl p-1 bg-white shadow-xl ring-1 ring-slate-100 overflow-hidden">
                                <Avatar className="w-full h-full rounded-2xl bg-slate-50">
                                    {previewImage && <AvatarImage src={previewImage} alt={user.name} className="object-cover" />}
                                    <AvatarFallback className="bg-primary text-secondary font-bold text-3xl">AD</AvatarFallback>
                                </Avatar>
                            </div>
                            {isEditing && (
                                <label className="absolute inset-0 rounded-3xl bg-black/40 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm z-10 border-2 border-dashed border-white/50 m-1">
                                    <Camera className="w-6 h-6 text-white mb-1" />
                                    <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Ganti</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            )}
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{user.name}</h3>
                        <Badge className="mt-2 bg-primary/10 text-primary border-primary/20 font-bold px-3 py-1 uppercase text-[10px]">
                            {user.role === 'admin_pusat' ? 'Admin Pusat' : 'Admin Agama'}
                        </Badge>
                        <div className="mt-8 w-full space-y-3">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                <Shield className="w-5 h-5 text-primary opacity-40" />
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Hak Akses</p>
                                    <p className="text-xs font-bold text-slate-700 mt-1 uppercase">SUPER_ADMIN</p>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                <Lock className="w-5 h-5 text-primary opacity-40" />
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Keamanan</p>
                                    <p className="text-xs font-bold text-success mt-1 uppercase italic">Terverifikasi</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-2 space-y-6">
                    <Card className="border-slate-200/60 shadow-sm rounded-3xl overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-100 px-8 py-4">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">
                                <User className="w-4 h-4 text-primary" />
                                Informasi Akun
                            </h3>
                        </div>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Lengkap</Label>
                                    {isEditing ? (
                                        <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold" />
                                    ) : (
                                        <p className="font-bold text-slate-800 h-12 flex items-center px-1 uppercase">{user.name}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ID Pengguna (Username)</Label>
                                    <p className="font-bold text-slate-400 h-12 flex items-center px-1 font-mono text-sm italic">{user.nrp || user.username || user.id}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Dinas</Label>
                                    <div className="flex items-center gap-3 h-12 px-1">
                                        <Mail className="w-4 h-4 text-primary opacity-40" />
                                        <p className="font-bold text-slate-600">{user.email || 'admin@tniad.mil.id'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-secondary/5 bg-secondary/10 rounded-[2rem] p-8 group transition-all">
                        <h4 className="font-black text-primary text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                            <div className="w-2 h-6 bg-primary rounded-full"></div>
                            Log Aktivitas Terakhir
                        </h4>
                        <p className="text-[11px] text-primary/70 leading-relaxed font-bold italic">
                            Login terakhir terdeteksi pada {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} pukul {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB dari Alamat IP Anda saat ini.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
