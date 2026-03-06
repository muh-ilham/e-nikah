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
        console.error("GET Identitas Error:", error);
        return NextResponse.json({ error: "Failed to fetch identitas" }, { status: 500 });
    }
}
