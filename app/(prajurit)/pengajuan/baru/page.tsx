// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, User, Heart, FileText, Loader2, ArrowRight, ArrowLeft, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function PengajuanBaruPage() {
    const router = useRouter();
    const [step, setStep] = useState(0); // Start at Step 0: Pilih Jenis
    const [isLoading, setIsLoading] = useState(false);
    const [jenisPengajuan, setJenisPengajuan] = useState("NIKAH");

    // Data Pemohon (Fetched)
    const [profil, setProfil] = useState<any>(null);

    // Master Berkas & Existing Berkas
    const [masterBerkas, setMasterBerkas] = useState<any[]>([]);
    const [existingBerkas, setExistingBerkas] = useState<any[]>([]);

    // Form Data Calon Istri
    const [calon, setCalon] = useState({
        namaCalon: "",
        tempatLahirCalon: "",
        tglLahirCalon: "",
        agamaCalon: "",
        pekerjaanCalon: "",
        sukuCalon: "",
        alamatCalon: "",
        id: "", // For revision mode
        catatanAdmin: "" // To show feedback
    });

    // File Uploads State
    const [files, setFiles] = useState<Record<string, File | null>>({});

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Get userId from localStorage
                const storedUser = localStorage.getItem("user_prajurit");
                if (!storedUser) {
                    toast.error("Sesi berakhir, silakan login kembali");
                    router.push("/login");
                    return;
                }
                const parsedUser = JSON.parse(storedUser);

                // Fetch user profil
                const resProfil = await fetch(`/api/profil/me?userId=${parsedUser.id}`);
                if (resProfil.ok) {
                    const data = await resProfil.json();
                    if (data.profilPrajurit) {
                        setProfil({
                            user: {
                                id: data.id,
                                name: data.name,
                                nrp: data.nrp
                            },
                            profile: data.profilPrajurit
                        });
                    } else {
                        toast.error("Profil belum lengkap! Silakan lengkapi profil terlebih dahulu.");
                        router.push("/lengkapi-profil");
                        return;
                    }
                }

                // Fetch master berkas
                const resBerkas = await fetch("/api/master/berkas");
                if (resBerkas.ok) {
                    const dataBerkas = await resBerkas.json();
                    const activeBerkas = dataBerkas.filter((b: any) => b.aktif);
                    setMasterBerkas(activeBerkas);

                    // Initialize files state
                    const initialFiles: Record<string, File | null> = {};
                    activeBerkas.forEach((b: any) => {
                        initialFiles[b.id] = null;
                    });
                    setFiles(initialFiles);
                }
                // Check for Revision Mode
                const urlParams = new URLSearchParams(window.location.search);
                const isRevision = urlParams.get("mode") === "revisi";

                if (isRevision) {
                    const resActive = await fetch(`/api/prajurit/pengajuan?userId=${parsedUser.id}`);
                    if (resActive.ok) {
                        const activeData = await resActive.json();
                        if (activeData && activeData.pengajuan) {
                            const p = activeData.pengajuan;
                            setCalon({
                                id: p.id,
                                namaCalon: p.namaCalon || "",
                                tempatLahirCalon: p.tempatLahirCalon || "",
                                tglLahirCalon: p.tglLahirCalon ? format(new Date(p.tglLahirCalon), "yyyy-MM-dd") : "",
                                agamaCalon: p.agamaCalon || "",
                                pekerjaanCalon: p.pekerjaanCalon || "",
                                sukuCalon: p.sukuCalon || "",
                                alamatCalon: p.alamatCalon || "",
                                catatanAdmin: p.catatanAdmin || ""
                            });
                            setExistingBerkas(p.berkas || []);
                            setJenisPengajuan(p.jenisPengajuan || "NIKAH");
                            setStep(1); // Jump to data pemohon if revising
                        }
                    }
                }
            } catch (error) {
                console.error("Gagal mengambil data", error);
            }
        };

        fetchInitialData();
    }, [router]);

    const handleFileChange = (berkasId: string, file: File | null) => {
        setFiles(prev => ({ ...prev, [berkasId]: file }));
    };

    const nextStep = () => {
        if (step === 2) {
            // Validate calon data
            if (!calon.namaCalon || !calon.tempatLahirCalon || !calon.tglLahirCalon || !calon.agamaCalon || !calon.pekerjaanCalon || !calon.alamatCalon) {
                toast.error("Harap lengkapi semua data calon istri!");
                return;
            }
        }
        setStep(s => s + 1);
    };

    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        // Filter master berkas based on selected jenis and user religion
        const filteredMaster = masterBerkas.filter(item => {
            const userAgama = profil?.profile?.agama?.toLowerCase();
            const itemAgama = item.agama?.toLowerCase();

            const matchesAgama = !itemAgama || itemAgama === 'semua' || itemAgama === userAgama;
            const matchesJenis = item.jenisPengajuan === jenisPengajuan;

            return matchesAgama && matchesJenis;
        });

        // Validation files
        const missingFiles = filteredMaster.filter(b => {
            if (!b.wajib) return false;
            const hasNewFile = !!files[b.id];
            const hasExistingFile = existingBerkas.some(eb => eb.masterBerkasId === b.id);
            return !hasNewFile && !hasExistingFile;
        });

        if (missingFiles.length > 0) {
            toast.error("Masih ada berkas persyaratan WAJIB yang belum diunggah!");
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();

            // Append Calon Istri Data
            Object.entries(calon).forEach(([key, value]) => {
                formData.append(key, value);
            });

            // Append Files Data
            masterBerkas.forEach(b => {
                if (files[b.id]) {
                    formData.append(`file_${b.id}`, files[b.id] as Blob);
                }
            });

            // Set userId and pengajuanId if available
            formData.append("userId", profil.user.id);
            formData.append("jenisPengajuan", jenisPengajuan);
            if (calon.id) {
                formData.append("pengajuanId", calon.id);
            }

            const res = await fetch("/api/prajurit/pengajuan", {
                method: "POST",
                body: formData
            });

            const result = await res.json();
            if (res.ok) {
                toast.success("Pengajuan berhasil dikirim!");
                router.push("/pengajuan");
            } else {
                toast.error(result.error || "Gagal mengirim pengajuan");
            }
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setIsLoading(false);
        }
    };

    if (!profil) {
        return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary/40" /></div>;
    }

    const steps = [
        { num: 0, title: "JENIS", icon: FileText },
        { num: 1, title: "PEMOHON", icon: User },
        { num: 2, title: "CALON", icon: Heart },
        { num: 3, title: "BERKAS", icon: FileText }
    ];

    const JENIS_OPTIONS = [
        { id: "NIKAH", label: "NIKAH", icon: Heart, color: "text-rose-500", bg: "bg-rose-50", desc: "Permohonan Izin Menikah" },
        { id: "CERAI", label: "CERAI", icon: X, color: "text-red-500", bg: "bg-red-50", desc: "Permohonan Izin Perceraian" },
        { id: "TALAK", label: "TALAK", icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50", desc: "Permohonan Izin Talak" },
        { id: "RUJUK", label: "RUJUK", icon: Check, color: "text-emerald-500", bg: "bg-emerald-50", desc: "Permohonan Izin Rujuk Kembali" },
    ];

    // Filtered Berkas based on current selection
    const filteredMasterBerkas = masterBerkas.filter(item => {
        // Normalisasi agama untuk perbandingan yang lebih kuat
        const userAgama = profil?.profile?.agama?.toLowerCase();
        const itemAgama = item.agama?.toLowerCase();

        const matchesAgama = !itemAgama || itemAgama === 'semua' || itemAgama === userAgama;
        const matchesJenis = item.jenisPengajuan === jenisPengajuan;

        return matchesAgama && matchesJenis;
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700">
            {calon.catatanAdmin && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Catatan Verifikator:</h4>
                        <p className="text-sm text-amber-700 leading-relaxed italic">"{calon.catatanAdmin}"</p>
                    </div>
                </div>
            )}

            {/* Stepper Header */}
            <div className="flex justify-between items-center relative mb-8">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 z-0"></div>
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary z-0 transition-all duration-500"
                    style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((s) => {
                    const Icon = s.icon;
                    const isActive = step >= s.num;
                    return (
                        <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                                {step > s.num ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                            </div>
                            <span className={`text-[10px] font-bold tracking-wider ${isActive ? 'text-primary' : 'text-slate-400'}`}>{s.title}</span>
                        </div>
                    );
                })}
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white/50 backdrop-blur">
                <CardContent className="p-6 md:p-8">
                    {step === 0 && (
                        <div className="space-y-8 animate-in zoom-in-95 duration-500">
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight">Pilih Jenis Pengajuan</h3>
                                <p className="text-xs text-slate-500">Tentukan jenis permohonan administrasi yang ingin Anda ajukan.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {JENIS_OPTIONS.map((opt) => {
                                    const Icon = opt.icon;
                                    const isSelected = jenisPengajuan === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => setJenisPengajuan(opt.id)}
                                            className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3 group ${isSelected ? 'border-primary bg-primary/5 ring-4 ring-primary/5' : 'border-slate-100 bg-slate-50/50 hover:border-slate-300'}`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl ${opt.bg} ${opt.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                                <Icon className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-slate-800'}`}>{opt.label}</h4>
                                                <p className="text-[10px] text-slate-400 font-medium">{opt.desc}</p>
                                            </div>
                                            {isSelected && (
                                                <div className="mt-2 text-primary font-bold text-[10px] flex items-center gap-1">
                                                    <Check className="w-3 h-3" /> TERPILIH
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex justify-center pt-4">
                                <Button
                                    onClick={() => setStep(1)}
                                    className="bg-primary px-12 h-12 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
                                >
                                    MULAI PENGISIAN <ArrowRight className="w-4 h-4 ml-3" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
                                    <Check className="w-5 h-5 text-emerald-500" /> Profil Pemohon
                                </h3>
                                <p className="text-xs text-slate-500">Data Anda telah diambil secara otomatis dari sistem.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
                                <div>
                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Nama Lengkap</Label>
                                    <p className="font-semibold text-slate-800">{profil.user.name}</p>
                                </div>
                                <div>
                                    <Label className="text-[10px] uppercase font-bold text-slate-400">NRP</Label>
                                    <p className="font-semibold text-slate-800">{profil.user.nrp}</p>
                                </div>
                                <div>
                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Pangkat / Korps</Label>
                                    <p className="font-semibold text-slate-800">{profil.profile.pangkat?.nama || "-"} {profil.profile.pangkat?.korps ? `(${profil.profile.pangkat.korps})` : ""}</p>
                                </div>
                                <div>
                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Satuan (Kesatuan)</Label>
                                    <p className="font-semibold text-slate-800">{profil.profile.satuan?.nama || "-"}</p>
                                </div>
                                <div>
                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Jabatan</Label>
                                    <p className="font-semibold text-slate-800">{profil.profile.jabatan?.nama || "-"}</p>
                                </div>
                                <div>
                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Agama / Suku</Label>
                                    <p className="font-semibold text-slate-800">{profil.profile.agama || "-"} / {profil.profile.suku || "-"}</p>
                                </div>
                                <div>
                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Tempat, Tgl Lahir</Label>
                                    <p className="font-semibold text-slate-800">
                                        {profil.profile.tempatLahir || "-"}, {profil.profile.tglLahir ? format(new Date(profil.profile.tglLahir), "dd MMM yyyy") : "-"}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Nomor HP</Label>
                                    <p className="font-semibold text-slate-800">{profil.profile.hp || "-"}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Tempat Tinggal (Alamat)</Label>
                                    <p className="font-semibold text-slate-800">{profil.profile.alamat || "-"}</p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button onClick={nextStep} className="bg-primary px-8 h-10 w-full sm:w-auto">
                                    LANJUT: DATA CALON <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
                                    <Heart className="w-5 h-5 text-rose-500" /> Identitas Calon Istri
                                </h3>
                                <p className="text-xs text-slate-500">Isi data identitas calon istri Anda sesuai dengan KTP.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="font-bold">Nama Lengkap</Label>
                                    <Input
                                        placeholder="Nama sesuai KTP..."
                                        className="bg-slate-50"
                                        value={calon.namaCalon}
                                        onChange={e => setCalon({ ...calon, namaCalon: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Tempat Lahir</Label>
                                    <Input
                                        placeholder="Kota Kelahiran"
                                        className="bg-slate-50"
                                        value={calon.tempatLahirCalon}
                                        onChange={e => setCalon({ ...calon, tempatLahirCalon: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Tanggal Lahir</Label>
                                    <Input
                                        type="date"
                                        className="bg-slate-50"
                                        value={calon.tglLahirCalon}
                                        onChange={e => setCalon({ ...calon, tglLahirCalon: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Agama</Label>
                                    <Input
                                        placeholder="Agama"
                                        className="bg-slate-50"
                                        value={calon.agamaCalon}
                                        onChange={e => setCalon({ ...calon, agamaCalon: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Suku Bangsa</Label>
                                    <Input
                                        placeholder="Suku Bangsa"
                                        className="bg-slate-50"
                                        value={calon.sukuCalon}
                                        onChange={e => setCalon({ ...calon, sukuCalon: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="font-bold">Pekerjaan</Label>
                                    <Input
                                        placeholder="Pekerjaan saat ini"
                                        className="bg-slate-50"
                                        value={calon.pekerjaanCalon}
                                        onChange={e => setCalon({ ...calon, pekerjaanCalon: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="font-bold">Alamat Lengkap</Label>
                                    <Textarea
                                        placeholder="Alamat domisili sesuai KTP"
                                        className="bg-slate-50 min-h-[100px]"
                                        value={calon.alamatCalon}
                                        onChange={e => setCalon({ ...calon, alamatCalon: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between pt-4 border-t border-slate-100">
                                <Button variant="outline" onClick={prevStep} className="h-10">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> KEMBALI
                                </Button>
                                <Button onClick={nextStep} className="bg-primary px-8 h-10">
                                    LANJUT UPLOAD <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
                                    <FileText className="w-5 h-5 text-indigo-500" /> Unggah Persyaratan
                                </h3>
                                <p className="text-xs text-slate-500">Unggah berkas persyaratan. Format: PDF, JPG, PNG. Maksimal 5MB per file.</p>
                            </div>

                            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 pb-2">
                                {filteredMasterBerkas.length > 0 ? filteredMasterBerkas.map((item, index) => {
                                    const existingFile = existingBerkas.find(fb => fb.masterBerkasId === item.id);
                                    const hasFile = !!files[item.id];
                                    return (
                                        <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-primary/20 transition-all flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                            <div className="flex-1">
                                                <Label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                    {index + 1}. {item.nama}
                                                    {item.wajib ? (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-bold uppercase tracking-wider">Wajib</span>
                                                    ) : (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold uppercase tracking-wider">Opsional</span>
                                                    )}
                                                    {existingFile && !hasFile && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
                                                            <Check className="w-2 h-2" /> Sudah Ada
                                                        </span>
                                                    )}
                                                </Label>
                                                <p className="text-[11px] text-slate-500 mt-1 capitalize text-primary font-medium">Kategori: {item.kategori}</p>
                                            </div>
                                            <div className="shrink-0 w-full sm:w-auto">
                                                <Input
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    className={`text-xs w-full sm:w-[250px] bg-white cursor-pointer file:cursor-pointer file:bg-primary/10 file:text-primary file:border-0 file:rounded file:px-3 file:py-1 file:mr-3 hover:file:bg-primary/20 transition-colors ${existingFile && !hasFile ? "border-emerald-200 ring-2 ring-emerald-50" : ""}`}
                                                    onChange={(e) => handleFileChange(item.id, e.target.files ? e.target.files[0] : null)}
                                                />
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-center py-10 text-slate-500 text-sm italic">
                                        Tidak ada dokumen yang diperlukan untuk kategori ini.
                                    </div>
                                )}

                                {masterBerkas.length === 0 && (
                                    <div className="text-center py-10 text-slate-500 text-sm font-bold">
                                        Belum ada syarat berkas yang dikonfigurasi admin.
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between pt-6 border-t border-slate-100">
                                <Button variant="outline" onClick={prevStep} disabled={isLoading} className="h-10">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> KEMBALI
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="bg-primary px-8 h-10"
                                >
                                    {isLoading ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> MENGIRIM PENGUJUAN...</>
                                    ) : (
                                        <><Check className="w-4 h-4 mr-2" />KIRIM PENGAJUAN FINAL</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div >
    );
}
