// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldAlert, Lock, User, ArrowRight, Briefcase, Award, Building } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        nrp: "",
        email: "",
        password: "",
        pangkatId: "",
        jabatanId: "",
        satuanId: ""
    });
    const [masterData, setMasterData] = useState({
        pangkat: [],
        jabatan: [],
        satuan: []
    });
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState(false);

    useState(() => {
        const fetchMaster = async () => {
            try {
                const [pRes, jRes, sRes] = await Promise.all([
                    fetch("/api/master/pangkat"),
                    fetch("/api/master/jabatan"),
                    fetch("/api/master/satuan")
                ]);
                const [pData, jData, sData] = await Promise.all([
                    pRes.json(),
                    jRes.json(),
                    sRes.json()
                ]);
                setMasterData({
                    pangkat: Array.isArray(pData) ? pData : [],
                    jabatan: Array.isArray(jData) ? jData : [],
                    satuan: Array.isArray(sData) ? sData : []
                });
            } catch (err) {
                console.error("Failed to fetch master data", err);
            }
        };
        fetchMaster();
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFormError("");
        setFormSuccess(false);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (!res.ok) {
                setFormError(data.error || "Gagal mendaftar");
            } else {
                setFormSuccess(true);
                // Clear form
                setFormData({ name: "", nrp: "", email: "", password: "", pangkatId: "", jabatanId: "", satuanId: "" });
                // Optional: redirect to login view after short delay
                setTimeout(() => setIsRegistering(false), 3000);
            }
        } catch (error) {
            setFormError("Terjadi kesalahan jaringan");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrajuritLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFormError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email, password: formData.password, role: "prajurit" })
            });
            const data = await res.json();

            if (!res.ok) {
                setFormError(data.error || "Gagal login");
            } else {
                localStorage.setItem("user_" + data.user.role, JSON.stringify(data.user));
                localStorage.removeItem("user"); // Bersihkan key lama jika ada
                if (data.requireProfile) {
                    router.push("/lengkapi-profil");
                } else {
                    router.push("/beranda");
                }
            }
        } catch (error) {
            setFormError("Terjadi kesalahan jaringan");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFormError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    role: "admin"
                })
            });
            const data = await res.json();

            if (!res.ok) {
                setFormError(data.error || "Gagal login admin");
            } else {
                localStorage.setItem("user_" + data.user.role, JSON.stringify(data.user));
                localStorage.removeItem("user"); // Bersihkan key lama jika ada
                if (data.user.role === "admin_pusat") {
                    router.push("/admin/beranda");
                } else if (data.user.role === "admin_agama") {
                    router.push("/admin-agama/beranda");
                } else {
                    router.push("/admin/beranda");
                }
            }
        } catch (error) {
            setFormError("Terjadi kesalahan jaringan");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoAdmin = (role: string) => {
        const mockUser = role === 'admin_pusat'
            ? { id: 'admin-pusat-id', name: 'ADMIN PUSAT DEMO', role: 'admin_pusat', email: 'admin@tniad.mil.id' }
            : { id: 'admin-agama-id', name: 'ADMIN AGAMA DEMO', role: 'admin_agama', agamaId: 'ISLAM', email: 'islam@gmail.com' };

        localStorage.setItem("user_" + mockUser.role, JSON.stringify(mockUser));
        localStorage.removeItem("user");
        router.push(role === 'admin_pusat' ? "/admin/beranda" : "/admin-agama/beranda");
    };

    return (
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-white/50 to-secondary"></div>

            <CardHeader className="text-center pb-2">
                <CardTitle className="text-white font-heading text-xl font-bold">Autentikasi Sistem</CardTitle>
                <CardDescription className="text-white/60 text-xs">
                    Pilih portal masuk sesuai dengan peran Anda
                </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 pb-8">
                <Tabs defaultValue="prajurit" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-black/20 border border-white/10 rounded-lg p-1">
                        <TabsTrigger
                            value="prajurit"
                            className="text-xs font-bold uppercase data-[state=active]:bg-secondary data-[state=active]:text-primary data-[state=active]:shadow-xl transition-all"
                        >
                            Prajurit
                        </TabsTrigger>
                        <TabsTrigger
                            value="admin"
                            className="text-xs font-bold uppercase data-[state=active]:bg-secondary data-[state=active]:text-primary data-[state=active]:shadow-xl transition-all"
                        >
                            Admin
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="prajurit" className="space-y-4 mt-0">
                        {isRegistering ? (
                            <form onSubmit={handleRegister} className="space-y-3 animate-in fade-in duration-300">
                                {formError && <div className="p-2 mb-2 text-[10px] text-red-100 bg-red-500/80 rounded-md font-bold text-center">{formError}</div>}
                                {formSuccess && <div className="p-2 mb-2 text-[10px] text-emerald-100 bg-emerald-500/80 rounded-md font-bold text-center">Registrasi berhasil! Menunggu persetujuan Admin.</div>}

                                <div className="space-y-1">
                                    <Label htmlFor="reg-name" className="text-white/70 text-[10px] font-bold uppercase tracking-tighter">Nama Lengkap</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                                        <Input id="reg-name" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-white/5 border-white/10 text-white h-9 pl-9 focus:ring-secondary/50" placeholder="Nama Lengkap" required />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="reg-nrp" className="text-white/70 text-[10px] font-bold uppercase tracking-tighter">NRP</Label>
                                    <div className="relative">
                                        <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                                        <Input id="reg-nrp" type="text" value={formData.nrp} onChange={(e) => setFormData({ ...formData, nrp: e.target.value })} className="bg-white/5 border-white/10 text-white h-9 pl-9 focus:ring-secondary/50" placeholder="Nomor Registrasi Pokok" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-white/70 text-[10px] font-bold uppercase tracking-tighter">Pangkat</Label>
                                        <Select value={formData.pangkatId} onValueChange={(val) => setFormData({ ...formData, pangkatId: val })}>
                                            <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 text-xs">
                                                <SelectValue placeholder="Pilih Pangkat" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1B4332] border-white/10 text-white">
                                                {masterData.pangkat.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-white/70 text-[10px] font-bold uppercase tracking-tighter">Jabatan</Label>
                                        <Select value={formData.jabatanId} onValueChange={(val) => setFormData({ ...formData, jabatanId: val })}>
                                            <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 text-xs">
                                                <SelectValue placeholder="Pilih Jabatan" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1B4332] border-white/10 text-white">
                                                {masterData.jabatan.map((j) => (
                                                    <SelectItem key={j.id} value={j.id}>{j.nama}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-white/70 text-[10px] font-bold uppercase tracking-tighter">Satuan</Label>
                                    <Select value={formData.satuanId} onValueChange={(val) => setFormData({ ...formData, satuanId: val })}>
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 text-xs">
                                            <SelectValue placeholder="Pilih Satuan" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1B4332] border-white/10 text-white">
                                            {masterData.satuan.map((s) => (
                                                <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="reg-email" className="text-white/70 text-[10px] font-bold uppercase tracking-tighter">Email</Label>
                                    <Input id="reg-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-white/5 border-white/10 text-white h-9 focus:ring-secondary/50" placeholder="email@tniad.mil.id" required />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="reg-pass" className="text-white/70 text-[10px] font-bold uppercase tracking-tighter">Password</Label>
                                    <Input id="reg-pass" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="bg-white/5 border-white/10 text-white h-9 focus:ring-secondary/50" placeholder="••••••••" required />
                                </div>

                                <Button type="submit" disabled={isLoading} className="w-full bg-secondary text-primary hover:bg-secondary/80 h-10 font-bold mt-2">
                                    {isLoading ? "MEMPROSES..." : "DAFTAR SEKARANG"}
                                </Button>
                                <div className="text-center mt-3">
                                    <button type="button" onClick={() => { setIsRegistering(false); setFormError(""); setFormSuccess(false); }} className="text-[10px] font-bold text-secondary hover:text-white transition-colors uppercase tracking-widest">
                                        Kembali ke Login
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handlePrajuritLogin} className="space-y-4 animate-in fade-in duration-300">
                                {formError && <div className="p-2 mb-2 text-[10px] text-red-100 bg-red-500/80 rounded-md font-bold text-center">{formError}</div>}

                                <div className="space-y-2">
                                    <Label htmlFor="prajurit-email" className="text-white/70 text-[10px] font-bold uppercase tracking-tighter">Email / NRP</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <Input id="prajurit-email" type="text" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Masukkan NRP atau Email" className="bg-white/5 border-white/10 text-white pl-10 h-11 focus:ring-secondary/50" required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="prajurit-pw" className="text-white/70 text-[10px] font-bold uppercase tracking-tighter">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <Input id="prajurit-pw" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" className="bg-white/5 border-white/10 text-white pl-10 h-11 focus:ring-secondary/50" required />
                                    </div>
                                </div>

                                <Button type="submit" disabled={isLoading} className="w-full bg-white text-primary hover:bg-slate-100 h-11 font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                                    {isLoading ? <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div> : (<><ShieldAlert className="w-4 h-4" /> MASUK KE PORTAL PRAJURIT</>)}
                                </Button>

                                <div className="text-center mt-3">
                                    <p className="text-[10px] text-white/60 mb-1">Belum memiliki akun?</p>
                                    <button type="button" onClick={() => { setIsRegistering(true); setFormError(""); }} className="text-[10px] font-bold text-secondary hover:text-white transition-colors uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-md border border-white/10">
                                        Buat Akun Manual
                                    </button>
                                </div>
                            </form>
                        )}
                    </TabsContent>

                    <TabsContent value="admin" className="space-y-4 mt-0">
                        <form onSubmit={handleAdminLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="admin-email" className="text-white/70 text-[10px] font-bold uppercase tracking-tighter">Email / NRP</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <Input
                                        id="admin-email"
                                        type="text"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="pangkat.nama@tniad.mil.id"
                                        className="bg-white/5 border-white/10 text-white pl-10 h-11 focus:ring-secondary/50"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="admin-password" className="text-white/70 text-[10px] font-bold uppercase tracking-tighter">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <Input
                                        id="admin-password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="bg-white/5 border-white/10 text-white pl-10 h-11 focus:ring-secondary/50"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-secondary text-primary hover:bg-secondary/80 h-11 font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-secondary/10"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        MASUK SISTEM
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="relative pt-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#1B4332] px-2 text-white/20 font-bold tracking-widest text-[9px]">Akses Demo Admin</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-10 text-[10px] font-bold uppercase tracking-wider"
                                onClick={() => handleDemoAdmin('admin_pusat')}
                            >
                                Admin Pusat
                            </Button>
                            <Button
                                variant="outline"
                                className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-10 text-[10px] font-bold uppercase tracking-wider"
                                onClick={() => handleDemoAdmin('admin_agama')}
                            >
                                Admin Agama
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-center gap-6 mt-8">
                    <div className="flex items-center gap-2 text-white/40">
                        <div className="w-1 h-1 bg-secondary rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-medium tracking-wider">SSL SECURE</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/40">
                        <div className="w-1 h-1 bg-secondary rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-medium tracking-wider">MILITARY GRADE</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
