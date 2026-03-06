
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
  Monitor,
  Menu,
  Sun,
  Moon,
  Settings
} from "lucide-react"
import { BatteryGauge } from "@/components/battery-gauge"
import { MetricCard } from "@/components/metric-card"
import { AIOptimizer } from "@/components/ai-optimizer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

// Definición de tipos para el API de batería experimental
interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  onlevelchange: ((this: BatteryManager, ev: Event) => any) | null;
  onchargingchange: ((this: BatteryManager, ev: Event) => any) | null;
}

declare global {
  interface Navigator {
    getBattery?: () => Promise<BatteryManager>;
  }
}

export default function AmpereScanDashboard() {
  const [realBattery, setRealBattery] = React.useState<BatteryManager | null>(null)
  const [deviceInfo, setDeviceInfo] = React.useState({ 
    model: "Detectando...", 
    os: "Sistema", 
    manufacturer: "Genérico",
    platform: "web"
  })
  const [simulatedTemp, setSimulatedTemp] = React.useState(25.0)
  const [mAOffset, setMAOffset] = React.useState(0)
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark')
  const [isLinking, setIsLinking] = React.useState(false)

  // Manejo de Temas
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('ampere_theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  React.useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('ampere_theme', theme)
  }, [theme])

  // Simulación de fluctuaciones de corriente para realismo visual
  React.useEffect(() => {
    const interval = setInterval(() => {
      setMAOffset(Math.floor(Math.random() * 21) - 10)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Inicialización de datos del dispositivo y batería
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      if (navigator.getBattery) {
        navigator.getBattery().then((battery) => {
          const updateBattery = () => {
            setIsLinking(true)
            setRealBattery(battery)
            setSimulatedTemp(prev => {
              const targetTemp = battery.charging ? 36.5 : 28.2
              return prev + (targetTemp - prev) * 0.05
            })
            setTimeout(() => setIsLinking(false), 800)
          }
          updateBattery()
          battery.addEventListener('levelchange', updateBattery)
          battery.addEventListener('chargingchange', updateBattery)
        })
      }

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
      }
      setDeviceInfo({ model, os, manufacturer, platform })
    }
  }, [])

  const currentLevel = realBattery ? Math.round(realBattery.level * 100) : 50
  const isCharging = realBattery?.charging ?? false
  
  // Capacidad de referencia realista según dispositivo
  const capacity = deviceInfo.platform === "android" ? 5000 : 45000 
  
  // Amperaje base dinámico basado en estado de carga real
  const baseMA = isCharging 
    ? (deviceInfo.platform === "android" ? 2200 - (currentLevel * 10) : 5000 - (currentLevel * 20)) 
    : -(350 + (currentLevel * 2))

  const currentMA = currentLevel === 0 ? 0 : Math.round(baseMA + mAOffset)
  const calculatedVoltageV = (3.4 + (currentLevel / 100) * 0.82).toFixed(2)

  const calculateEstimatedTime = () => {
    if (!realBattery) return 0
    
    // Prioridad 1: Datos directos del sistema operativo (lo más real)
    if (isCharging && realBattery.chargingTime !== Infinity && realBattery.chargingTime > 0) {
      return Math.round(realBattery.chargingTime / 60)
    }
    if (!isCharging && realBattery.dischargingTime !== Infinity && realBattery.dischargingTime > 0) {
      return Math.round(realBattery.dischargingTime / 60)
    }
    
    // Prioridad 2: Cálculo basado en amperaje si el SO no da el dato
    const absMA = Math.abs(currentMA)
    if (absMA < 10) return 0
    
    if (isCharging) {
      const remainingMah = ((100 - currentLevel) * capacity) / 100
      return Math.round((remainingMah / absMA) * 60)
    } else {
      const availableMah = (currentLevel * capacity) / 100
      return Math.round((availableMah / absMA) * 60)
    }
  }

  const estimatedMinutes = calculateEstimatedTime()
  const currentWattage = Number(((Math.abs(currentMA) * Number(calculatedVoltageV)) / 1000).toFixed(1))

  const getSystemStatus = () => {
    if (simulatedTemp > 42) return { label: "TEMPERATURA_ALTA", variant: "destructive" as const }
    if (currentLevel < 15 && currentLevel > 0) return { label: "BATERÍA_CRÍTICA", variant: "destructive" as const }
    if (isCharging) return { label: "CARGA_ACTIVA", variant: "default" as const }
    return { label: "SISTEMA_OPTIMIZADO", variant: "secondary" as const }
  }

  const systemStatus = getSystemStatus()

  return (
    <main className="min-h-screen pb-12 bg-background text-foreground transition-colors duration-300 overflow-x-hidden">
      <header className="p-5 flex items-center justify-between border-b border-white/5 sticky top-0 z-50 bg-background/95 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl shadow-[0_0_20px_rgba(var(--primary),0.3)]">
            <Zap className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold tracking-tight leading-none">Ampere Scan</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isLinking ? 'bg-primary scale-150 shadow-[0_0_10px_var(--primary)]' : 'bg-green-500 shadow-[0_0_5px_green]'}`} />
              <span className="text-[9px] text-primary font-mono uppercase tracking-[0.2em]">Hardware Link</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-primary/40 text-primary font-mono bg-primary/10 px-3 py-1">
            {deviceInfo.platform === 'android' ? 'ANDROID LINK' : 'DESKTOP LINK'}
          </Badge>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glass-card border-l border-white/10 w-[300px]">
              <SheetHeader className="mb-8">
                <SheetTitle className="text-xl font-bold flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" /> Menú de Control
                </SheetTitle>
                <SheetDescription>Configuración del panel de diagnóstico</SheetDescription>
              </SheetHeader>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor="theme-mode" className="text-sm font-semibold">Tema Visual</Label>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      {theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-accent" />}
                    <Switch 
                      id="theme-mode" 
                      checked={theme === 'dark'} 
                      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                  <h4 className="text-[10px] font-bold text-primary mb-2 uppercase tracking-widest">Estado del Motor</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">V 2.5.1 Kernel</span>
                    <Badge variant="secondary" className="bg-primary/20 text-primary text-[10px]">ACTIVO</Badge>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-5">
        <section className="flex flex-col items-center justify-center py-8 bg-gradient-to-b from-primary/5 to-transparent rounded-[2.5rem] border border-white/5 relative overflow-hidden">
          <BatteryGauge 
            level={currentLevel} 
            status={isCharging ? "Cargando" : "Descargando"} 
            mA={currentMA} 
            isCharging={isCharging}
          />
          
          <div className="flex gap-10 mt-10 relative z-10">
             <div className="flex flex-col items-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-1 font-bold">
                  {isCharging ? "Añadiendo" : "Consumo"}
                </span>
                <span className="text-2xl font-black font-headline text-primary">{currentWattage}W</span>
             </div>
             <div className="w-px h-10 bg-white/10 self-center" />
             <div className="flex flex-col items-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-1 font-bold">Restante</span>
                <span className="text-2xl font-black font-headline text-primary">~{estimatedMinutes}m</span>
             </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <MetricCard title="Voltaje" value={calculatedVoltageV} unit="V" icon={<Activity className="w-4 h-4" />} description="Célula (est.)" />
          <MetricCard title="Temperatura" value={simulatedTemp.toFixed(1)} unit="°C" icon={<Thermometer className="w-4 h-4" />} description="Sensor (est.)" accent={simulatedTemp > 40} />
          <MetricCard title="Fuente" value={isCharging ? "Red AC" : "Batería"} icon={<Usb className="w-4 h-4" />} description={isCharging ? "Conectado" : "Desconectado"} />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <MetricCard title="Ciclos" value="N/D" icon={<ShieldCheck className="w-4 h-4" />} description="Dato Protegido" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-card border-white/10 text-[10px] max-w-[200px]">
                Android y Windows restringen el acceso al contador físico de ciclos por razones de privacidad en navegadores web.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </section>

        <section>
          <AIOptimizer deviceData={{
            currentBatteryLevel: currentLevel,
            isCharging: isCharging,
            batteryHealthStatus: "Sincronizado",
            batteryTechnology: "Li-ion",
            totalDesignCapacityMah: capacity,
            currentMilliAmp: currentMA,
            voltage: Math.round(Number(calculatedVoltageV) * 1000),
            temperatureCelsius: simulatedTemp,
            deviceOsVersion: deviceInfo.os,
            deviceManufacturer: deviceInfo.manufacturer,
            deviceModel: deviceInfo.model,
            historicalUsageSummary: "Diagnóstico dinámico basado en API de hardware del sistema."
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
                  <p className="text-sm font-semibold truncate">{deviceInfo.model}</p>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Fabricante</span>
                  <p className="text-sm font-semibold truncate">{deviceInfo.manufacturer}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Tecnología</span>
                  <p className="text-sm font-semibold">Ion Litio</p>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Sistema Operativo</span>
                  <p className="text-sm font-semibold truncate">{deviceInfo.os}</p>
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
