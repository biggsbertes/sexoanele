#!/bin/bash

echo "========================================"
echo "   Painel Administrativo TrackWise"
echo "========================================"
echo ""
echo "Iniciando servidor e frontend..."
echo ""

# Iniciar o servidor em background
npm run server &
SERVER_PID=$!

# Aguardar um pouco para o servidor inicializar
sleep 3

# Iniciar o frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "Servidor e frontend iniciados!"
echo ""
echo "Sistema completo: http://localhost:8080"
echo "Painel Admin: http://localhost:8080/admin/login"
echo "API: http://localhost:8080/api"
echo ""
echo "Credenciais: admin / admin123"
echo "========================================"
echo ""

# Função para encerrar processos ao sair
cleanup() {
    echo "Encerrando processos..."
    kill $SERVER_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturar sinal de interrupção
trap cleanup SIGINT SIGTERM

# Aguardar indefinidamente
wait
