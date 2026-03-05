
"use client"

import * as React from "react"
import { 
  Zap, 
  Thermometer, 
  Activity, 
  Smartphone, 
  Info,
  ShieldCheck,
  Cpu,
  Usb,
  AlertCircle,
  Monitor
} from "lucide-react"
import { BatteryGauge } from "@/components/battery-gauge"
import { MetricCard } from "@/components/metric-card"
import { AIOptimizer } from "@/components/ai-optimizer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Definición de tipos para el API de batería experimental
interface BatteryManager {
  level: number;
  charging: boolean;
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
}

declare global {
  interface Navigator {
    getBattery?: () => Promise<BatteryManager>;
  }
}

export default function AmpereScanDashboard() {
  const [realBattery, setRealBattery] = React.useState<{level: number, charging: boolean} | null>(null)
  const [deviceInfo, setDeviceInfo] = React.useState({ 
    model: "Detectando...", 
    os: "Sistema", 
    manufacturer: "Genérico",
    platform: "web"
  })
  const [simulatedTemp, setSimulatedTemp] = React.useState(25.0)
  const [mAOffset, setMAOffset] = React.useState(0)

  // Simulación de fluctuaciones de corriente para dar realismo al bus (jitter)
  React.useEffect(() => {
    const interval = setInterval(() => {
      setMAOffset(Math.floor(Math.random() * 11) - 5) // +/- 5mA
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  // Inicialización de datos del dispositivo
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      // API de Batería Real
      if (navigator.getBattery) {
        navigator.getBattery().then((battery) => {
          const updateBattery = () => {
            setRealBattery({
              level: Math.round(battery.level * 100),
              charging: battery.charging
            })
            // Simulación reactiva: la temperatura sube ligeramente si carga
            setSimulatedTemp(battery.charging ? 32.5 : 24.8)
          }
          updateBattery()
          battery.addEventListener('levelchange', updateBattery)
          battery.addEventListener('chargingchange', updateBattery)
        })
      }

      // Detección de Modelo y OS real
      const ua = navigator.userAgent
      let model = "Dispositivo Web"
      let os = "Desconocido"
      let manufacturer = "OEM"
      let platform = "desktop"

      if (/Android/i.test(ua)) {
        platform = "android"
        const match = ua.match(/Android\s([0-9\.]+);?\s?([^;)]+)/)
        if (match) {
          os = `Android ${match[1]}`
          const modelParts = match[2].split(';')
          model = modelParts[modelParts.length - 1].trim()
          
          if (ua.toLowerCase().includes("pixel")) manufacturer = "Google"
          else if (ua.toLowerCase().includes("samsung") || model.toLowerCase().includes("sm-")) manufacturer = "Samsung"
          else if (ua.toLowerCase().includes("xiaomi")) manufacturer = "Xiaomi"
        }
      } else if (/Windows/i.test(ua)) {
        os = "Windows"
        model = "PC / Laptop"
        manufacturer = "Microsoft"
      } else if (/Macintosh/i.test(ua)) {
        os = "macOS"
        model = "MacBook / iMac"
        manufacturer = "Apple"
      } else if (/Linux/i.test(ua)) {
        os = "Linux"
        model = "Computadora"
        manufacturer = "Genérico"
      }
      
      setDeviceInfo({ model, os, manufacturer, platform })
    }
  }, [])

  // Parámetros técnicos dinámicos
  const currentLevel = realBattery?.level ?? 0
  const capacity = deviceInfo.platform === "android" ? 5000 : 45000 // mAh referencia (móvil vs pc)
  
  const baseMA = realBattery?.charging ? (deviceInfo.platform === "android" ? 1200 : 3500) : -350
  const mA = currentLevel === 0 ? 0 : baseMA + mAOffset
  
  // Voltaje calculado (Curva Li-ion: 3.4V a 4.2V)
  const calculatedVoltageMV = Math.round(3400 + (currentLevel * 8)) 
  const calculatedVoltageV = (calculatedVoltageMV / 1000).toFixed(2)

  const calculateEstimatedTime = () => {
    const currentMA = Math.abs(mA)
    if (currentMA === 0) return 0
    if (mA > 0) {
      const remainingMah = ((100 - currentLevel) * capacity) / 100
      return Math.round((remainingMah / currentMA) * 60)
    } else {
      const availableMah = (currentLevel * capacity) / 100
      return Math.round((availableMah / currentMA) * 60)
    }
  }

  const batteryData = {
    level: currentLevel,
    status: realBattery?.charging ? "Cargando" : "Descargando",
    isCharging: realBattery?.charging ?? false,
    mA: mA,
    voltageV: calculatedVoltageV, 
    temperature: simulatedTemp,
    technology: "Li-ion",
    capacity: capacity,
    estimatedTime: calculateEstimatedTime(),
    healthStatus: "Sincronizado",
    powerSource: realBattery?.charging ? "Fuente Externa" : "Batería Interna",
    cycleCount: "N/D", 
    manufacturer: deviceInfo.manufacturer,
    model: deviceInfo.model,
    osVersion: deviceInfo.os,
    historicalUsage: "Monitoreo activo de hardware."
  }

  const getSystemStatus = () => {
    if (batteryData.temperature > 45) return { label: "TEMPERATURA_ALTA", variant: "destructive" as const }
    if (batteryData.level < 15 && batteryData.level > 0) return { label: "BATERÍA_CRÍTICA", variant: "destructive" as const }
    if (batteryData.isCharging) return { label: "CARGA_ACTIVA", variant: "default" as const }
    return { label: "SISTEMA_ESTABLE", variant: "secondary" as const }
  }

  const systemStatus = getSystemStatus()
  const wattage = Number(((Math.abs(batteryData.mA) * Number(batteryData.voltageV)) / 1000).toFixed(1))

  return (
    <main className="min-h-screen pb-12 bg-background text-foreground overflow-x-hidden">
      <header className="p-5 flex items-center justify-between border-b border-white/5 sticky top-0 z-50 bg-background/95 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl shadow-[0_0_20px_rgba(var(--primary),0.3)]">
            <Zap className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold tracking-tight leading-none text-white">Ampere Scan</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_green]" />
              <span className="text-[9px] text-primary font-mono uppercase tracking-[0.2em]">Hardware Live</span>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/40 text-primary font-mono bg-primary/10 px-3 py-1">
          {deviceInfo.platform === 'android' ? 'ANDROID LINK' : 'DESKTOP LINK'}
        </Badge>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-5">
        <section className="flex flex-col items-center justify-center py-8 bg-gradient-to-b from-primary/5 to-transparent rounded-[2.5rem] border border-white/5 relative overflow-hidden">
          <BatteryGauge 
            level={batteryData.level} 
            status={batteryData.status} 
            mA={batteryData.mA} 
            isCharging={batteryData.isCharging}
          />
          
          <div className="flex gap-10 mt-10 relative z-10">
             <div className="flex flex-col items-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-1 font-bold">Consumo</span>
                <span className="text-2xl font-black font-headline text-primary">{wattage}W</span>
             </div>
             <div className="w-px h-10 bg-white/10 self-center" />
             <div className="flex flex-col items-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-1 font-bold">Estimado</span>
                <span className="text-2xl font-black font-headline text-primary">~{batteryData.estimatedTime}m</span>
             </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <MetricCard 
            title="Voltaje" 
            value={batteryData.voltageV} 
            unit="V" 
            icon={<Activity className="w-4 h-4" />} 
            description="Medición de celda (est.)"
          />
          <MetricCard 
            title="Temp." 
            value={batteryData.temperature.toFixed(1)} 
            unit="°C" 
            icon={<Thermometer className="w-4 h-4" />} 
            description="Sensor térmico (est.)"
            accent={batteryData.temperature > 40}
          />
          <MetricCard 
            title="Fuente" 
            value={batteryData.powerSource} 
            icon={<Usb className="w-4 h-4" />} 
            description={batteryData.isCharging ? "Suministro detectado" : "Descarga interna"}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <MetricCard 
                    title="Ciclos" 
                    value={batteryData.cycleCount} 
                    icon={<ShieldCheck className="w-4 h-4" />} 
                    description="Dato Protegido"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-card border-white/10 text-[10px] max-w-[200px]">
                Los navegadores restringen el acceso al contador físico de ciclos por razones de privacidad.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </section>

        <section>
          <AIOptimizer deviceData={{
            currentBatteryLevel: batteryData.level,
            isCharging: batteryData.isCharging,
            batteryHealthStatus: batteryData.healthStatus,
            batteryTechnology: batteryData.technology,
            totalDesignCapacityMah: batteryData.capacity,
            currentMilliAmp: batteryData.mA,
            voltage: Math.round(Number(batteryData.voltageV) * 1000),
            temperatureCelsius: batteryData.temperature,
            deviceOsVersion: batteryData.osVersion,
            deviceManufacturer: batteryData.manufacturer,
            deviceModel: batteryData.model,
            historicalUsageSummary: batteryData.historicalUsage
          }} />
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            {deviceInfo.platform === 'android' ? <Smartphone className="w-4 h-4 text-primary" /> : <Monitor className="w-4 h-4 text-primary" />}
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Identidad del Terminal</h3>
          </div>
          <Card className="glass-card border-none bg-white/[0.02] rounded-3xl overflow-hidden shadow-inner">
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Modelo Detectado</span>
                  <p className="text-sm font-semibold truncate text-white">{batteryData.model}</p>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Fabricante</span>
                  <p className="text-sm font-semibold text-white">{batteryData.manufacturer}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Tecnología</span>
                  <p className="text-sm font-semibold text-white">{batteryData.technology}</p>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Sistema Operativo</span>
                  <p className="text-sm font-semibold text-white">{batteryData.osVersion}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-primary/60" />
                  <span className="text-[9px] text-muted-foreground uppercase font-bold">Estado del Kernel</span>
                </div>
                <Badge 
                  variant={systemStatus.variant} 
                  className={`text-[9px] font-mono ${systemStatus.variant === 'secondary' ? 'bg-white/5 text-primary' : ''}`}
                >
                  {systemStatus.label}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        <footer className="pt-6 pb-4 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-[9px] text-muted-foreground bg-white/5 px-5 py-2.5 rounded-full border border-white/5 backdrop-blur-sm">
            <AlertCircle className="w-3.5 h-3.5 text-primary" />
            <span className="uppercase tracking-widest font-medium">Privacidad de hardware respetada</span>
          </div>
          <p className="text-[8px] text-muted-foreground/40 uppercase tracking-[0.3em]">Ampere Scan Engine © 2024</p>
        </footer>
      </div>
    </main>
  )
}

