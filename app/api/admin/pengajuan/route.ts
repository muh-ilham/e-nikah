import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const religion = searchParams.get("religion");
        const id = searchParams.get("id");
        const list = searchParams.get("list");

        const where: any = {};
        if (religion) {
            where.agama = religion.toUpperCase();
        }
        if (id) {
            where.id = id;
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

        // Strip fileUrl from list view to keep payload small (Base64 is huge)
        const lightPengajuan = pengajuan.map(p => ({
            ...p,
            berkas: p.berkas.map(b => ({
                ...b,
                fileUrl: "" // Don't send Base64 in list
            }))
        }));

        return NextResponse.json(lightPengajuan);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
