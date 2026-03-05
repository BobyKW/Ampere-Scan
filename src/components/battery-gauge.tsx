"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface BatteryGaugeProps {
  level: number
  status: string
  mA: number
  isCharging: boolean
  className?: string
}

export function BatteryGauge({ level, status, mA, isCharging, className }: BatteryGaugeProps) {
  const radius = 90
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (level / 100) * circumference

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg className="w-64 h-64 -rotate-90">
        {/* Background track */}
        <circle
          cx="128"
          cy="128"
          r={radius}
          fill="transparent"
          stroke="hsl(var(--muted))"
          strokeWidth="12"
          className="opacity-20"
        />
        {/* Progress bar */}
        <circle
          cx="128"
          cy="128"
          r={radius}
          fill="transparent"
          stroke="hsl(var(--primary))"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="gauge-progress transition-all duration-1000 ease-in-out energy-glow"
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-5xl font-bold font-headline tracking-tighter">
          {level}%
        </span>
        <div className="flex flex-col mt-2 items-center">
          <span className={cn(
            "text-2xl font-semibold font-headline flex items-center gap-1",
            isCharging ? "text-primary animate-pulse-subtle" : mA < 0 ? "text-accent" : "text-muted-foreground"
          )}>
            {mA > 0 ? `+${mA}` : mA} <span className="text-sm font-normal">mA</span>
          </span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            {isCharging ? "Cargando" : "Descargando"}
          </span>
        </div>
      </div>
    </div>
  )
}
