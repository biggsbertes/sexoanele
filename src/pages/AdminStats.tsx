import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  BarChart3,
  Download,
  RefreshCw,
  Activity,
  Clock,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface Stats {
  total: number;
  today: number;
}

interface Lead {
  id: number;
  tracking: string;
  nome: string;
  nome_produto: string;
  telefone: string;
  endereco: string;
  cpf_cnpj: string;
  email: string;
  data: string;
  created_at: string;
}

export function AdminStats() {
  const [stats, setStats] = useState<Stats>({ total: 0, today: 0 });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      // Buscar estatísticas básicas
      const statsResponse = await fetch('/api/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Buscar leads para análises
      const leadsResponse = await fetch('/api/leads?limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (leadsResponse.ok) {
        const leadsData = await leadsResponse.json();
        setLeads(leadsData.leads);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    return { startDate, endDate: now, days };
  };

  const generateChartData = () => {
    const { startDate, endDate, days } = getDateRange();
    const data = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
      const dateStr = date.toISOString().split('T')[0];
      
      const count = leads.filter(lead => {
        const leadDate = new Date(lead.created_at);
        return leadDate.toISOString().split('T')[0] === dateStr;
      }).length;
      
      data.push({
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        leads: count
      });
    }
    
    return data;
  };

  const getProductStats = () => {
    const productCounts: { [key: string]: number } = {};
    leads.forEach(lead => {
      const product = lead.nome_produto || 'Sem nome';
      productCounts[product] = (productCounts[product] || 0) + 1;
    });
    
    return Object.entries(productCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const getLocationStats = () => {
    const locationCounts: { [key: string]: number } = {};
    leads.forEach(lead => {
      if (lead.endereco) {
        const city = lead.endereco.split(',')[0]?.trim() || 'Não informado';
        locationCounts[city] = (locationCounts[city] || 0) + 1;
      }
    });
    
    return Object.entries(locationCounts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  };

  const getContactStats = () => {
    const withPhone = leads.filter(lead => lead.telefone).length;
    const withEmail = leads.filter(lead => lead.email).length;
    const withBoth = leads.filter(lead => lead.telefone && lead.email).length;
    const withoutContact = leads.filter(lead => !lead.telefone && !lead.email).length;
    
    return [
      { name: 'Com Telefone', value: withPhone, color: '#10B981' },
      { name: 'Com E-mail', value: withEmail, color: '#3B82F6' },
      { name: 'Com Ambos', value: withBoth, color: '#8B5CF6' },
      { name: 'Sem Contato', value: withoutContact, color: '#EF4444' }
    ];
  };

  const exportStats = () => {
    const { startDate, endDate } = getDateRange();
    const statsData = {
      periodo: `${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}`,
      totalLeads: stats.total,
      leadsHoje: stats.today,
      leadsPeriodo: leads.filter(lead => {
        const leadDate = new Date(lead.created_at);
        return leadDate >= startDate && leadDate <= endDate;
      }).length,
      produtosMaisVendidos: getProductStats(),
      localizacoes: getLocationStats(),
      contatos: getContactStats()
    };

    const blob = new Blob([JSON.stringify(statsData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estatisticas_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = generateChartData();
  const productStats = getProductStats();
  const locationStats = getLocationStats();
  const contactStats = getContactStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estatísticas</h1>
          <p className="mt-2 text-gray-600">
            Análises detalhadas e insights sobre os leads do sistema.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={exportStats}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros de tempo */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-2">
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('7d')}
            >
              7 dias
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('30d')}
            >
              30 dias
            </Button>
            <Button
              variant={timeRange === '90d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('90d')}
            >
              90 dias
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Leads
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-xs text-gray-600">
              Todos os leads cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Leads Hoje
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.today}</div>
            <p className="text-xs text-gray-600">
              Novos leads hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Leads no Período
            </CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {leads.filter(lead => {
                const leadDate = new Date(lead.created_at);
                const { startDate, endDate } = getDateRange();
                return leadDate >= startDate && leadDate <= endDate;
              }).length}
            </div>
            <p className="text-xs text-gray-600">
              Últimos {getDateRange().days} dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Taxa de Crescimento
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.total > 0 ? Math.round((stats.today / stats.total) * 100) : 0}%
            </div>
            <p className="text-xs text-gray-600">
              Crescimento diário
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de leads por dia */}
        <Card>
          <CardHeader>
            <CardTitle>Leads por Dia</CardTitle>
            <CardDescription>
              Evolução do número de leads nos últimos {getDateRange().days} dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="leads" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de produtos mais vendidos */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
            <CardDescription>
              Top 10 produtos por número de leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Análises adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição de contatos */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Contatos</CardTitle>
            <CardDescription>
              Como os leads fornecem informações de contato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={contactStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contactStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top localizações */}
        <Card>
          <CardHeader>
            <CardTitle>Top Localizações</CardTitle>
            <CardDescription>
              Cidades com mais leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {locationStats.map((location, index) => (
                <div key={location.city} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <span className="text-sm font-medium">{location.city}</span>
                  </div>
                  <span className="text-sm text-gray-600">{location.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights rápidos */}
        <Card>
          <CardHeader>
            <CardTitle>Insights Rápidos</CardTitle>
            <CardDescription>
              Análises automáticas dos dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Telefone</p>
                  <p className="text-xs text-gray-600">
                    {stats.total > 0 ? Math.round((leads.filter(l => l.telefone).length / stats.total) * 100) : 0}% dos leads
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">E-mail</p>
                  <p className="text-xs text-gray-600">
                    {stats.total > 0 ? Math.round((leads.filter(l => l.email).length / stats.total) * 100) : 0}% dos leads
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Endereço</p>
                  <p className="text-xs text-gray-600">
                    {stats.total > 0 ? Math.round((leads.filter(l => l.endereco).length / stats.total) * 100) : 0}% dos leads
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Última Atividade</p>
                  <p className="text-xs text-gray-600">
                    {leads.length > 0 ? new Date(Math.max(...leads.map(l => new Date(l.created_at).getTime()))).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
