@echo off
chcp 65001 >nul
echo ==========================================
echo    Khazina System - Stopping...
echo ==========================================
echo.

echo [1/2] Stopping all Node processes...
taskkill /F /IM node.exe 2>nul

echo [2/2] Done!
echo.
echo All Khazina servers stopped.
echo.
pause