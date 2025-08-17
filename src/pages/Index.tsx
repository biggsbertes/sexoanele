import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Package, Truck, MapPin, CheckCircle } from "lucide-react"

import { toast } from "sonner"
import Header from "@/components/Header"
import { ChatWidget } from "@/components/ChatWidget"

const Index = () => {
  const [trackingCode, setTrackingCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { quickCode } = useParams<{ quickCode?: string }>()

  useEffect(() => {
    if (quickCode) {
      setTrackingCode(quickCode.toUpperCase())
    }
  }, [quickCode])

  const handleTrack = () => {
    if (!trackingCode.trim()) {
      toast.error("Por favor, insira um código de rastreio válido")
      return
    }

    setIsLoading(true)
    
    // Simula validação do código
    setTimeout(() => {
      setIsLoading(false)
      navigate(`/rastreio/${trackingCode.trim()}`)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTrack()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!trackingCode.trim()) {
      return
    }
    
    navigate(`/rastreio/${trackingCode.trim()}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section estilo Jadlog */}
      <main className="container mx-auto px-6 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Título principal */}
          <div className="text-center mb-16 animate-fade-in">
                         <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 md:mb-8 leading-tight" style={{ color: '#3a3839' }}>
               <span className="inline-block animate-fade-scale">Rastreie sua</span> <br/>
               <span className="inline-block animate-fade-scale animate-delay-200" style={{ 
                 background: 'linear-gradient(135deg, #dc003a, #c40134)', 
                 WebkitBackgroundClip: 'text', 
                 WebkitTextFillColor: 'transparent',
                 backgroundClip: 'text'
               }}>encomenda</span>
            </h2>
                         <p className="text-lg sm:text-xl text-muted-foreground mb-4 max-w-3xl mx-auto font-medium leading-relaxed px-4">
              Acompanhe o status da sua entrega em tempo real com nosso sistema
            </p>

          </div>

          {/* Card de Rastreio Principal - estilo Jadlog */}
          <div className="max-w-3xl mx-auto mb-16 md:mb-20 px-4 sm:px-6">
            <Card className="gradient-card shadow-hero border-0 animate-scale-in p-4 sm:p-6 md:p-8">
              <CardContent className="space-y-8 p-0">
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl font-heading font-semibold mb-3" style={{ color: '#3a3839' }}>
                    Informe o código de rastreamento
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Digite o código que você recebeu por e-mail ou WhatsApp
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Input
                      placeholder="Ex: BR123456789BR"
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                      onKeyPress={handleKeyPress}
                      className="text-base sm:text-lg h-12 sm:h-14 text-center font-mono tracking-wider transition-smooth focus:shadow-glow border-2 focus:border-primary/30"
                      disabled={isLoading}
                    />
                    
                    <Button 
                      onClick={handleTrack} 
                      disabled={isLoading || !trackingCode.trim()}
                      className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold shadow-card transition-bounce hover:scale-[1.02] disabled:opacity-50"
                      style={{ 
                        background: 'linear-gradient(135deg, #dc003a, #c40134)',
                        color: 'white',
                        animation: 'buttonPulse 3s ease-in-out infinite'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #eb0945, #dc003a)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #dc003a, #c40134)';
                      }}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                          <span>Consultando...</span>
                        </div>
                      ) : (
                        <>
                          <Search className="w-6 h-6 mr-3" />
                          Rastrear Encomenda
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed px-2">
                      O código de rastreamento é enviado por e-mail ou WhatsApp assim que sua<br className="hidden sm:block"/>
                      <span className="sm:hidden">encomenda é despachada pelo remetente</span>
                      <span className="hidden sm:inline">encomenda é despachada pelo remetente</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seção de Clientes - Carrossel */}
          <div className="text-center mt-24 md:mt-28 animate-fade-in-up px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-4 md:mb-6" style={{ color: '#3a3839' }}>
              Conheça alguns clientes da Jadlog
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-8 md:mb-12 max-w-4xl mx-auto leading-relaxed">
              Siga o caminho de quem já trabalha conosco e encontre as melhores soluções logísticas.
            </p>
            
            {/* Carrossel de Logos */}
            <div className="max-w-5xl sm:max-w-6xl mx-auto overflow-hidden">
              <div className="flex animate-scroll-x">
                {/* Primeira linha de logos */}
                <div className="flex space-x-8 sm:space-x-10 md:space-x-12 lg:space-x-16 items-center min-w-max">
                  <div className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-20 lg:w-32 lg:h-20 flex items-center justify-center transition-all duration-300">
                    <img src="https://http2.mlstatic.com/resources/frontend/statics/loyal/partners/meliplus/vdp/pill-meliplus@3x.png" alt="Meliplus" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-20 lg:w-32 lg:h-20 flex items-center justify-center transition-all duration-300">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png" alt="Amazon" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-20 lg:w-32 lg:h-20 flex items-center justify-center transition-all duration-300">
                    <img src="https://logodownload.org/wp-content/uploads/2017/04/britania-logo.png" alt="Britânia" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-20 lg:w-32 lg:h-20 flex items-center justify-center transition-all duration-300">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Electrolux_logo.png/1200px-Electrolux_logo.png" alt="Electrolux" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-20 lg:w-32 lg:h-20 flex items-center justify-center transition-all duration-300">
                    <img src="https://logodownload.org/wp-content/uploads/2019/09/arezzo-logo.png" alt="Arezzo" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-20 lg:w-32 lg:h-20 flex items-center justify-center transition-all duration-300">
                    <img src="https://cdn.freelogovectors.net/wp-content/uploads/2020/12/privalia-logo.png" alt="Privalia" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-20 lg:w-32 lg:h-20 flex items-center justify-center transition-all duration-300">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/O-boticario-logo-0-599x599.png" alt="O Boticário" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-20 lg:w-32 lg:h-20 flex items-center justify-center transition-all duration-300">
                    <img src="https://mir-s3-cdn-cf.behance.net/projects/404/8909b1144139065.Y3JvcCwxNTAwLDExNzMsMCwxNjM.png" alt="Behance" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-20 lg:w-32 lg:h-20 flex items-center justify-center transition-all duration-300">
                    <img src="https://logodownload.org/wp-content/uploads/2023/10/petz-logo-0.png" alt="Petz" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-20 lg:w-32 lg:h-20 flex items-center justify-center transition-all duration-300">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Logotipo_das_Lojas_Renner.svg/2560px-Logotipo_das_Lojas_Renner.svg.png" alt="Lojas Renner" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-20 lg:w-32 lg:h-20 flex items-center justify-center transition-all duration-300">
                    <img src="https://logodownload.org/wp-content/uploads/2016/11/nestle-logo-8.png" alt="Nestlé" className="w-full h-full object-contain" />
                  </div>
                </div>
                
                {/* Segunda linha de logos (duplicada para loop infinito) */}
                <div className="flex space-x-8 sm:space-x-10 md:space-x-12 lg:space-x-16 items-center min-w-max">
                  <div className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-20 lg:w-32 lg:h-20 flex items-center justify-center transition-all duration-300">
                    <img src="https://http2.mlstatic.com/resources/frontend/statics/loyal/partners/meliplus/vdp/pill-meliplus@3x.png" alt="Meliplus" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-20 lg:w-32 lg:h-20 flex items-center justify-center transition-all duration-300">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png" alt="Amazon" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-20 lg:w-32 lg:h-20 flex items-center justify-center transition-all duration-300">
                    <img src="https://logodownload.org/wp-content/uploads/2017/04/britania-logo.png" alt="Britânia" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-20 lg:w-32 lg:h-20 flex items-center justify-center transition-all duration-300">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Electrolux_logo.png/1200px-Electrolux_logo.png" alt="Electrolux" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-20 lg:w-32 lg:h-20 flex items-center justify-center transition-all duration-300">
                    <img src="https://logodownload.org/wp-content/uploads/2019/09/arezzo-logo.png" alt="Arezzo" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-20 lg:w-32 lg:h-20 flex items-center justify-center transition-all duration-300">
                    <img src="https://cdn.freelogovectors.net/wp-content/uploads/2020/12/privalia-logo.png" alt="Privalia" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-20 lg:w-32 lg:h-20 flex items-center justify-center transition-all duration-300">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/O-boticario-logo-0-599x599.png" alt="O Boticário" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-20 lg:w-32 lg:h-20 flex items-center justify-center transition-all duration-300">
                    <img src="https://mir-s3-cdn-cf.behance.net/projects/404/8909b1144139065.Y3JvcCwxNTAwLDExNzMsMCwxNjM.png" alt="Behance" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-20 lg:w-32 lg:h-20 flex items-center justify-center transition-all duration-300">
                    <img src="https://logodownload.org/wp-content/uploads/2023/10/petz-logo-0.png" alt="Petz" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-20 lg:w-32 lg:h-20 flex items-center justify-center transition-all duration-300">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Logotipo_das_Lojas_Renner.svg/2560px-Logotipo_das_Lojas_Renner.svg.png" alt="Lojas Renner" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-20 lg:w-32 lg:h-20 flex items-center justify-center transition-all duration-300">
                    <img src="https://logodownload.org/wp-content/uploads/2016/11/nestle-logo-8.png" alt="Nestlé" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            </div>
            </div>

          {/* Seção Somos a Jadlog */}
          <div className="text-center mt-24 md:mt-28 animate-fade-in-up px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                {/* Imagem */}
                <div className="flex-1">
                  <img 
                    src="https://i.imgur.com/QplGChh.png" 
                    alt="Somos a Jadlog" 
                    className="w-full max-w-3xl mx-auto rounded-lg"
                  />
                </div>
                
                {/* Texto e botão */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="space-y-6">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-heading font-light leading-tight" style={{ color: '#3a3839' }}>
                      Somos a Jadlog,<br />
                      sua encomenda no<br />
                      melhor caminho.
                    </div>
                    
                    <div className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed space-y-2 text-left">
                      <p>• Somos transportadores.</p>
                      <p>• Somos pessoas.</p>
                      <p>• Somos mais de 5.000 colaboradores diretos e indiretos.</p>
                      <p>• Somos 7.000 veículos, caminhões e carretas que coletam e entregam sua encomenda.</p>
                      <p>• Somos o comércio do seu lado, com 4.000 parceiros Pickup.</p>
                      <p>• Somos parte do Grupo europeu líder em entrega de encomendas e soluções para comércio eletrónico, o Geopost.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Franquia */}
          <div className="text-center mt-24 md:mt-28 animate-fade-in-up px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                {/* Imagem da franquia */}
                <div className="flex-1">
                  <img 
                    src="https://www.jadlog.com.br/jadlog/img/outdoor02.png" 
                    alt="Seja um franqueado Jadlog" 
                    className="w-full max-w-3xl mx-auto rounded-lg"
                  />
                </div>
                
                {/* Texto e botão */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="space-y-6">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-heading font-light leading-tight" style={{ color: '#3a3839' }}>
                      Seja um franqueado<br />
                      Jadlog e encontre<br />
                      novos caminhos<br />
                      para seu sucesso<br />
                      profissional.
                    </div>
                    
                    <div className="pt-4">
                      <img 
                        src="https://www.jadlog.com.br/jadlog/img/bt_saibamais.jpg" 
                        alt="Saiba mais" 
                        className="inline-block cursor-pointer hover:opacity-90 transition-opacity duration-200"
                        style={{ maxWidth: '200px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

              </div>
      </main>

      {/* Seção Últimas Notícias da Jadlog - Fora do main */}
      <div className="mt-24 md:mt-28">
        {/* Título e descrição */}
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-5xl mx-auto text-center mb-4 md:mb-8 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-heading font-bold mb-3 md:mb-4 leading-tight" style={{ color: '#3a3839' }}>
              Últimas Notícias da Jadlog
            </h2>
            <p className="text-sm sm:text-base md:text-base text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Conteúdo exclusivo para manter você sempre informado sobre tudo que acontece por aqui e no mercado.
            </p>
          </div>
        </div>
        
        {/* Imagem do banner JadNews - Largura total apenas no mobile */}
        <div className="w-full md:container md:mx-auto md:px-6">
          <div className="md:max-w-4xl md:mx-auto">
            <img 
              src="https://www.jadlog.com.br/portal/assets/img/cint_jadnews.jpg" 
              alt="JadNews - Últimas Notícias da Jadlog" 
              className="w-full md:rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Footer reformulado */}
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
      
      <ChatWidget />
    </div>
  );
};

export default Index;
