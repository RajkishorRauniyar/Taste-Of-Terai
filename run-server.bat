@echo off
echo ==========================================
echo   Taste Of Terai - Starting Server...
echo ==========================================
cd /d "%~dp0"
cd backend
echo.
echo Installing dependencies...
call npm install
echo.
echo Starting server...
call node server.js
pause
