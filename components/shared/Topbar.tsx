// @ts-nocheck
"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, Menu, User as UserIcon, LogOut, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface TopbarProps {
    title: string;
    role: "prajurit" | "admin_pusat" | "admin_agama";
    agamaLabel?: string;
}

const Topbar = ({ title, role, agamaLabel }: TopbarProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user_" + role);
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                // Ambil data profil terbaru
                fetch(`/api/profil/me?userId=${userData.id}&t=${Date.now()}`, { cache: 'no-store' })
                    .then(res => res.json())
                    .then(data => {
                        if (!data.error) {
                            setUser(data);
                        } else {
                            setUser(userData);
                        }
                    })
                    .catch(() => setUser(userData));
            } catch (e) {
                console.error("Gagal parse user data", e);
            }
        }
    }, [pathname, role]);

    const handleLogout = () => {
        localStorage.removeItem("user_" + role);
        if (pathname.startsWith("/admin-agama") || pathname.startsWith("/admin")) {
            router.push("/admin-login");
        } else {
            router.push("/login");
        }
    };

    // Helper untuk mendapatkan label jabatan/pangkat
    const getRankLabel = () => {
        if (!user) return "...";
        if (user.role === 'admin_pusat') return "Admin Pusat Dashboard";
        if (user.role === 'admin_agama') return `Admin Agama ${user.agamaId || ''}`;
        return user.profilPrajurit?.pangkat?.nama || "Prajurit";
    };

    return (
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="lg:hidden text-slate-600">
                            <Menu className="w-6 h-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64 border-r-0">
                        <Sidebar
                            role={role}
                            agamaLabel={agamaLabel}
                            onItemClick={() => setIsMobileMenuOpen(false)}
                        />
                    </SheetContent>
                </Sheet>
                <h2 className="font-heading font-bold text-lg text-slate-800 truncate max-w-[150px] sm:max-w-none">{title}</h2>
            </div>

            <div className="flex items-center gap-4">
                {/* Search placeholder */}
                <div className="hidden md:flex items-center bg-slate-100 rounded-full px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari data..."
                        className="bg-transparent border-none outline-none text-xs px-2 w-48 text-slate-600 font-medium"
                    />
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:bg-slate-50">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-secondary rounded-full border-2 border-white"></span>
                </Button>

                {/* User Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="p-0 px-2 hover:bg-slate-50 flex items-center gap-3 transition-colors h-10 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden ring-2 ring-slate-100 ring-offset-1">
                                {user?.profilPrajurit?.fotoUrl || user?.fotoUrl ? (
                                    <img
                                        src={user.profilPrajurit?.fotoUrl || user.fotoUrl}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <UserIcon className="w-4 h-4 text-slate-400" />
                                )}
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className="text-[10px] font-black text-slate-900 leading-none uppercase tracking-tighter">
                                    {user?.name || "MEMUAT..."}
                                </p>
                                <p className="text-[9px] text-slate-400 font-bold mt-0.5 uppercase tracking-tight">
                                    {getRankLabel()}
                                </p>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl shadow-2xl border-slate-100 p-2">
                        <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1.5">Akun Saya</DropdownMenuLabel>
                        <DropdownMenuSeparator className="my-1 bg-slate-50" />
                        <DropdownMenuItem className="rounded-lg font-bold text-xs py-2.5 px-3 cursor-pointer" onClick={() => router.push(role === 'prajurit' ? '/profil' : role === 'admin_pusat' ? '/admin/profil' : '/admin-agama/profil')}>
                            <UserIcon className="w-4 h-4 mr-2 text-primary" /> Lihat Profil
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg font-bold text-xs py-2.5 px-3 cursor-pointer" onClick={() => router.push(role === 'prajurit' ? '/pengaturan' : role === 'admin_pusat' ? '/admin/pengaturan' : '/admin-agama/pengaturan')}>
                            <Settings className="w-4 h-4 mr-2 text-primary" /> Pengaturan
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 bg-slate-50" />
                        <DropdownMenuItem className="rounded-lg font-bold text-xs py-2.5 px-3 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" /> Keluar Sistem
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default Topbar;
