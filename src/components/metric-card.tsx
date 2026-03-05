"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  icon: React.ReactNode
  description?: string
  trend?: "up" | "down" | "stable"
  accent?: boolean
  className?: string
}

export function MetricCard({ title, value, unit, icon, description, accent, className }: MetricCardProps) {
  return (
    <Card className={cn("glass-card border-none overflow-hidden", className)}>
      <CardContent className="p-4 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
          <div className={cn(
            "p-1.5 rounded-md",
            accent ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
          )}>
            {icon}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-headline">{value}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          {description && <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{description}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
