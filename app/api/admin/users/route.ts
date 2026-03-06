import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendEmail, getAccountApprovalTemplate } from "@/lib/mail";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const role = searchParams.get("role");

        const where: any = {};
        if (role) where.role = role;

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                nrp: true,
                email: true,
                password: true, // Sertakan password
                status: true,
                role: true,
                agamaId: true,
                createdAt: true,
                profilPrajurit: {
                    select: {
                        fotoUrl: true,
                        hp: true,
                        alamat: true,
                        pangkat: true,
                        satuan: true,
                        jabatan: true,
                        pangkatId: true,
                        satuanId: true,
                        jabatanId: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, role, nrp, agamaId } = body;

        if (!name || !email || !role) {
            return NextResponse.json({ error: "Name, email, and role are required" }, { status: 400 });
        }

        // Check if email or nrp already exists
        const existingEmail = await prisma.user.findUnique({ where: { email } });
        if (existingEmail) return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });

        if (nrp) {
            const existingNRP = await prisma.user.findUnique({ where: { nrp } });
            if (existingNRP) return NextResponse.json({ error: "NRP sudah terdaftar" }, { status: 400 });
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: password || "123456", // Default password
                role,
                nrp: nrp || null,
                agamaId: agamaId || null,
                status: role === "prajurit" ? "pending" : "approved", // Admin agama langsung active
            },
        });

        // If prajurit, create profile with provided data
        if (role === "prajurit") {
            await prisma.profilPrajurit.create({
                data: {
                    userId: user.id,
                    pangkatId: body.pangkatId || null,
                    satuanId: body.satuanId || null,
                    jabatanId: body.jabatanId || null,
                    hp: body.hp || null,
                    alamat: body.alamat || null,
                    fotoUrl: body.fotoUrl || null,
                }
            });
        }

        // Send email if user is instantly approved
        if (user.status === "approved") {
            const settings = await prisma.systemSettings.findUnique({
                where: { id: "current" }
            });
            if (settings?.emailNotif !== false) {
                const emailHtml = getAccountApprovalTemplate(user.name);
                await sendEmail(user.email, "Akun E-NIKAH Anda Telah Disetujui", emailHtml);
            }
        }

        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        console.error("Create user error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
