import { NextResponse } from "next/server";

export async function GET() {
    // Daftar agama statis sesuai kebutuhan militer/instansi
    const daftarAgama = [
        { id: "ISLAM", nama: "ISLAM" },
        { id: "PROTESTAN", nama: "KRISTEN PROTESTAN" },
        { id: "KATOLIK", nama: "KRISTEN KATOLIK" },
        { id: "HINDU", nama: "HINDU" },
        { id: "BUDDHA", nama: "BUDDHA" },
        { id: "KHONGHUCU", nama: "KHONGHUCU" },
    ];

    return NextResponse.json(daftarAgama);
}
