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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    User,
    Award,
    Home,
    Calendar,
    Loader2,
    Save,
    X,
    Edit3,
    Heart,
    Fingerprint,
    Camera,
    MapPin,
    Phone,
    Briefcase
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function ProfilPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    // Master Data
    const [masterPangkat, setMasterPangkat] = useState<any[]>([]);
    const [masterSatuan, setMasterSatuan] = useState<any[]>([]);
    const [masterJabatan, setMasterJabatan] = useState<any[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        nrp: "",
        hp: "",
        alamat: "",
        tempatLahir: "",
        tglLahir: "",
        agama: "",
        suku: "",
        pangkatId: "",
        satuanId: "",
        jabatanId: "",
    });
    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        fetchUserData();
        fetchMasterData();
    }, []);

    const fetchMasterData = async () => {
        try {
            const [resP, resS, resJ] = await Promise.all([
                fetch("/api/master/pangkat"),
                fetch("/api/master/satuan"),
                fetch("/api/master/jabatan"),
            ]);
            if (resP.ok) setMasterPangkat(await resP.json());
            if (resS.ok) setMasterSatuan(await resS.json());
            if (resJ.ok) setMasterJabatan(await resJ.json());
        } catch (e) {
            console.error(e);
        }
    };

    const fetchUserData = async () => {
        setLoading(true);
        const roleKey = "user_prajurit";
        const storedUser = localStorage.getItem(roleKey);
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                const res = await fetch(`/api/profil/me?userId=${parsedUser.id}`);
                const data = await res.json();
                if (res.ok) {
                    setUser(data);
                    const p = data.profilPrajurit || {};
                    setFormData({
                        name: data.name || "",
                        nrp: data.nrp || "",
                        hp: p.hp || "",
                        alamat: p.alamat || "",
                        tempatLahir: p.tempatLahir || "",
                        tglLahir: p.tglLahir ? format(new Date(p.tglLahir), "yyyy-MM-dd") : "",
                        agama: p.agama || "",
                        suku: p.suku || "",
                        pangkatId: p.pangkatId || "",
                        satuanId: p.satuanId || "",
                        jabatanId: p.jabatanId || "",
                    });
                    setPreviewImage(p.fotoUrl || null);
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
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });
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
                const roleKey = "user_prajurit";
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
        return <div className="p-12 text-center text-slate-500">Gagal memuat profil. Silakan login kembali.</div>;
    }

    const profil = user.profilPrajurit || {};
    const nama = user.name;
    const nrp = user.nrp;
    const pangkat = profil.pangkat?.nama || "-";
    const satuan = profil.satuan?.nama || "-";
    const jabatan = profil.jabatan?.nama || "-";
    const agama = profil.agama || "-";
    const suku = profil.suku || "-";
    const tempatLahir = profil.tempatLahir || "-";
    const tglLahir = profil.tglLahir ? format(new Date(profil.tglLahir), "dd MMMM yyyy", { locale: id }) : "-";
    const status = user.status; // pending, approved, rejected
    const tmtDate = user.createdAt ? format(new Date(user.createdAt), "dd MMMM yyyy", { locale: id }) : "-";

    // Avatar initials
    const initials = nama.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header / Banner Premium */}
            <div className="relative group">
                <div className="h-48 md:h-64 bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-slate-900 opacity-90 animate-pulse transition-all duration-[5000ms]"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

                    {/* Decorative Elements */}
                    <div className="absolute top-10 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl animate-bounce duration-[10000ms]"></div>
                    <div className="absolute bottom-10 left-1/4 w-48 h-48 bg-primary-light/5 rounded-full blur-3xl animate-pulse"></div>
                </div>

                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0 flex flex-col md:flex-row items-center md:items-end gap-6 px-4 w-full md:w-auto">
                    <div className="relative">
                        <div className="w-36 h-36 md:w-44 md:h-44 rounded-3xl p-1.5 bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden group/avatar">
                            <Avatar className="w-full h-full rounded-2xl bg-slate-50">
                                {previewImage && <AvatarImage src={previewImage} alt={nama} className="object-cover" />}
                                <AvatarFallback className="bg-secondary/20 text-primary font-heading text-4xl font-bold">{initials}</AvatarFallback>
                            </Avatar>

                            {isEditing && (
                                <label className="absolute inset-1.5 rounded-2xl bg-black/40 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-all backdrop-blur-sm z-10 border-2 border-dashed border-white/50">
                                    <Camera className="w-8 h-8 text-white mb-2" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Ganti Foto</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            )}
                        </div>
                        <div className="absolute -top-3 -right-3 w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shadow-lg border-2 border-white animate-in zoom-in duration-500">
                            <Award className="w-5 h-5 text-primary" />
                        </div>
                    </div>

                    <div className="text-center md:text-left pb-4 space-y-1">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-1">
                            <h1 className="text-2xl md:text-3xl font-heading font-black text-slate-800 tracking-tight uppercase shadow-white drop-shadow-sm">{nama}</h1>
                            {status === "approved" ? (
                                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20 font-black px-3 py-1 rounded-lg text-[10px] tracking-widest motion-safe:animate-pulse">ACTIVE</Badge>
                            ) : (
                                <Badge variant="outline" className="font-black border-2 px-3 py-1 rounded-lg text-[10px] tracking-widest uppercase">{status}</Badge>
                            )}
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-4 text-slate-600 font-bold uppercase tracking-widest text-[11px]">
                            <span className="flex items-center gap-1.5 opacity-70"><Fingerprint className="w-3.5 h-3.5" /> NRP: {nrp}</span>
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                            <span className="flex items-center gap-1.5 opacity-70"><Briefcase className="w-3.5 h-3.5" /> {jabatan}</span>
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex absolute -bottom-8 right-12 gap-3 z-50">
                    {!isEditing ? (
                        <Button id="edit-profile-btn" onClick={() => setIsEditing(true)} className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-xl shadow-slate-200/50 h-12 px-6 rounded-2xl font-bold gap-3 group/btn">
                            <Edit3 className="w-5 h-5 text-primary group-hover/btn:scale-110 transition-transform" />
                            EDIT PROFIL PERSONEL
                        </Button>
                    ) : (
                        <div className="flex gap-3 animate-in fade-in slide-in-from-right-4">
                            <Button id="cancel-edit-btn" variant="ghost" onClick={() => { setIsEditing(false); setPreviewImage(profil.fotoUrl || null); setFotoFile(null); }} className="bg-white/50 hover:bg-white text-slate-500 border border-slate-100 h-12 px-6 rounded-2xl font-bold backdrop-blur-sm">
                                <X className="w-5 h-5 mr-2" /> BATAL
                            </Button>
                            <Button id="save-profile-btn" onClick={handleSave} disabled={saveLoading} className="bg-primary hover:bg-primary-dark text-white shadow-xl shadow-primary/30 h-12 px-8 rounded-2xl font-bold gap-3 group/save">
                                {saveLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover/save:rotate-12 transition-transform" />}
                                SIMPAN PERUBAHAN
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-20 grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Column: Data Utama */}
                <div className="md:col-span-8 space-y-8">
                    <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white/70 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-100 px-10 py-6 flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">
                                <span className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                    <User className="w-4 h-4" />
                                </span>
                                Bio-data Personel
                            </h3>
                            {isEditing && <span className="text-[10px] font-bold text-primary animate-pulse">MODE EDIT AKTIF</span>}
                        </div>

                        <CardContent className="p-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
                                {/* BARIS 1 */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Lengkap</Label>
                                    {isEditing ? (
                                        <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold" />
                                    ) : (
                                        <div className="flex items-center gap-3 p-1 rounded-xl group transition-all">
                                            <p className="font-bold text-slate-800 group-hover:text-primary transition-colors uppercase">{nama}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">NRP</Label>
                                    {isEditing ? (
                                        <Input value={formData.nrp} onChange={e => setFormData({ ...formData, nrp: e.target.value })} className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold" />
                                    ) : (
                                        <div className="flex items-center gap-3 p-1">
                                            <p className="font-bold text-slate-800">{nrp}</p>
                                        </div>
                                    )}
                                </div>

                                {/* BARIS 2 */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Pangkat / Korps</Label>
                                    {isEditing ? (
                                        <Select value={formData.pangkatId} onValueChange={v => setFormData({ ...formData, pangkatId: v })}>
                                            <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold">
                                                <SelectValue placeholder="Pilih Pangkat" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl overflow-hidden border-slate-200 shadow-2xl">
                                                {masterPangkat.map(p => (
                                                    <SelectItem key={p.id} value={p.id} className="font-bold text-slate-700 py-3">{p.nama} {p.korps && `(${p.korps})`}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="flex items-center gap-3 p-1">
                                            <Badge className="bg-primary/5 text-primary border-primary/10 font-bold px-3 py-1 rounded-lg shadow-none uppercase">{pangkat} {profil.pangkat?.korps ? `(${profil.pangkat.korps})` : ''}</Badge>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Satuan Induk</Label>
                                    {isEditing ? (
                                        <Select value={formData.satuanId} onValueChange={v => setFormData({ ...formData, satuanId: v })}>
                                            <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold">
                                                <SelectValue placeholder="Pilih Satuan" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl overflow-hidden border-slate-200 shadow-2xl">
                                                {masterSatuan.map(s => (
                                                    <SelectItem key={s.id} value={s.id} className="font-bold text-slate-700 py-3">{s.nama}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="flex items-center gap-3 p-1">
                                            <p className="font-bold text-slate-800">{satuan}</p>
                                        </div>
                                    )}
                                </div>

                                {/* BARIS 3 */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Jabatan Sekarang</Label>
                                    {isEditing ? (
                                        <Select value={formData.jabatanId} onValueChange={v => setFormData({ ...formData, jabatanId: v })}>
                                            <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold">
                                                <SelectValue placeholder="Pilih Jabatan" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl overflow-hidden border-slate-200 shadow-2xl">
                                                {masterJabatan.map(j => (
                                                    <SelectItem key={j.id} value={j.id} className="font-bold text-slate-700 py-3">{j.nama}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="flex items-center gap-3 p-1">
                                            <p className="font-bold text-slate-800 italic underline decoration-secondary decoration-4 underline-offset-4">{jabatan}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Agama</Label>
                                    {isEditing ? (
                                        <Select value={formData.agama} onValueChange={v => setFormData({ ...formData, agama: v })}>
                                            <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold">
                                                <SelectValue placeholder="Pilih Agama" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl overflow-hidden border-slate-200 shadow-2xl">
                                                {["ISLAM", "KRISTEN", "KATOLIK", "HINDU", "BUDHA", "KONGHUCU"].map(a => (
                                                    <SelectItem key={a} value={a} className="font-bold text-slate-700 py-3">{a}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <p className="font-bold text-slate-800">{agama}</p>
                                    )}
                                </div>

                                {/* BARIS 4 */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Suku Bangsa</Label>
                                    {isEditing ? (
                                        <Input value={formData.suku} onChange={e => setFormData({ ...formData, suku: e.target.value })} className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold" />
                                    ) : (
                                        <p className="font-bold text-slate-800">{suku}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tempat Lahir</Label>
                                    {isEditing ? (
                                        <Input value={formData.tempatLahir} onChange={e => setFormData({ ...formData, tempatLahir: e.target.value })} className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold" />
                                    ) : (
                                        <p className="font-bold text-slate-800">{tempatLahir}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tanggal Lahir</Label>
                                    {isEditing ? (
                                        <Input type="date" value={formData.tglLahir} onChange={e => setFormData({ ...formData, tglLahir: e.target.value })} className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold" />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-primary shrink-0" />
                                            <p className="font-bold text-slate-800">{tglLahir}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Terdaftar Di Sistem</Label>
                                    <div className="flex items-center gap-2 p-1">
                                        <p className="font-bold text-slate-400">{tmtDate}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 pt-10 border-t-2 border-dashed border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-primary" /> Nomor HP Aktif</Label>
                                    {isEditing ? (
                                        <Input value={formData.hp} onChange={e => setFormData({ ...formData, hp: e.target.value })} className="h-12 bg-primary/5 border-primary/10 rounded-xl font-bold text-primary" placeholder="08XXXXXXXXXX" />
                                    ) : (
                                        <p className="text-lg font-black text-primary tracking-tighter">{profil.hp || "-"}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-primary" /> Alamat Domisili</Label>
                                    {isEditing ? (
                                        <Input value={formData.alamat} onChange={e => setFormData({ ...formData, alamat: e.target.value })} className="h-12 bg-primary/5 border-primary/10 rounded-xl font-bold text-primary" placeholder="Masukkan alamat lengkap..." />
                                    ) : (
                                        <p className="text-sm font-bold text-slate-700 leading-relaxed">{profil.alamat || "-"}</p>
                                    )}
                                </div>
                            </div>

                            {/* Mobile Save Button */}
                            <div className="md:hidden mt-8 space-y-3">
                                {isEditing ? (
                                    <>
                                        <Button onClick={handleSave} disabled={saveLoading} className="w-full bg-primary h-14 rounded-2xl font-bold shadow-xl">
                                            {saveLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "SIMPAN PERUBAHAN"}
                                        </Button>
                                        <Button variant="ghost" onClick={() => setIsEditing(false)} className="w-full h-12 text-slate-400">BATAL</Button>
                                    </>
                                ) : (
                                    <Button onClick={() => setIsEditing(true)} className="w-full bg-slate-900 h-14 rounded-2xl font-bold shadow-xl">EDIT PROFIL</Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Cards */}
                <div className="md:col-span-4 space-y-6">
                    <Card className="border-none shadow-2xl shadow-slate-200/50 bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[80px] opacity-20 -mr-16 -mt-16 group-hover:opacity-40 transition-opacity"></div>
                        <h4 className="font-heading font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-3">
                            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                            Catatan Sistem
                        </h4>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-white/30 uppercase">Sinkronisasi</p>
                                <p className="text-[11px] leading-relaxed text-white/70 italic">
                                    "Data pangkat, jabatan, dan satuan terintegrasi."
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-white/30 uppercase">Integritas Data</p>
                                <p className="text-[11px] leading-relaxed text-white/70">
                                    Setiap perubahan data personel akan dicatat dalam database induk untuk keperluan validasi pengajuan nikah.
                                </p>
                            </div>
                            <div className="pt-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary font-black shadow-lg">V</div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-white">Verified</p>
                                            <p className="text-[8px] text-white/40">Sisfopers Integrated</p>
                                        </div>
                                    </div>
                                    <CheckCircle className="w-5 h-5 text-secondary" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-2 border-secondary/20 bg-secondary/5 rounded-[2rem] p-8 group hover:bg-secondary/10 transition-colors cursor-help">
                        <h3 className="font-black text-primary text-sm uppercase tracking-[0.2em] mb-3">Keamanan Dasar</h3>
                        <p className="text-[11px] text-primary/80 leading-relaxed font-bold">
                            Harap jaga kerahasiaan data pribadi dan segera perbarui Password Anda secara berkala di menu Pengaturan Keamanan.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Support Icon
function CheckCircle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    )
}
