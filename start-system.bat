@echo off
echo ================================
echo      MOTABEA System Startup
echo ================================
echo.

REM Kill any existing node processes
echo 🛑 Stopping existing servers...
taskkill /F /IM node.exe 2>nul || echo No existing Node processes found.
timeout /t 2 /nobreak >nul

REM Start backend server
echo.
echo 🚀 Starting Backend Server...
start "MOTABEA Backend" cmd /k "cd /d %~dp0 && node server/simple-server.js"
timeout /t 3 /nobreak >nul

REM Start frontend server
echo.
echo 🎨 Starting Frontend Server...
start "MOTABEA Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ✅ System is starting up...
echo.
echo 📡 Backend will be available at: http://localhost:5000
echo 🌐 Frontend will be available at: http://localhost:3000 or 3001
echo.
echo ⏳ Please wait 10-15 seconds for both servers to fully start...
echo 🔗 Then navigate to the frontend URL to access the system
echo.
echo Press any key to open the frontend URL after servers start...
pause >nul

timeout /t 8 /nobreak >nul
start http://localhost:3001

echo.
echo 🎉 MOTABEA System Started Successfully!
echo.
echo To stop the system, close both terminal windows or press Ctrl+C in each.
echo.
pause
