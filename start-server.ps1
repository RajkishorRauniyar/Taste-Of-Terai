# Taste Of Terai - Server Starter
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Taste Of Terai - Starting Server..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "$PSScriptRoot\backend"

Write-Host "[1/2] Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "[2/2] Starting server on http://localhost:3000" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

node server.js
