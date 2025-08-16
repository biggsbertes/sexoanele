import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Package, CheckCircle, Truck, MapPin, Clock } from "lucide-react"
import Header from "@/components/Header"

interface TrackingStep {
  id: number
  title: string
  description: string
  date: string
  completed: boolean
  active: boolean
}

export function FreteExpressConfirmed() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [trackingData, setTrackingData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const trackingCode = searchParams.get('tracking')

  useEffect(() => {
    // Simular carregamento dos dados de rastreamento
    setTimeout(() => {
      setTrackingData({
        tracking: trackingCode || "US641400141BR",
        payment: {
          amount: 67.40,
          status: "confirmado",
          confirmedAt: new Date().toLocaleString('pt-BR')
        }
      })
      setLoading(false)
    }, 1500)
  }, [trackingCode])

  const steps: TrackingStep[] = [
    {
      id: 1,
      title: "Pagamento Confirmado",
      description: "Pagamento PIX confirmado e processado com sucesso",
      date: new Date().toLocaleDateString('pt-BR'),
      completed: true,
      active: false
    },
    {
      id: 2,
      title: "Preparando para envio",
      description: "Produto sendo preparado para envio express. Entrega em até 12 horas.",
      date: new Date().toLocaleDateString('pt-BR'),
      completed: false,
      active: true
    },
    {
      id: 3,
      title: "Em Rota",
      description: "Produto em trânsito para entrega",
      date: "",
      completed: false,
      active: false
    },
    {
      id: 4,
      title: "Entregue",
      description: "Produto entregue ao destinatário",
      date: "",
      completed: false,
      active: false
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Confirmando pagamento do frete express...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-4 sm:py-8">
        <style jsx>{`
          @keyframes truckMove {
            0% {
              transform: translateX(-2px);
            }
            50% {
              transform: translateX(2px);
            }
            100% {
              transform: translateX(-2px);
            }
          }
          
          .animate-truck {
            animation: truckMove 1.5s ease-in-out infinite;
          }
        `}</style>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header de Confirmação */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-3 sm:mb-4">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Frete Express Confirmado!
            </h1>
            <p className="text-base sm:text-lg text-gray-600 px-2">
              Seu pagamento do frete express foi processado com sucesso. Entrega em até 12 horas.
            </p>
          </div>

          {/* Código de Rastreamento */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 flex-shrink-0" />
                <div className="text-center sm:text-left">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Código de Rastreamento</h2>
                  <p className="text-xs sm:text-sm text-gray-600">Use este código para acompanhar seu pedido</p>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-lg sm:text-2xl font-mono font-bold text-green-600 break-all">
                  {trackingData?.tracking}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">Status: Liberado + Express</p>
              </div>
            </div>
          </div>



          {/* Informações do Frete Express */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-green-600 animate-truck" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-green-900 mb-2">
                Produto sendo preparado!
              </h2>
              <p className="text-sm sm:text-base text-green-700 mb-4">
                Seu produto chegará em até 12 horas.
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Voltar para página inicial
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16 md:mt-20">
        <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            {/* Lado esquerdo - Logo Jadlog + Copyright */}
            <div className="flex items-center space-x-6">
              <img 
                src="https://cdn.cookielaw.org/logos/ca573dc2-6848-4d5d-811b-a73af38af8db/351dcc81-561f-44be-ad95-966e6f1bb905/f0416ebe-67db-4d95-aee0-56e49a2678f4/logo_jadlog.png" 
                alt="Jadlog Logo" 
                className="h-12 w-auto object-contain"
              />
              <span className="text-sm text-muted-foreground">
                ©2021 Jadlog - Todos os direitos reservados
              </span>
            </div>
            
            {/* Lado direito - Logo Geopost + Desenvolvimento */}
            <div className="flex flex-col items-end space-y-2">
              {/* Logo Geopost */}
              <img 
                src="https://integracoes.jadlog.com.br/wp-content/uploads/2022/04/GEOPOST_logo-endorsement_redblack_rgb.png" 
                alt="Geopost Logo" 
                className="h-14 w-auto object-contain"
              />
              
              {/* Seção Desenvolvimento */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">Desenvolvimento:</span>
                <img
                  src="https://static.wixstatic.com/media/04414b_f247fc186c9548cab59a461766fc77fc~mv2.png/v1/fill/w_55,h_22,al_c,q_85,enc_avif,quality_auto/logo_tripe.png"
                  alt="Tripe Logo"
                  className="h-5 w-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden space-y-4">
            {/* Logo Jadlog + Copyright - Centralizado */}
            <div className="flex flex-col items-center space-y-2">
              <img 
                src="https://cdn.cookielaw.org/logos/ca573dc2-6848-4d5d-811b-a73af38af8db/351dcc81-561f-44be-ad95-966e6f1bb905/f0416ebe-67db-4d95-aee0-56e49a2678f4/logo_jadlog.png" 
                alt="Jadlog Logo" 
                className="h-8 sm:h-10 w-auto object-contain"
              />
              <span className="text-xs sm:text-sm text-muted-foreground text-center px-2">
                ©2021 Jadlog - Todos os direitos reservados
              </span>
            </div>
            
            {/* Logos Geopost e Tripe - Lado a lado */}
            <div className="flex justify-center items-center space-x-4 sm:space-x-6">
              {/* Logo Geopost */}
              <img 
                src="https://integracoes.jadlog.com.br/wp-content/uploads/2022/04/GEOPOST_logo-endorsement_redblack_rgb.png" 
                alt="Geopost Logo" 
                className="h-10 sm:h-12 md:h-14 w-auto object-contain"
              />
              
              {/* Logo Tripe */}
              <div className="flex flex-col items-center space-y-1">
                <span className="text-xs text-muted-foreground">Desenvolvimento:</span>
                <img
                  src="https://static.wixstatic.com/media/04414b_f247fc186c9548cab59a461766fc77fc~mv2.png/v1/fill/w_55,h_22,al_c,q_85,enc_avif,quality_auto/logo_tripe.png"
                  alt="Tripe Logo"
                  className="h-4 sm:h-5 w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
