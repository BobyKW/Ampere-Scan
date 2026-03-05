"use client"

import * as React from "react"
import { 
  Zap, 
  Thermometer, 
  Activity, 
  Battery, 
  Smartphone, 
  Info,
  ShieldCheck
} from "lucide-react"
import { BatteryGauge } from "@/components/battery-gauge"
import { MetricCard } from "@/components/metric-card"
import { AIOptimizer } from "@/components/ai-optimizer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AmpereScanDashboard() {
  // Simulated data representing high-fidelity battery readings
  const batteryData = {
    level: 78,
    status: "Buen estado",
    isCharging: true,
    mA: 1450,
    voltage: 4125, // mV
    temperature: 32.5, // Celsius
    technology: "Li-poly",
    capacity: 5000, // mAh
    estimatedTime: 42, // minutes
    healthStatus: "Bien",
    manufacturer: "Google",
    model: "Pixel 8 Pro",
    osVersion: "Android 14 (UPS1.231013.001)",
    historicalUsage: "Frecuentes drenajes por debajo del 20%, alto consumo de redes sociales, brillo de pantalla alto."
  }

  const wattage = Number(((batteryData.mA * batteryData.voltage) / 1000000).toFixed(1))

  const aiInput = {
    currentBatteryLevel: batteryData.level,
    isCharging: batteryData.isCharging,
    batteryHealthStatus: batteryData.healthStatus,
    batteryTechnology: batteryData.technology,
    totalDesignCapacityMah: batteryData.capacity,
    currentMilliAmp: batteryData.mA,
    voltage: batteryData.voltage,
    temperatureCelsius: batteryData.temperature,
    deviceOsVersion: batteryData.osVersion,
    deviceManufacturer: batteryData.manufacturer,
    deviceModel: batteryData.model,
    historicalUsageSummary: batteryData.historicalUsage
  }

  return (
    <main className="min-h-screen pb-12">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-white/5 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Zap className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold font-headline tracking-tight">Ampere Scan</h1>
        </div>
        <Badge variant="outline" className="border-primary/30 text-primary font-mono bg-primary/5">
          PRO v2.4.1
        </Badge>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Main Gauge Section */}
        <section className="flex flex-col items-center justify-center py-6">
          <BatteryGauge 
            level={batteryData.level} 
            status={batteryData.status} 
            mA={batteryData.mA} 
            isCharging={batteryData.isCharging}
          />
          <div className="flex gap-4 mt-6">
             <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Potencia</span>
                <span className="text-lg font-bold font-headline">{wattage} W</span>
             </div>
             <div className="w-px h-10 bg-white/10" />
             <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Restante</span>
                <span className="text-lg font-bold font-headline">~{batteryData.estimatedTime} min</span>
             </div>
          </div>
        </section>

        {/* Core Metrics Grid */}
        <section className="grid grid-cols-2 gap-3">
          <MetricCard 
            title="Voltaje" 
            value={batteryData.voltage} 
            unit="mV" 
            icon={Activity} 
            description="Tensión actual"
          />
          <MetricCard 
            title="Temperatura" 
            value={batteryData.temperature} 
            unit="°C" 
            icon={Thermometer} 
            description="Estado térmico: Estable"
            accent={batteryData.temperature > 40}
          />
          <MetricCard 
            title="Capacidad" 
            value={batteryData.capacity} 
            unit="mAh" 
            icon={Battery} 
            description="Diseño original"
          />
          <MetricCard 
            title="Salud" 
            value={batteryData.healthStatus} 
            icon={ShieldCheck} 
            description="Ciclos: 142"
          />
        </section>

        {/* AI Optimization Tool */}
        <section>
          <AIOptimizer deviceData={aiInput} />
        </section>

        {/* Device Information */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Detalles del Dispositivo</h3>
          </div>
          <Card className="glass-card border-none">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Fabricante</span>
                <span className="font-medium">{batteryData.manufacturer}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Modelo</span>
                <span className="font-medium">{batteryData.model}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Tecnología</span>
                <span className="font-medium">{batteryData.technology}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Versión de Android</span>
                <span className="font-medium text-xs truncate max-w-[200px]">{batteryData.osVersion}</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Charging Status Indicator Footer */}
        <footer className="pt-4 flex justify-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 px-4 py-2 rounded-full border border-white/5">
            <Info className="w-3 h-3" />
            <span>Datos actualizados en tiempo real</span>
          </div>
        </footer>
      </div>
    </main>
  )
}
