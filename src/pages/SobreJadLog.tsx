import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SobreJadLog = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Sobre a JadLog
            </h1>
            <p className="text-xl text-gray-600">
              Sua parceira de confiança em soluções logísticas
            </p>
          </div>

          {/* Main Content */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Company Info */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-blue-600">🏢</span>
                  Nossa Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  A JadLog é uma empresa especializada em soluções logísticas completas, 
                  oferecendo serviços de transporte, armazenamento e distribuição para 
                  empresas de todos os portes.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Logística</Badge>
                  <Badge variant="secondary">Transporte</Badge>
                  <Badge variant="secondary">Distribuição</Badge>
                  <Badge variant="secondary">Armazenamento</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-green-600">🚚</span>
                  Nossos Serviços
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Transporte rodoviário nacional</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Rastreamento em tempo real</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Logística reversa</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Armazenagem inteligente</span>
                </div>
              </CardContent>
            </Card>

            {/* Mission */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-purple-600">🎯</span>
                  Nossa Missão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Proporcionar soluções logísticas inovadoras e eficientes, 
                  contribuindo para o sucesso dos nossos clientes através 
                  de um serviço de qualidade e tecnologia de ponta.
                </p>
              </CardContent>
            </Card>

            {/* Values */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-orange-600">⭐</span>
                  Nossos Valores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span>Transparência</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span>Confiabilidade</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span>Inovação</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span>Compromisso</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Section */}
          <Card className="mt-8 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-blue-600">
                Entre em Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-700 mb-4">
                Precisa de uma solução logística personalizada? 
                Nossa equipe está pronta para ajudar!
              </p>
              <div className="flex justify-center gap-4 text-sm text-gray-600">
                <span>📧 contato@jadlog.com</span>
                <span>📞 (11) 3000-0000</span>
                <span>🌐 www.jadlog.com</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SobreJadLog;

