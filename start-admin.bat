@echo off
echo ========================================
echo    Painel Administrativo TrackWise
echo ========================================
echo.
echo Iniciando servidor e frontend...
echo.

REM Iniciar o servidor em background
start "Servidor TrackWise" cmd /k "npm run server"

REM Aguardar um pouco para o servidor inicializar
timeout /t 3 /nobreak > nul

REM Iniciar o frontend
start "Frontend TrackWise" cmd /k "npm run dev"

echo.
echo ========================================
echo Servidor e frontend iniciados!
echo.
echo Sistema completo: http://localhost:8080
echo Painel Admin: http://localhost:8080/admin/login
echo API: http://localhost:8080/api
echo.
echo Credenciais: admin / admin123
echo ========================================
echo.
pause
