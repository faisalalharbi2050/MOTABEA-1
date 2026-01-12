#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');
const net = require('net');

// ألوان للتيرمينال
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// فحص إذا كان الپورت متاح
function checkPort(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, () => {
            server.once('close', () => resolve(true));
            server.close();
        });
        server.on('error', () => resolve(false));
    });
}

// قتل العمليات على پورت معين
function killProcessOnPort(port) {
    return new Promise((resolve) => {
        const command = process.platform === 'win32' 
            ? `netstat -ano | findstr :${port} | findstr LISTENING`
            : `lsof -ti:${port}`;
        
        exec(command, (error, stdout) => {
            if (stdout) {
                const lines = stdout.trim().split('\n');
                lines.forEach(line => {
                    if (process.platform === 'win32') {
                        const pid = line.trim().split(/\s+/).pop();
                        if (pid && !isNaN(pid)) {
                            exec(`taskkill /F /PID ${pid}`, () => {});
                        }
                    } else {
                        const pid = line.trim();
                        if (pid && !isNaN(pid)) {
                            exec(`kill -9 ${pid}`, () => {});
                        }
                    }
                });
                setTimeout(resolve, 2000); // انتظار لقتل العمليات
            } else {
                resolve();
            }
        });
    });
}

// انتظار تشغيل الخادم
function waitForServer(port, maxAttempts = 30) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        
        const check = async () => {
            attempts++;
            const isAvailable = await checkPort(port);
            
            if (!isAvailable) {
                log(`✅ الخادم يعمل على الپورت ${port}`, 'green');
                resolve();
            } else if (attempts >= maxAttempts) {
                reject(new Error(`فشل في تشغيل الخادم على الپورت ${port}`));
            } else {
                setTimeout(check, 1000);
            }
        };
        
        check();
    });
}

async function startBackendServer() {
    log('🔧 تحضير الخادم الخلفي...', 'yellow');
    
    // قتل أي عمليات على الپورت 5001
    await killProcessOnPort(5001);
    
    log('🚀 تشغيل الخادم الخلفي...', 'blue');
    
    const backend = spawn('node', ['server/index.js'], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        detached: false
    });
    
    let serverStarted = false;
    
    backend.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Server running') && !serverStarted) {
            log('✅ الخادم الخلفي يعمل بنجاح', 'green');
            serverStarted = true;
        }
        console.log(`[Backend] ${output.trim()}`);
    });
    
    backend.stderr.on('data', (data) => {
        console.error(`[Backend Error] ${data.toString().trim()}`);
    });
    
    backend.on('close', (code) => {
        if (code !== 0) {
            log(`❌ الخادم الخلفي توقف بكود: ${code}`, 'red');
        }
    });
    
    backend.on('error', (error) => {
        log(`❌ خطأ في تشغيل الخادم الخلفي: ${error.message}`, 'red');
    });
    
    // انتظار تشغيل الخادم
    try {
        await waitForServer(5001);
        return backend;
    } catch (error) {
        log(`❌ فشل في تشغيل الخادم الخلفي: ${error.message}`, 'red');
        backend.kill();
        throw error;
    }
}

async function startFrontendServer() {
    log('🔧 تحضير خادم التطوير...', 'yellow');
    
    // قتل أي عمليات على الپورت 3000
    await killProcessOnPort(3000);
    
    log('🌐 تشغيل خادم التطوير...', 'blue');
    
    const frontend = spawn('npm', ['run', 'dev'], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        detached: false
    });
    
    let serverStarted = false;
    
    frontend.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[Frontend] ${output.trim()}`);
        
        if ((output.includes('Local:') || output.includes('ready in')) && !serverStarted) {
            log('✅ خادم التطوير يعمل بنجاح', 'green');
            const port = output.includes('3001') ? '3001' : '3000';
            log(`🌐 يمكنك الآن فتح المتصفح والانتقال إلى: http://localhost:${port}`, 'cyan');
            serverStarted = true;
        }
    });
    
    frontend.stderr.on('data', (data) => {
        const output = data.toString();
        if (!output.includes('deprecated') && !output.includes('WARNING')) { // تجاهل تحذيرات Vite
            console.error(`[Frontend Error] ${output.trim()}`);
        }
    });
    
    frontend.on('close', (code) => {
        if (code !== 0) {
            log(`❌ خادم التطوير توقف بكود: ${code}`, 'red');
        }
    });
    
    frontend.on('error', (error) => {
        log(`❌ خطأ في تشغيل خادم التطوير: ${error.message}`, 'red');
    });
    
    return frontend;
}

async function main() {
    try {
        log('🎯 MOTABEA - بدء تشغيل الخوادم', 'cyan');
        log('===============================', 'cyan');
        
        // تشغيل الخادم الخلفي أولاً
        const backend = await startBackendServer();
        
        // انتظار قليل ثم تشغيل الفرونت إند
        setTimeout(async () => {
            try {
                const frontend = await startFrontendServer();
                
                // التعامل مع إيقاف التطبيق
                process.on('SIGINT', () => {
                    log('\n🛑 إيقاف الخوادم...', 'yellow');
                    backend.kill('SIGTERM');
                    frontend.kill('SIGTERM');
                    setTimeout(() => {
                        backend.kill('SIGKILL');
                        frontend.kill('SIGKILL');
                        process.exit(0);
                    }, 5000);
                });
                
                process.on('SIGTERM', () => {
                    log('\n🛑 إيقاف الخوادم...', 'yellow');
                    backend.kill('SIGTERM');
                    frontend.kill('SIGTERM');
                    setTimeout(() => {
                        backend.kill('SIGKILL');
                        frontend.kill('SIGKILL');
                        process.exit(0);
                    }, 5000);
                });
                
            } catch (frontendError) {
                log(`❌ خطأ في تشغيل خادم التطوير: ${frontendError.message}`, 'red');
                backend.kill();
            }
        }, 3000);
        
    } catch (error) {
        log(`❌ خطأ: ${error.message}`, 'red');
        process.exit(1);
    }
}

main();
