import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

        // Update DB
        await prisma.systemSettings.upsert({
            where: { id: "current" },
            update: { logoUrl: base64Image },
            create: { id: "current", logoUrl: base64Image }
        });

        return NextResponse.json({ success: true, logoUrl: base64Image });
    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Failed to upload logo" }, { status: 500 });
    }
}
