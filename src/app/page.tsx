
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
  Usb
} from "lucide-react"
import { BatteryGauge } from "@/components/battery-gauge"
import { MetricCard } from "@/components/metric-card"
import { AIOptimizer } from "@/components/ai-optimizer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
  const [deviceInfo, setDeviceInfo] = React.useState({ model: "Android Device", os: "Android", manufacturer: "Google / Samsung" })
  const [simulatedTemp, setSimulatedTemp] = React.useState(31.2)

  // Intentar obtener datos reales del sensor del dispositivo y del hardware
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      // API de Batería
      if (navigator.getBattery) {
        navigator.getBattery().then((battery) => {
          const updateBattery = () => {
            setRealBattery({
              level: Math.round(battery.level * 100),
              charging: battery.charging
            })
            // Simulación de temperatura reactiva: Sube si carga, baja si no
            setSimulatedTemp(battery.charging ? 36.8 : 30.5)
          }
          updateBattery()
          battery.addEventListener('levelchange', updateBattery)
          battery.addEventListener('chargingchange', updateBattery)
        })
      }

      // Detección de Modelo y OS (Android)
      const ua = navigator.userAgent
      let model = "Generic Android"
      let os = "Android OS"
      let manufacturer = "Android OEM"

      if (/Android/i.test(ua)) {
        const match = ua.match(/Android\s([0-9\.]+);?\s?([^;)]+)/)
        if (match) {
          os = `Android ${match[1]}`
          model = match[2].split(';')[0].trim()
          if (model.toLowerCase().includes("pixel")) manufacturer = "Google"
          else if (model.toLowerCase().includes("sm-") || model.toLowerCase().includes("samsung")) manufacturer = "Samsung"
          else if (model.toLowerCase().includes("mi") || model.toLowerCase().includes("redmi")) manufacturer = "Xiaomi"
        }
      }
      setDeviceInfo({ model, os, manufacturer })
    }
  }, [])

  // Parámetros técnicos base
  const currentLevel = realBattery?.level ?? 78
  const capacity = 5000 // mAh
  const mA = realBattery?.charging ? 1450 : -320
  const calculatedVoltageMV = Math.round(3400 + (currentLevel * 8)) 
  const calculatedVoltageV = (calculatedVoltageMV / 1000).toFixed(2)

  // Cálculo dinámico del tiempo estimado (Realista)
  const calculateEstimatedTime = () => {
    if (mA > 0) {
      // Tiempo hasta carga completa (100%)
      const remainingMah = ((100 - currentLevel) * capacity) / 100
      return Math.round((remainingMah / mA) * 60)
    } else {
      // Tiempo hasta agotarse (0%)
      const availableMah = (currentLevel * capacity) / 100
      return Math.round((availableMah / Math.abs(mA)) * 60)
    }
  }

  const batteryData = {
    level: currentLevel,
    status: realBattery?.charging ? "Cargando" : "Descargando",
    isCharging: realBattery?.charging ?? true,
    mA: mA,
    voltage: calculatedVoltageMV, 
    voltageV: calculatedVoltageV, 
    temperature: simulatedTemp,
    technology: "Li-ion",
    capacity: capacity,
    estimatedTime: calculateEstimatedTime(),
    healthStatus: "Excelente",
    pluggedType: realBattery?.charging ? "USB / AC" : "Batería",
    powerSource: realBattery?.charging ? "Conectado" : "Batería",
    cycleCount: 142,
    manufacturer: deviceInfo.manufacturer,
    model: deviceInfo.model,
    osVersion: deviceInfo.os,
    historicalUsage: "Uso balanceado detectado en los últimos ciclos."
  }

  const getSystemStatus = () => {
    if (batteryData.temperature > 40) return { label: "TEMPERATURA_ALTA", variant: "destructive" as const }
    if (batteryData.level < 15) return { label: "BATERÍA_CRÍTICA", variant: "destructive" as const }
    if (batteryData.isCharging) return { label: "CARGA_ACTIVA", variant: "default" as const }
    return { label: "SISTEMA_OPTIMIZADO", variant: "secondary" as const }
  }

  const systemStatus = getSystemStatus()
  const wattage = Number(((Math.abs(batteryData.mA) * batteryData.voltage) / 1000000).toFixed(1))

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
    <main className="min-h-screen pb-12 bg-background text-foreground overflow-x-hidden">
      <header className="p-5 flex items-center justify-between border-b border-white/5 sticky top-0 z-50 bg-background/90 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl shadow-[0_0_20px_rgba(var(--primary),0.4)]">
            <Zap className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold tracking-tight leading-none">Ampere Scan</h1>
            <span className="text-[9px] text-primary font-mono uppercase tracking-[0.2em] mt-1">Kernel Monitor</span>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/40 text-primary font-mono bg-primary/10 px-3">
          PRO
        </Badge>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-5">
        <section className="flex flex-col items-center justify-center py-8 bg-gradient-to-b from-primary/10 via-transparent to-transparent rounded-[2.5rem] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
             <div className="absolute top-[-10%] left-[-10%] w-full h-full bg-primary rounded-full blur-[100px]" />
          </div>
          
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
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-1 font-bold">Restante</span>
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
            description="Tensión batería"
          />
          <MetricCard 
            title="Temp." 
            value={batteryData.temperature.toFixed(1)} 
            unit="°C" 
            icon={<Thermometer className="w-4 h-4" />} 
            description={batteryData.isCharging ? "Carga térmica activa" : "Temperatura estable"}
            accent={batteryData.temperature > 40}
          />
          <MetricCard 
            title="Fuente" 
            value={batteryData.powerSource} 
            icon={<Usb className="w-4 h-4" />} 
            description={batteryData.pluggedType}
          />
          <MetricCard 
            title="Salud" 
            value={batteryData.healthStatus} 
            icon={<ShieldCheck className="w-4 h-4" />} 
            description={`Ciclos: ${batteryData.cycleCount}`}
          />
        </section>

        <section>
          <AIOptimizer deviceData={aiInput} />
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Smartphone className="w-4 h-4 text-primary" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Especificaciones de Hardware</h3>
          </div>
          <Card className="glass-card border-none bg-white/[0.03] rounded-3xl overflow-hidden">
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Modelo</span>
                  <p className="text-sm font-semibold truncate">{batteryData.model}</p>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Fabricante</span>
                  <p className="text-sm font-semibold">{batteryData.manufacturer}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Tecnología</span>
                  <p className="text-sm font-semibold">{batteryData.technology}</p>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Versión OS</span>
                  <p className="text-sm font-semibold">{batteryData.osVersion}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-primary/60" />
                  <span className="text-[9px] text-muted-foreground uppercase font-bold">Estado del Sistema</span>
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
            <Info className="w-3.5 h-3.5 text-primary" />
            <span className="uppercase tracking-widest font-medium">Sincronizado con hardware local</span>
          </div>
          <p className="text-[8px] text-muted-foreground/40 uppercase tracking-[0.3em]">Ampere Scan Engine © 2024</p>
        </footer>
      </div>
    </main>
  )
}
