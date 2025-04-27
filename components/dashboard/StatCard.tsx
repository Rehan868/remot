"use client"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { BarChart } from "lucide-react" // Default icon

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon = BarChart, // Provide a default icon
  trend,
  trendValue,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-6">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="p-2 bg-primary/10 rounded-md">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          </div>
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          {trend && trendValue && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  "text-xs font-medium",
                  trend === "up" && "text-green-500",
                  trend === "down" && "text-red-500",
                  trend === "neutral" && "text-gray-500",
                )}
              >
                {trendValue}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
