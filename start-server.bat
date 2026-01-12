@echo off
chcp 65001 >nul
echo ═══════════════════════════════════════════════════════════
echo    🚀 MOTABEA - تشغيل الخادم الخلفي
echo ═══════════════════════════════════════════════════════════
echo.

REM التحقق من وجود Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ خطأ: Node.js غير مثبت على النظام
    echo    يرجى تثبيت Node.js من: https://nodejs.org
    pause
    exit /b 1
)

REM التحقق من وجود مجلد node_modules
if not exist "node_modules\" (
    echo ⚠️  تحذير: مجلد node_modules غير موجود
    echo 📦 جاري تثبيت المكتبات...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ فشل تثبيت المكتبات
        pause
        exit /b 1
    )
)

REM إيقاف أي عملية Node.js سابقة على المنفذ 5001
echo 🔍 التحقق من المنفذ 5001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001 ^| findstr LISTENING') do (
    echo ⚠️  إيقاف العملية القديمة...
    taskkill /F /PID %%a >nul 2>nul
)

REM تشغيل الخادم
echo.
echo ✅ جاري تشغيل الخادم الخلفي...
echo 🌐 المنفذ: 5001
echo 📱 Frontend URL: http://localhost:3003
echo.
echo ═══════════════════════════════════════════════════════════
echo    لإيقاف الخادم اضغط Ctrl+C
echo ═══════════════════════════════════════════════════════════
echo.

node server/index.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ خطأ في تشغيل الخادم
    echo    يرجى التحقق من ملف server/index.js
    pause
)
