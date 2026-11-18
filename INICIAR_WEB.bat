@echo off
chcp 65001 > nul
setlocal EnableDelayedExpansion
title WHA MOUNTAIN - Servidor Web + QR Celular
color 0A

echo ============================================================
echo         WHA MOUNTAIN PERÚ - SISTEMA WEB LOCAL + MOVIL
echo ============================================================

:: Asegurar la ruta de Node.js en el PATH
if exist "F:\nodeJs" set "PATH=F:\nodeJs;%PATH%"
if exist "C:\Program Files\nodejs" set "PATH=C:\Program Files\nodejs;%PATH%"

:: Generar QR con la IP Wi-Fi actual para escanear desde el celular
python "%~dp0CODIGOS OTROS\generar_qr_celular.py" 2>nul

cd /d "%~dp0PAGINA WEB"
if not exist "package.json" (
    cd /d "%~dp0"
)

echo [1/2] Abriendo la pagina web en tu navegador de PC...
start http://localhost:5173/

echo [2/2] Iniciando servidor en Red Local (PC + Celular)...
echo.
echo ------------------------------------------------------------
echo  IMPORTANTE: Escanea el QR de arriba con tu celular o abre
echo  el boton "QR Celular" en la barra superior de la web.
echo ------------------------------------------------------------
echo.

call npm run dev -- --host

if errorlevel 1 (
    call npx vite --host --port 5173
)

pause
