@echo off
title MOTABEA - Health Check
color 0a
echo.
echo ====================================
echo       MOTABEA Health Check
echo ====================================
echo.

echo 🔍 فحص الخوادم...
echo.

REM فحص الخادم الخلفي
echo [Backend] فحص الخادم الخلفي على الپورت 5001...
netstat -an | findstr :5001 | findstr LISTENING >nul
if %errorlevel%==0 (
    echo ✅ الخادم الخلفي يعمل
) else (
    echo ❌ الخادم الخلفي متوقف
)

echo.

REM فحص خادم التطوير  
echo [Frontend] فحص خادم التطوير على الپورت 3000...
netstat -an | findstr :3000 | findstr LISTENING >nul
if %errorlevel%==0 (
    echo ✅ خادم التطوير يعمل
) else (
    echo ❌ خادم التطوير متوقف
)

echo.

REM فحص العمليات
echo 🔍 عمليات Node.js النشطة:
tasklist /FI "IMAGENAME eq node.exe" /FO TABLE

echo.
echo 💡 للتشغيل: اضغط start.bat
echo 💡 للإيقاف: Ctrl+C في النوافذ المفتوحة
echo.
pause
