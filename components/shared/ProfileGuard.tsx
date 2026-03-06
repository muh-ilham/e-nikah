// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProfileGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkProfile = () => {
            const userStr = localStorage.getItem("user_prajurit");
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    // Check if the user object in localStorage has the 'fotoUrl' property or 'profilPrajurit' property.
                    // When the profile is successfully created, these will be populated.
                    // Wait, sometimes the API returns `requireProfile` on login based on `user.profilPrajurit`.
                    // The simplest way to know if a profile is complete is checking if we know their `pangkatId` or `satuanId` or `agama`,
                    // or if the `fotoUrl` flag is set (assuming it's filled or handled during completion).
                    // Wait, looking at lengkapi-profil, it saves `name` and `nrp` to local storage, but how do we know it's *complete*?
                    // Actually, let's call the `api/profil/me` endpoint to be absolutely sure, but we don't want to block rendering on every load if possible.
                    // No, `login/page.tsx` receives `data.requireProfile` and sets it somewhere. But the user didn't exist yet on subsequent loads.
                    // The best way for a persistent check without blocking is to check local storage first. Jika tidak yakin, kita fetch ke `/api/profil/me`.

                    const verifyProfile = async () => {
                        try {
                            const res = await fetch(`/api/profil/me?userId=${user.id}`);
                            if (res.ok) {
                                const data = await res.json();
                                // If profilPrajurit is missing essential fields, it's incomplete.
                                const p = data.profilPrajurit;
                                if (!p || !p.hp || !p.tempatLahir || !p.tglLahir || !p.agama) {
                                    if (pathname !== "/lengkapi-profil") {
                                        router.push("/lengkapi-profil");
                                    } else {
                                        setIsChecking(false);
                                    }
                                } else {
                                    setIsChecking(false);
                                }
                            } else {
                                setIsChecking(false); // Let it pass or handle error
                            }
                        } catch (e) {
                            setIsChecking(false);
                        }
                    };

                    verifyProfile();

                } catch (e) {
                    setIsChecking(false);
                }
            } else {
                setIsChecking(false);
            }
        };

        checkProfile();
    }, [pathname, router]);

    if (isChecking) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm font-bold text-slate-500 animate-pulse">Memverifikasi Kelengkapan Data...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
