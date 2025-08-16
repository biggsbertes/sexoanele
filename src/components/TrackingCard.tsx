import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, MapPin, CheckCircle, Clock, AlertCircle, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrackingStep {
  id: string
  status: string
  description: string
  date: string
  completed: boolean
}

interface TrackingCardProps {
  trackingCode: string
  steps: TrackingStep[]
  currentStep: number
  className?: string
}

const statusIcons = {
  "Seu produto já está com a Jadlog": Package,
  "Seu produto está em transferência interna para Jadlog destino": Truck,
  "Em transferência": Truck,
  "Retido na alfândega": AlertCircle,
  "Em rota de entrega": Truck,
  "Entregue": CheckCircle
}

const statusColors = {
  "Seu produto já está com a Jadlog": "bg-red-500 text-white",
  "Seu produto está em transferência interna para Jadlog destino": "bg-red-500 text-white",
  "Em transferência": "bg-red-500 text-white",
  "Retido na alfândega": "bg-red-500 text-white",
  "Em rota de entrega": "bg-blue-500 text-white",
  "Entregue": "bg-green-500 text-white"
}

export function TrackingCard({ trackingCode, steps, currentStep, className }: TrackingCardProps) {
  return (
    <Card className={cn("w-full gradient-card shadow-card", className)}>
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
            Código: {trackingCode}
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
            {steps.length} etapas
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="space-y-3 sm:space-y-4">
          {steps.map((step, index) => {
            const Icon = statusIcons[step.status as keyof typeof statusIcons] || Clock
            const isCompleted = index <= currentStep
            const isCurrent = index === currentStep
            
            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-start space-x-3 sm:space-y-4 p-4 rounded-lg border transition-all duration-300 hover:shadow-sm",
                  step.status === "Retido na alfândega" ? "bg-red-50 border-red-200 hover:bg-red-100" : 
                  step.status === "Em transferência" || step.status === "Seu produto já está com a Jadlog" || step.status === "Seu produto está em transferência interna para Jadlog destino" ? "bg-gray-50 border-gray-200 hover:bg-gray-100" :
                  step.status === "Em rota de entrega" ? "bg-blue-50 border-blue-200 hover:bg-blue-100" :
                  step.status === "Entregue" ? "bg-green-50 border-green-200 hover:bg-green-100" :
                  isCompleted ? "bg-blue-50 border-blue-200 hover:bg-blue-100" : "bg-gray-50 border-gray-200 hover:bg-gray-100",
                  step.status === "Retido na alfândega" && "ring-2 ring-red-300 animate-pulse",
                  isCurrent && "ring-2 ring-blue-300 bg-blue-100 shadow-md"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-300 flex-shrink-0 shadow-sm",
                  isCompleted 
                    ? statusColors[step.status as keyof typeof statusColors] || "bg-blue-500 text-white"
                    : "bg-gray-300 text-gray-600"
                )}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-2">
                      <h4 className={cn(
                        "font-semibold text-sm sm:text-base leading-tight",
                        step.status === "Em rota de entrega" || step.status === "Entregue" ? "text-gray-600" :
                        isCompleted ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {step.status}
                      </h4>
                      {isCurrent && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 animate-pulse">
                          Atual
                        </Badge>
                      )}
                    </div>
                    {step.date && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500 flex-shrink-0">
                        <Calendar className="w-3 h-3" />
                        <span>{step.date.split(' ')[0]}</span>
                      </div>
                    )}
                  </div>
                  <p className={cn(
                    "text-xs sm:text-sm mt-2 sm:mt-1 leading-relaxed",
                    step.status === "Em rota de entrega" || step.status === "Entregue" ? "text-gray-500" :
                    isCompleted ? "text-foreground/80" : "text-muted-foreground"
                  )}>
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}