"use client"

import * as React from "react"
import { Sparkles, Loader2, CheckCircle2, ChevronRight, Key, Trash2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { batteryOptimizationRecommendations, BatteryOptimizationOutput, BatteryOptimizationInput } from "@/ai/flows/battery-optimization-recommendations"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

interface AIOptimizerProps {
  deviceData: Omit<BatteryOptimizationInput, 'userApiKey'>
}

const STORAGE_KEY = 'ampere_scan_user_gemini_key'
const EXPIRY_DAYS = 90 // 3 meses

export function AIOptimizer({ deviceData }: AIOptimizerProps) {
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<BatteryOptimizationOutput | null>(null)
  const [apiKey, setApiKey] = React.useState<string>("")
  const [hasStoredKey, setHasStoredKey] = React.useState(false)
  const [showKeyInput, setShowKeyInput] = React.useState(false)

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const { key, expiresAt } = JSON.parse(stored)
        if (Date.now() < expiresAt) {
          setApiKey(key)
          setHasStoredKey(true)
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const saveApiKey = () => {
    if (!apiKey.trim()) return
    const expiresAt = Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ key: apiKey, expiresAt }))
    setHasStoredKey(true)
    setShowKeyInput(false)
    toast({
      title: "Clave guardada",
      description: "Tu clave de API se ha guardado localmente por 3 meses.",
    })
  }

  const deleteApiKey = () => {
    localStorage.removeItem(STORAGE_KEY)
    setApiKey("")
    setHasStoredKey(false)
    setShowKeyInput(true)
    toast({
      variant: "destructive",
      title: "Clave eliminada",
      description: "La clave ha sido borrada de tu dispositivo.",
    })
  }

  const handleOptimize = async () => {
    if (!apiKey) {
      setShowKeyInput(true)
      return
    }

    setLoading(true)
    try {
      const output = await batteryOptimizationRecommendations({
        ...deviceData,
        userApiKey: apiKey,
      })
      setResult(output)
    } catch (error: any) {
      console.error("Optimization failed:", error)
      toast({
        variant: "destructive",
        title: "Error de Análisis",
        description: "Asegúrate de que tu API Key sea correcta y tenga permisos.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="glass-card border-primary/20 bg-primary/5 shadow-lg overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles className="w-24 h-24 text-primary" />
      </div>
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-primary/20 p-1.5 rounded-lg">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-headline">Optimizador Inteligente</CardTitle>
          </div>
          {hasStoredKey && (
            <Button variant="ghost" size="icon" onClick={deleteApiKey} className="h-8 w-8 text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
        <CardDescription className="text-muted-foreground text-xs">
          Análisis personalizado usando tu propia inteligencia artificial.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative z-10">
        {showKeyInput && !result ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Key className="w-3 h-3" /> Configurar Gemini API Key
              </label>
              <div className="flex gap-2">
                <Input 
                  type="password" 
                  placeholder="Pega tu clave aquí..." 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-background/50 border-white/10 text-sm h-11"
                />
                <Button onClick={saveApiKey} className="bg-primary text-primary-foreground">
                  Listo
                </Button>
              </div>
              <p className="text-[9px] text-muted-foreground italic flex items-start gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                Tu clave se guarda localmente en tu navegador y no se comparte con otros usuarios.
              </p>
            </div>
          </div>
        ) : !result ? (
          <Button 
            onClick={handleOptimize} 
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 shadow-xl"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Procesando con Gemini...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {hasStoredKey ? "Iniciar Análisis IA" : "Configurar y Analizar"}
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-background/50 p-4 rounded-xl border border-white/5 shadow-inner">
              <h4 className="text-[10px] font-bold text-primary mb-2 uppercase tracking-[0.2em]">Recomendación Kernel</h4>
              <p className="text-sm leading-relaxed text-foreground/90">{result.overallRecommendation}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-accent mb-2 uppercase tracking-[0.2em]">Protocolo de Optimización</h4>
              <div className="grid gap-2">
                {result.personalizedTips.map((tip, idx) => (
                  <div key={idx} className="flex gap-3 text-xs p-3 bg-white/5 rounded-xl items-start border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="leading-tight">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-black/20 p-2 rounded-lg">
                <ChevronRight className="w-3 h-3 text-primary" />
                <span className="italic">{result.performanceMetricsImpact}</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={() => setResult(null)} 
              className="w-full border-primary/20 hover:bg-primary/10 rounded-xl"
            >
              Nuevo Análisis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
