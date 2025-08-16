-- Script para testar o sistema de pagamentos PIX

-- Verificar se a tabela payments foi criada
SELECT name FROM sqlite_master WHERE type='table' AND name='payments';

-- Verificar estrutura da tabela payments
PRAGMA table_info(payments);

-- Inserir alguns pagamentos de teste
INSERT INTO payments (tracking_code, amount, payment_type, status, pix_code, order_id) 
VALUES 
('US641400141BR', 67.40, 'taxa_liberacao', 'pending', 'PIX123456789', 'US641400141BR'),
('US641400141BR', 15.40, 'frete_express', 'pending', 'PIX987654321', 'FE-US641400141BR'),
('BR123456789BR', 67.40, 'taxa_liberacao', 'paid', 'PIX111222333', 'BR123456789BR'),
('BR123456789BR', 15.40, 'frete_express', 'paid', 'PIX444555666', 'FE-BR123456789BR');

-- Verificar pagamentos inseridos
SELECT * FROM payments;

-- Verificar estatísticas
SELECT 
  (SELECT COUNT(*) FROM leads) as total_leads,
  (SELECT COUNT(*) FROM payments) as total_pagamentos_pix,
  (SELECT COUNT(*) FROM payments WHERE status = 'paid') as total_pagamentos_confirmados;

-- Limpar dados de teste (opcional)
-- DELETE FROM payments WHERE pix_code LIKE 'PIX%';
