import prisma from "@/lib/prisma";
export const dynamic = "force-dynamic";

export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    let settings = null;
    try {
        settings = await prisma.systemSettings.findUnique({
            where: { id: "current" }
        });
    } catch (error) {
        console.error("Failed to load settings in AuthLayout", error);
    }

    const appName = settings?.appName || "SISTEM PENGAJUAN NIKAH ONLINE";
    const instansiName = settings?.instansiName || "Tentara Nasional Indonesia Angkatan Darat";

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center p-4 bg-primary overflow-hidden">
            {/* Background patterns/effects */}
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(212,160,23,0.1),transparent_70%)]"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-light/30 blur-[120px] rounded-full"></div>
            </div>

            <div className="z-10 w-full max-w-7xl flex flex-col items-center">
                {settings?.logoUrl ? (
                    <div className="w-20 h-20 mb-4 bg-white rounded-2xl shadow-xl border-4 border-white/20 overflow-hidden flex items-center justify-center p-2">
                        <img src={settings.logoUrl} alt="Logo Instansi" className="w-full h-full object-contain" />
                    </div>
                ) : (
                    <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center font-bold text-primary mx-auto mb-4 shadow-xl border border-white/20">
                        AD
                    </div>
                )}

                {children}

                <footer className="mt-12 text-white/30 text-[10px] uppercase tracking-tighter">
                    &copy; {new Date().getFullYear()} {settings?.instansiName || "DISBINTALAD"}. ALL RIGHTS RESERVED.
                </footer>
            </div>
        </div>
    );
}
