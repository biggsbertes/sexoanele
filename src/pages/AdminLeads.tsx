import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Edit, 
  Trash2, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Lead {
  id: number;
  tracking: string;
  nome: string;
  nome_produto: string;
  valor: number;
  telefone: string;
  endereco: string;
  cpf_cnpj: string;
  email: string;
  data: string;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [editForm, setEditForm] = useState({
    nome: '',
    nome_produto: '',
    telefone: '',
    endereco: '',
    cpf_cnpj: '',
    email: '',
    data: ''
  });

  useEffect(() => {
    fetchLeads();
  }, [pagination.page, search]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: search
      });

      const response = await fetch(`/api/leads?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setEditForm({
      nome: lead.nome,
      nome_produto: lead.nome_produto,
      telefone: lead.telefone || '',
      endereco: lead.endereco || '',
      cpf_cnpj: lead.cpf_cnpj || '',
      email: lead.email || '',
      data: lead.data || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingLead) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/leads/${editingLead.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        setEditingLead(null);
        fetchLeads();
      }
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingLead) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/leads/${deletingLead.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setDeletingLead(null);
        fetchLeads();
      }
    } catch (error) {
      console.error('Erro ao excluir lead:', error);
    }
  };

  const exportToCSV = () => {
    const headers = ['Tracking', 'Nome', 'Nome do produto', 'Telefone', 'Endereço', 'CPF/CNPJ', 'E-mail', 'Data'];
    const csvContent = [
      headers.join(','),
      ...leads.map(lead => [
        lead.tracking,
        lead.nome,
        lead.nome_produto,
        lead.telefone || '',
        lead.endereco || '',
        lead.cpf_cnpj || '',
        lead.email || '',
        lead.data || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Leads</h1>
          <p className="mt-2 text-gray-600">
            Visualize, edite e gerencie todos os leads do sistema de rastreio.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por tracking, nome, produto ou email..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {pagination.total} leads encontrados
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de leads */}
      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
          <CardDescription>
            Página {pagination.page} de {pagination.pages} • {pagination.total} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum lead encontrado.
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="font-mono">
                          {lead.tracking}
                        </Badge>
                        <span className="font-medium text-gray-900">{lead.nome}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Produto:</span> {lead.nome_produto}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Valor:</span> R$ {(lead.valor || 0).toFixed(2).replace('.', ',')}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        {lead.telefone && (
                          <span>📞 {lead.telefone}</span>
                        )}
                        {lead.email && (
                          <span>📧 {lead.email}</span>
                        )}
                        {lead.data && (
                          <span>📅 {lead.data}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingLead(lead)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(lead)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingLead(lead)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginação */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} resultados
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm text-gray-700">
                  Página {pagination.page} de {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de edição */}
      <Dialog open={!!editingLead} onOpenChange={() => setEditingLead(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Lead</DialogTitle>
            <DialogDescription>
              Edite as informações do lead {editingLead?.tracking}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={editForm.nome}
                onChange={(e) => setEditForm(prev => ({ ...prev, nome: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome_produto">Nome do Produto *</Label>
              <Input
                id="nome_produto"
                value={editForm.nome_produto}
                onChange={(e) => setEditForm(prev => ({ ...prev, nome_produto: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={editForm.telefone}
                onChange={(e) => setEditForm(prev => ({ ...prev, telefone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Textarea
                id="endereco"
                value={editForm.endereco}
                onChange={(e) => setEditForm(prev => ({ ...prev, endereco: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
              <Input
                id="cpf_cnpj"
                value={editForm.cpf_cnpj}
                onChange={(e) => setEditForm(prev => ({ ...prev, cpf_cnpj: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={editForm.data}
                onChange={(e) => setEditForm(prev => ({ ...prev, data: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLead(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de visualização */}
      <Dialog open={!!viewingLead} onOpenChange={() => setViewingLead(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
            <DialogDescription>
              Informações completas do lead {viewingLead?.tracking}
            </DialogDescription>
          </DialogHeader>
          {viewingLead && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tracking</Label>
                  <p className="text-lg font-mono">{viewingLead.tracking}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nome</Label>
                  <p className="text-lg">{viewingLead.nome}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Produto</Label>
                  <p className="text-lg">{viewingLead.nome_produto}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Telefone</Label>
                  <p className="text-lg">{viewingLead.telefone || 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">E-mail</Label>
                  <p className="text-lg">{viewingLead.email || 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">CPF/CNPJ</Label>
                  <p className="text-lg">{viewingLead.cpf_cnpj || 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Data</Label>
                  <p className="text-lg">{viewingLead.data || 'Não informado'}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Endereço</Label>
                  <p className="text-lg">{viewingLead.endereco || 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Data de Criação</Label>
                  <p className="text-lg">{formatDate(viewingLead.created_at)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewingLead(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={!!deletingLead} onOpenChange={() => setDeletingLead(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o lead <strong>{deletingLead?.tracking}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
