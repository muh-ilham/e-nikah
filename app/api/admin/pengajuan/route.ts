import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const religion = searchParams.get("religion");

        const where: any = {};
        if (religion) {
            where.agama = religion.toUpperCase();
        }

        const pengajuan = await prisma.pengajuanNikah.findMany({
            where,
            orderBy: { createdAt: 'desc' },
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

        // Map to simpler format for table if needed, or just return all
        return NextResponse.json(pengajuan);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
