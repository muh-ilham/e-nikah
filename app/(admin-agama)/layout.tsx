import AppLayout from "@/components/shared/AppLayout";

export default function AdminAgamaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AppLayout role="admin_agama" title="Dashboard Admin Agama" agamaLabel="ADMIN AGAMA">
            {children}
        </AppLayout>
    );
}
