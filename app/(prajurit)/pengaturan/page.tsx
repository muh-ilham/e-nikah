// @ts-nocheck
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Key, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function PengaturanPrajuritPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Konfirmasi password baru tidak cocok.");
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error("Password baru minimal 6 karakter.");
            return;
        }

        const storedUser = localStorage.getItem("user_prajurit");
        if (!storedUser) {
            toast.error("Sesi telah habis, silakan login kembali.");
            return;
        }

        setLoading(true);
        const parsedUser = JSON.parse(storedUser);

        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: parsedUser.id,
                    oldPassword: formData.oldPassword,
                    newPassword: formData.newPassword,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Password berhasil diubah!");
                setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                toast.error(data.error || "Gagal mengubah password.");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                    <Shield className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">Pengaturan Keamanan</h2>
                    <p className="text-slate-500 text-sm mt-1">Ubah kata sandi dan amankan akun Anda.</p>
                </div>
            </div>

            <Card className="border-slate-200/60 shadow-sm">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Key className="w-5 h-5 text-primary" />
                        Ganti Password
                    </CardTitle>
                    <CardDescription>
                        Pastikan menggunakan kombinasi password yang kuat untuk keamanan akun.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleChangePassword} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="oldPassword">Password Lama</Label>
                            <Input
                                id="oldPassword"
                                type="password"
                                required
                                value={formData.oldPassword}
                                onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                                className="bg-slate-50/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Password Baru</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                required
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                className="bg-slate-50/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="bg-slate-50/50"
                            />
                        </div>

                        <div className="pt-4">
                            <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-primary hover:bg-primary-dark">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Simpan Password
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
