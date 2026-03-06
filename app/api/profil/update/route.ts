import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const userId = formData.get("userId") as string;

        if (!userId) {
            return NextResponse.json({ error: "User ID tidak valid" }, { status: 400 });
        }

        const name = formData.get("name") as string;
        const nrp = formData.get("nrp") as string;
        const tempatLahir = formData.get("tempatLahir") as string;
        const tglLahirStr = formData.get("tglLahir") as string;
        const agama = formData.get("agama") as string;
        const hp = formData.get("hp") as string;
        const pangkatId = formData.get("pangkatId") as string;
        const jabatanId = formData.get("jabatanId") as string;
        const satuanId = formData.get("satuanId") as string;
        const alamat = formData.get("alamat") as string;
        const suku = formData.get("suku") as string;

        // Foto file handling - Switch to Base64 for Vercel
        const fotoFile = formData.get("foto") as File | null;
        let fotoUrl = null;

        if (fotoFile && fotoFile.size > 0) {
            const bytes = await fotoFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            fotoUrl = `data:${fotoFile.type};base64,${buffer.toString('base64')}`;
        }

        // Update User records mapping
        await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                nrp
            }
        });

        // Insert or Update ProfilPrajurit
        const tglLahir = tglLahirStr ? new Date(tglLahirStr) : null;

        const profilParams: any = {
            tempatLahir: tempatLahir || null,
            tglLahir: tglLahir && !isNaN(tglLahir.getTime()) ? tglLahir : null,
            agama: agama || null,
            hp: hp || null,
            suku: suku || null,
            alamat: alamat || null,
            pangkatId: pangkatId || null,
            jabatanId: jabatanId || null,
            satuanId: satuanId || null,
        };

        if (fotoUrl) {
            profilParams.fotoUrl = fotoUrl;
        }

        const profile = await prisma.profilPrajurit.upsert({
            where: { userId },
            update: profilParams,
            create: {
                ...profilParams,
                userId
            }
        });

        return NextResponse.json({ success: true, profile });
    } catch (error) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan saat menyimpan profil" }, { status: 500 });
    }
}
