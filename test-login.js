/**
 * اختبار سريع لتسجيل الدخول
 * يمكن تشغيل هذا الكود في console المتصفح لاختبار API
 */

console.log('🔐 بدء اختبار تسجيل الدخول...');

async function testLogin() {
    try {
        console.log('📡 إرسال طلب تسجيل الدخول...');
        
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            }),
        });

        console.log('📊 حالة الاستجابة:', response.status);
        console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ خطأ في تسجيل الدخول:', errorData);
            return;
        }

        const data = await response.json();
        console.log('✅ نجح تسجيل الدخول:', {
            user: data.user?.name,
            role: data.user?.role,
            hasToken: !!data.token,
            tokenLength: data.token?.length
        });

        // حفظ التوكن في localStorage
        if (data.token) {
            localStorage.setItem('motabea_token', data.token);
            console.log('💾 تم حفظ التوكن في localStorage');
        }

        return data;
    } catch (error) {
        console.error('💥 خطأ في الشبكة:', error);
    }
}

// تشغيل الاختبار
testLogin().then(() => {
    console.log('✨ انتهى الاختبار');
});
