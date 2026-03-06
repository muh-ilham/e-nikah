"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus, Info, CheckCircle2, Clock, XCircle, AlertCircle, Loader2, Printer, Calendar } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function PengajuanPage() {
    const [pengajuan, setPengajuan] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                // Fetch user session first
                const userStr = localStorage.getItem("user_prajurit");
                if (userStr) {
                    const u = JSON.parse(userStr);
                    const urlParams = new URLSearchParams(window.location.search);
                    const pengajuanId = urlParams.get('id');

                    const queryUrl = pengajuanId
                        ? `/api/prajurit/pengajuan?userId=${u.id}&id=${pengajuanId}`
                        : `/api/prajurit/pengajuan?userId=${u.id}`;

                    const res = await fetch(queryUrl);
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.pengajuan) {
                            setPengajuan(data.pengajuan);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed fetching pengajuan status", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, []);

    const STATUS_MAP: Record<string, any> = {
        "Menunggu": { icon: Clock, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
        "Diperiksa": { icon: Loader2, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200", spin: true },
        "Disetujui": { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" },
        "Ditolak": { icon: XCircle, color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
        "Revisi": { icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
    };

    if (loading) {
        return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary/40" /></div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div>
                <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <FilePlus className="w-6 h-6 text-primary" />
                    Status Pengajuan
                </h2>
                <p className="text-sm text-slate-500 font-medium italic">Pantau proses administrasi pernikahan Anda di sini.</p>
            </div>

            {pengajuan ? (
                <div className="space-y-6">
                    <Card className={`border shadow-sm border-l-4 ${STATUS_MAP[pengajuan.status]?.border || "border-slate-200"}`}>
                        <CardHeader className="pb-4 border-b border-slate-100 print:hidden">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <CardTitle className="text-base font-bold text-slate-800">No. Rekam: {pengajuan.noRegistrasi}</CardTitle>
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1.5 ${STATUS_MAP[pengajuan.status]?.bg} ${STATUS_MAP[pengajuan.status]?.color} border ${STATUS_MAP[pengajuan.status]?.border}`}>
                                            {(() => {
                                                const Icon = STATUS_MAP[pengajuan.status]?.icon || Clock;
                                                return <Icon className={`w-3 h-3 ${STATUS_MAP[pengajuan.status]?.spin ? 'animate-spin' : ''}`} />;
                                            })()}
                                            {pengajuan.status}
                                        </div>
                                    </div>
                                    <CardDescription className="text-xs">Diajukan pada: {format(new Date(pengajuan.tglPengajuan), "dd MMMM yyyy, HH:mm", { locale: id })}</CardDescription>
                                </div>
                                {pengajuan.status === 'Disetujui' && (
                                    <Button onClick={() => window.print()} variant="outline" size="sm" className="hidden md:flex gap-2 text-primary border-primary hover:bg-primary/5">
                                        <Printer className="w-4 h-4" />
                                        Cetak Bukti Persetujuan
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6 bg-slate-50/30 print:bg-white print:p-0">
                            {/* Layout Khusus Cetak (Hidden in Screen, Visible in Print) */}
                            <div className="hidden print:block space-y-8 p-10 font-serif">
                                <div className="text-center border-b-2 border-black pb-4 mb-8">
                                    <h1 className="text-xl font-bold uppercase tracking-wider mb-1">Bukti Persetujuan Dokumen E-NIKAH</h1>
                                    <p className="text-sm font-semibold uppercase">TNI ANGKATAN DARAT</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-bold w-32 inline-block">No. Registrasi</p>
                                            <span className="text-sm font-bold">: {pengajuan.noRegistrasi}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold w-24 inline-block">Tanggal</p>
                                            <span className="text-sm">: {format(new Date(pengajuan.tglPengajuan), "dd MMMM yyyy", { locale: id })}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold w-32 inline-block">Status</p>
                                        <span className="text-sm uppercase font-bold text-green-700">: {pengajuan.status}</span>
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold w-32 inline-block">Jenis Layanan</p>
                                        <span className="text-sm uppercase font-bold">: {pengajuan.jenisPengajuan}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200">
                                    <div className="space-y-3">
                                        <h3 className="font-bold text-sm uppercase bg-gray-100 py-1 px-2 border border-gray-300">Data Prajurit (Pemohon)</h3>
                                        <div className="text-sm grid grid-cols-3 gap-2 px-2">
                                            <span className="font-bold text-gray-600">Nama</span>
                                            <span className="col-span-2 capitalize">: {pengajuan.user.name}</span>
                                            <span className="font-bold text-gray-600">NRP</span>
                                            <span className="col-span-2">: {pengajuan.user.nrp}</span>
                                            <span className="font-bold text-gray-600">Pangkat</span>
                                            <span className="col-span-2 uppercase">: {pengajuan.user.profilPrajurit?.pangkat?.nama || '-'}</span>
                                            <span className="font-bold text-gray-600">Jabatan</span>
                                            <span className="col-span-2 uppercase">: {pengajuan.user.profilPrajurit?.jabatan?.nama || '-'}</span>
                                            <span className="font-bold text-gray-600">Satuan</span>
                                            <span className="col-span-2 uppercase">: {pengajuan.user.profilPrajurit?.satuan?.nama || '-'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="font-bold text-sm uppercase bg-gray-100 py-1 px-2 border border-gray-300">Data Calon Istri</h3>
                                        <div className="text-sm grid grid-cols-3 gap-2 px-2">
                                            <span className="font-bold text-gray-600">Nama</span>
                                            <span className="col-span-2 capitalize">: {pengajuan.namaCalon}</span>
                                            <span className="font-bold text-gray-600">TTL</span>
                                            <span className="col-span-2 capitalize">: {pengajuan.tempatLahirCalon}, {format(new Date(pengajuan.tglLahirCalon), "dd MMM yyyy", { locale: id })}</span>
                                            <span className="font-bold text-gray-600">Pekerjaan</span>
                                            <span className="col-span-2 capitalize">: {pengajuan.pekerjaanCalon}</span>
                                        </div>
                                    </div>
                                </div>

                                {pengajuan.jadwalKedatangan && (
                                    <div className="mt-8 p-4 border-2 border-dashed border-gray-400 rounded-lg text-center bg-gray-50">
                                        <h4 className="font-bold text-sm uppercase mb-2">Jadwal Kehadiran Fisik</h4>
                                        <p className="text-lg font-black">{format(new Date(pengajuan.jadwalKedatangan), "EEEE, dd MMMM yyyy", { locale: id })}</p>
                                        <p className="text-md font-bold text-gray-700">Pukul: {format(new Date(pengajuan.jadwalKedatangan), "HH:mm")} WIB</p>
                                        <p className="text-xs text-gray-600 mt-2 italic">*Harap hadir tepat waktu dengan membawa berkas asli.</p>
                                    </div>
                                )}
                            </div>

                            {/* Layout Layar Utama */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Data Pemohon</p>
                                    <p className="text-sm font-semibold text-slate-900">{pengajuan.user.name}</p>
                                    <p className="text-xs text-slate-500">NRP: {pengajuan.user.nrp}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Jenis Pengajuan</p>
                                    <p className="text-sm font-semibold text-slate-900 uppercase">{pengajuan.jenisPengajuan}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Data Calon Istri</p>
                                    <p className="text-sm font-semibold text-slate-900">{pengajuan.namaCalon}</p>
                                </div>
                            </div>

                            {/* Alert/Notes from Admin */}
                            {pengajuan.catatanAdmin && (
                                <div className={`p-5 rounded-xl border print:hidden ${pengajuan.status === 'Disetujui' ? 'bg-emerald-50/50 border-emerald-200 shadow-[inset_0_2px_10px_rgba(16,185,129,0.05)]' : 'bg-red-50/50 border-red-200'}`}>
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <p className={`font-bold flex items-center gap-2 mb-2 ${pengajuan.status === 'Disetujui' ? 'text-emerald-800' : 'text-red-800'}`}>
                                                <Info className="w-5 h-5 flex-shrink-0" />
                                                Catatan Verifikator BINTAL:
                                            </p>
                                            <div className="pl-7 text-sm font-medium leading-relaxed text-slate-700">
                                                {pengajuan.catatanAdmin}
                                            </div>
                                        </div>

                                        {pengajuan.status === 'Disetujui' && pengajuan.jadwalKedatangan && (
                                            <div className="mt-2 bg-white/60 p-4 rounded-lg border border-emerald-100 flex items-start gap-4 shadow-sm">
                                                <div className="bg-emerald-100 p-2.5 rounded-full flex-shrink-0">
                                                    <Calendar className="w-6 h-6 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Jadwal Kedatangan & Wawancara</p>
                                                    <p className="text-lg font-black text-slate-800">
                                                        {format(new Date(pengajuan.jadwalKedatangan), "EEEE, dd MMMM yyyy", { locale: id })}
                                                    </p>
                                                    <p className="text-sm font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        Pukul {format(new Date(pengajuan.jadwalKedatangan), "HH:mm")} Waktu Setempat
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {(pengajuan.status === 'Revisi' || pengajuan.status === 'Ditolak') && (
                                <div className="mt-6 flex justify-end print:hidden">
                                    <Link href="/pengajuan/baru?mode=revisi" passHref>
                                        <Button className="bg-primary text-xs font-bold px-6 h-9">
                                            PERBAIKAN DATA
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-slate-200/60 shadow-sm border-l-4 border-l-primary">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800">Persyaratan Umum</CardTitle>
                            <CardDescription className="text-xs">Pastikan Anda telah menyiapkan dokumen berdasarkan buku panduan.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <ul className="text-xs space-y-2 text-slate-600 font-medium">
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-primary rounded-full"></div>
                                    Telah mengisi Profil Lengkap di sistem
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-primary rounded-full"></div>
                                    Dokumen Identitas Pribadi & Calon Istri (KTP, KK, KTA)
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-primary rounded-full"></div>
                                    Surat Rekomendasi / N1-N4 / SKCK yang dipersyaratkan
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/60 shadow-sm flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <FilePlus className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Siap Mengajukan?</h3>
                        <p className="text-xs text-slate-500 mb-6 max-w-[200px]">Proses pengajuan akan memakan waktu sekitar 10-15 menit. Anda dapat terus memantau statusnya di sini setelah dikirim.</p>
                        <Link href="/pengajuan/baru" passHref>
                            <Button className="bg-primary text-xs font-bold px-8 h-10 hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95">
                                MULAI PENGISIAN FORM
                            </Button>
                        </Link>
                    </Card>
                </div>
            )}

            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-3 mt-8 print:hidden">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 leading-relaxed italic">
                    <span className="font-bold text-primary italic">Catatan:</span> Data yang telah disimpan akan dikirim ke Admin Pusat/Agama untuk verifikasi mendalam. Pastikan resolusi scan dokumen yang diunggah cukup tajam dan jelas.
                </p>
            </div>
        </div>
    );
}
