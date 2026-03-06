import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(
    req: Request,
    { params }: { params: { type: string } }
) {
    const type = params.type;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const kategori = searchParams.get("kategori") || "";
    const jenisPengajuan = searchParams.get("jenisPengajuan") || "";
    const agama = searchParams.get("agama") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    try {
        let data;
        let total = 0;
        const where: any = {};

        if (search) {
            where.nama = { contains: search };
        }

        switch (type) {
            case 'pangkat':
                total = await prisma.masterPangkat.count({ where });
                data = await prisma.masterPangkat.findMany({
                    where,
                    orderBy: { nama: 'asc' },
                    skip,
                    take: limit
                });
                break;
            case 'satuan':
                total = await prisma.masterSatuan.count({ where });
                data = await prisma.masterSatuan.findMany({
                    where,
                    orderBy: { nama: 'asc' },
                    skip,
                    take: limit
                });
                break;
            case 'jabatan':
                total = await prisma.masterJabatan.count({ where });
                data = await prisma.masterJabatan.findMany({
                    where,
                    orderBy: { nama: 'asc' },
                    skip,
                    take: limit
                });
                break;
            case 'berkas':
                if (kategori && kategori !== 'semua') where.kategori = kategori;
                if (jenisPengajuan && jenisPengajuan !== 'semua') where.jenisPengajuan = jenisPengajuan;
                if (agama && agama !== 'semua') where.agama = agama;

                total = await prisma.masterBerkas.count({ where });
                data = await prisma.masterBerkas.findMany({
                    where,
                    orderBy: { urut: 'asc' },
                    skip,
                    take: limit
                });
                break;
            default:
                return NextResponse.json({ error: "Tipe master data tidak valid" }, { status: 400 });
        }
        return NextResponse.json({
            data,
            total,
            page,
            limit,
            debug: {
                type,
                where,
                foundCount: data?.length || 0,
                dbUrlSet: !!process.env.DATABASE_URL
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: { type: string } }
) {
    const type = params.type;
    const body = await req.json();

    try {
        let result;
        switch (type) {
            case 'pangkat':
                result = await prisma.masterPangkat.create({
                    data: {
                        nama: body.nama,
                        korps: body.korps,
                        aktif: body.aktif ?? true
                    }
                });
                break;
            case 'satuan':
                result = await prisma.masterSatuan.create({
                    data: {
                        nama: body.nama,
                        aktif: body.aktif ?? true
                    }
                });
                break;
            case 'jabatan':
                result = await prisma.masterJabatan.create({
                    data: {
                        nama: body.nama,
                        aktif: body.aktif ?? true
                    }
                });
                break;
            case 'berkas':
                result = await prisma.masterBerkas.create({
                    data: {
                        nama: body.nama,
                        wajib: body.wajib ?? true,
                        kategori: body.kategori || "umum",
                        jenisPengajuan: body.jenisPengajuan || "NIKAH",
                        agama: body.agama || null,
                        aktif: body.aktif ?? true,
                        urut: parseInt(body.urut) || 0
                    }
                });
                break;
            default:
                return NextResponse.json({ error: "Tipe master data tidak valid" }, { status: 400 });
        }
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { type: string } }
) {
    const type = params.type;
    const body = await req.json();
    const { id, ...data } = body;

    try {
        let result;
        switch (type) {
            case 'pangkat':
                result = await prisma.masterPangkat.update({
                    where: { id },
                    data: {
                        nama: data.nama,
                        korps: data.korps,
                        aktif: data.aktif
                    }
                });
                break;
            case 'satuan':
                result = await prisma.masterSatuan.update({
                    where: { id },
                    data: {
                        nama: data.nama,
                        aktif: data.aktif
                    }
                });
                break;
            case 'jabatan':
                result = await prisma.masterJabatan.update({
                    where: { id },
                    data: {
                        nama: data.nama,
                        aktif: data.aktif
                    }
                });
                break;
            case 'berkas':
                result = await prisma.masterBerkas.update({
                    where: { id },
                    data: {
                        nama: data.nama,
                        wajib: data.wajib,
                        kategori: data.kategori,
                        jenisPengajuan: data.jenisPengajuan,
                        agama: data.agama,
                        aktif: data.aktif,
                        urut: parseInt(data.urut) || 0
                    }
                });
                break;
            default:
                return NextResponse.json({ error: "Tipe master data tidak valid" }, { status: 400 });
        }
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { type: string } }
) {
    const type = params.type;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });

    try {
        switch (type) {
            case 'pangkat':
                await prisma.masterPangkat.delete({ where: { id } });
                break;
            case 'satuan':
                await prisma.masterSatuan.delete({ where: { id } });
                break;
            case 'jabatan':
                await prisma.masterJabatan.delete({ where: { id } });
                break;
            case 'berkas':
                await prisma.masterBerkas.delete({ where: { id } });
                break;
            default:
                return NextResponse.json({ error: "Tipe master data tidak valid" }, { status: 400 });
        }
        return NextResponse.json({ message: "Berhasil dihapus" });
    } catch (error: any) {
        // Handle constraint errors if data is being used
        if (error.code === 'P2003') {
            return NextResponse.json({ error: "Data ini tidak bisa dihapus karena sedang digunakan oleh profil prajurit." }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
