import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        let settings = await prisma.systemSettings.findUnique({
            where: { id: "current" }
        });

        if (!settings) {
            settings = await prisma.systemSettings.create({
                data: { id: "current" }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error("GET Settings Error:", error);
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();

        const settings = await prisma.systemSettings.upsert({
            where: { id: "current" },
            update: {
                appName: data.appName,
                instansiName: data.instansiName,
                satuanInduk: data.satuanInduk,
                alamatKantor: data.alamatKantor,
                logoUrl: data.logoUrl,
                emailNotif: data.emailNotif,
                browserNotif: data.browserNotif,
                waNotif: data.waNotif,
                // SMTP fields
                // @ts-ignore
                smtpHost: data.smtpHost || null,
                // @ts-ignore
                smtpPort: data.smtpPort ? parseInt(data.smtpPort.toString()) : 587,
                // @ts-ignore
                smtpUser: data.smtpUser || null,
                // @ts-ignore
                smtpPass: data.smtpPass || null,
                // @ts-ignore
                smtpSecure: data.smtpSecure === true || data.smtpSecure === "true",
                // @ts-ignore
                smtpFromName: data.smtpFromName || "E-NIKAH DISBINTALAD",
                // @ts-ignore
                smtpFromEmail: data.smtpFromEmail || "no-reply@e-nikah.mil.id",
            },
            create: {
                id: "current",
                appName: data.appName,
                instansiName: data.instansiName,
                satuanInduk: data.satuanInduk,
                alamatKantor: data.alamatKantor,
                logoUrl: data.logoUrl,
                emailNotif: data.emailNotif,
                browserNotif: data.browserNotif,
                waNotif: data.waNotif,
                // SMTP fields
                // @ts-ignore
                smtpHost: data.smtpHost || null,
                // @ts-ignore
                smtpPort: data.smtpPort ? parseInt(data.smtpPort.toString()) : 587,
                // @ts-ignore
                smtpUser: data.smtpUser || null,
                // @ts-ignore
                smtpPass: data.smtpPass || null,
                // @ts-ignore
                smtpSecure: data.smtpSecure === true || data.smtpSecure === "true",
                // @ts-ignore
                smtpFromName: data.smtpFromName || "E-NIKAH DISBINTALAD",
                // @ts-ignore
                smtpFromEmail: data.smtpFromEmail || "no-reply@e-nikah.mil.id",
            }
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error("PUT Settings Error:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
