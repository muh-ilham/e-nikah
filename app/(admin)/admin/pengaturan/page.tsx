"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Settings,
    Bell,
    Lock,
    Database,
    Save,
    RefreshCcw,
    Check,
    Upload,
    Image as ImageIcon,
    Mail
} from "lucide-react";

export default function PengaturanPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [logoUploading, setLogoUploading] = useState(false);

    const [settings, setSettings] = useState({
        appName: "",
        instansiName: "",
        satuanInduk: "",
        alamatKantor: "",
        logoUrl: "",
        emailNotif: true,
        browserNotif: true,
        waNotif: false,
        // SMTP fields
        smtpHost: "",
        smtpPort: 587,
        smtpUser: "",
        smtpPass: "",
        smtpSecure: false,
        smtpFromName: "E-NIKAH DISBINTALAD",
        smtpFromEmail: "no-reply@e-nikah.mil.id"
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch("/api/admin/settings");
            const data = await response.json();
            if (!data.error) {
                setSettings({
                    appName: data.appName || "",
                    instansiName: data.instansiName || "",
                    satuanInduk: data.satuanInduk || "",
                    alamatKantor: data.alamatKantor || "",
                    logoUrl: data.logoUrl || "",
                    emailNotif: data.emailNotif ?? true,
                    browserNotif: data.browserNotif ?? true,
                    waNotif: data.waNotif ?? false,
                    smtpHost: data.smtpHost || "",
                    smtpPort: data.smtpPort || 587,
                    smtpUser: data.smtpUser || "",
                    smtpPass: data.smtpPass || "",
                    smtpSecure: data.smtpSecure || false,
                    smtpFromName: data.smtpFromName || "E-NIKAH DISBINTALAD",
                    smtpFromEmail: data.smtpFromEmail || "no-reply@e-nikah.mil.id"
                });
            }
        } catch (error) {
            console.error("Fetch Settings Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccess(false);
        try {
            const response = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });
            const data = await response.json();
            if (!data.error) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
                window.dispatchEvent(new Event("settingsUpdated"));
            }
        } catch (error) {
            console.error("Save Settings Error:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setLogoUploading(true);
        const formData = new FormData();
        formData.append("file", e.target.files[0]);

        try {
            const res = await fetch("/api/admin/settings/logo", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setSettings({ ...settings, logoUrl: data.logoUrl });
                window.dispatchEvent(new Event("settingsUpdated"));
            }
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setLogoUploading(false);
        }
    };

    const handleBackupDb = () => {
        window.location.href = "/api/admin/export/db";
    };

    const handleExportCsv = () => {
        window.location.href = "/api/admin/export/csv";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <RefreshCcw className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <Settings className="w-6 h-6 text-primary" />
                        Pengaturan Sistem
                    </h2>
                    <p className="text-sm text-slate-500 font-medium italic">Konfigurasi parameter aplikasi dan akun admin</p>
                </div>
            </div>

            <Tabs defaultValue="umum" className="w-full">
                <TabsList className="grid w-full lg:w-[750px] grid-cols-5 bg-slate-100/50 p-1">
                    <TabsTrigger value="umum" className="text-[10px] font-bold uppercase data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                        <Settings className="w-3 h-3 mr-2" /> UMUM
                    </TabsTrigger>
                    <TabsTrigger value="email" className="text-[10px] font-bold uppercase data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                        <Mail className="w-3 h-3 mr-2" /> EMAIL
                    </TabsTrigger>
                    <TabsTrigger value="pemberitahuan" className="text-[10px] font-bold uppercase data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                        <Bell className="w-3 h-3 mr-2" /> NOTIF
                    </TabsTrigger>
                    <TabsTrigger value="keamanan" className="text-[10px] font-bold uppercase data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                        <Lock className="w-3 h-3 mr-2" /> KEAMANAN
                    </TabsTrigger>
                    <TabsTrigger value="data" className="text-[10px] font-bold uppercase data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                        <Database className="w-3 h-3 mr-2" /> DATA
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="umum" className="mt-6 space-y-6">
                    <Card className="border-slate-200/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800">Identitas Instansi & Aplikasi</CardTitle>
                            <CardDescription className="text-xs">Informasi yang akan muncul pada header, sidebar, dan dokumen resmi</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Logo Upload Section */}
                            <div className="flex items-center gap-6 p-4 border rounded-xl border-dashed bg-slate-50 border-slate-200">
                                <div className="w-20 h-20 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                                    {settings.logoUrl ? (
                                        <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-slate-300" />
                                    )}
                                </div>
                                <div className="space-y-2 flex-1">
                                    <Label className="text-xs font-bold text-slate-900">Logo Instansi</Label>
                                    <p className="text-[10px] text-slate-500 leading-tight">Gunakan format PNG transparan untuk hasil terbaik pada sidebar dan halaman login. Ukuran maksimal 2MB.</p>
                                    <div className="relative">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer h-full"
                                        />
                                        <Button variant="outline" type="button" disabled={logoUploading} className="text-[10px] font-bold h-8 gap-2 bg-white flex items-center">
                                            {logoUploading ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                            {logoUploading ? "MENGUNGGAH..." : "UNGGAH GAMBAR"}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="appName" className="text-[10px] font-bold text-slate-500 uppercase">Nama Aplikasi</Label>
                                <Input
                                    id="appName"
                                    value={settings.appName}
                                    onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                                    className="bg-slate-50 border-slate-200 text-xs font-bold h-10"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nama" className="text-[10px] font-bold text-slate-500 uppercase">Nama Instansi</Label>
                                    <Input
                                        id="nama"
                                        value={settings.instansiName}
                                        onChange={(e) => setSettings({ ...settings, instansiName: e.target.value })}
                                        className="bg-slate-50 border-slate-200 text-xs font-bold h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="satuan" className="text-[10px] font-bold text-slate-500 uppercase">Satuan Induk</Label>
                                    <Input
                                        id="satuan"
                                        value={settings.satuanInduk}
                                        onChange={(e) => setSettings({ ...settings, satuanInduk: e.target.value })}
                                        className="bg-slate-50 border-slate-200 text-xs font-bold h-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="alamat" className="text-[10px] font-bold text-slate-500 uppercase">Alamat Kantor</Label>
                                <Input
                                    id="alamat"
                                    value={settings.alamatKantor}
                                    onChange={(e) => setSettings({ ...settings, alamatKantor: e.target.value })}
                                    className="bg-slate-50 border-slate-200 text-xs font-bold h-10"
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-primary hover:bg-primary-light text-white text-[10px] font-bold h-10 px-6 gap-2"
                                >
                                    {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : (success ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
                                    {saving ? "MENYIMPAN..." : (success ? "TERSIMPAN" : "SIMPAN PERUBAHAN")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="email" className="mt-6 space-y-6">
                    <Card className="border-slate-200/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                <Settings className="w-4 h-4 text-primary" />
                                Konfigurasi SMTP Email
                            </CardTitle>
                            <CardDescription className="text-xs">Atur server pengiriman email untuk notifikasi otomatis</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="smtpHost" className="text-[10px] font-bold text-slate-500 uppercase">SMTP Host</Label>
                                    <Input
                                        id="smtpHost"
                                        placeholder="smtp.example.com"
                                        value={settings.smtpHost}
                                        onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                                        className="bg-slate-50 border-slate-200 text-xs font-bold h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtpPort" className="text-[10px] font-bold text-slate-500 uppercase">SMTP Port</Label>
                                    <Input
                                        id="smtpPort"
                                        type="number"
                                        placeholder="587"
                                        value={settings.smtpPort}
                                        onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) || 0 })}
                                        className="bg-slate-50 border-slate-200 text-xs font-bold h-10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="smtpUser" className="text-[10px] font-bold text-slate-500 uppercase">SMTP Username</Label>
                                    <Input
                                        id="smtpUser"
                                        placeholder="user@example.com"
                                        value={settings.smtpUser}
                                        onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                                        className="bg-slate-50 border-slate-200 text-xs font-bold h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtpPass" className="text-[10px] font-bold text-slate-500 uppercase">SMTP Password</Label>
                                    <Input
                                        id="smtpPass"
                                        type="password"
                                        placeholder="••••••••"
                                        value={settings.smtpPass}
                                        onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                                        className="bg-slate-50 border-slate-200 text-xs font-bold h-10"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-bold text-slate-900">Secure Connection (SSL/TLS)</Label>
                                    <p className="text-[10px] text-slate-500">Aktifkan jika menggunakan port 465 (Secure) atau TLS</p>
                                </div>
                                <Switch
                                    checked={settings.smtpSecure}
                                    onCheckedChange={(val) => setSettings({ ...settings, smtpSecure: val })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                <div className="space-y-2">
                                    <Label htmlFor="fromName" className="text-[10px] font-bold text-slate-500 uppercase">Pengirim (Display Name)</Label>
                                    <Input
                                        id="fromName"
                                        value={settings.smtpFromName}
                                        onChange={(e) => setSettings({ ...settings, smtpFromName: e.target.value })}
                                        className="bg-slate-50 border-slate-200 text-xs font-bold h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fromEmail" className="text-[10px] font-bold text-slate-500 uppercase">Email Pengirim</Label>
                                    <Input
                                        id="fromEmail"
                                        value={settings.smtpFromEmail}
                                        onChange={(e) => setSettings({ ...settings, smtpFromEmail: e.target.value })}
                                        className="bg-slate-50 border-slate-200 text-xs font-bold h-10"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-between items-center">
                                <Button
                                    variant="outline"
                                    className="text-[10px] font-bold h-10 gap-2 border-slate-200"
                                    onClick={() => {
                                        alert("Fitur tes koneksi akan segera hadir. Pastikan data sudah disimpan.");
                                    }}
                                >
                                    <RefreshCcw className="w-3 h-3" />
                                    TES KONEKSI
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-primary hover:bg-primary-light text-white text-[10px] font-bold h-10 px-6 gap-2"
                                >
                                    {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : (success ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
                                    {saving ? "MENYIMPAN..." : (success ? "TERSIMPAN" : "SIMPAN KONFIGURASI")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pemberitahuan" className="mt-6 space-y-6">
                    <Card className="border-slate-200/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800">Notifikasi Sistem</CardTitle>
                            <CardDescription className="text-xs">Atur bagaimana sistem mengirimkan pemberitahuan</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-bold text-slate-900">Email Notifikasi</Label>
                                    <p className="text-[10px] text-slate-500">Kirim email otomatis saat ada pengajuan baru</p>
                                </div>
                                <Switch
                                    checked={settings.emailNotif}
                                    onCheckedChange={(val) => setSettings({ ...settings, emailNotif: val })}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-bold text-slate-900">Browser Notification</Label>
                                    <p className="text-[10px] text-slate-500">Tampilkan pop-up notifikasi pada dashboard</p>
                                </div>
                                <Switch
                                    checked={settings.browserNotif}
                                    onCheckedChange={(val) => setSettings({ ...settings, browserNotif: val })}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-bold text-slate-900">WhatsApp Gateway (Optional)</Label>
                                    <p className="text-[10px] text-slate-500">Kirim pemberitahuan via WhatsApp (Integrasi berbayar)</p>
                                </div>
                                <Switch
                                    checked={settings.waNotif}
                                    onCheckedChange={(val) => setSettings({ ...settings, waNotif: val })}
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-primary hover:bg-primary-light text-white text-[10px] font-bold h-10 px-6 gap-2"
                                >
                                    {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : (success ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
                                    {saving ? "MENYIMPAN..." : (success ? "TERSIMPAN" : "SIMPAN PERUBAHAN")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="keamanan" className="mt-6">
                    <Card className="border-slate-200/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800">Ganti Password</CardTitle>
                            <CardDescription className="text-xs">Perbarui keamanan akun administrator Anda</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 max-w-md">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-slate-500 uppercase">Password Lama</Label>
                                <Input type="password" placeholder="••••••••" className="bg-slate-50 border-slate-200 text-xs font-bold h-10" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-slate-500 uppercase">Password Baru</Label>
                                <Input type="password" placeholder="••••••••" className="bg-slate-50 border-slate-200 text-xs font-bold h-10" />
                            </div>
                            <div className="pt-4 flex justify-end">
                                <Button className="bg-primary text-white text-[10px] font-bold h-10 px-6 gap-2">PERBARUI PASSWORD</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="data" className="mt-6">
                    <Card className="border-slate-200/60 shadow-sm border-l-4 border-l-amber-500">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800">Manajemen Data</CardTitle>
                            <CardDescription className="text-xs">Ekspor dan cadangkan basis data sistem</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                <p className="text-[11px] text-amber-700 font-bold leading-relaxed italic">
                                    Perhatian: Semua data pengajuan bersifat rahasia. Lakukan backup berkala untuk menghindari kehilangan data penting.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button
                                    variant="outline"
                                    className="h-12 border-slate-200 text-slate-600 font-bold text-[11px] gap-2 hover:bg-slate-50"
                                    onClick={handleBackupDb}
                                >
                                    <Save className="w-4 h-4" />
                                    BACKUP DATABASE (.SQL)
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-12 border-slate-200 text-slate-600 font-bold text-[11px] gap-2 hover:bg-slate-50"
                                    onClick={handleExportCsv}
                                >
                                    <Database className="w-4 h-4" />
                                    EKSPOR DATA (.CSV)
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
