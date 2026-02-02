import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    description?: string
    trend?: {
        value: string
        isPositive: boolean
    }
    className?: string
    color?: "blue" | "green" | "purple" | "orange"
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    className,
    color = "blue"
}: StatsCardProps) {
    const colorStyles = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        green: "bg-green-50 text-green-600 border-green-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100",
    }

    return (
        <div className={cn(
            "bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group relative overflow-hidden",
            className
        )}>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", colorStyles[color])}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>

            <div className="relative z-10">
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
                    {trend && (
                        <span className={cn(
                            "text-xs font-bold px-2 py-0.5 rounded-full",
                            trend.isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                            {trend.isPositive ? "+" : ""}{trend.value}
                        </span>
                    )}
                </div>
                {description && (
                    <p className="text-sm text-gray-400 mt-1 font-medium">{description}</p>
                )}
            </div>

            {/* Decorative background element */}
            <div className={cn(
                "absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity blur-2xl",
                color === "blue" && "bg-blue-600",
                color === "green" && "bg-green-600",
                color === "purple" && "bg-purple-600",
                color === "orange" && "bg-orange-600",
            )} />
        </div>
    )
}
