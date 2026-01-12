const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🚀 MOTABEA - نظام إدارة المدرسة');
console.log('=====================================\n');

// التحقق من الملفات المطلوبة
const requiredFiles = [
  'server/index.js',
  'src/App.tsx',
  'vite.config.ts',
  'package.json'
];

console.log('📁 التحقق من الملفات...');
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ ملف مفقود: ${file}`);
    process.exit(1);
  }
}
console.log('✅ جميع الملفات موجودة\n');

// إنشاء ملف .env إذا لم يكن موجوداً
if (!fs.existsSync('.env')) {
  const envContent = `NODE_ENV=development
PORT=5001
JWT_SECRET=motabea_school_management_secret_key_2024
DATABASE_URL=mysql://localhost:3306/motabea_school
CORS_ORIGIN=http://localhost:3003`;
  
  fs.writeFileSync('.env', envContent);
  console.log('✅ تم إنشاء ملف .env');
} else {
  console.log('✅ ملف .env موجود');
}

// التحقق من تثبيت التبعيات
if (!fs.existsSync('node_modules')) {
  console.log('📦 تثبيت التبعيات...');
  exec('npm install', (error) => {
    if (error) {
      console.error('❌ فشل في تثبيت التبعيات:', error);
      process.exit(1);
    }
    console.log('✅ تم تثبيت التبعيات\n');
    startServers();
  });
} else {
  console.log('✅ التبعيات مثبتة\n');
  startServers();
}

function killExistingProcesses() {
  return new Promise((resolve) => {
    exec('taskkill /F /IM node.exe /T', () => {
      exec('taskkill /F /IM npm.exe /T', () => {
        setTimeout(resolve, 2000);
      });
    });
  });
}

async function startServers() {
  console.log('🛑 إيقاف العمليات السابقة...');
  await killExistingProcesses();
  console.log('✅ تم إيقاف العمليات السابقة\n');

  // تشغيل الخادم الخلفي
  console.log('🔧 تشغيل الخادم الخلفي...');
  const backend = spawn('node', ['server/index.js'], {
    stdio: 'pipe',
    shell: true
  });

  backend.stdout.on('data', (data) => {
    console.log(`[Backend] ${data.toString().trim()}`);
  });

  backend.stderr.on('data', (data) => {
    console.error(`[Backend Error] ${data.toString().trim()}`);
  });

  // انتظار تشغيل الخادم الخلفي
  await new Promise(resolve => setTimeout(resolve, 5000));

  // التحقق من الخادم الخلفي
  const healthCheck = spawn('curl', ['-s', 'http://localhost:5001/api/health'], {
    stdio: 'pipe',
    shell: true
  });

  healthCheck.on('close', (code) => {
    if (code === 0) {
      console.log('✅ الخادم الخلفي يعمل بشكل صحيح\n');
    } else {
      console.log('⚠️ الخادم الخلفي قد لا يعمل بشكل صحيح\n');
    }

    // تشغيل الواجهة الأمامية
    console.log('🎨 تشغيل الواجهة الأمامية...');
    console.log('=====================================');
    console.log('🌐 الواجهة الأمامية: http://localhost:3003');
    console.log('🔧 الخادم الخلفي: http://localhost:5001');
    console.log('👤 المستخدم: admin');
    console.log('🔑 كلمة المرور: admin123');
    console.log('=====================================\n');

    const frontend = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });

    frontend.on('close', (code) => {
      console.log(`Frontend exited with code ${code}`);
      backend.kill();
    });
  });

  // إغلاق نظيف عند الخروج
  process.on('SIGINT', () => {
    console.log('\n🛑 إيقاف الخوادم...');
    backend.kill();
    process.exit();
  });
}

module.exports = startServers;
