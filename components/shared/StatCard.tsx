import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: string;
    trendType?: "positive" | "negative" | "neutral";
    className?: string;
}

export const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
    trendType = "neutral",
    className
}: StatCardProps) => {
    return (
        <Card className={cn("overflow-hidden border-slate-200/60 shadow-sm", className)}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-bold text-slate-900 font-heading tracking-tight">{value}</h3>
                            {trend && (
                                <span className={cn(
                                    "text-[10px] font-bold px-1.5 py-0.5 rounded",
                                    trendType === "positive" && "bg-success/10 text-success",
                                    trendType === "negative" && "bg-destructive/10 text-destructive",
                                    trendType === "neutral" && "bg-slate-100 text-slate-500",
                                )}>
                                    {trend}
                                </span>
                            )}
                        </div>
                        {description && (
                            <p className="text-[11px] text-slate-400 font-medium">{description}</p>
                        )}
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <Icon className="w-5 h-5 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
