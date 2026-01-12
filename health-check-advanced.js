#!/usr/bin/env node

const http = require('http');
const { exec } = require('child_process');

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

function checkServerHealth(port, name) {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: port,
            path: '/',
            method: 'GET',
            timeout: 5000
        }, (res) => {
            resolve({ port, name, status: 'running', statusCode: res.statusCode });
        });

        req.on('error', () => {
            resolve({ port, name, status: 'stopped', statusCode: null });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({ port, name, status: 'timeout', statusCode: null });
        });

        req.end();
    });
}

function checkProcesses() {
    return new Promise((resolve) => {
        const command = process.platform === 'win32' 
            ? 'tasklist /FI "IMAGENAME eq node.exe" /FO CSV'
            : 'ps aux | grep node';
        
        exec(command, (error, stdout) => {
            if (error) {
                resolve([]);
                return;
            }
            
            const processes = [];
            const lines = stdout.split('\n');
            
            if (process.platform === 'win32') {
                lines.forEach(line => {
                    if (line.includes('node.exe')) {
                        const parts = line.split(',');
                        if (parts.length >= 5) {
                            processes.push({
                                name: parts[0].replace(/"/g, ''),
                                pid: parts[1].replace(/"/g, ''),
                                memory: parts[4].replace(/"/g, '')
                            });
                        }
                    }
                });
            } else {
                lines.forEach(line => {
                    if (line.includes('node') && !line.includes('grep')) {
                        processes.push({ line: line.trim() });
                    }
                });
            }
            
            resolve(processes);
        });
    });
}

async function healthCheck() {
    log('🏥 فحص صحة خوادم MOTABEA', 'cyan');
    log('==============================', 'cyan');
    
    // فحص الخوادم
    const servers = [
        { port: 5001, name: 'Backend Server' },
        { port: 3000, name: 'Frontend Server (Primary)' },
        { port: 3001, name: 'Frontend Server (Secondary)' }
    ];
    
    const results = await Promise.all(
        servers.map(server => checkServerHealth(server.port, server.name))
    );
    
    log('\n📊 حالة الخوادم:', 'blue');
    results.forEach(result => {
        const status = result.status === 'running' ? '✅ يعمل' : '❌ متوقف';
        const color = result.status === 'running' ? 'green' : 'red';
        log(`  ${result.name} (Port ${result.port}): ${status}`, color);
        if (result.statusCode) {
            log(`    Status Code: ${result.statusCode}`, 'yellow');
        }
    });
    
    // فحص العمليات
    log('\n🔍 عمليات Node.js النشطة:', 'blue');
    const processes = await checkProcesses();
    
    if (processes.length === 0) {
        log('  لا توجد عمليات Node.js نشطة', 'yellow');
    } else {
        processes.forEach(process => {
            if (process.pid) {
                log(`  PID: ${process.pid} | Memory: ${process.memory}`, 'green');
            } else {
                log(`  ${process.line}`, 'green');
            }
        });
    }
    
    // تحديد المشاكل والحلول
    const runningServers = results.filter(r => r.status === 'running');
    const stoppedServers = results.filter(r => r.status !== 'running');
    
    log('\n📋 التشخيص:', 'blue');
    
    if (runningServers.length === 0) {
        log('  ❌ لا توجد خوادم تعمل', 'red');
        log('  💡 الحل: تشغيل الخوادم باستخدام npm start', 'yellow');
    } else if (stoppedServers.length > 0) {
        log(`  ⚠️  ${runningServers.length} خادم يعمل، ${stoppedServers.length} متوقف`, 'yellow');
        if (stoppedServers.some(s => s.port === 5001)) {
            log('  💡 الحل: الخادم الخلفي متوقف، تشغيل npm start', 'yellow');
        }
    } else {
        log('  ✅ جميع الخوادم تعمل بشكل طبيعي', 'green');
    }
    
    // اختبار الاتصال
    const backendRunning = results.find(r => r.port === 5001 && r.status === 'running');
    if (backendRunning) {
        log('\n🔗 اختبار اتصال API...', 'blue');
        
        const apiTest = await new Promise((resolve) => {
            const req = http.request({
                hostname: 'localhost',
                port: 5001,
                path: '/api/health',
                method: 'GET',
                timeout: 5000
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve({ success: true, data: parsed });
                    } catch {
                        resolve({ success: true, data: data });
                    }
                });
            });
            
            req.on('error', (err) => {
                resolve({ success: false, error: err.message });
            });
            
            req.end();
        });
        
        if (apiTest.success) {
            log('  ✅ API يعمل بشكل طبيعي', 'green');
        } else {
            log(`  ❌ خطأ في API: ${apiTest.error}`, 'red');
        }
    }
    
    log('\n🎯 للحصول على أفضل أداء:', 'cyan');
    log('  1. تأكد من تشغيل كلا الخادمين', 'cyan');
    log('  2. استخدم npm start للتشغيل الآمن', 'cyan');
    log('  3. في حالة المشاكل، استخدم npm run restart', 'cyan');
}

healthCheck().catch(console.error);
