import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail, getOrderApprovalTemplate, getOrderRevisionTemplate, getOrderRejectionTemplate } from "@/lib/mail";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        const body = await request.json();
        const { status, catatanAdmin, jadwalKedatangan } = body;

        if (!status) {
            return NextResponse.json({ error: "Status harus diisi" }, { status: 400 });
        }

        // Update data pengajuan
        const updatedPengajuan = await prisma.pengajuanNikah.update({
            where: { id },
            data: {
                status,
                catatanAdmin: catatanAdmin || null,
                jadwalKedatangan: jadwalKedatangan ? new Date(jadwalKedatangan) : null,
            },
            include: {
                user: {
                    include: {
                        profilPrajurit: {
                            include: {
                                pangkat: true,
                                satuan: true
                            }
                        }
                    }
                }
            }
        });

        // Handle Email Notifications
        if (['Disetujui', 'Revisi', 'Ditolak'].includes(status) && updatedPengajuan.user) {
            const settings = await prisma.systemSettings.findUnique({
                where: { id: "current" }
            });

            if (settings?.emailNotif !== false) {
                let emailHtml = "";
                let emailSubject = "";

                if (status === 'Disetujui') {
                    let jadwalStr = "";
                    if (updatedPengajuan.jadwalKedatangan) {
                        jadwalStr = format(new Date(updatedPengajuan.jadwalKedatangan), "EEEE, d MMMM yyyy 'Pukul' HH:mm", { locale: localeId });
                    }

                    const profilDetail = {
                        pangkat: updatedPengajuan.user.profilPrajurit?.pangkat?.nama || '',
                        satuan: updatedPengajuan.user.profilPrajurit?.satuan?.nama || '',
                        nrp: updatedPengajuan.user.nrp || ''
                    };

                    emailHtml = getOrderApprovalTemplate(
                        updatedPengajuan.user.name,
                        updatedPengajuan.noRegistrasi,
                        profilDetail,
                        jadwalStr,
                        updatedPengajuan.catatanAdmin || ''
                    );
                    emailSubject = `Pengajuan Nikah Disetujui - ${updatedPengajuan.noRegistrasi}`;

                } else if (status === 'Revisi') {
                    emailHtml = getOrderRevisionTemplate(
                        updatedPengajuan.user.name,
                        updatedPengajuan.noRegistrasi,
                        updatedPengajuan.catatanAdmin || 'Perlu perbaikan berkas'
                    );
                    emailSubject = `Pengajuan Nikah Perlu Direvisi - ${updatedPengajuan.noRegistrasi}`;

                } else if (status === 'Ditolak') {
                    emailHtml = getOrderRejectionTemplate(
                        updatedPengajuan.user.name,
                        updatedPengajuan.noRegistrasi,
                        updatedPengajuan.catatanAdmin || 'Tidak memenuhi syarat'
                    );
                    emailSubject = `Pengajuan Nikah Ditolak - ${updatedPengajuan.noRegistrasi}`;
                }

                if (emailHtml) {
                    await sendEmail(
                        updatedPengajuan.user.email,
                        emailSubject,
                        emailHtml
                    );
                }
            }
        }

        return NextResponse.json({ success: true, data: updatedPengajuan });
    } catch (error: any) {
        console.error("Error updating pengajuan status:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        const pengajuan = await prisma.pengajuanNikah.findUnique({
            where: { id },
            include: {
                user: {
                    include: {
                        profilPrajurit: {
                            include: {
                                satuan: true,
                                pangkat: true,
                                jabatan: true
                            }
                        }
                    }
                },
                berkas: {
                    include: {
                        masterBerkas: true
                    }
                }
            }
        });

        if (!pengajuan) {
            return NextResponse.json({ error: "Pengajuan tidak ditemukan" }, { status: 404 });
        }

        return NextResponse.json(pengajuan);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
