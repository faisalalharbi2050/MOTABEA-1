#!/usr/bin/env node

const { exec, spawn } = require('child_process');
const path = require('path');

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

function cleanProcesses() {
    return new Promise((resolve) => {
        log('🧹 تنظيف العمليات السابقة...', 'yellow');
        
        if (process.platform === 'win32') {
            exec('taskkill /F /IM node.exe /T 2>nul', () => {
                setTimeout(resolve, 2000);
            });
        } else {
            exec('pkill -f "node.*server" && pkill -f "npm.*dev" && pkill -f "vite"', () => {
                setTimeout(resolve, 2000);
            });
        }
    });
}

function startProcess(command, args, name, color) {
    return new Promise((resolve, reject) => {
        log(`🚀 تشغيل ${name}...`, color);
        
        const process = spawn(command, args, {
            cwd: __dirname,
            stdio: 'inherit',
            shell: true
        });
        
        process.on('spawn', () => {
            log(`✅ تم تشغيل ${name} بنجاح`, 'green');
            resolve(process);
        });
        
        process.on('error', (error) => {
            log(`❌ خطأ في تشغيل ${name}: ${error.message}`, 'red');
            reject(error);
        });
    });
}

async function main() {
    try {
        log('🎯 MOTABEA - التشغيل السريع', 'cyan');
        log('============================', 'cyan');
        
        // تنظيف العمليات السابقة
        await cleanProcesses();
        
        // تشغيل الخادم الخلفي
        log('\n📡 مرحلة 1: الخادم الخلفي', 'blue');
        const backend = await startProcess('node', ['server/index.js'], 'الخادم الخلفي', 'blue');
        
        // انتظار 5 ثوانٍ
        log('\n⏳ انتظار 5 ثوانٍ...', 'yellow');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // تشغيل خادم التطوير
        log('\n🌐 مرحلة 2: خادم التطوير', 'blue');
        const frontend = await startProcess('npm', ['run', 'dev'], 'خادم التطوير', 'blue');
        
        log('\n🎉 تم تشغيل جميع الخوادم بنجاح!', 'green');
        log('🌐 Frontend: http://localhost:3000', 'cyan');
        log('📡 Backend: http://localhost:5001', 'cyan');
        log('\n💡 اضغط Ctrl+C لإيقاف الخوادم', 'yellow');
        
        // التعامل مع الإيقاف
        process.on('SIGINT', () => {
            log('\n🛑 إيقاف الخوادم...', 'yellow');
            backend.kill();
            frontend.kill();
            setTimeout(() => process.exit(0), 2000);
        });
        
        // منع إيقاف السكريپت
        process.stdin.resume();
        
    } catch (error) {
        log(`❌ خطأ: ${error.message}`, 'red');
        log('💡 جرب: npm run restart', 'yellow');
        process.exit(1);
    }
}

main();
