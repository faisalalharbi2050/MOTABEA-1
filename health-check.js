#!/usr/bin/env node

/**
 * MOTABEA System Health Check
 * أداة تشخيص النظام لحل مشاكل تسجيل الدخول
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔍 بدء فحص نظام متابع...\n');

// التحقق من ملفات النظام المطلوبة
function checkSystemFiles() {
    console.log('📁 فحص ملفات النظام:');
    
    const requiredFiles = [
        'package.json',
        'server/index.js',
        'src/contexts/AuthContext.tsx',
        'src/pages/LoginPage.tsx',
        'vite.config.ts',
        '.env'
    ];
    
    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`  ✅ ${file}`);
        } else {
            console.log(`  ❌ ${file} - مفقود!`);
        }
    });
    console.log();
}

// التحقق من إعداد البيئة
function checkEnvironment() {
    console.log('🌍 فحص متغيرات البيئة:');
    
    if (fs.existsSync('.env')) {
        const envContent = fs.readFileSync('.env', 'utf8');
        const portMatch = envContent.match(/PORT=(\d+)/);
        const port = portMatch ? portMatch[1] : '5000';
        console.log(`  📡 PORT: ${port}`);
        
        const jwtMatch = envContent.match(/JWT_SECRET=(.+)/);
        const hasJWT = jwtMatch && jwtMatch[1].trim().length > 0;
        console.log(`  🔐 JWT_SECRET: ${hasJWT ? '✅ محدد' : '❌ غير محدد'}`);
    } else {
        console.log('  ❌ ملف .env غير موجود');
    }
    console.log();
}

// التحقق من الخادم الخلفي
function checkBackendServer(port = 5001) {
    return new Promise((resolve) => {
        console.log(`🔌 فحص الخادم الخلفي على البورت ${port}:`);
        
        const options = {
            hostname: 'localhost',
            port: port,
            path: '/api/health',
            method: 'GET',
            timeout: 5000
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`  ✅ الخادم يعمل - Status: ${res.statusCode}`);
                try {
                    const response = JSON.parse(data);
                    console.log(`  📨 الاستجابة: ${response.message || 'OK'}`);
                } catch (e) {
                    console.log(`  📨 الاستجابة: ${data}`);
                }
                resolve(true);
            });
        });
        
        req.on('error', (err) => {
            console.log(`  ❌ الخادم لا يعمل: ${err.message}`);
            resolve(false);
        });
        
        req.on('timeout', () => {
            console.log(`  ⏰ انتهت مهلة الاتصال`);
            req.destroy();
            resolve(false);
        });
        
        req.end();
    });
}

// التحقق من خادم التطوير
function checkFrontendServer(port = 3000) {
    return new Promise((resolve) => {
        console.log(`\n🌐 فحص خادم التطوير على البورت ${port}:`);
        
        const options = {
            hostname: 'localhost',
            port: port,
            path: '/',
            method: 'GET',
            timeout: 5000
        };
        
        const req = http.request(options, (res) => {
            console.log(`  ✅ خادم التطوير يعمل - Status: ${res.statusCode}`);
            resolve(true);
        });
        
        req.on('error', (err) => {
            console.log(`  ❌ خادم التطوير لا يعمل: ${err.message}`);
            resolve(false);
        });
        
        req.on('timeout', () => {
            console.log(`  ⏰ انتهت مهلة الاتصال`);
            req.destroy();
            resolve(false);
        });
        
        req.end();
    });
}

// اختبار تسجيل الدخول
async function testLogin(port = 5001) {
    return new Promise((resolve) => {
        console.log(`\n🔐 اختبار تسجيل الدخول:`);
        
        const postData = JSON.stringify({
            username: 'admin',
            password: 'admin123'
        });
        
        const options = {
            hostname: 'localhost',
            port: port,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 10000
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`  📡 حالة الاستجابة: ${res.statusCode}`);
                
                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(data);
                        console.log(`  ✅ تسجيل الدخول نجح`);
                        console.log(`  👤 المستخدم: ${response.user?.name || 'غير محدد'}`);
                        console.log(`  🎫 التوكن: ${response.token ? 'موجود' : 'غير موجود'}`);
                    } catch (e) {
                        console.log(`  ❌ خطأ في تحليل الاستجابة: ${e.message}`);
                    }
                } else {
                    console.log(`  ❌ فشل تسجيل الدخول`);
                    try {
                        const response = JSON.parse(data);
                        console.log(`  📝 رسالة الخطأ: ${response.message || response.error}`);
                    } catch (e) {
                        console.log(`  📝 استجابة الخطأ: ${data}`);
                    }
                }
                resolve(res.statusCode === 200);
            });
        });
        
        req.on('error', (err) => {
            console.log(`  ❌ خطأ في الاتصال: ${err.message}`);
            resolve(false);
        });
        
        req.on('timeout', () => {
            console.log(`  ⏰ انتهت مهلة الاتصال`);
            req.destroy();
            resolve(false);
        });
        
        req.write(postData);
        req.end();
    });
}

// تشغيل الفحص الشامل
async function runHealthCheck() {
    console.log('🚀 فحص نظام متابع الشامل\n' + '='.repeat(50) + '\n');
    
    // فحص الملفات
    checkSystemFiles();
    
    // فحص البيئة
    checkEnvironment();
    
    // فحص الخوادم
    const backendRunning = await checkBackendServer();
    const frontendRunning = await checkFrontendServer();
    
    // اختبار تسجيل الدخول
    if (backendRunning) {
        await testLogin();
    }
    
    // النتيجة النهائية
    console.log('\n' + '='.repeat(50));
    console.log('📊 ملخص النتائج:');
    console.log(`  🔧 الخادم الخلفي: ${backendRunning ? '✅ يعمل' : '❌ لا يعمل'}`);
    console.log(`  🌐 خادم التطوير: ${frontendRunning ? '✅ يعمل' : '❌ لا يعمل'}`);
    
    if (!backendRunning) {
        console.log('\n🔨 الحلول المقترحة:');
        console.log('  1. تأكد من تشغيل الخادم الخلفي: npm run server');
        console.log('  2. تحقق من البورت في ملف .env');
        console.log('  3. تأكد من عدم وجود برامج أخرى تستخدم نفس البورت');
    }
    
    if (!frontendRunning) {
        console.log('\n🔨 الحلول المقترحة:');
        console.log('  1. تأكد من تشغيل خادم التطوير: npm run dev');
        console.log('  2. تحقق من إعدادات Vite');
    }
    
    console.log('\n✨ انتهى الفحص');
}

// تشغيل الفحص
runHealthCheck().catch(console.error);
