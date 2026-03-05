"use client"

import * as React from "react"
import { Sparkles, Loader2, CheckCircle2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { batteryOptimizationRecommendations, BatteryOptimizationOutput, BatteryOptimizationInput } from "@/ai/flows/battery-optimization-recommendations"
import { cn } from "@/lib/utils"

interface AIOptimizerProps {
  deviceData: BatteryOptimizationInput
}

export function AIOptimizer({ deviceData }: AIOptimizerProps) {
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<BatteryOptimizationOutput | null>(null)

  const handleOptimize = async () => {
    setLoading(true)
    try {
      const output = await batteryOptimizationRecommendations(deviceData)
      setResult(output)
    } catch (error) {
      console.error("Optimization failed:", error)
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
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-primary/20 p-1.5 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-lg font-headline">Optimizador Inteligente</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">
          Análisis GenAI para maximizar la vida útil de tu batería.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative z-10">
        {!result ? (
          <Button 
            onClick={handleOptimize} 
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analizando patrones...
              </>
            ) : (
              "Analizar y Optimizar"
            )}
          </Button>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-background/50 p-4 rounded-xl border border-white/5">
              <h4 className="text-sm font-bold text-primary mb-2 uppercase tracking-wide">Recomendación General</h4>
              <p className="text-sm leading-relaxed">{result.overallRecommendation}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-accent mb-2 uppercase tracking-wide">Consejos Personalizados</h4>
              <div className="grid gap-2">
                {result.personalizedTips.map((tip, idx) => (
                  <div key={idx} className="flex gap-3 text-sm p-3 bg-white/5 rounded-lg items-start">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                <ChevronRight className="w-3 h-3 text-primary" />
                {result.performanceMetricsImpact}
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={() => setResult(null)} 
              className="w-full border-primary/20 hover:bg-primary/10"
            >
              Nuevo Análisis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
