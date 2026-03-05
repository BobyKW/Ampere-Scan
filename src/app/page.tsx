
"use client"

import * as React from "react"
import { 
  Zap, 
  Thermometer, 
  Activity, 
  Battery, 
  Smartphone, 
  Info,
  ShieldCheck,
  Cpu,
  Usb
} from "lucide-react"
import { BatteryGauge } from "@/components/battery-gauge"
import { MetricCard } from "@/components/metric-card"
import { AIOptimizer } from "@/components/ai-optimizer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AmpereScanDashboard() {
  // Datos simulados extraídos de la API de Android (BatteryManager)
  const batteryData = {
    level: 78,
    status: "Cargando (AC)",
    isCharging: true,
    mA: 1450,
    voltage: 4125, // mV
    temperature: 32.5, // Celsius
    technology: "Li-poly",
    capacity: 5000, // mAh
    estimatedTime: 42, // minutos
    healthStatus: "Excelente",
    pluggedType: "Cargador de pared (AC)",
    powerSource: "AC",
    cycleCount: 142,
    manufacturer: "Google",
    model: "Pixel 8 Pro",
    osVersion: "Android 14 (Upside Down Cake)",
    securityPatch: "1 de Febrero, 2024",
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
    <main className="min-h-screen pb-12 bg-background">
      {/* Header Estilo Android Status Bar */}
      <header className="p-6 flex items-center justify-between border-b border-white/5 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg shadow-[0_0_15px_rgba(var(--primary),0.4)]">
            <Zap className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold font-headline tracking-tight leading-none">Ampere Scan</h1>
            <span className="text-[10px] text-primary font-mono uppercase tracking-widest mt-1">Android Monitor</span>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/30 text-primary font-mono bg-primary/5">
          v2.4.1-PRO
        </Badge>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Main Gauge Section */}
        <section className="flex flex-col items-center justify-center py-6 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl border border-white/5">
          <BatteryGauge 
            level={batteryData.level} 
            status={batteryData.status} 
            mA={batteryData.mA} 
            isCharging={batteryData.isCharging}
          />
          <div className="flex gap-8 mt-8">
             <div className="flex flex-col items-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-1">Potencia</span>
                <span className="text-xl font-bold font-headline text-primary">{wattage} W</span>
             </div>
             <div className="w-px h-10 bg-white/10" />
             <div className="flex flex-col items-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-1">Carga Restante</span>
                <span className="text-xl font-bold font-headline text-primary">~{batteryData.estimatedTime} min</span>
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
            description="Tensión de celda"
          />
          <MetricCard 
            title="Temperatura" 
            value={batteryData.temperature} 
            unit="°C" 
            icon={Thermometer} 
            description="Límite: 45°C"
            accent={batteryData.temperature > 40}
          />
          <MetricCard 
            title="Fuente" 
            value={batteryData.powerSource} 
            icon={Usb} 
            description={batteryData.pluggedType}
          />
          <MetricCard 
            title="Salud" 
            value={batteryData.healthStatus} 
            icon={ShieldCheck} 
            description={`Ciclos: ${batteryData.cycleCount}`}
          />
        </section>

        {/* AI Optimization Tool */}
        <section>
          <AIOptimizer deviceData={aiInput} />
        </section>

        {/* Android Device Information */}
        <section>
          <div className="flex items-center gap-2 mb-3 px-1">
            <Smartphone className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sistema Android</h3>
          </div>
          <Card className="glass-card border-none bg-white/[0.02]">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase">Modelo</span>
                  <p className="text-sm font-medium">{batteryData.model}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase">Versión</span>
                  <p className="text-sm font-medium">{batteryData.osVersion}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase">Tecnología</span>
                  <p className="text-sm font-medium">{batteryData.technology}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase">Capacidad</span>
                  <p className="text-sm font-medium">{batteryData.capacity} mAh</p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground uppercase">Parche de Seguridad</span>
                </div>
                <span className="text-[10px] font-mono text-primary">{batteryData.securityPatch}</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="pt-4 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-white/5 px-4 py-2 rounded-full border border-white/5">
            <Info className="w-3 h-3 text-primary" />
            <span className="uppercase tracking-tighter">Monitoreo de Kernel Android en tiempo real</span>
          </div>
        </footer>
      </div>
    </main>
  )
}
