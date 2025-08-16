import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, AlertCircle, CheckCircle, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface TrackingStatus {
  id: number
  title: string
  description: string
  status: 'completed' | 'current' | 'pending'
  icon: any
  color: string
  date?: string
}

export function TrackingStatusField() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // Função para obter a data atual formatada
  const getCurrentDate = () => {
    const now = new Date()
    return now.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const trackingStatuses: TrackingStatus[] = [
    {
      id: 1,
      title: "Seu produto já está com a Jadlog",
      description: "Produto recebido e processado pela Jadlog",
      status: 'completed',
      icon: Package,
      color: 'bg-blue-500',
      date: "14/08/2024"
    },
    {
      id: 2,
      title: "Seu produto está em transferência interna para Jadlog destino",
      description: "Produto em transferência para o centro de distribuição",
      status: 'completed',
      icon: Truck,
      color: 'bg-blue-500',
      date: "16/08/2024"
    },
    {
      id: 3,
      title: "Retido na alfândega",
      description: "Produto retido para verificação",
      status: 'current',
      icon: AlertCircle,
      color: 'bg-red-500',
      date: "20/08/2024"
    },
    {
      id: 4,
      title: "Em rota de entrega",
      description: "Saiu para entrega",
      status: 'pending',
      icon: Truck,
      color: 'bg-gray-400'
    },
    {
      id: 5,
      title: "Entregue",
      description: "Produto entregue ao destinatário",
      status: 'pending',
      icon: CheckCircle,
      color: 'bg-gray-400'
    }
  ]

  const currentStatus = trackingStatuses.find(status => status.status === 'current')
  const completedCount = trackingStatuses.filter(status => status.status === 'completed').length

  return (
    <Card className="w-full bg-white border border-gray-200 shadow-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Status Atual */}
          <div className="flex items-center space-x-3">
            <div className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 shadow-md",
              currentStatus?.color || "bg-red-500"
            )}>
              {currentStatus?.icon && <currentStatus.icon className="w-6 h-6 text-white" />}
            </div>
            <div>
                             <h4 className="font-semibold text-foreground text-base flex items-center space-x-2">
                 <span>Status do Rastreio</span>
               </h4>
              <p className="text-sm text-red-600 font-medium">
                {currentStatus?.title || "Retido na alfândega"}
              </p>
            </div>
          </div>
          
          {/* Botão do Menu */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "flex items-center space-x-2 bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-800 transition-all duration-300 hover:scale-105 shadow-sm",
              isMenuOpen && "ring-2 ring-blue-300 bg-blue-50"
            )}
          >
            <span className="hidden sm:inline">
              {isMenuOpen ? "Fechar" : "Ver Status"}
            </span>
            <ChevronDown className={cn(
              "w-4 h-4 text-gray-500 transition-transform duration-300",
              isMenuOpen && "rotate-180"
            )} />
            <Badge variant="secondary" className="ml-1 text-xs bg-blue-100 text-blue-700 font-medium">
              {completedCount}/{trackingStatuses.length}
            </Badge>
          </Button>
        </div>

        {/* Menu Interno Expansível */}
        {isMenuOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200 animate-in slide-in-from-top-2 duration-300">
            {/* Header do Menu */}
            <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 mb-3">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-gray-800 text-sm">Status do Rastreio</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Acompanhe o progresso da sua encomenda</p>
            </div>
            
            {/* Lista de Status */}
            <div className="space-y-2">
              {trackingStatuses.map((status, index) => (
                <div
                  key={status.id}
                  className={cn(
                    "flex items-start space-x-3 p-3 rounded-lg border transition-all duration-300 hover:scale-[1.01] cursor-default",
                    status.status === 'current' ? "bg-red-50 border-red-200 ring-2 ring-red-200" :
                    status.status === 'completed' ? "bg-green-50 border-green-200" :
                    "bg-gray-50 border-gray-200",
                    index === 0 && "animate-in slide-in-from-top-2 duration-300 delay-100",
                    index === 1 && "animate-in slide-in-from-top-2 duration-300 delay-200",
                    index === 2 && "animate-in slide-in-from-top-2 duration-300 delay-300",
                    index === 3 && "animate-in slide-in-from-top-2 duration-300 delay-400",
                    index === 4 && "animate-in slide-in-from-top-2 duration-300 delay-500"
                  )}
                >
                                     <div className={cn(
                     "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 flex-shrink-0 shadow-sm",
                     status.status === 'current' ? status.color + " text-white" :
                     status.status === 'completed' ? "bg-green-500 text-white" :
                     "bg-gray-300 text-gray-600"
                   )}>
                     <status.icon className="w-4 h-4" />
                   </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between space-x-2">
                      <h6 className={cn(
                        "font-medium text-sm leading-tight",
                        status.status === 'current' ? "text-red-800" :
                        status.status === 'completed' ? "text-green-800" :
                        "text-gray-600"
                      )}>
                        {status.title}
                      </h6>
                      {status.status === 'current' && (
                        <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 animate-pulse">
                          Atual
                        </Badge>
                      )}
                      
                    </div>
                    
                    <p className={cn(
                      "text-xs mt-1 leading-relaxed",
                      status.status === 'current' ? "text-red-700" :
                      status.status === 'completed' ? "text-green-700" :
                      "text-gray-500"
                    )}>
                                                            {status.description}
                </p>
                
                {status.status === 'current' && (
                  <div className="flex items-center space-x-1 mt-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-red-600 font-medium">Status Atual</span>
                  </div>
                )}
                
                {status.status === 'current' && (
                  <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                    <span>Data: {getCurrentDate()}</span>
                  </div>
                )}
                
                {status.status === 'completed' && status.date && (
                  <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                    <span>Data: {status.date}</span>
                  </div>
                )}
                </div>
                </div>
              ))}
            </div>
            
            {/* Footer do Menu */}
            <div className="mt-3 pt-3 border-t border-gray-200 bg-gray-50 rounded-lg px-3 py-2">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Total de etapas: {trackingStatuses.length}</span>
                <span>Concluídas: {completedCount}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
