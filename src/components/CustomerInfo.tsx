import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, MapPin, FileText, Mail, Phone } from "lucide-react"
import { cn } from "@/lib/utils"

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  status: string
}

interface Customer {
  name: string
  cpf: string
  phone: string
  email: string
  address: string
}

interface CustomerInfoProps {
  customer: Customer
  items: OrderItem[]
  className?: string
}

export function CustomerInfo({ customer, items, className }: CustomerInfoProps) {

  // Função para formatar CPF ou CNPJ com pontuações
  const formatDocument = (document: string) => {
    if (!document) return document
    
    // Remove todos os caracteres não numéricos
    const cleanDoc = document.replace(/\D/g, '')
    
    // Se tiver 11 dígitos = CPF (123.456.789-01)
    if (cleanDoc.length === 11) {
      return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    
    // Se tiver 14 dígitos = CNPJ (12.345.678/0001-90)
    if (cleanDoc.length === 14) {
      return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
    
    // Se não for nem CPF nem CNPJ, retorna o valor original
    return document
  }

  // Função para formatar telefone com formatação brasileira
  const formatPhone = (phone: string) => {
    if (!phone) return phone
    
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '')
    
    // Se tiver 13 dígitos = +55 + DDD + 9 dígitos (celular)
    if (cleanPhone.length === 13) {
      return cleanPhone.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 $2 $3-$4')
    }
    
    // Se tiver 12 dígitos = +55 + DDD + 8 dígitos (telefone fixo)
    if (cleanPhone.length === 12) {
      return cleanPhone.replace(/(\d{2})(\d{2})(\d{4})(\d{4})/, '+$1 $2 $3-$4')
    }
    
    // Se tiver 11 dígitos = DDD + 9 dígitos (celular sem código do país)
    if (cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '+55 $1 $2-$3')
    }
    
    // Se tiver 10 dígitos = DDD + 8 dígitos (telefone fixo sem código do país)
    if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '+55 $1 $2-$3')
    }
    
    // Se não for nenhum dos formatos acima, retorna o valor original
    return phone
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Informações do Cliente */}
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-primary" />
            <span>Informações do Cliente</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6">
            {/* Nome Completo e CPF/CNPJ lado a lado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm sm:text-base text-foreground">{customer.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Nome completo</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm sm:text-base text-foreground">{formatDocument(customer.cpf)}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">CPF/CNPJ</p>
                </div>
              </div>
            </div>
            
            {/* Email e Telefone lado a lado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm sm:text-base text-foreground">{customer.email}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">E-mail</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm sm:text-base text-foreground whitespace-nowrap">{formatPhone(customer.phone)}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Telefone</p>
                </div>
              </div>
            </div>
            
            {/* Endereço de entrega (largura total) */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm sm:text-base text-foreground whitespace-pre-line">{customer.address}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Endereço de entrega</p>
              </div>
            </div>
          </div>
        </CardContent>
        </Card>
      </div>



    </div>
  )
}