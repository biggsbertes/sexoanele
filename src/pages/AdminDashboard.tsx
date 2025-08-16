import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileSpreadsheet, 
  TrendingUp, 
  Calendar,
  Upload,
  Eye,
  Plus,
  ShoppingCart,
  CreditCard,
  Clock,
  DollarSign,
  MessageCircle,
  MessageSquare,
  Trash2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { useChat } from '@/contexts/ChatContext';

interface Stats {
  totalOrders: number;
  totalPaidOrders: number;
  totalPendingOrders: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
}

interface Payment {
  id: number;
  tracking_code: string;
  amount: number;
  payment_type: string;
  status: string;
  created_at: string;
  lead_nome?: string;
  lead_produto?: string;
}

interface PaymentsResponse {
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ 
    totalOrders: 0, 
    totalPaidOrders: 0, 
    totalPendingOrders: 0, 
    totalPaidAmount: 0, 
    totalPendingAmount: 0 
  });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]); // Para calcular totais gerais
  const [loading, setLoading] = useState<boolean>(true);
  const [paymentsLoading, setPaymentsLoading] = useState<boolean>(true);
  const [paymentsPagination, setPaymentsPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  }>({ 
    page: 1, 
    limit: 8, 
    total: 0, 
    pages: 0 
  });
  const [confirmDeleteAllLeads, setConfirmDeleteAllLeads] = useState<boolean>(false);
  const [confirmDeleteAllOrders, setConfirmDeleteAllOrders] = useState<boolean>(false);
  const [confirmDeleteAllPayments, setConfirmDeleteAllPayments] = useState<boolean>(false);
  const [bulkDeleting, setBulkDeleting] = useState<boolean>(false);
  const navigate = useNavigate();
  const { isChatEnabled = false, toggleChat = () => {}, enableChat = () => {}, disableChat = () => {} } = useChat() || {};

  useEffect(() => {
    try {
      fetchStats();
    } catch (error) {
      console.error('Erro no useEffect fetchStats:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      fetchPayments();
    } catch (error) {
      console.error('Erro no useEffect fetchPayments:', error);
      setPaymentsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentsPagination.page, paymentsPagination.limit]);

  // Buscar todos os pagamentos para calcular totais gerais
  useEffect(() => {
    fetchAllPayments();
  }, []);





  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('No admin token found');
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data) {
          const newStats = {
            totalOrders: data.totalOrders || 0,
            totalPaidOrders: data.totalPaidOrders || 0,
            totalPendingOrders: data.totalPendingOrders || 0,
            totalPaidAmount: data.totalPaidAmount || 0,
            totalPendingAmount: data.totalPendingAmount || 0
          };
          setStats(newStats);
        }
      } else {
        console.error('Response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };



  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('No admin token found for payments');
        setPaymentsLoading(false);
        return;
      }
      
      const params = new URLSearchParams({
        page: String(paymentsPagination.page),
        limit: String(paymentsPagination.limit)
      });
      
      const url = `/api/payments?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data: PaymentsResponse = await response.json();
        
        if (data && data.payments) {
          setPayments(data.payments);
          
          if (data.pagination) {
            const newPagination = {
              ...paymentsPagination,
              total: data.pagination.total || 0,
              pages: data.pagination.pages || 0
            };
            setPaymentsPagination(prev => newPagination);
          }
        }
      } else {
        console.error('Payments response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
    } finally {
      setPaymentsLoading(false);
    }
  };

  // Buscar todos os pagamentos para calcular totais gerais
  const fetchAllPayments = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('No admin token found for all payments');
        return;
      }
      
      // Buscar todos os pagamentos (sem paginação)
      const response = await fetch('/api/payments?limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data: PaymentsResponse = await response.json();
        
        if (data && data.payments) {
          setAllPayments(data.payments);
        }
      } else {
        console.error('All payments response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erro ao buscar todos os pagamentos:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'paid') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Pago</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendente</Badge>;
  };

  const getPaymentTypeLabel = (type: string) => {
    if (type === 'taxa_liberacao') {
      return 'Taxa de Liberação';
    }
    if (type === 'frete_express') {
      return 'Frete Express';
    }
    return type;
  };

  // Calcular total de pagamentos confirmados baseado em todos os pagamentos
  const getTotalConfirmedAmount = () => {
    if (!allPayments || allPayments.length === 0) return 0;
    
    const confirmedPayments = allPayments.filter(payment => payment.status === 'paid');
    return confirmedPayments.reduce((total, payment) => total + (payment.amount || 0), 0);
  };

  // Calcular total de pagamentos pendentes baseado em todos os pagamentos
  const getTotalPendingAmount = () => {
    if (!allPayments || allPayments.length === 0) return 0;
    
    const pendingPayments = allPayments.filter(payment => payment.status !== 'paid');
    return pendingPayments.reduce((total, payment) => total + (payment.amount || 0), 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteAllLeads = async () => {
    try {
      setBulkDeleting(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/leads', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setConfirmDeleteAllLeads(false);
      if (res.ok) {
        fetchStats();
      }
    } catch (e) {
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleDeleteAllOrders = async () => {
    try {
      setBulkDeleting(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setConfirmDeleteAllOrders(false);
      if (res.ok) {
        setPaymentsPagination({ page: 1, limit: paymentsPagination.limit, total: 0, pages: 0 });
        setPaymentsLoading(true);
        fetchStats();
        await fetchPayments();
        fetchAllPayments(); // Recarregar todos os pagamentos para atualizar totais
      }
    } catch (e) {
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleDeleteAllPayments = async () => {
    try {
      setBulkDeleting(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/payments', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setConfirmDeleteAllPayments(false);
      if (res.ok) {
        setPaymentsPagination({ page: 1, limit: paymentsPagination.limit, total: 0, pages: 0 });
        setPaymentsLoading(true);
        fetchStats();
        await fetchPayments();
        fetchAllPayments(); // Recarregar todos os pagamentos para atualizar totais
      }
    } catch (e) {
    } finally {
      setBulkDeleting(false);
    }
  };

  const quickActions = [
    {
      title: 'Importar CSV',
      description: 'Adicionar novos leads via arquivo CSV',
      icon: Upload,
      action: () => navigate('/admin/import'),
      color: 'bg-blue-500',
      buttonText: 'Importar'
    },
    {
      title: 'Gerenciar Leads',
      description: 'Visualizar e editar leads existentes',
      icon: Users,
      action: () => navigate('/admin/leads'),
      color: 'bg-green-500',
      buttonText: 'Gerenciar'
    },
    {
      title: isChatEnabled ? 'Desativar Chat' : 'Ativar Chat',
      description: isChatEnabled 
        ? 'Desativar o chat de suporte da página inicial' 
        : 'Ativar o chat de suporte da página inicial',
      icon: isChatEnabled ? MessageSquare : MessageCircle,
      action: toggleChat,
      color: isChatEnabled ? 'bg-red-500' : 'bg-green-500',
      buttonText: isChatEnabled ? 'Desativar' : 'Ativar'
    },
    {
      title: 'Excluir todos os Leads',
      description: 'Remove todos os registros de leads da base',
      icon: Trash2,
      action: () => setConfirmDeleteAllLeads(true),
      color: 'bg-red-500',
      buttonText: 'Excluir Leads'
    },
    {
      title: 'Excluir todos os Pedidos',
      description: 'Remove todos os registros de pedidos/pagamentos',
      icon: Trash2,
      action: () => setConfirmDeleteAllOrders(true),
      color: 'bg-red-600',
      buttonText: 'Excluir Pedidos'
    },
    {
      title: 'Excluir histórico de Pagamentos',
      description: 'Remove todos os registros de pagamentos do histórico',
      icon: Trash2,
      action: () => setConfirmDeleteAllPayments(true),
      color: 'bg-red-700',
      buttonText: 'Excluir Pagamentos'
    }
  ];



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Pagamentos PIX</h1>
        <p className="mt-2 text-gray-600">
          Acompanhe todos os pagamentos PIX gerados no sistema de rastreio.
        </p>
      </div>

      {/* Cards de estatísticas de pagamentos PIX */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Pagamentos PIX
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              R$ {(getTotalConfirmedAmount() + getTotalPendingAmount()).toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-gray-600">
              Valor total solicitado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pagamentos Confirmados
            </CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {getTotalConfirmedAmount().toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-gray-600">
              Valor total já pago
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pagamentos Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">R$ {getTotalPendingAmount().toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-gray-600">
              Valor de pagamentos pendentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pagamentos PIX */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pagamentos PIX Recentes</h2>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Histórico de Pagamentos</span>
            </CardTitle>
            <CardDescription>
              Lista dos últimos pagamentos PIX gerados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum pagamento PIX encontrado</p>
                <p className="text-sm">Os pagamentos aparecerão aqui quando forem gerados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Tracking</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Cliente</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Produto</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Tipo</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Valor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm text-gray-900">
                          {payment.tracking_code}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {payment.lead_nome || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {payment.lead_produto || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {getPaymentTypeLabel(payment.payment_type)}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          R$ {payment.amount.toFixed(2).replace('.', ',')}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(payment.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {paymentsPagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-700">
                      Mostrando {((paymentsPagination.page - 1) * paymentsPagination.limit) + 1} a {Math.min(paymentsPagination.page * paymentsPagination.limit, paymentsPagination.total)} no Histórico de Pagamentos
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentsPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                        disabled={paymentsPagination.page === 1}
                      >
                        Anterior
                      </Button>
                      <span className="text-sm text-gray-700">
                        Página {paymentsPagination.page} de {paymentsPagination.pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentsPagination(p => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
                        disabled={paymentsPagination.page === paymentsPagination.pages}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={action.action}
                    className="w-full"
                    variant="outline"
                  >
                    {action.buttonText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      <AlertDialog open={confirmDeleteAllLeads} onOpenChange={setConfirmDeleteAllLeads}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir todos os leads?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove permanentemente todos os leads da base de dados. Não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAllLeads} disabled={bulkDeleting} className="bg-red-600 hover:bg-red-700">
              {bulkDeleting ? 'Excluindo...' : 'Excluir Todos'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDeleteAllOrders} onOpenChange={setConfirmDeleteAllOrders}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir todos os pedidos?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove permanentemente todos os pedidos/pagamentos. Não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAllOrders} disabled={bulkDeleting} className="bg-red-600 hover:bg-red-700">
              {bulkDeleting ? 'Excluindo...' : 'Excluir Todos'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDeleteAllPayments} onOpenChange={setConfirmDeleteAllPayments}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir histórico de pagamentos?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove permanentemente todos os pagamentos da base. Não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAllPayments} disabled={bulkDeleting} className="bg-red-700 hover:bg-red-800">
              {bulkDeleting ? 'Excluindo...' : 'Excluir Todos'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
