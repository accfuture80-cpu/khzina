@echo off
chcp 65001 >nul
echo ==========================================
echo    Khazina System - Starting...
echo ==========================================
echo.

:: Kill any existing Node processes (clean start)
echo [0/4] Cleaning old processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

:: Start Backend
echo [1/4] Starting Backend (Port 3000)...
start "Khazina-Backend" /D "D:\programe new Future\khazina\backend" cmd /k "npm run start:dev"

:: Wait 5 seconds for backend to start
timeout /t 5 /nobreak >nul

:: Start Frontend with Network Access
echo [2/4] Starting Frontend (Port 5173)...
start "Khazina-Frontend" /D "D:\programe new Future\khazina\frontend" cmd /k "npm run dev -- --host 0.0.0.0"

:: Wait 3 seconds
timeout /t 3 /nobreak >nul

:: Open Firewall Ports
echo [3/4] Opening Firewall Ports...
netsh advfirewall firewall add rule name="Khazina-Backend" dir=in action=allow protocol=tcp localport=3000 >nul 2>&1
netsh advfirewall firewall add rule name="Khazina-Frontend" dir=in action=allow protocol=tcp localport=5173 >nul 2>&1

:: Show Info
echo [4/4] Done!
echo.
echo ==========================================
echo    Khazina System Ready!
echo ==========================================
echo.
echo Local:     http://localhost:5173
echo.
echo Press any key to exit...
pause >nul