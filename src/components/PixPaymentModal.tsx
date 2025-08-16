import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Download, QrCode, Loader2, X, Check } from "lucide-react"

interface PixPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  orderId: string
  trackingCode?: string
  title?: string
  description?: string
  onPaymentConfirmed?: () => void
}

export function PixPaymentModal({ isOpen, onClose, amount, orderId, trackingCode, title, description, onPaymentConfirmed }: PixPaymentModalProps) {
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60) // 24 horas em segundos
  const [isGeneratingPayment, setIsGeneratingPayment] = useState(false)
  const [backendPixCode, setBackendPixCode] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<number | null>(null)
  const [providerOrderId, setProviderOrderId] = useState<string | number | null>(null)
  const [showCopiedMessage, setShowCopiedMessage] = useState(false)
  const navigate = useNavigate()
  
  // PIX gerado pelo backend (usa exatamente o qrcode string do provider como "copia e cola")
  const pixData = backendPixCode
    ? {
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(backendPixCode)}`,
        copyPaste: backendPixCode,
      }
    : null

  // Timer de 24 horas
  useEffect(() => {
    if (!isOpen) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen])

  // Registrar pagamento PIX quando modal é aberto (gera código no backend e salva DB)
  useEffect(() => {
    if (isOpen && trackingCode) {
      const registerPayment = async () => {
        try {
          console.log('🔄 Modal PIX aberto, registrando pagamento para:', trackingCode)
          
          // Determinar o tipo de pagamento baseado no amount
          const paymentType = amount === 15.40 ? 'frete_express' : 'taxa_liberacao'
          
          const paymentData = {
            tracking_code: trackingCode,
            amount: amount,
            payment_type: paymentType,
            order_id: orderId
          }
          
          console.log('📤 Enviando dados do pagamento:', paymentData)
          
          const response = await fetch('/api/payments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData)
          });

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Pagamento PIX registrado com sucesso:', result);
            if (result && result.pix_code) {
              setBackendPixCode(result.pix_code)
            }
            if (result && result.payment_id) {
              setPaymentId(result.payment_id)
            }
            if (result && result.provider_order_id) {
              setProviderOrderId(result.provider_order_id)
            }
            if (result && result.provider_order_id) {
              setProviderOrderId(result.provider_order_id)
            }
          } else {
            const errorData = await response.text();
            console.error('❌ Erro ao registrar pagamento PIX:', response.status, errorData);
          }
        } catch (error) {
          console.error('❌ Erro ao registrar pagamento:', error);
        }
      };

      registerPayment();
    }
  }, [isOpen, trackingCode, amount, orderId]);

  // Polling do status do pagamento consultando NovaEra e redirecionamento ao aprovar
  useEffect(() => {
    if (!paymentId && !providerOrderId) return
    let stop = false

    const check = async () => {
      try {
        // Primeiro tenta pelo provider (NovaEra), se houver
        let status: string | null = null
        if (providerOrderId !== null && providerOrderId !== undefined && providerOrderId !== '') {
          const providerRes = await fetch(`/api/providers/novaera/transactions/${providerOrderId}`)
          if (providerRes.ok) {
            const providerJson = await providerRes.json()
            const data = providerJson && providerJson.data ? providerJson.data : {}
            status = String(data.status || '').toLowerCase()
            // Atualiza fallback do QR se veio novamente
            if (data.pix && data.pix.qrcode && !backendPixCode) {
              setBackendPixCode(String(data.pix.qrcode))
            }
          }
        }

        if (status) {
          if (status === 'approved' || status === 'paid' || status === 'approved_payment') {
            if (onPaymentConfirmed) onPaymentConfirmed()
            navigate(`/pagamento-confirmado?tracking=${trackingCode || orderId}`)
            return
          }
        }
      } catch {}
      if (!stop) setTimeout(check, 3000)
    }

    const t = setTimeout(check, 3000)
    return () => { stop = true; clearTimeout(t) }
  }, [paymentId, providerOrderId])

  // Formatar tempo restante
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixData.copyPaste)
      setCopied(true)
      
      // Pequeno delay para garantir que a animação de entrada funcione
      setTimeout(() => {
        setShowCopiedMessage(true)
      }, 50)
      
      setTimeout(() => {
        setShowCopiedMessage(false)
        setTimeout(() => setCopied(false), 300) // Aguarda a animação de saída
      }, 2000)
    } catch (err) {
      // Erro silencioso
    }
  }

  const handleDownloadQR = () => {
    const link = document.createElement('a')
    link.href = pixData.qrCode
    link.download = `pix-qr-${orderId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Função para gerar pagamento (será implementada com a API da gateway)
  const handleGeneratePayment = async () => {
    setIsGeneratingPayment(true)
    
    // TODO: Implementar chamada para a API da gateway
    // const response = await apiGateway.createPayment({ amount, orderId, trackingCode })
    
    // Simular delay da API (remover quando implementar)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsGeneratingPayment(false)
    
    // TODO: Implementar lógica de confirmação baseada na resposta da API
    // if (response.success) {
    //   // Lógica de sucesso
    // }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="pix-modal sm:max-w-md max-w-[95vw] mx-auto my-auto max-h-[90vh] overflow-y-auto rounded-3xl sm:rounded-lg"
        style={{
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* Internet Explorer 10+ */
        }}
      >
        <style jsx>{`
          ::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }
          
          /* Solução agressiva para eliminar cores laranja */
          .copy-button,
          .copy-button[data-state="pressed"],
          .copy-button[data-state="closed"],
          .copy-button:active,
          .copy-button:focus,
          .copy-button:focus-visible,
          .copy-button:hover,
          .copy-button:visited {
            background-color: rgb(243 244 246) !important;
            color: rgb(17 24 39) !important;
            border-color: rgb(209 213 219) !important;
            outline: none !important;
            box-shadow: none !important;
          }
          
          /* Sobrescrever qualquer cor laranja do Shadcn */
          .copy-button[data-variant="outline"] {
            background-color: rgb(243 244 246) !important;
            color: rgb(17 24 39) !important;
            border-color: rgb(209 213 219) !important;
          }
          
          /* Estados específicos do botão */
          .copy-button[data-state="pressed"] {
            background-color: rgb(243 244 246) !important;
            color: rgb(17 24 39) !important;
            border-color: rgb(209 213 219) !important;
            transform: scale(0.98) !important;
          }
          
          .copy-button:active {
            background-color: rgb(243 244 246) !important;
            color: rgb(17 24 39) !important;
            border-color: rgb(209 213 219) !important;
            transform: scale(0.98) !important;
          }
          
          /* Remover qualquer ring ou outline laranja */
          .copy-button:focus,
          .copy-button:focus-visible {
            outline: none !important;
            outline-offset: 0 !important;
            ring: none !important;
            ring-color: transparent !important;
            box-shadow: none !important;
          }
          
          /* Remover foco automático quando modal abre */
          .copy-button:not(:focus):not(:focus-visible) {
            outline: none !important;
            box-shadow: none !important;
            ring: none !important;
          }
          
          /* Botão X discreto sem contornos */
          [data-radix-dialog-close],
          [data-radix-dialog-close]:focus,
          [data-radix-dialog-close]:focus-visible,
          [data-radix-dialog-close]:hover,
          [data-radix-dialog-close]:active {
            outline: none !important;
            box-shadow: none !important;
            ring: none !important;
            border: none !important;
            background: transparent !important;
          }
          
          /* Remover qualquer contorno do botão X */
          [data-radix-dialog-close]::before,
          [data-radix-dialog-close]::after {
            display: none !important;
          }
          
          /* Solução mais agressiva para o botão X */
          button[data-radix-dialog-close],
          button[data-radix-dialog-close]:focus,
          button[data-radix-dialog-close]:focus-visible,
          button[data-radix-dialog-close]:hover,
          button[data-radix-dialog-close]:active,
          button[data-radix-dialog-close]:visited {
            outline: none !important;
            outline-offset: 0 !important;
            box-shadow: none !important;
            ring: none !important;
            ring-color: transparent !important;
            border: none !important;
            background: transparent !important;
            color: inherit !important;
          }
          
          /* Remover qualquer estilo de foco do Radix */
          [data-radix-dialog-close][data-state="open"],
          [data-radix-dialog-close][data-state="closed"] {
            outline: none !important;
            box-shadow: none !important;
            ring: none !important;
            border: none !important;
            background: transparent !important;
          }
          
          /* Forçar remoção de qualquer cor vermelha */
          [data-radix-dialog-close] *,
          button[data-radix-dialog-close] * {
            outline: none !important;
            box-shadow: none !important;
            ring: none !important;
            border: none !important;
            background: transparent !important;
          }
          
          /* CSS global para eliminar vermelho de todo o modal */
          .pix-modal * {
            outline-color: transparent !important;
            border-color: transparent !important;
            box-shadow: none !important;
          }
          
          /* Especificamente para o botão X - última tentativa */
          [data-radix-dialog-close],
          [data-radix-dialog-close] button,
          [data-radix-dialog-close] div,
          [data-radix-dialog-close] span {
            all: unset !important;
            outline: none !important;
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
            color: inherit !important;
          }
        `}</style>
        <DialogHeader className="pb-6">
          <DialogTitle className="text-lg font-semibold text-gray-900 text-center">
            {title || "Pagamento PIX"}
          </DialogTitle>
          <p className="text-sm text-gray-600 text-center mt-2">
            {description || "Escaneie o QR Code ou copie o código PIX para efetuar o pagamento"}
          </p>
        </DialogHeader>
        
        <div className="space-y-6 py-6">
          {/* QR Code */}
          <div className="text-center">
            {!pixData ? (
              <div className="bg-white p-6 rounded-lg border border-gray-200 inline-flex items-center justify-center w-40 h-40">
                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
              </div>
            ) : (
              <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block">
                <img 
                  src={pixData.qrCode} 
                  alt="QR Code PIX" 
                  className="w-36 h-36 sm:w-40 sm:h-40"
                />
              </div>
            )}
            {/* link de checkout seguro removido */}
          </div>

          {/* Informações do pagamento */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Valor</span>
              <span className="font-medium text-gray-900">R$ {amount.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Destinatário</span>
              <span className="text-sm text-gray-600">JadLog Rastreamento</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Identificação</span>
              <span className="text-sm text-gray-600">{trackingCode || orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pagamento expira</span>
              <span className="font-mono text-sm text-orange-600">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Código PIX */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Código PIX (Copia e Cola):</label>
            <div className="flex space-x-2">
              <Input
                value={pixData ? pixData.copyPaste : 'Gerando código PIX...'}
                readOnly
                onFocus={(e) => e.target.blur()}
                className="font-mono text-xs flex-1 hover:bg-gray-100 focus:bg-gray-100 focus:border-gray-300 focus:ring-gray-300 focus:ring-1 focus-visible:border-gray-300 focus-visible:ring-gray-300 focus-visible:ring-1 transition-colors border-gray-200"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyPix}
                onFocus={(e) => e.target.blur()}
                tabIndex={-1}
                className={`copy-button px-3 transition-all duration-300 ease-in-out ${
                  copied 
                    ? 'bg-green-100 text-green-700 border-green-300 scale-105' 
                    : ''
                }`}
                disabled={!pixData}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            {copied && (
              <div className={`transition-all duration-300 ease-in-out ${
                showCopiedMessage 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform -translate-y-2'
              }`}>
                <p className="text-xs text-green-600 mt-2">
                  ✓ Código copiado!
                </p>
              </div>
            )}
          </div>

          {/* Instruções de como pagar */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 text-sm mb-3 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Como pagar
            </h4>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Acesse o app do seu banco</li>
              <li>Escolha a opção PIX</li>
              <li>Escaneie o QR Code ou cole o código</li>
              <li>Confirme a transação</li>
            </ol>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-sm text-green-700 font-medium flex items-center">
                <span className="text-green-600 mr-1">✓</span>
                Rastreamento liberado automaticamente
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}