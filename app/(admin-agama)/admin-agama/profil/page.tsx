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
    Globe,
    CheckCircle
} from "lucide-react";
import { toast } from "sonner";

export default function AdminAgamaProfilPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    // Master Data
    const [masterPangkat, setMasterPangkat] = useState<any[]>([]);
    const [masterJabatan, setMasterJabatan] = useState<any[]>([]);
    const [masterSatuan, setMasterSatuan] = useState<any[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        nrp: "",
        hp: "",
        alamat: "",
        pangkatId: "",
        jabatanId: "",
        satuanId: "",
    });
    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        fetchUserData();
        fetchMasterData();
    }, []);

    const fetchMasterData = async () => {
        try {
            const [p, j, s] = await Promise.all([
                fetch("/api/master/pangkat").then(r => r.json()),
                fetch("/api/master/jabatan").then(r => r.json()),
                fetch("/api/master/satuan").then(r => r.json()),
            ]);
            setMasterPangkat(p);
            setMasterJabatan(j);
            setMasterSatuan(s);
        } catch (error) {
            console.error("Failed to fetch master data:", error);
        }
    };

    const fetchUserData = async () => {
        setLoading(true);
        const roleKey = "user_admin_agama";
        const storedUser = localStorage.getItem(roleKey);
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                const res = await fetch(`/api/profil/me?userId=${parsedUser.id}`);
                const data = await res.json();
                if (res.ok) {
                    setUser(data);
                    const prof = data.profilPrajurit || {};
                    setFormData({
                        name: data.name || "",
                        email: data.email || "",
                        nrp: data.nrp || "",
                        hp: prof.hp || "",
                        alamat: prof.alamat || "",
                        pangkatId: prof.pangkatId || "",
                        jabatanId: prof.jabatanId || "",
                        satuanId: prof.satuanId || "",
                    });
                    setPreviewImage(prof.fotoUrl || data.fotoUrl || null);
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
            data.append("nrp", formData.nrp);
            data.append("hp", formData.hp);
            data.append("alamat", formData.alamat);
            data.append("pangkatId", formData.pangkatId);
            data.append("jabatanId", formData.jabatanId);
            data.append("satuanId", formData.satuanId);

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
                // Sync topbar
                const roleKey = "user_admin_agama";
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
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 px-4 md:px-0">
            {/* Premium Header Wrapper */}
            <div className="relative">
                <div className="relative h-48 bg-primary rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-slate-900 opacity-90 transition-all"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

                    <div className="absolute bottom-6 right-6 md:right-10">
                        {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)} className="bg-white hover:bg-slate-100 text-slate-900 font-black gap-2 rounded-2xl h-12 px-8 shadow-xl">
                                <Edit3 className="w-4 h-4" /> EDIT DATA
                            </Button>
                        ) : (
                            <div className="flex gap-3">
                                <Button variant="ghost" onClick={() => { setIsEditing(false); setPreviewImage(user.profilPrajurit?.fotoUrl || user.fotoUrl || null); }} className="text-white hover:bg-white/10 font-bold h-12 px-6">
                                    BATAL
                                </Button>
                                <Button onClick={handleSave} disabled={saveLoading} className="bg-secondary text-primary hover:bg-secondary/90 font-black gap-2 rounded-2xl h-12 px-8 shadow-xl">
                                    {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} SIMPAN
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Photo Container Moved Outside overflow-hidden */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 z-20">
                    <div className="relative group">
                        <div className="w-36 h-48 md:w-44 md:h-56 bg-white rounded-3xl p-1.5 shadow-2xl ring-4 ring-white/20 flex items-center justify-center border border-slate-100/50 backdrop-blur-sm overflow-hidden">
                            <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-100 relative shadow-inner">
                                {previewImage ? (
                                    <img
                                        src={previewImage}
                                        alt={user.name}
                                        className="w-full h-full object-cover object-top"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary font-black text-5xl">
                                        {user.name?.charAt(0) || 'A'}
                                    </div>
                                )}
                                {isEditing && (
                                    <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px] z-10 border-2 border-dashed border-white/40">
                                        <Camera className="w-8 h-8 text-white mb-1" />
                                        <span className="text-[10px] text-white font-black uppercase tracking-widest">Ganti Foto</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-12 grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-8 space-y-6">
                    <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white/70 backdrop-blur-md">
                        <div className="bg-slate-50 border-b border-slate-100 px-10 py-6 flex justify-between items-center">
                            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] flex items-center gap-3">
                                <span className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                    <Shield className="w-4 h-4" />
                                </span>
                                IDENTITAS VERIFIKATOR
                            </h3>
                            <Badge className="bg-primary hover:bg-primary text-white font-black px-4 py-1.5 rounded-lg border-0 tracking-widest uppercase">
                                {user.agama?.nama || 'UMUM'}
                            </Badge>
                        </div>
                        <CardContent className="p-10 space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Lengkap</Label>
                                    {isEditing ? (
                                        <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold uppercase" />
                                    ) : (
                                        <p className="font-bold text-slate-900 text-lg uppercase">{user.name}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">NRP / NIP</Label>
                                    {isEditing ? (
                                        <Input value={formData.nrp} onChange={e => setFormData({ ...formData, nrp: e.target.value })} className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold uppercase" />
                                    ) : (
                                        <p className="font-bold text-slate-900 text-lg uppercase">{user.nrp || '-'}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Pangkat / Korps</Label>
                                    {isEditing ? (
                                        <select
                                            value={formData.pangkatId}
                                            onChange={e => setFormData({ ...formData, pangkatId: e.target.value })}
                                            className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl font-bold px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="">Pilih Pangkat</option>
                                            {masterPangkat.map(p => (
                                                <option key={p.id} value={p.id}>{p.nama} {p.korps ? `(${p.korps})` : ''}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="font-bold text-slate-900 text-lg uppercase">{user.profilPrajurit?.pangkat?.nama || '-'} {user.profilPrajurit?.pangkat?.korps ? `(${user.profilPrajurit?.pangkat.korps})` : ''}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Jabatan Sekarang</Label>
                                    {isEditing ? (
                                        <select
                                            value={formData.jabatanId}
                                            onChange={e => setFormData({ ...formData, jabatanId: e.target.value })}
                                            className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl font-bold px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="">Pilih Jabatan</option>
                                            {masterJabatan.map(j => (
                                                <option key={j.id} value={j.id}>{j.nama}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="font-bold text-slate-900 text-lg uppercase">{user.profilPrajurit?.jabatan?.nama || '-'}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Satuan Kerja</Label>
                                    {isEditing ? (
                                        <select
                                            value={formData.satuanId}
                                            onChange={e => setFormData({ ...formData, satuanId: e.target.value })}
                                            className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl font-bold px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="">Pilih Satuan</option>
                                            {masterSatuan.map(s => (
                                                <option key={s.id} value={s.id}>{s.nama}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="font-bold text-slate-900 text-lg uppercase">{user.profilPrajurit?.satuan?.nama || '-'}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nomor HP</Label>
                                    {isEditing ? (
                                        <Input value={formData.hp} onChange={e => setFormData({ ...formData, hp: e.target.value })} className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold" />
                                    ) : (
                                        <p className="font-bold text-slate-900 text-lg uppercase">{user.profilPrajurit?.hp || '-'}</p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Alamat Domisili</Label>
                                {isEditing ? (
                                    <Input value={formData.alamat} onChange={e => setFormData({ ...formData, alamat: e.target.value })} className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold" />
                                ) : (
                                    <p className="font-bold text-slate-900 text-lg uppercase">{user.profilPrajurit?.alamat || '-'}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-4 space-y-6">
                    <Card className="border-none shadow-2xl shadow-slate-200/50 bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                        <Globe className="absolute -right-8 -bottom-8 w-32 h-32 text-white/5" />
                        <h4 className="font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-3 text-secondary">
                            <CheckCircle className="w-4 h-4" />
                            Status Otoritas
                        </h4>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-[10px] font-black text-white/30 uppercase mb-1">Status Akun</p>
                                <p className="text-xs font-bold text-success uppercase italic">Aktif & Terverifikasi</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-[10px] font-black text-white/30 uppercase mb-1">Daftar Sebagai</p>
                                <p className="text-xs font-bold text-white/80 uppercase">{user.role?.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-2 border-primary/10 bg-primary/5 rounded-[2rem] p-8">
                        <div className="flex items-center gap-4 mb-4 font-black">
                            <Mail className="w-5 h-5 text-primary" />
                            <div className="space-y-1">
                                <p className="text-[10px] text-slate-400 uppercase">Kontak Akun</p>
                                <p className="text-xs text-primary">{user.email}</p>
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic">
                            Email akun digunakan untuk otentikasi sistem dan korespondensi resmi kedinasan.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
