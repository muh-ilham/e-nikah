import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { email, password, role } = await request.json();

        // Generic login logic for both Prajurit and Admin
        if (!email || !password) {
            return NextResponse.json({ error: "Email/NRP dan Password wajib diisi" }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { nrp: email }],
                // Filter role based on request if provided, otherwise allow anyway and check role later
                role: role === "prajurit" ? "prajurit" : { in: ["admin_pusat", "admin_agama"] }
            },
            include: {
                profilPrajurit: {
                    include: {
                        pangkat: true
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "Akun tidak ditemukan atau role tidak sesuai" }, { status: 404 });
        }

        // Check password
        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(password, user.password);
        } catch (e) {
            console.error("Bcrypt error:", e);
        }

        // Fallback to plain comparison ONLY if bcrypt fails and it looks like a plain password (or for dev environment)
        if (!isMatch && password === user.password) {
            isMatch = true;
        }

        if (!isMatch) {
            console.log(`Login failed for ${email}: Password mismatch`);
            return NextResponse.json({ error: "Password salah" }, { status: 401 });
        }

        if (user.role === "prajurit") {
            if (user.status === "pending") {
                return NextResponse.json({ error: "Akun Anda belum disetujui oleh Admin Pusat." }, { status: 403 });
            }
            if (user.status === "rejected") {
                return NextResponse.json({ error: "Akun Anda ditolak oleh Admin Pusat." }, { status: 403 });
            }
        }

        const hasProfile = !!user.profilPrajurit;

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                agamaId: user.agamaId,
                fotoUrl: user.profilPrajurit?.fotoUrl
            },
            requireProfile: user.role === "prajurit" && !hasProfile
        });

    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
    }
}
