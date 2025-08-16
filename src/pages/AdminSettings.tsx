import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sk, setSk] = useState('');
  const [pk, setPk] = useState('');
  const [postbackUrl, setPostbackUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch('/api/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSk('');
          setPk('');
          setPostbackUrl(data['novaera.postbackUrl'] || '');
        }
      } catch (e) {
        setError('Erro ao carregar configurações');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          novaeraSk: sk,
          novaeraPk: pk,
          novaeraPostbackUrl: postbackUrl,
        })
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t);
      }
      setSuccess('Configurações salvas com sucesso');
    } catch (e:any) {
      setError(e.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="mt-2 text-gray-600">Defina as chaves e URLs para integração com a NovaEra.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>NovaEra Pagamentos</CardTitle>
          <CardDescription>Defina as chaves e URL de postback. A Base URL é fixa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key (SK)</label>
            <Input value={sk} onChange={(e) => setSk(e.target.value)} placeholder="sk_..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Public Key (PK)</label>
            <Input value={pk} onChange={(e) => setPk(e.target.value)} placeholder="pk_..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postback URL</label>
            <Input value={postbackUrl} onChange={(e) => setPostbackUrl(e.target.value)} placeholder={`http://localhost:3001/api/webhooks/novaera`} />
          </div>
          <div>
            <Button onClick={save} disabled={saving}>{saving ? 'Salvando...' : 'Salvar Configurações'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminSettings;


