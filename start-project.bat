@echo off
chcp 65001 >nul
title MOTABEA - نظام إدارة المدرسة
color 0B

echo.
echo ═══════════════════════════════════════════════════════════════════
echo.
echo        ███╗   ███╗ ██████╗ ████████╗ █████╗ ██████╗ ███████╗ █████╗ 
echo        ████╗ ████║██╔═══██╗╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██╔══██╗
echo        ██╔████╔██║██║   ██║   ██║   ███████║██████╔╝█████╗  ███████║
echo        ██║╚██╔╝██║██║   ██║   ██║   ██╔══██║██╔══██╗██╔══╝  ██╔══██║
echo        ██║ ╚═╝ ██║╚██████╔╝   ██║   ██║  ██║██████╔╝███████╗██║  ██║
echo        ╚═╝     ╚═╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝
echo.
echo                        🎓 نظام إدارة المدرسة الشامل
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.

REM التحقق من Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ خطأ: Node.js غير مثبت
    echo    يرجى تثبيته من: https://nodejs.org
    pause
    exit /b 1
)

REM التحقق من npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ خطأ: npm غير متوفر
    pause
    exit /b 1
)

REM التحقق من المكتبات
if not exist "node_modules\" (
    echo 📦 تثبيت المكتبات المطلوبة...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ فشل تثبيت المكتبات
        pause
        exit /b 1
    )
    echo ✅ تم تثبيت المكتبات بنجاح
    echo.
)

REM إيقاف العمليات السابقة
echo 🔄 تنظيف العمليات السابقة...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3003 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
)

echo ✅ جاهز للتشغيل
echo.
echo ═══════════════════════════════════════════════════════════════════
echo    🚀 تشغيل خوادم المشروع
echo ═══════════════════════════════════════════════════════════════════
echo.
echo    📡 الخادم الخلفي (Backend):  http://localhost:5001
echo    🌐 الواجهة الأمامية (Frontend): http://localhost:3003
echo.
echo    💡 سيتم فتح نافذتين:
echo       - نافذة للخادم الخلفي
echo       - نافذة للواجهة الأمامية
echo.
echo    ⚠️  لا تغلق هذه النوافذ أثناء استخدام النظام
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.

REM تشغيل الخادم الخلفي في نافذة منفصلة
echo 🔵 تشغيل الخادم الخلفي...
start "MOTABEA - Backend Server (Port 5001)" /D "%CD%" cmd /k "echo 🚀 MOTABEA Backend Server && echo ══════════════════════════════════ && echo. && node server/index.js"

REM الانتظار قليلاً للتأكد من بدء الخادم الخلفي
timeout /t 3 /nobreak >nul

REM تشغيل الواجهة الأمامية في نافذة منفصلة
echo 🟢 تشغيل الواجهة الأمامية...
start "MOTABEA - Frontend (Port 3003)" /D "%CD%" cmd /k "echo 🌐 MOTABEA Frontend && echo ══════════════════════════════════ && echo. && npm run dev"

echo.
echo ═══════════════════════════════════════════════════════════════════
echo    ✅ تم تشغيل المشروع بنجاح!
echo ═══════════════════════════════════════════════════════════════════
echo.
echo    📱 انتظر قليلاً حتى يفتح المتصفح تلقائياً
echo    🌐 أو افتح: http://localhost:3003
echo.
echo    🔑 حسابات تجريبية:
echo       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo       👨‍💼 مدير:           admin / admin123
echo       👨‍🏫 وكيل:           vice / vice123
echo       👨‍🔧 مشرف:          supervisor / super123
echo       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo    ℹ️  لإيقاف المشروع: أغلق نوافذ الخوادم
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.

REM الانتظار قبل إغلاق النافذة الرئيسية
timeout /t 5 /nobreak >nul

echo 💡 يمكنك إغلاق هذه النافذة الآن بأمان
echo.
pause
