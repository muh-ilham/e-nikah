import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { name, nrp, email, password, pangkatId, jabatanId, satuanId } = await request.json();

        if (!name || !nrp || !email || !password) {
            return NextResponse.json({ error: "Semua kolom wajib diisi" }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { nrp }
                ]
            }
        });

        if (existingUser) {
            return NextResponse.json({ error: "Email atau NRP sudah terdaftar" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                nrp,
                email,
                password: hashedPassword,
                role: "prajurit",
                status: "pending",
                profilPrajurit: {
                    create: {
                        pangkatId: pangkatId || null,
                        jabatanId: jabatanId || null,
                        satuanId: satuanId || null,
                    }
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                nrp: true,
                status: true
            }
        });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error("Register Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan saat mendaftar" }, { status: 500 });
    }
}
