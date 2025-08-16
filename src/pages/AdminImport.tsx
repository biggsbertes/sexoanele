import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  Download,
  AlertTriangle,
  Info
} from 'lucide-react';

interface ImportResult {
  message: string;
  total: number;
  success: number;
  duplicates: number;
  errors: Array<{
    row: any;
    error: string;
  }>;
}

export function AdminImport() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8080/api/import-csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setResult({
          message: 'Erro na importação',
          total: 0,
          success: 0,
          duplicates: 0,
          errors: [{ row: {}, error: data.error }]
        });
      }
    } catch (error) {
      setResult({
        message: 'Erro na importação',
        total: 0,
        success: 0,
        duplicates: 0,
        errors: [{ row: {}, error: 'Erro de conexão' }]
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'Tracking,Nome,Nome do produto,Telefone,Endereço,CPF/CNPJ,E-mail,Data\nABC123,João Silva,Produto A,11999999999,Rua A 123,12345678901,joao@email.com,2024-01-15';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_leads.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Importar CSV</h1>
        <p className="mt-2 text-gray-600">
          Importe arquivos CSV com dados de leads para o sistema de rastreio.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Área de upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload do Arquivo</span>
            </CardTitle>
            <CardDescription>
              Arraste e solte um arquivo CSV ou clique para selecionar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {file ? file.name : 'Arraste um arquivo CSV aqui ou clique para selecionar'}
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2"
                >
                  Selecionar Arquivo
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {file && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <Badge variant="secondary">
                    {(file.size / 1024).toFixed(1)} KB
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full"
              size="lg"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar CSV
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Informações e template */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>Formato Requerido</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  O arquivo CSV deve conter as seguintes colunas na ordem especificada:
                </p>
                <div className="bg-gray-50 p-3 rounded-md">
                  <code className="text-xs text-gray-800">
                    Tracking, Nome, Nome do produto, Telefone, Endereço, CPF/CNPJ, E-mail, Data
                  </code>
                </div>
                <div className="space-y-1 text-xs text-gray-500">
                  <p><strong>Campos obrigatórios:</strong> Tracking, Nome, Nome do produto</p>
                  <p><strong>Campos opcionais:</strong> Telefone, Endereço, CPF/CNPJ, E-mail, Data</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Template
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Importante</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• O sistema verifica automaticamente duplicatas pelo campo Tracking</p>
                <p>• Registros com campos obrigatórios vazios serão rejeitados</p>
                <p>• O arquivo deve estar codificado em UTF-8</p>
                <p>• Tamanho máximo recomendado: 10MB</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resultado da importação */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {result.success > 0 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span>Resultado da Importação</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert variant={result.success > 0 ? "default" : "destructive"}>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{result.total}</div>
                  <div className="text-sm text-gray-600">Total Processado</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.success}</div>
                  <div className="text-sm text-green-600">Importados</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{result.duplicates}</div>
                  <div className="text-sm text-yellow-600">Duplicatas</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{result.errors.length}</div>
                  <div className="text-sm text-red-600">Erros</div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Detalhes dos Erros:</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <div key={index} className="p-3 bg-red-50 rounded-md text-sm">
                        <div className="font-medium text-red-800">Erro: {error.error}</div>
                        {error.row.Tracking && (
                          <div className="text-red-600 mt-1">
                            Tracking: {error.row.Tracking}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={resetForm}>
                  Importar Outro Arquivo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
