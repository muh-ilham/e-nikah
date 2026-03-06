import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TYPE_MAP: Record<string, any> = {
    pangkat: prisma.masterPangkat,
    satuan: prisma.masterSatuan,
    jabatan: prisma.masterJabatan,
    berkas: prisma.masterBerkas,
};

export async function PUT(req: Request, { params }: { params: { type: string; id: string } }) {
    const { type, id } = params;

    if (!TYPE_MAP[type]) {
        return NextResponse.json({ error: "Invalid master data type" }, { status: 400 });
    }

    try {
        const body = await req.json();

        // Check if item exists
        const existing = await TYPE_MAP[type].findUnique({
            where: { id }
        });

        if (!existing) {
            return NextResponse.json({ error: `${type} tidak ditemukan.` }, { status: 404 });
        }

        // Prevent duplicate names when updating, excluding the current one
        if (body.nama && body.nama !== existing.nama) {
            const duplicate = await TYPE_MAP[type].findFirst({
                where: { nama: body.nama }
            });
            if (duplicate) {
                return NextResponse.json({ error: `${type} dengan nama tersebut sudah ada.` }, { status: 400 });
            }
        }

        const data = await TYPE_MAP[type].update({
            where: { id },
            data: body,
        });

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { type: string; id: string } }) {
    const { type, id } = params;

    if (!TYPE_MAP[type]) {
        return NextResponse.json({ error: "Invalid master data type" }, { status: 400 });
    }

    try {
        // Check if item exists
        const existing = await TYPE_MAP[type].findUnique({
            where: { id }
        });

        if (!existing) {
            return NextResponse.json({ error: `${type} tidak ditemukan.` }, { status: 404 });
        }

        await TYPE_MAP[type].delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: "Data ini tidak dapat dihapus karena sedang digunakan oleh data lain." }, { status: 500 });
    }
}
