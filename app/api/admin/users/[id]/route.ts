import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        // The original instruction had `const body = await req.json();` which is incorrect for GET.
        // I will omit this line as it's not part of the core instruction and is syntactically incorrect for GET.
        // The instruction also had `{{ ... }}` indicating an incomplete body.
        // I will just add the try-catch block and the id extraction.
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                profilPrajurit: {
                    include: {
                        pangkat: true,
                        satuan: true,
                        jabatan: true,
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await req.json();

        // Destructure data
        const { name, nrp, hp, alamat, pangkatId, satuanId, jabatanId, role, password, agamaId } = body;

        // Update User
        const user = await prisma.user.update({
            where: { id },
            data: {
                name,
                nrp,
                role,
                password,
                agamaId: (role === 'admin_agama' ? agamaId : null)
            },
        });

        // Update or Create ProfilPrajurit
        const profil = await prisma.profilPrajurit.upsert({
            where: { userId: id },
            update: {
                hp,
                alamat,
                pangkatId: pangkatId || null,
                satuanId: satuanId || null,
                jabatanId: jabatanId || null,
            },
            create: {
                userId: id,
                hp,
                alamat,
                pangkatId: pangkatId || null,
                satuanId: satuanId || null,
                jabatanId: jabatanId || null,
            }
        });

        return NextResponse.json({ success: true, user, profil });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        // Validasi: Cek apakah user ada
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
        }

        // Hapus user
        await prisma.user.delete({
            where: { id },
        });

        console.log(`User deleted: ${id} (${user.email})`);
        return NextResponse.json({ success: true, message: "User berhasil dihapus" });
    } catch (error: any) {
        console.error("Delete user error:", error);

        // Handle specific Prisma errors (e.g. foreign key)
        if (error.code === 'P2003') {
            return NextResponse.json({
                error: "Tidak bisa menghapus pengguna karena masih memiliki data terkait yang aktif (Foreign Key Constraint)."
            }, { status: 400 });
        }

        return NextResponse.json({ error: error.message || "Gagal menghapus pengguna" }, { status: 500 });
    }
}
