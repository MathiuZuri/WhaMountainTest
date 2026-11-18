@echo off
chcp 65001 > nul
setlocal EnableDelayedExpansion
title WHA MOUNTAIN - Servidor Web + QR Celular
color 0A

echo ============================================================
echo         WHA MOUNTAIN PERÚ - SISTEMA WEB LOCAL + MOVIL
echo ============================================================

if exist "F:\nodeJs" set "PATH=F:\nodeJs;%PATH%"
if exist "C:\Program Files\nodejs" set "PATH=C:\Program Files\nodejs;%PATH%"

python "%~dp0..\CODIGOS OTROS\generar_qr_celular.py" 2>nul

cd /d "%~dp0"

echo [1/2] Abriendo la pagina web en tu navegador de PC...
start http://localhost:5173/

echo [2/2] Iniciando servidor en Red Local (PC + Celular)...
call npm run dev -- --host

if errorlevel 1 (
    call npx vite --host --port 5173
)

pause
