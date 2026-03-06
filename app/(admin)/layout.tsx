import AppLayout from "@/components/shared/AppLayout";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AppLayout role="admin_pusat" title="Admin Pusat Dashboard">
            {children}
        </AppLayout>
    );
}
