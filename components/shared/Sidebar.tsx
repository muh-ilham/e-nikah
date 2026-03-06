// @ts-nocheck
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Home,
    FileText,
    User,
    Settings,
    Users,
    Database,
    CheckCircle,
    LogOut,
    ChevronRight,
    History,
    FileText as FileTextIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Role = "prajurit" | "admin_pusat" | "admin_agama";

interface SidebarProps {
    role: Role;
    agamaLabel?: string;
    onItemClick?: () => void;
}

const Sidebar = ({ role, agamaLabel, onItemClick }: SidebarProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const [settings, setSettings] = useState<any>(null);
    const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

    useEffect(() => {
        // Force Vercel cache break
        console.log("Rendering Sidebar for role:", role);
    }, [role]);

    useEffect(() => {
        const loadSettings = () => {
            fetch("/api/identitas-instansi?t=" + Date.now(), { cache: 'no-store' })
                .then((res) => res.json())
                .then((data) => {
                    if (!data.error) {
                        setSettings(data);
                    }
                })
                .catch(console.error);
        };

        loadSettings();

        window.addEventListener("settingsUpdated", loadSettings);
        return () => window.removeEventListener("settingsUpdated", loadSettings);
    }, []);

    useEffect(() => {

        // Auto expand if current path is a sub-item
        if (pathname.includes("/master-data")) {
            setExpandedMenus(["Master Data"]);
        }
    }, [pathname]);

    const toggleMenu = (label: string) => {
        setExpandedMenus(prev =>
            prev.includes(label)
                ? prev.filter(l => l !== label)
                : [...prev, label]
        );
    };

    const getMenu = () => {
        const icons: Record<string, any> = { Home, FileText, User, Settings, Users, Database, CheckCircle };
        switch (role) {
            case "prajurit":
                return [
                    { label: "Beranda", icon: Home as any, href: "/beranda" },
                    { label: "Pengajuan", icon: FileText as any, href: "/pengajuan" },
                    { label: "Riwayat Pengajuan", icon: History as any, href: "/pengajuan/riwayat" },
                    { label: "Profil Saya", icon: User as any, href: "/profil" },
                ];
            case "admin_pusat":
                return [
                    { label: "Beranda", icon: Home as any, href: "/admin/beranda" },
                    { label: "Verifikasi", icon: CheckCircle as any, href: "/admin/verifikasi" },
                    {
                        label: "Master Data",
                        icon: Database as any,
                        href: "#",
                        sub: [
                            { label: "Berkas", href: "/admin/master-data/berkas" },
                            { label: "Pangkat", href: "/admin/master-data/pangkat" },
                            { label: "Jabatan", href: "/admin/master-data/jabatan" },
                            { label: "Satuan", href: "/admin/master-data/satuan" },
                        ]
                    },
                    { label: "Pengguna", icon: Users as any, href: "/admin/pengguna" },
                    { label: "Laporan", icon: FileTextIcon as any, href: "/admin/laporan" },
                    { label: "Profil", icon: User as any, href: "/admin/profil" },
                    { label: "Pengaturan", icon: Settings as any, href: "/admin/pengaturan" },
                ];
            case "admin_agama":
                return [
                    { label: "Beranda", icon: Home as any, href: "/admin-agama/beranda" },
                    { label: "Verifikasi", icon: CheckCircle as any, href: "/admin-agama/verifikasi" },
                    { label: "Laporan", icon: FileTextIcon as any, href: "/admin-agama/laporan" },
                    { label: "Profil Saya", icon: User as any, href: "/admin-agama/profil" },
                ];
            default:
                return [];
        }
    };

    const handleLogout = () => {
        if (role === "admin_pusat" || role === "admin_agama") {
            router.push("/login");
        } else {
            router.push("/login");
        }
    };

    const menuItems = getMenu();

    return (
        <div className="w-64 bg-primary text-white h-screen flex flex-col fixed left-0 top-0 z-50">
            {/* Logo Area */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    {settings?.logoUrl ? (
                        <div className="w-12 h-12 bg-white rounded flex items-center justify-center shrink-0 p-1 overflow-hidden">
                            <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center font-bold text-primary shrink-0">
                            AD
                        </div>
                    )}
                    <div>
                        <h1 className="font-heading font-bold text-sm leading-tight text-white flex flex-col">
                            <span>{settings?.appName || "E-NIKAH"}</span>
                            {settings?.instansiName && (
                                <span className="text-secondary text-xs">{settings.instansiName}</span>
                            )}
                        </h1>
                        <p className="text-[10px] text-white/60 mt-0.5">
                            {settings?.satuanInduk || "TNI Angkatan Darat"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Admin Agama Label if applicable */}
            {role === "admin_agama" && agamaLabel && (
                <div className="px-6 py-2 bg-secondary/20 border-b border-white/10">
                    <span className="text-[10px] uppercase font-bold text-secondary">{agamaLabel}</span>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isExpanded = expandedMenus.includes(item.label);
                    const hasSub = !!item.sub;
                    const isActive = pathname === item.href || (hasSub && pathname.includes("/master-data") && item.label === "Master Data");

                    return (
                        <div key={item.label}>
                            {hasSub ? (
                                <button
                                    onClick={() => toggleMenu(item.label)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                                        isActive
                                            ? "bg-secondary text-primary"
                                            : "text-white/70 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                    <ChevronRight className={cn(
                                        "w-3 h-3 ml-auto opacity-50 transition-transform duration-200",
                                        isExpanded && "rotate-90"
                                    )} />
                                </button>
                            ) : (
                                <Link
                                    href={item.href}
                                    onClick={onItemClick}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                                        pathname === item.href
                                            ? "bg-secondary text-primary"
                                            : "text-white/70 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            )}

                            {/* Submenu rendering if applicable */}
                            {hasSub && isExpanded && (
                                <div className="ml-9 mt-1 space-y-1 border-l border-white/10">
                                    {item.sub.map((sub) => (
                                        <Link
                                            key={sub.label}
                                            href={sub.href}
                                            onClick={onItemClick}
                                            className={cn(
                                                "block px-3 py-1.5 text-xs transition-colors",
                                                pathname === sub.href
                                                    ? "text-secondary font-bold"
                                                    : "text-white/50 hover:text-white"
                                            )}
                                        >
                                            {sub.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 gap-3 px-3"
                >
                    <LogOut className="w-4 h-4" />
                    Keluar
                </Button>
            </div>
        </div>
    );
};

export default Sidebar;
