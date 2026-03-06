import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Define path
        const filename = `logo-${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const relativePath = `/uploads/${filename}`;
        const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

        await writeFile(filePath, buffer);

        // Update DB
        await prisma.systemSettings.upsert({
            where: { id: "current" },
            update: { logoUrl: relativePath },
            create: { id: "current", logoUrl: relativePath }
        });

        return NextResponse.json({ success: true, logoUrl: relativePath });
    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Failed to upload logo" }, { status: 500 });
    }
}
