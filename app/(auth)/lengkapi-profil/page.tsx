// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Check, User, Briefcase, Loader2 } from "lucide-react";

export default function LengkapiProfil() {
    const [step, setStep] = useState(1);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Master Data State
    const [masterPangkat, setMasterPangkat] = useState<any[]>([]);
    const [masterSatuan, setMasterSatuan] = useState<any[]>([]);
    const [masterJabatan, setMasterJabatan] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        userId: "",
        name: "",
        nrp: "",
        tempatLahir: "",
        tglLahir: "",
        agama: "",
        hp: "",
        suku: "",
        pangkatId: "",
        satuanId: "",
        jabatanId: "",
        alamat: "",
    });
    const [fotoFile, setFotoFile] = useState<File | null>(null);

    // Load from localStorage on mount & Fetch Master Data
    useEffect(() => {
        const userStr = localStorage.getItem("user_prajurit");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setFormData(prev => ({
                    ...prev,
                    userId: user.id || "",
                    name: user.name || "",
                    nrp: user.nrp || ""
                }));
            } catch (e) { }
        }

        fetchMasterData();
    }, []);

    const fetchMasterData = async () => {
        try {
            const [resPangkat, resSatuan, resJabatan] = await Promise.all([
                fetch("/api/master/pangkat"),
                fetch("/api/master/satuan"),
                fetch("/api/master/jabatan"),
            ]);

            if (resPangkat.ok) setMasterPangkat(await resPangkat.json());
            if (resSatuan.ok) setMasterSatuan(await resSatuan.json());
            if (resJabatan.ok) setMasterJabatan(await resJabatan.json());
        } catch (e) {
            console.error("Failed fetching master data:", e);
        }
    }

    const nextStep = () => setStep((s) => s + 1);
    const prevStep = () => setStep((s) => s - 1);

    const handleSubmit = async () => {
        if (!formData.userId) {
            setError("User session tidak ditemukan. Harap login kembali.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });
            if (fotoFile) {
                data.append("foto", fotoFile);
            }

            const res = await fetch("/api/profil/update", {
                method: "POST",
                body: data
            });

            const result = await res.json();
            if (!res.ok) {
                setError(result.error || "Gagal menyimpan profil");
            } else {
                // Update local session
                const userStr = localStorage.getItem("user_prajurit");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    user.name = formData.name;
                    user.nrp = formData.nrp;
                    const roleKey = "user_prajurit";
                    localStorage.setItem(roleKey, JSON.stringify(user));
                    localStorage.removeItem("user"); // Bersihkan key lama jika ada
                }
                router.push("/beranda");
            }
        } catch (err) {
            setError("Terjadi kesalahan jaringan");
        } finally {
            setIsLoading(false);
        }
    };

    const selectedPangkat = masterPangkat.find(p => p.id === formData.pangkatId);
    const selectedSatuan = masterSatuan.find(s => s.id === formData.satuanId);

    return (
        <div className="w-full max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Dynamic Stepper */}
            <div className="flex items-center justify-between px-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 z-0"></div>
                {[1, 2, 3].map((s) => (
                    <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step >= s ? "bg-secondary text-primary" : "bg-primary-light text-white/40"
                            }`}>
                            {step > s ? <Check className="w-5 h-5" /> : s}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= s ? "text-secondary" : "text-white/20"
                            }`}>
                            {s === 1 ? "Pribadi" : s === 2 ? "Kedinasan" : "Selesai"}
                        </span>
                    </div>
                ))}
            </div>

            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-white font-heading font-extrabold flex items-center gap-3">
                        {step === 1 && <User className="w-5 h-5 text-secondary" />}
                        {step === 2 && <Briefcase className="w-5 h-5 text-secondary" />}
                        {step === 3 && <Check className="w-5 h-5 text-secondary" />}
                        {step === 1 ? "Data Pribadi" : step === 2 ? "Data Kedinasan" : "Konfirmasi Data"}
                    </CardTitle>
                    <CardDescription className="text-white/50">
                        Lengkapi data diri Anda sesuai dengan buku saku prajurit.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 pt-2">
                    {error && <div className="p-3 bg-red-500/20 text-red-200 border border-red-500/50 rounded-md text-xs">{error}</div>}

                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label className="text-white/70 text-xs font-bold uppercase">Nama Lengkap</Label>
                                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/70 text-xs font-bold uppercase">NRP</Label>
                                <Input value={formData.nrp} onChange={e => setFormData({ ...formData, nrp: e.target.value })} placeholder="Contoh: 12345678" className="bg-white/5 border-white/10 text-white" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/70 text-xs font-bold uppercase">Tempat Lahir</Label>
                                <Input value={formData.tempatLahir} onChange={e => setFormData({ ...formData, tempatLahir: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/70 text-xs font-bold uppercase">Tanggal Lahir</Label>
                                <Input type="date" value={formData.tglLahir} onChange={e => setFormData({ ...formData, tglLahir: e.target.value })} className="bg-white/5 border-white/10 text-white [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/70 text-xs font-bold uppercase">Agama</Label>
                                <Select value={formData.agama} onValueChange={v => setFormData({ ...formData, agama: v })}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                        <SelectValue placeholder="Pilih Agama" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ISLAM">ISLAM</SelectItem>
                                        <SelectItem value="KRISTEN">KRISTEN</SelectItem>
                                        <SelectItem value="KATOLIK">KATOLIK</SelectItem>
                                        <SelectItem value="HINDU">HINDU</SelectItem>
                                        <SelectItem value="BUDHA">BUDHA</SelectItem>
                                        <SelectItem value="KONGHUCU">KONGHUCU</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/70 text-xs font-bold uppercase">Suku / Bangsa</Label>
                                <Input value={formData.suku} onChange={e => setFormData({ ...formData, suku: e.target.value })} placeholder="Contoh: Jawa / Indonesia" className="bg-white/5 border-white/10 text-white" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-white/70 text-xs font-bold uppercase">No. Handphone</Label>
                                <Input value={formData.hp} onChange={e => setFormData({ ...formData, hp: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label className="text-white/70 text-xs font-bold uppercase">Pangkat / Korps</Label>
                                <Select value={formData.pangkatId} onValueChange={v => setFormData({ ...formData, pangkatId: v })}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                        <SelectValue placeholder="Pilih Pangkat" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {masterPangkat.map((p) => (
                                            // @ts-ignore
                                            <SelectItem key={p.id} value={p.id}>{p.nama} {p.korps ? `(${p.korps})` : ''}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/70 text-xs font-bold uppercase">Jabatan</Label>
                                <Select value={formData.jabatanId} onValueChange={v => setFormData({ ...formData, jabatanId: v })}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                        <SelectValue placeholder="Pilih Jabatan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {masterJabatan.map((j) => (
                                            // @ts-ignore
                                            <SelectItem key={j.id} value={j.id}>{j.nama}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 lg:col-span-2">
                                <Label className="text-white/70 text-xs font-bold uppercase">Satuan Induk / Kesatuan</Label>
                                <Select value={formData.satuanId} onValueChange={v => setFormData({ ...formData, satuanId: v })}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                        <SelectValue placeholder="Pilih Satuan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {masterSatuan.map((s) => (
                                            // @ts-ignore
                                            <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 lg:col-span-2">
                                <Label className="text-white/70 text-xs font-bold uppercase">Alamat Domisili / Tempat Tinggal</Label>
                                <Input value={formData.alamat} onChange={e => setFormData({ ...formData, alamat: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                            </div>
                            <div className="space-y-2 lg:col-span-2">
                                <Label className="text-white/70 text-xs font-bold uppercase">Unggah Foto Diri (Maks. 2MB)</Label>
                                <Input type="file" accept="image/*" onChange={e => setFotoFile(e.target.files?.[0] || null)} className="bg-white/5 border-white/10 text-white file:text-white file:bg-secondary file:border-0 file:rounded-sm file:px-3 file:py-1 file:mr-3 hover:file:bg-secondary/80 focus-visible:ring-secondary/50" />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                            <div className="bg-secondary/10 p-6 rounded-xl border border-secondary/20">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center font-bold text-primary shrink-0">
                                        <Check className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Siap Kirim!</h4>
                                        <p className="text-white/50 text-[11px]">Pastikan data yang Anda masukkan sudah benar.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-y-3 text-[11px] overflow-hidden">
                                    <p className="text-white/40">NAMA</p><p className="text-white font-bold text-right truncate">{formData.name}</p>
                                    <p className="text-white/40">NRP</p><p className="text-white font-bold text-right truncate">{formData.nrp}</p>
                                    <p className="text-white/40">PANGKAT</p><p className="text-white font-bold text-right truncate w-full">{selectedPangkat?.nama} {selectedPangkat?.korps && `(${selectedPangkat.korps})`}</p>
                                    <p className="text-white/40">SATUAN</p><p className="text-white font-bold text-right truncate w-full">{selectedSatuan?.nama}</p>
                                    <p className="text-white/40">FOTO</p><p className="text-white font-bold text-right truncate w-full">{fotoFile ? fotoFile.name : "Tidak ada unggahan"}</p>
                                </div>
                            </div>
                            <p className="text-[10px] text-white/30 text-center italic">
                                Dengan menekan simpan, Anda menyatakan bahwa data di atas adalah benar sesuai dengan identitas militer Anda.
                            </p>
                        </div>
                    )}

                    <div className="flex justify-between pt-6 border-t border-white/10">
                        {step > 1 ? (
                            <Button variant="ghost" onClick={prevStep} disabled={isLoading} className="text-white/60 hover:text-white hover:bg-white/10 font-bold">
                                KEMBALI
                            </Button>
                        ) : <div />}

                        {step < 3 ? (
                            <Button onClick={nextStep} className="bg-secondary text-primary hover:bg-secondary/80 font-bold px-8">
                                SELANJUTNYA
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} disabled={isLoading} className="bg-secondary text-primary hover:bg-secondary/80 font-bold px-8 shadow-lg shadow-secondary/20">
                                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "SIMPAN PROFIL"}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
