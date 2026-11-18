Write-Host "============================================================" -ForegroundColor Green
Write-Host "         WHA MOUNTAIN PERÚ - SISTEMA WEB LOCAL + MOVIL" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green

if (Test-Path "F:\nodeJs") { $env:PATH = "F:\nodeJs;$env:PATH" }
if (Test-Path "C:\Program Files\nodejs") { $env:PATH = "C:\Program Files\nodejs;$env:PATH" }

python "$PSScriptRoot\CODIGOS OTROS\generar_qr_celular.py"

$targetDir = "$PSScriptRoot\PAGINA WEB"
if (-not (Test-Path "$targetDir\package.json")) {
    $targetDir = "$PSScriptRoot"
}

Set-Location $targetDir

Write-Host "`n[1/2] Abriendo en tu navegador: http://localhost:5173/..." -ForegroundColor Cyan
Start-Process "http://localhost:5173/"

Write-Host "[2/2] Iniciando servidor Vite en Red Local (--host)..." -ForegroundColor Yellow
npm run dev -- --host
