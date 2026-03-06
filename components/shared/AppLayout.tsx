import Sidebar from "@/components/shared/Sidebar";
import Topbar from "@/components/shared/Topbar";

export default function AppLayout({
    children,
    role,
    title,
    agamaLabel,
}: {
    children: React.ReactNode;
    role: "prajurit" | "admin_pusat" | "admin_agama";
    title: string;
    agamaLabel?: string;
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex overflow-hidden">
            {/* Sidebar hidden on mobile, visible on desktop */}
            <div className="hidden lg:block">
                <Sidebar role={role} agamaLabel={agamaLabel} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-64 flex flex-col h-screen overflow-hidden">
                <Topbar title={title} role={role} agamaLabel={agamaLabel} />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
