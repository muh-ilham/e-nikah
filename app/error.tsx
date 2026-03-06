"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 text-slate-900">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-200">
                <h2 className="text-xl font-bold mb-4">Sesuatu Telah Terjadi</h2>
                <p className="text-sm text-slate-500 mb-6 font-mono break-all bg-slate-100 p-3 rounded">
                    {error.message || "An unexpected error occurred."}
                </p>
                <Button onClick={() => reset()} className="w-full">
                    Coba Lagi
                </Button>
            </div>
        </div>
    );
}
