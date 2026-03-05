
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
      <CardContent className="p-4 flex flex-col h-full justify-between overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate mr-2">{title}</span>
          <div className={cn(
            "p-1.5 rounded-md shrink-0",
            accent ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
          )}>
            {icon}
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-1 min-w-0 overflow-hidden">
            <span className="text-2xl font-bold font-headline truncate">
              {value}
            </span>
            {unit && <span className="text-sm text-muted-foreground shrink-0">{unit}</span>}
          </div>
          {description && (
            <p className="text-[10px] text-muted-foreground mt-1 truncate">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
