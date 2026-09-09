@echo off
chcp 65001 >nul
title إصلاح جدول المرفقات
cls

echo ==========================================
echo   تشغيل migration 002 - إصلاح المرفقات
echo ==========================================
echo.

set "PGUSER=postgres"
set "PGDATABASE=khazina_db"
set "SQLFILE=%~dp0fix_attachments.sql"

echo [1/1] تشغيل الـ SQL على قاعدة البيانات...
psql -U %PGUSER% -d %PGDATABASE% -f "%SQLFILE%"

if errorlevel 1 (
    echo.
    echo ❌ حصل خطأ! تأكد من:
    echo    - PostgreSQL شغال (pgAdmin أو الخدمة)
    echo    - اسم المستخدم = postgres
    echo    - اسم قاعدة البيانات = khazina_db
    echo.
    echo لو البيانات مختلفة، عدّل الملف ده (كليك يمين ^> Edit) وغيّر PGUSER و PGDATABASE.
    pause
    exit /b 1
)

echo.
echo ✅ تم بنجاح! جدول attachments دلوقتي فيه عمود category.
echo ✅ اضغط أي مفتاح للإغلاق.
pause
