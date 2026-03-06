import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Allowed master data types and their corresponding Prisma models
const TYPE_MAP: Record<string, any> = {
    pangkat: prisma.masterPangkat,
    satuan: prisma.masterSatuan,
    jabatan: prisma.masterJabatan,
    berkas: prisma.masterBerkas,
};

export async function GET(req: Request, { params }: { params: { type: string } }) {
    const { type } = params;

    if (!TYPE_MAP[type]) {
        return NextResponse.json({ error: "Invalid master data type" }, { status: 400 });
    }

    try {
        const orderBy = type === "berkas" ? { urut: 'asc' } : { nama: 'asc' };

        // Fetch data
        const data = await TYPE_MAP[type].findMany({
            orderBy,
        });

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { type: string } }) {
    const { type } = params;

    if (!TYPE_MAP[type]) {
        return NextResponse.json({ error: "Invalid master data type" }, { status: 400 });
    }

    try {
        const body = await req.json();

        // Prevent duplicate names
        const existing = await TYPE_MAP[type].findFirst({
            where: { nama: body.nama }
        });

        if (existing) {
            return NextResponse.json({ error: `${type} dengan nama tersebut sudah ada.` }, { status: 400 });
        }

        const data = await TYPE_MAP[type].create({
            data: body,
        });

        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
