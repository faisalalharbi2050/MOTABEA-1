@echo off
echo ====================================
echo تنظيف وإعادة تشغيل خادم التطوير
echo ====================================
echo.

echo [1/4] إيقاف الخوادم القديمة...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] مسح ملفات البناء المؤقتة...
if exist dist rmdir /s /q dist
if exist node_modules\.vite rmdir /s /q node_modules\.vite

echo [3/4] تنظيف الذاكرة المؤقتة...
timeout /t 1 /nobreak >nul

echo [4/4] تشغيل خادم التطوير...
echo.
echo ====================================
echo الخادم يعمل الآن - افتح المتصفح
echo واضغط Ctrl + Shift + R للتحديث القوي
echo ====================================
echo.

npm run dev
