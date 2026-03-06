import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendEmail, getAccountApprovalTemplate, getAccountRejectionTemplate } from "@/lib/mail";

const prisma = new PrismaClient();

export async function POST(request: Request, context: any) {
    try {
        const { params } = context;
        const userId = params.id;

        const { status } = await request.json(); // should be 'approved' or 'rejected'

        if (status !== 'approved' && status !== 'rejected') {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { status }
        });

        // Kirim email notifikasi jika pengaturan email aktif
        const settings = await prisma.systemSettings.findUnique({
            where: { id: "current" }
        });

        if (settings?.emailNotif !== false) {
            if (status === 'approved') {
                const emailHtml = getAccountApprovalTemplate(user.name);
                await sendEmail(user.email, "Akun E-NIKAH Anda Telah Disetujui", emailHtml);
            } else if (status === 'rejected') {
                const emailHtml = getAccountRejectionTemplate(user.name);
                await sendEmail(user.email, "Status Pendaftaran Akun E-NIKAH: DITOLAK", emailHtml);
            }
        }

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error("Update User Status Error:", error);
        return NextResponse.json({ error: "Failed to update user status" }, { status: 500 });
    }
}
