import AppLayout from "@/components/shared/AppLayout";
import ProfileGuard from "@/components/shared/ProfileGuard";

export default function PrajuritLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProfileGuard>
            <AppLayout role="prajurit" title="Beranda Prajurit">
                {children}
            </AppLayout>
        </ProfileGuard>
    );
}
