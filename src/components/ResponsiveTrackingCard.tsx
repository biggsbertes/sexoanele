import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, MapPin, CheckCircle, Clock, AlertCircle, X, Building2, Eye, Home, ChevronDown, Calendar, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TrackingStep {
  id: string
  status: string
  description: string
  date: string
  completed: boolean
}

interface ResponsiveTrackingCardProps {
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
  "Entregue": Home
}

const statusColors = {
  "Seu produto já está com a Jadlog": "bg-red-500 text-white",
  "Seu produto está em transferência interna para Jadlog destino": "bg-red-500 text-white",
  "Em transferência": "bg-red-500 text-white",
  "Retido na alfândega": "bg-red-500 text-white",
  "Em rota de entrega": "bg-[#f4f5f6] text-gray-400",
  "Entregue": "bg-gray-300 text-gray-900"
}

export function ResponsiveTrackingCard({ trackingCode, steps, currentStep, className }: ResponsiveTrackingCardProps) {
  // Status atual fixo para demonstração (status fictícios)
  const currentStatus = "Retido na alfândega"
  const currentIcon = Truck // Ícone de caminhão em movimento
  const currentColor = statusColors[currentStatus as keyof typeof statusColors] || "bg-red-500 text-white"

  return (
    <Card className={cn("w-full gradient-card shadow-card", className)}>
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
            Código: {trackingCode}
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 sm:space-y-4">
        {/* Status Atual - Sempre Visível */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                currentColor
              )}>
                <currentIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-base flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-red-600 animate-pulse" />
                  <span>Status Atual</span>
                </h4>
                <p className="text-sm text-red-600 font-medium">
                  {currentStatus}
                </p>
              </div>
            </div>
            
            {/* Dropdown Menu para Status */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-800 transition-all duration-200 hover:scale-105 shadow-sm"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                  <span className="hidden sm:inline">Ver Status</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                  <Badge variant="secondary" className="ml-1 text-xs bg-blue-100 text-blue-700 font-medium">
                    {steps.length}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent 
                className="w-80 max-h-[70vh] overflow-y-auto p-0" 
                align="end"
                sideOffset={8}
              >
                <DropdownMenuLabel className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-800">Histórico de Status</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Código: {trackingCode}</p>
                </DropdownMenuLabel>
                
                <div className="p-2 space-y-1">
                  {steps.map((step, index) => {
                    const Icon = statusIcons[step.status as keyof typeof statusIcons]
                    const isCompleted = index <= currentStep
                    const isCurrent = index === currentStep
                    
                    return (
                      <DropdownMenuItem
                        key={step.id}
                        className={cn(
                          "flex items-start space-x-3 p-3 rounded-lg cursor-default transition-all duration-200",
                          step.status === "Retido na alfândega" ? "bg-red-50 hover:bg-red-100" : 
                          step.status === "Em transferência" || step.status === "Seu produto já está com a Jadlog" || step.status === "Seu produto está em transferência interna para Jadlog destino" ? "bg-gray-50 hover:bg-gray-100" :
                          step.status === "Em rota de entrega" ? "bg-blue-50 hover:bg-blue-100" :
                          step.status === "Entregue" ? "bg-green-50 hover:bg-green-100" :
                          isCompleted ? "bg-blue-50 hover:bg-blue-100" : "bg-gray-50 hover:bg-gray-100",
                          step.status === "Retido na alfândega" && "ring-1 ring-red-200",
                          isCurrent && "ring-2 ring-blue-300 bg-blue-100"
                        )}
                      >
                        {Icon && (
                          <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 flex-shrink-0",
                            isCompleted 
                              ? statusColors[step.status as keyof typeof statusColors] || "bg-blue-500 text-white"
                              : "bg-gray-300 text-gray-600"
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between space-x-2">
                            <h6 className={cn(
                              "font-medium text-sm leading-tight",
                              step.status === "Em rota de entrega" || step.status === "Entregue" ? "text-gray-600" :
                              isCompleted ? "text-gray-800" : "text-gray-600"
                            )}>
                              {step.status}
                            </h6>
                            {step.date && (
                              <div className="flex items-center space-x-1 text-xs text-gray-500 flex-shrink-0">
                                <Calendar className="w-3 h-3" />
                                <span>{step.date.split(' ')[0]}</span>
                              </div>
                            )}
                          </div>
                          
                          {step.description && (
                            <p className={cn(
                              "text-xs mt-1 leading-relaxed",
                              step.status === "Em rota de entrega" || step.status === "Entregue" ? "text-gray-500" :
                              isCompleted ? "text-gray-700" : "text-gray-500"
                            )}>
                              {step.description}
                            </p>
                          )}
                          
                          {isCurrent && (
                            <div className="flex items-center space-x-1 mt-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-blue-600 font-medium">Status Atual</span>
                            </div>
                          )}
                        </div>
                      </DropdownMenuItem>
                    )
                  })}
                </div>
                
                <DropdownMenuSeparator />
                
                <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Total de etapas: {steps.length}</span>
                    <span>Etapa atual: {currentStep + 1}</span>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
