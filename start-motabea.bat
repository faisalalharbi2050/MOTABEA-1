@echo off
echo ========================================
echo        MOTABEA - نظام إدارة المدرسة
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] التحقق من إعدادات المشروع...

REM إنشاء ملف .env إذا لم يكن موجوداً
if not exist ".env" (
    echo NODE_ENV=development> .env
    echo PORT=5001>> .env
    echo JWT_SECRET=motabea_school_management_secret_key_2024>> .env
    echo DATABASE_URL=mysql://localhost:3306/motabea_school>> .env
    echo CORS_ORIGIN=http://localhost:3003>> .env
    echo ✅ تم إنشاء ملف .env
) else (
    echo ✅ ملف .env موجود
)

echo.
echo [2/5] إيقاف أي عمليات سابقة...

REM إيقاف أي عمليات Node.js تعمل على البورتات المطلوبة
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM npm.exe >nul 2>&1

REM انتظار لضمان إيقاف العمليات
timeout /t 3 /nobreak >nul

echo ✅ تم إيقاف العمليات السابقة

echo.
echo [3/5] تثبيت التبعيات إذا لزم الأمر...

if not exist "node_modules" (
    echo 📦 تثبيت التبعيات...
    npm install
    if errorlevel 1 (
        echo ❌ فشل في تثبيت التبعيات
        pause
        exit /b 1
    )
) else (
    echo ✅ التبعيات مثبتة
)

echo.
echo [4/5] تشغيل الخادم الخلفي...

REM تشغيل الخادم الخلفي في الخلفية
start "MOTABEA Backend" cmd /c "node server/index.js & pause"

REM انتظار 5 ثوان لتشغيل الخادم
echo ⏳ انتظار تشغيل الخادم الخلفي...
timeout /t 5 /nobreak >nul

REM التحقق من تشغيل الخادم
echo 🔍 التحقق من الخادم الخلفي...
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:5001/api/health' -TimeoutSec 5; if($response.status -eq 'OK') { Write-Host '✅ الخادم الخلفي يعمل بشكل صحيح' -ForegroundColor Green } else { Write-Host '❌ الخادم الخلفي لا يستجيب' -ForegroundColor Red; exit 1 } } catch { Write-Host '❌ فشل الاتصال بالخادم الخلفي' -ForegroundColor Red; exit 1 }"

if errorlevel 1 (
    echo ❌ فشل في تشغيل الخادم الخلفي
    echo 💡 جاري المحاولة مرة أخرى...
    timeout /t 3 /nobreak >nul
    start "MOTABEA Backend Retry" cmd /c "node server/index.js & pause"
    timeout /t 5 /nobreak >nul
)

echo.
echo [5/5] تشغيل الواجهة الأمامية...

echo 🚀 تشغيل الواجهة الأمامية على http://localhost:3003
echo.
echo ========================================
echo    تم تشغيل MOTABEA بنجاح! 🎉
echo ========================================
echo.
echo 🌐 الواجهة الأمامية: http://localhost:3003
echo 🔧 الخادم الخلفي: http://localhost:5001
echo 👤 المستخدم: admin
echo 🔑 كلمة المرور: admin123
echo.
echo ========================================

REM تشغيل الواجهة الأمامية
npm run dev

echo.
echo 📝 إذا واجهت أي مشكلة، تحقق من:
echo    1. أن البورت 3003 و 5001 غير مستخدمين
echo    2. أن Node.js مثبت بشكل صحيح
echo    3. أن جميع الملفات موجودة
echo.
pause
