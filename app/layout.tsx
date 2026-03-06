import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

import prisma from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  let settings = null;
  try {
    settings = await prisma.systemSettings.findUnique({
      where: { id: "current" }
    });
  } catch (error) {
    console.error("Failed to load settings in RootLayout metadata", error);
  }

  const appName = settings?.appName || "Sistem Pengajuan Nikah Online";
  const instansiName = settings?.instansiName || "TNI AD";

  return {
    title: `${appName} - ${instansiName}`,
    description: "Aplikasi pengajuan dan verifikasi nikah bagi prajurit",
    icons: {
      icon: settings?.logoUrl || "/favicon.ico",
    }
  };
}

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${jakarta.variable} font-sans antialiased`}>
        {children}
        {/* @ts-ignore */}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
