"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, Search, Heart, HeartOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function LaporanAdminAgamaPage() {
    const [adminAgama, setAdminAgama] = useState<string>("");
    const [year, setYear] = useState<string>(new Date().getFullYear().toString());
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user_admin_agama");
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                if (userData.agamaId) {
                    setAdminAgama(userData.agamaId);
                }
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
    }, []);

    const fetchLaporan = async (selectedYear: string, agama: string) => {
        setLoading(true);
        try {
            const url = `/api/admin/laporan?year=${selectedYear}${agama ? `&agama=${agama}` : ''}`;
            const res = await fetch(url);
            const result = await res.json();
            if (!result.error) {
                setData(result);
            }
        } catch (error) {
            console.error("Failed to fetch laporan data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (adminAgama !== undefined) {
            fetchLaporan(year, adminAgama);
        }
    }, [year, adminAgama]);

    const handleExportPDF = () => {
        window.print();
    };

    if (loading && !data) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="font-bold animate-pulse text-sm">MEMUAT DATA LAPORAN...</p>
            </div>
        );
    }

    const { summary, table } = data || {
        summary: { totalNikah: 0, totalCeraiTalakRujuk: 0 },
        table: {}
    };

    const categories = [
        { key: "NIKAH", label: "I. DATA NIKAH" },
        { key: "CERAI", label: "II. DATA CERAI" },
        { key: "TALAK", label: "III. DATA TALAK" },
        { key: "RUJUK", label: "IV. DATA RUJUK" }
    ];

    const golongans = ["Perwira", "Bintara", "Tamtama", "PNS"];
    const months = [
        ["JAN", "FEB", "MAR"],
        ["APR", "MEI", "JUN"],
        ["JUL", "AGU", "SEP"],
        ["OKT", "NOV", "DES"]
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-700 print:bg-white print:p-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">Laporan Data {year}</h2>
                        <p className="text-sm text-slate-500 font-medium">Rekapitulasi data pengajuan khusus agama {adminAgama || 'Semua'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search data..."
                            className="pl-9 bg-white border-slate-200"
                        />
                    </div>
                    <Button onClick={handleExportPDF} className="bg-amber-500 hover:bg-amber-600 text-white gap-2 font-bold shadow-sm">
                        <Download className="w-4 h-4" /> EXPORT PDF
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
                <Card className="border-slate-200/60 shadow-sm overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-blue-100"></div>
                    <CardContent className="p-6 relative">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center border border-blue-200 shadow-sm text-blue-500">
                                <Heart className="w-7 h-7 fill-blue-500/20" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Nikah {year}</p>
                                <h3 className="text-3xl font-extrabold text-slate-800">{summary.totalNikah}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 shadow-sm overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-red-100"></div>
                    <CardContent className="p-6 relative">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center border border-red-200 shadow-sm text-red-500">
                                <HeartOff className="w-7 h-7 fill-red-500/20" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Cerai/Talak/Rujuk {year}</p>
                                <h3 className="text-3xl font-extrabold text-slate-800">{summary.totalCeraiTalakRujuk}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table Card */}
            <Card className="border-slate-200/60 shadow-sm print:border-none print:shadow-none">
                <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/50 print:bg-transparent pb-3">
                    <div>
                        <CardTitle className="text-sm font-bold text-slate-800">Rekapitulasi Data Triwulan I - IV</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 print:hidden">
                        <span className="text-xs font-bold text-slate-500">Tahun:</span>
                        <Select value={year} onValueChange={setYear}>
                            <SelectTrigger className="w-24 h-8 text-xs font-bold bg-white border-slate-200">
                                <SelectValue placeholder="Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2023">2023</SelectItem>
                                <SelectItem value="2024">2024</SelectItem>
                                <SelectItem value="2025">2025</SelectItem>
                                <SelectItem value="2026">2026</SelectItem>
                                <SelectItem value="2027">2027</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto print:overflow-visible">
                        {loading && data ? (
                            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : null}

                        <table className="w-full text-[11px] text-center border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                                    <th className="py-3 px-4 text-left border-b border-r border-slate-200 w-1/5" rowSpan={2}>
                                        Kategori / Golongan
                                    </th>
                                    <th className="py-2 border-b border-r border-slate-200" colSpan={3}>TRIWULAN I</th>
                                    <th className="py-2 border-b border-r border-slate-200" colSpan={3}>TRIWULAN II</th>
                                    <th className="py-2 border-b border-r border-slate-200" colSpan={3}>TRIWULAN III</th>
                                    <th className="py-2 border-b border-r border-slate-200" colSpan={3}>TRIWULAN IV</th>
                                    <th className="py-3 px-2 border-b border-slate-200 bg-slate-100 text-slate-700" rowSpan={2}>
                                        JUMLAH
                                    </th>
                                </tr>
                                <tr className="bg-slate-50/80 text-[10px] text-slate-400 font-bold uppercase">
                                    {months.flat().map((month, idx) => (
                                        <th key={idx} className="py-2 border-b border-slate-200">{month}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {categories.map((cat, cIdx) => (
                                    <React.Fragment key={cat.key}>
                                        {/* Header Kategori */}
                                        <tr className="bg-slate-100/50">
                                            <td colSpan={14} className="py-2 px-4 text-left font-extrabold text-slate-700">
                                                {cat.label}
                                            </td>
                                        </tr>
                                        {/* Baris Golongan */}
                                        {golongans.map((gol) => {
                                            const rowData = table[cat.key]?.[gol] || Array(12).fill(0);
                                            const totalRow = rowData.reduce((a: number, b: number) => a + b, 0);
                                            return (
                                                <tr key={gol} className="hover:bg-slate-50 transition-colors">
                                                    <td className="py-2 px-4 text-left text-slate-600 font-medium pl-8 relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                        {gol}
                                                    </td>
                                                    {rowData.map((val: number, mIdx: number) => (
                                                        <td key={mIdx} className={"py-2 text-slate-500 font-medium " + (mIdx % 3 === 2 && mIdx !== 11 ? 'border-r border-slate-100' : '')}>
                                                            {val === 0 ? <span className="text-slate-300">0</span> : <span className="text-slate-900 font-bold">{val}</span>}
                                                        </td>
                                                    ))}
                                                    <td className="py-2 px-2 font-bold text-slate-800 bg-slate-50/50">
                                                        {totalRow}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold">
                                <tr>
                                    <td colSpan={10} className="py-4 border-r border-slate-200 text-right pr-6">
                                        <div className="flex flex-col items-end gap-1 uppercase tracking-wider">
                                            <span className="text-[10px] text-slate-400">Total Akumulasi Nikah</span>
                                            <span className="text-sm text-blue-600">{summary.totalNikah}</span>
                                        </div>
                                    </td>
                                    <td colSpan={4} className="py-4 text-center">
                                        <div className="flex flex-col items-center gap-1 uppercase tracking-wider">
                                            <span className="text-[10px] text-slate-400">Total Akumulasi Cerai/Talak/Rujuk</span>
                                            <span className="text-sm text-red-500">{summary.totalCeraiTalakRujuk}</span>
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Print Styles Configuration */}
            {/* Print Styles Configuration */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {size: landscape; margin: 1cm; }
                    body {background-color: white !important; }
                    .print\\hidden {display: none !important; }
                    .print\\bg-white {background-color: white !important; }
                    .print\\bg-transparent {background-color: transparent !important; }
                    .print\\border-none {border: none !important; }
                    .print\\shadow-none {box-shadow: none !important; }
                    .print\\overflow-visible {overflow: visible !important; }
                    .print\\p-0 {padding: 0 !important; }
                }
            `}} />
        </div>
    );
}
