import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import path from "path";

export async function GET() {
    try {
        const dbPath = path.join(process.cwd(), "prisma", "dev.db");

        if (!existsSync(dbPath)) {
            return NextResponse.json({ error: "Database file not found" }, { status: 404 });
        }

        const fileBuffer = readFileSync(dbPath);

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Disposition": `attachment; filename="enikah_backup_${new Date().toISOString().split('T')[0]}.sqlite"`,
                "Content-Type": "application/x-sqlite3",
            }
        });
    } catch (error) {
        console.error("Backup DB Error:", error);
        return NextResponse.json({ error: "Failed to backup database" }, { status: 500 });
    }
}
