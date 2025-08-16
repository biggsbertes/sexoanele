import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ResponsiveTrackingCard } from "@/components/ResponsiveTrackingCard"
import { TrackingStatusField } from "@/components/TrackingStatusField"
import { CustomerInfo } from "@/components/CustomerInfo"
import { PixPaymentModal } from "@/components/PixPaymentModal"
import { Package, Image } from "lucide-react"
import Header from "@/components/Header"

interface LeadData {
  id: number;
  tracking: string;
  nome: string;
  nome_produto: string;
  valor?: number;
  telefone: string;
  endereco: string;
  cpf_cnpj: string;
  email: string;
  data: string;
  created_at: string;
}

const TrackingResult = () => {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [trackingData, setTrackingData] = useState<LeadData | null>(null)
  const [isPixModalOpen, setIsPixModalOpen] = useState(false)
  const [isGeneratingPayment, setIsGeneratingPayment] = useState(false)
  const [feeBreakdown, setFeeBreakdown] = useState<{ ii: number; icms: number; admin: number; operacionais: number; total: number }>({ ii: 0, icms: 0, admin: 0, operacionais: 0, total: 0 })

  useEffect(() => {
    if (code) {
      fetchTrackingData(code)
    }
  }, [code])

  const fetchTrackingData = async (trackingCode: string) => {
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/tracking/${trackingCode}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          // Erro silencioso
        } else {
          // Erro silencioso
        }
        return
      }
      
      const data = await response.json()
      setTrackingData(data)
      // Calcular taxas a partir do valor do lead
      const valorBase = Number(data?.valor) || 0
      const impostoImportacao = round2(valorBase * 0.12) // 12%
      const baseICMS = valorBase + impostoImportacao
      const icms = round2(baseICMS * 0.18) // 18%
      const taxaAdministrativa = 14.9 // fixa
      const encargosOperacionais = round2(Math.max(valorBase * 0.017, 10)) // 1.7% (mín R$10)
      const total = round2(impostoImportacao + icms + taxaAdministrativa + encargosOperacionais)
      setFeeBreakdown({ ii: impostoImportacao, icms, admin: taxaAdministrativa, operacionais: encargosOperacionais, total })
    } catch (err) {
      console.error('Erro ao buscar tracking:', err)
      // Erro silencioso
    } finally {
      setIsLoading(false)
    }
  }

  const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Carregando informações de rastreio...</p>
        </div>
      </div>
    )
  }

  if (!trackingData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
              <Package className="w-12 h-12 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Código não encontrado
            </h2>
            <p className="text-muted-foreground mb-6">
              O código <strong>{code}</strong> não foi encontrado em nosso sistema.
              Verifique se digitou corretamente.
            </p>
            <Button onClick={() => navigate('/')} className="gradient-primary">
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Criar dados estruturados para manter o estilo original
  const customerData = {
    name: trackingData.nome,
    cpf: trackingData.cpf_cnpj || 'Não informado',
    phone: trackingData.telefone || 'Não informado',
    email: trackingData.email || 'Não informado',
    address: trackingData.endereco || 'Não informado'
  }

  // Função para gerar datas dinâmicas e realistas
  const generateRealisticDates = () => {
    const today = new Date()
    const currentDay = today.getDate()
    const currentMonth = today.getMonth() + 1
    const currentYear = today.getFullYear()
    
    // Formatar data atual (DD/MM/YYYY)
    const formatDate = (day: number, month: number, year: number) => {
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
    }
    
    // Data atual para o status "Retido na alfândega"
    const currentDate = formatDate(currentDay, currentMonth, currentYear)
    
    // Datas anteriores (realistas)
    const previousDate1 = formatDate(Math.max(1, currentDay - 4), currentMonth, currentYear) // 4 dias atrás
    const previousDate2 = formatDate(Math.max(1, currentDay - 7), currentMonth, currentYear) // 7 dias atrás
    
    return {
      current: currentDate,
      previous1: previousDate1,
      previous2: previousDate2
    }
  }

  const dates = generateRealisticDates()

  const itemsData = [
    {
      id: "1",
      name: trackingData.nome_produto,
      quantity: 1,
      price: 0,
      status: "Retido"
    }
  ]

  const stepsData = [
    {
      id: "1",
      status: "Seu produto já está com a Jadlog",
      description: "Produto recebido e processado pela Jadlog",
      date: dates.previous2,
      completed: true,
      bgColor: "bg-gray-50"
    },
    {
      id: "2",
      status: "Seu produto está em transferência interna para Jadlog destino",
      description: "Produto em transferência para o centro de distribuição",
      date: dates.previous1,
      completed: true,
      bgColor: "bg-gray-50"
    },
    {
      id: "3",
      status: "Retido na alfândega",
      description: "Produto retido para verificação aduaneira",
      date: dates.current,
      completed: true,
      bgColor: "bg-red-50"
    },
    {
      id: "4",
      status: "Em rota de entrega",
      description: "Saiu para entrega",
      date: "",
      completed: false,
      bgColor: "bg-white",
      textColor: "text-gray-400"
    },
    {
      id: "5",
      status: "Entregue",
      description: "Produto entregue ao destinatário",
      date: "",
      completed: false,
      bgColor: "bg-white",
      textColor: "text-gray-400"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-8 sm:space-y-12">
          {/* 1. Informações do Cliente */}
          <div className="animate-fade-in [animation-duration:1.5s]">
            <CustomerInfo
              customer={customerData}
              items={[]}
            />
          </div>

          {/* 2. Itens do Pedido */}
          <div className="animate-fade-in [animation-duration:1.5s]">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center space-x-2" style={{ color: '#3a3839' }}>
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  <span>Itens do Pedido</span>
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  {itemsData.map((item: any, index: number) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground text-sm sm:text-base">{item.name}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          <span className="block sm:inline">Quantidade: {item.quantity}</span>
                          <span className="hidden sm:inline"> | </span>
                          <span className="block sm:inline">Data: {trackingData.data || 'Não informada'}</span>
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className={`px-2 sm:px-3 py-1 rounded-sm text-xs font-medium ${
                          item.status === 'Entregue' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>



          {/* 3. Status do Rastreio */}
          <div className="animate-fade-in [animation-duration:1.5s]">
            <div className="max-w-2xl mx-auto">
              <TrackingStatusField />
            </div>
          </div>



          {/* 5. Guia de Pagamento */}
          <div className="animate-fade-in [animation-duration:1.5s]">
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Card: Guia de Pagamento */}
              <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6">
                                   <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4" style={{ color: '#3a3839' }}>
                     Guia de Pagamento - Órgão Tributador
                   </h2>
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex justify-between items-start">
                    <span className="text-xs sm:text-sm text-muted-foreground flex-1 pr-2 break-words">Imposto de Importação (12%)</span>
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground flex-shrink-0">R$ {feeBreakdown.ii.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs sm:text-sm text-muted-foreground flex-1 pr-2 break-words">ICMS (18% sobre valor + II)</span>
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground flex-shrink-0">R$ {feeBreakdown.icms.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs sm:text-sm text-muted-foreground flex-1 pr-2 break-words">Taxa Administrativa</span>
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground flex-shrink-0">R$ {feeBreakdown.admin.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <span className="text-xs sm:text-sm text-muted-foreground block sm:inline">Encargos Operacionais</span>
                      <span className="text-xs sm:text-sm text-muted-foreground/70 block sm:inline">(1,7% • mín R$ 10,00)</span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground flex-shrink-0">R$ {feeBreakdown.operacionais.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 sm:pt-3">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-foreground text-sm sm:text-base flex-1 pr-2">Total</span>
                      <span className="font-bold text-foreground text-sm sm:text-base flex-shrink-0">R$ {feeBreakdown.total.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                </div>

                {/* Botão de Pagamento */}
                <div className="text-center flex justify-center items-center">
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-8 rounded-lg transition-all duration-200 shadow-md text-sm sm:text-base w-auto flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    onClick={async () => {
                      setIsGeneratingPayment(true)
                      
                      try {
                        // Registrar pagamento PIX na API
                        const response = await fetch('/api/payments', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            tracking_code: trackingData.tracking,
                            amount: feeBreakdown.total,
                            payment_type: 'taxa_liberacao',
                            order_id: trackingData.tracking
                          })
                        });

                        if (response.ok) {
                          const paymentData = await response.json();
                          console.log('Pagamento PIX registrado:', paymentData);
                        } else {
                          console.error('Erro ao registrar pagamento PIX');
                        }
                      } catch (error) {
                        console.error('Erro ao registrar pagamento:', error);
                      }

                      // Simular delay de geração do pagamento
                      await new Promise(resolve => setTimeout(resolve, 2000))
                      setIsGeneratingPayment(false)
                      setIsPixModalOpen(true)
                    }}
                    disabled={isGeneratingPayment}
                  >
                    {isGeneratingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Processando...</span>
                      </>
                    ) : (
                      <span>Pagar Taxa de Liberação</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Mensagem da Alfândega */}
          <div className="animate-fade-in [animation-duration:1.5s]">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-100">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground text-left mb-3 sm:mb-4 leading-tight">
                      Sua encomenda está aguardando regularização para liberação na triagem aduaneira
                    </h3>
                    
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-5">
                      O recolhimento abaixo é exigido pela Receita Federal para conclusão do desembaraço.
                    </p>
                    
                    <ul className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                      <li className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          Valores únicos referentes à importação, desembaraço e encargos operacionais
                        </span>
                      </li>
                      <li className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          Após a confirmação, o processamento é imediato e o comprovante é enviado ao seu e-mail
                        </span>
                      </li>
                      <li className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          Caso não regularizada, a encomenda poderá retornar ao remetente conforme prazos do operador
                        </span>
                      </li>
                    </ul>
                    
                    <div className="border-t border-gray-200 pt-3 sm:pt-4">
                      <p className="text-xs text-muted-foreground/80 font-medium">
                        Base legal: Lei nº 8.846/1994 (Emissão de documento fiscal e recolhimento de impostos)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PixPaymentModal 
        isOpen={isPixModalOpen} 
        onClose={() => setIsPixModalOpen(false)}
        amount={feeBreakdown.total}
        orderId={trackingData.tracking}
        trackingCode={trackingData.tracking}
      />
    </div>
  )
}

export default TrackingResult
