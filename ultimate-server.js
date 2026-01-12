#!/usr/bin/env node

const { exec, spawn } = require('child_process');
const http = require('http');
const path = require('path');

// إعدادات الخوادم
const BACKEND_PORT = 5001;
const FRONTEND_PORT = 3000;

// ألوان للتيرمينال
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
    const timestamp = new Date().toLocaleTimeString('ar-SA');
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

// فحص إذا كان الخادم يعمل
function isServerRunning(port) {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: port,
            method: 'GET',
            timeout: 3000
        }, () => {
            resolve(true);
        });
        
        req.on('error', () => resolve(false));
        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });
        
        req.end();
    });
}

// قتل العمليات على پورت معين
function killProcessOnPort(port) {
    return new Promise((resolve) => {
        const command = `netstat -ano | findstr :${port} | findstr LISTENING`;
        exec(command, (error, stdout) => {
            if (stdout) {
                const lines = stdout.trim().split('\n');
                const killPromises = lines.map(line => {
                    const pid = line.trim().split(/\s+/).pop();
                    if (pid && !isNaN(pid)) {
                        return new Promise((resolveKill) => {
                            exec(`taskkill /F /PID ${pid}`, () => resolveKill());
                        });
                    }
                    return Promise.resolve();
                });
                Promise.all(killPromises).then(() => {
                    setTimeout(resolve, 1000);
                });
            } else {
                resolve();
            }
        });
    });
}

// تشغيل الخادم الخلفي
async function startBackend() {
    log('🔄 تحضير الخادم الخلفي...', 'yellow');
    
    // قتل أي عمليات سابقة
    await killProcessOnPort(BACKEND_PORT);
    
    return new Promise((resolve, reject) => {
        log('🚀 تشغيل الخادم الخلفي...', 'blue');
        
        const backend = spawn('node', ['server/index.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd(),
            env: { ...process.env, PORT: BACKEND_PORT }
        });

        let resolved = false;
        
        backend.stdout.on('data', (data) => {
            const output = data.toString().trim();
            console.log(`[Backend] ${output}`);
            
            if (output.includes('Server running') && !resolved) {
                resolved = true;
                log('✅ الخادم الخلفي يعمل بنجاح!', 'green');
                resolve(backend);
            }
        });

        backend.stderr.on('data', (data) => {
            console.error(`[Backend Error] ${data.toString().trim()}`);
        });

        backend.on('close', (code) => {
            if (code !== 0) {
                log(`❌ الخادم الخلفي توقف بكود: ${code}`, 'red');
            }
        });

        // مهلة زمنية للتشغيل
        setTimeout(() => {
            if (!resolved) {
                log('⚠️ تجاوز الوقت المحدد لتشغيل الخادم الخلفي', 'yellow');
                resolve(backend);
            }
        }, 10000);
    });
}

// تشغيل خادم التطوير
async function startFrontend() {
    log('🔄 تحضير خادم التطوير...', 'yellow');
    
    // قتل أي عمليات سابقة
    await killProcessOnPort(FRONTEND_PORT);
    
    return new Promise((resolve) => {
        log('🌐 تشغيل خادم التطوير...', 'blue');
        
        const frontend = spawn('npm', ['run', 'dev'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd(),
            shell: true
        });

        let resolved = false;

        frontend.stdout.on('data', (data) => {
            const output = data.toString().trim();
            console.log(`[Frontend] ${output}`);
            
            if ((output.includes('ready in') || output.includes('Local:')) && !resolved) {
                resolved = true;
                log('✅ خادم التطوير يعمل بنجاح!', 'green');
                resolve(frontend);
            }
        });

        frontend.stderr.on('data', (data) => {
            const output = data.toString().trim();
            if (!output.includes('deprecated') && !output.includes('WARNING')) {
                console.error(`[Frontend Error] ${output}`);
            }
        });

        frontend.on('close', (code) => {
            if (code !== 0) {
                log(`❌ خادم التطوير توقف بكود: ${code}`, 'red');
            }
        });

        // مهلة زمنية للتشغيل
        setTimeout(() => {
            if (!resolved) {
                log('⚠️ تجاوز الوقت المحدد لتشغيل خادم التطوير', 'yellow');
                resolve(frontend);
            }
        }, 15000);
    });
}

// مراقبة مستمرة للخوادم
async function monitorServers(backend, frontend) {
    log('👁️ بدء المراقبة المستمرة للخوادم...', 'cyan');
    
    setInterval(async () => {
        const backendRunning = await isServerRunning(BACKEND_PORT);
        const frontendRunning = await isServerRunning(FRONTEND_PORT);
        
        if (!backendRunning) {
            log('⚠️ الخادم الخلفي متوقف! إعادة تشغيل...', 'yellow');
            try {
                backend.kill();
                const newBackend = await startBackend();
                backend = newBackend;
            } catch (error) {
                log(`❌ فشل في إعادة تشغيل الخادم الخلفي: ${error.message}`, 'red');
            }
        }
        
        if (!frontendRunning) {
            log('⚠️ خادم التطوير متوقف! إعادة تشغيل...', 'yellow');
            try {
                frontend.kill();
                const newFrontend = await startFrontend();
                frontend = newFrontend;
            } catch (error) {
                log(`❌ فشل في إعادة تشغيل خادم التطوير: ${error.message}`, 'red');
            }
        }
    }, 10000); // فحص كل 10 ثوانٍ
}

// الدالة الرئيسية
async function main() {
    try {
        log('🎯 MOTABEA - نظام التشغيل الذكي والمراقبة المستمرة', 'magenta');
        log('=========================================================', 'magenta');
        
        // تنظيف شامل
        log('🧹 تنظيف العمليات السابقة...', 'yellow');
        await killProcessOnPort(BACKEND_PORT);
        await killProcessOnPort(FRONTEND_PORT);
        
        // تشغيل الخادم الخلفي أولاً
        const backend = await startBackend();
        
        // انتظار تأكيد التشغيل
        let attempts = 0;
        while (attempts < 10) {
            const running = await isServerRunning(BACKEND_PORT);
            if (running) {
                log('✅ تم تأكيد تشغيل الخادم الخلفي', 'green');
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
            attempts++;
        }
        
        // تشغيل خادم التطوير
        const frontend = await startFrontend();
        
        // انتظار تأكيد التشغيل
        attempts = 0;
        while (attempts < 10) {
            const running = await isServerRunning(FRONTEND_PORT);
            if (running) {
                log('✅ تم تأكيد تشغيل خادم التطوير', 'green');
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
            attempts++;
        }
        
        // رسائل النجاح
        log('', 'reset');
        log('🎉 تم تشغيل جميع الخوادم بنجاح!', 'green');
        log('🌐 Frontend: http://localhost:3000', 'cyan');
        log('📡 Backend: http://localhost:5001', 'cyan');
        log('👁️ المراقبة المستمرة مفعلة', 'blue');
        log('', 'reset');
        log('💡 اضغط Ctrl+C لإيقاف جميع الخوادم', 'yellow');
        
        // بدء المراقبة المستمرة
        monitorServers(backend, frontend);
        
        // التعامل مع إشارات الإيقاف
        const gracefulShutdown = () => {
            log('🛑 إيقاف الخوادم...', 'yellow');
            backend.kill('SIGTERM');
            frontend.kill('SIGTERM');
            
            setTimeout(() => {
                backend.kill('SIGKILL');
                frontend.kill('SIGKILL');
                process.exit(0);
            }, 5000);
        };
        
        process.on('SIGINT', gracefulShutdown);
        process.on('SIGTERM', gracefulShutdown);
        
        // منع إنهاء البرنامج
        process.stdin.resume();
        
    } catch (error) {
        log(`❌ خطأ حرج: ${error.message}`, 'red');
        process.exit(1);
    }
}

// تشغيل البرنامج
main().catch(console.error);
