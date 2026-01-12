# دليل تنفيذ Meta Embedded Signup لنظام MOTABEA
## WhatsApp Business Platform Integration Guide

---

## 📋 نظرة عامة

هذا الدليل يشرح خطوات تنفيذ **Embedded Signup** من Meta لربط أرقام واتساب الأعمال بنظام MOTABEA. يتيح هذا التكامل للمدارس إرسال رسائل واتساب تلقائية بسهولة.

---

## 🎯 الأهداف

1. ربط رقم واتساب أعمال لكل مدرسة
2. الحصول على `phone_number_id` و `business_account_id`
3. تخزين بيانات الربط بشكل آمن
4. تفعيل إرسال الرسائل عبر WhatsApp Cloud API

---

## 📚 المتطلبات الأساسية

### 1. حساب Facebook Business Manager
- يجب أن يكون لديك حساب Facebook Business Manager نشط
- رابط التسجيل: https://business.facebook.com

### 2. إنشاء تطبيق Facebook
1. انتقل إلى: https://developers.facebook.com/apps
2. انقر على "Create App"
3. اختر نوع التطبيق: **Business**
4. أدخل تفاصيل التطبيق:
   - **App Name**: MOTABEA School Management
   - **App Contact Email**: your-email@motabea.edu.sa
   - **Business Account**: اختر حساب الأعمال الخاص بك

### 3. إضافة منتج WhatsApp
1. من لوحة تحكم التطبيق، اذهب إلى **Add Product**
2. اختر **WhatsApp** وانقر على **Set up**
3. سيتم توجيهك لصفحة إعدادات WhatsApp

### 4. الحصول على الـ Credentials
من صفحة **WhatsApp > Getting Started**:

```plaintext
📌 احفظ هذه البيانات بشكل آمن:

- App ID: 123456789012345
- App Secret: your_app_secret_here
- System User Access Token: (سيتم شرح إنشائه)
- Config ID: (سيتم إنشائه للـ Embedded Signup)
```

---

## 🔧 خطوات التنفيذ

### المرحلة 1: إعداد System User Access Token

#### 1. إنشاء System User
1. اذهب إلى **Business Settings** في Business Manager
2. من القائمة الجانبية: **Users > System Users**
3. انقر على **Add** وأنشئ System User جديد:
   - **Name**: MOTABEA WhatsApp System
   - **Role**: Admin
   - **Description**: System user for WhatsApp messaging

#### 2. إنشاء Access Token
1. اختر System User الذي أنشأته
2. انقر على **Generate New Token**
3. اختر التطبيق الذي أنشأته (MOTABEA School Management)
4. حدد الصلاحيات التالية:
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
   - ✅ `business_management`
5. انقر على **Generate Token**
6. **احفظ الـ Token فوراً** - لن تتمكن من رؤيته مرة أخرى!

```env
# أضف في ملف .env
WHATSAPP_SYSTEM_ACCESS_TOKEN=your_long_lived_access_token_here
```

---

### المرحلة 2: إنشاء Embedded Signup Configuration

#### 1. إنشاء Configuration في Meta
1. اذهب إلى: https://business.facebook.com/wa/manage/home/
2. من القائمة: **Account Tools > Embedded Signup**
3. انقر على **Create Configuration**
4. أدخل التفاصيل:

```json
{
  "name": "MOTABEA Schools Signup",
  "callback_url": "https://yourdomain.com/api/whatsapp/oauth-callback",
  "fields": [
    "waba_id",
    "phone_number_id"
  ],
  "business_verification_status": "not_verified",
  "display_name": "MOTABEA School Management System"
}
```

5. بعد الإنشاء، ستحصل على **Configuration ID** - احفظه

```env
# أضف في ملف .env
WHATSAPP_CONFIG_ID=your_configuration_id_here
```

---

### المرحلة 3: تكامل Frontend (React)

#### 1. تثبيت Facebook SDK

أضف في `index.html`:

```html
<!-- Facebook SDK -->
<script>
  window.fbAsyncInit = function() {
    FB.init({
      appId      : 'YOUR_APP_ID',
      cookie     : true,
      xfbml      : true,
      version    : 'v18.0'
    });
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "https://connect.facebook.net/ar_AR/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
</script>
```

#### 2. تحديث WhatsAppMessagingPage Component

في ملف `src/pages/Dashboard/WhatsAppMessagingPage.tsx`، حدّث دالة `handleEmbeddedSignup`:

```typescript
const handleEmbeddedSignup = () => {
  // التحقق من تحميل Facebook SDK
  if (typeof FB === 'undefined') {
    alert('Facebook SDK لم يتم تحميله بعد، الرجاء إعادة المحاولة');
    return;
  }

  const APP_ID = 'YOUR_APP_ID'; // من Facebook App
  const CONFIG_ID = 'YOUR_CONFIG_ID'; // من Embedded Signup Config
  const REDIRECT_URI = `${window.location.origin}/api/whatsapp/oauth-callback`;

  // فتح نافذة Embedded Signup
  FB.login(
    function(response) {
      if (response.authResponse) {
        console.log('Embedded Signup Success:', response);
        
        // استخراج البيانات المطلوبة
        const authCode = response.authResponse.code;
        
        // إرسال الكود للخادم لاستبداله بـ Access Token
        fetch('/api/whatsapp/complete-signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            authCode: authCode
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert('✅ تم ربط واتساب بنجاح!');
            // إعادة تحميل حالة الاشتراك
            fetchSubscriptionStatus();
          } else {
            alert('❌ فشل في إتمام عملية الربط');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('حدث خطأ في الاتصال');
        });
        
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    },
    {
      config_id: CONFIG_ID,
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        setup: {
          // يمكن إضافة معلومات مسبقة
        }
      }
    }
  );
};
```

---

### المرحلة 4: تكامل Backend (Node.js/Express)

#### 1. Endpoint لإتمام عملية Signup

أضف في `server/index.js`:

```javascript
const axios = require('axios');

// Endpoint لإتمام عملية Embedded Signup
app.post('/api/whatsapp/complete-signup', authenticateToken, async (req, res) => {
  try {
    const { authCode } = req.body;
    const schoolId = req.user.school_id;

    if (!authCode) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    // 1. استبدال Auth Code بـ Access Token
    const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        code: authCode
      }
    });

    const accessToken = tokenResponse.data.access_token;

    // 2. الحصول على معلومات WABA وPhone Number
    const debugResponse = await axios.get('https://graph.facebook.com/v18.0/debug_token', {
      params: {
        input_token: accessToken,
        access_token: process.env.WHATSAPP_SYSTEM_ACCESS_TOKEN
      }
    });

    const data = debugResponse.data.data;
    const wabaId = data.granular_scopes?.find(s => s.scope === 'whatsapp_business_management')?.target_ids?.[0];

    if (!wabaId) {
      throw new Error('Failed to get WABA ID');
    }

    // 3. الحصول على Phone Number ID
    const phoneResponse = await axios.get(`https://graph.facebook.com/v18.0/${wabaId}/phone_numbers`, {
      params: {
        access_token: process.env.WHATSAPP_SYSTEM_ACCESS_TOKEN
      }
    });

    const phoneNumber = phoneResponse.data.data[0];
    const phoneNumberId = phoneNumber.id;
    const phoneNumberValue = phoneNumber.display_phone_number;

    // 4. حفظ البيانات في قاعدة البيانات
    const config = {
      id: uuidv4(),
      school_id: schoolId,
      phone_number_id: phoneNumberId,
      business_account_id: wabaId,
      phone_number: phoneNumberValue,
      is_active: true,
      verified_at: new Date().toISOString(),
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // حفظ في قاعدة البيانات (استخدم MySQL في الإنتاج)
    if (!mockDatabase.whatsappConfigurations) {
      mockDatabase.whatsappConfigurations = [];
    }
    
    // إزالة الإعدادات القديمة إن وجدت
    mockDatabase.whatsappConfigurations = mockDatabase.whatsappConfigurations.filter(
      c => c.school_id !== schoolId
    );
    
    mockDatabase.whatsappConfigurations.push(config);

    console.log('✅ WhatsApp configuration saved:', config);

    res.json({
      success: true,
      message: 'تم ربط واتساب بنجاح',
      data: {
        phone_number: phoneNumberValue,
        waba_id: wabaId
      }
    });

  } catch (error) {
    console.error('Error completing signup:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في إتمام عملية الربط'
    });
  }
});
```

#### 2. تثبيت الحزم المطلوبة

```bash
npm install axios
```

---

### المرحلة 5: متغيرات البيئة (Environment Variables)

أنشئ ملف `.env` في جذر المشروع:

```env
# Facebook App Credentials
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here

# WhatsApp Configuration
WHATSAPP_SYSTEM_ACCESS_TOKEN=your_system_user_token_here
WHATSAPP_CONFIG_ID=your_config_id_here

# Stripe (للدفع)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=motabea_db

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5001
```

⚠️ **هام**: لا تشارك ملف `.env` أبداً على Git!

أضف في `.gitignore`:
```
.env
.env.local
.env.production
```

---

## 🔐 أمان البيانات

### 1. تشفير Access Tokens
لا تخزن Access Tokens بشكل نصي في قاعدة البيانات. استخدم التشفير:

```javascript
const crypto = require('crypto');

// دالة للتشفير
function encryptToken(token) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

// دالة لفك التشفير
function decryptToken(encryptedToken) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
  
  const parts = encryptedToken.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### 2. التحقق من Webhooks
عند استقبال Webhooks من Meta، تحقق من التوقيع:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature) {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.FACEBOOK_APP_SECRET)
    .update(payload)
    .digest('hex');
  
  return signature === `sha256=${expectedSignature}`;
}
```

---

## 📊 الخطوات التالية بعد الربط

### 1. إنشاء Message Templates
قبل إرسال الرسائل، يجب إنشاء قوالب معتمدة من Meta:

1. اذهب إلى: https://business.facebook.com/wa/manage/message-templates/
2. انقر على **Create Template**
3. أدخل تفاصيل القالب:
   - **Template Name**: `student_absence_notification`
   - **Category**: UTILITY
   - **Language**: Arabic
   - **Content**:
     ```
     عزيزي ولي أمر الطالب/ة {{1}}
     
     نود إعلامكم بغياب ابنكم/ابنتكم اليوم {{2}}
     
     للاستفسار: {{3}}
     ```

4. انتظر الموافقة (عادة خلال 24 ساعة)

### 2. اختبار إرسال رسالة

```javascript
// مثال على إرسال رسالة باستخدام Template
const result = await sendTemplatedWhatsAppMessage(
  'school_1',              // School ID
  '+966501234567',         // Recipient phone
  'student_absence_notification',  // Template name
  ['أحمد محمد', '2025-10-08', '0501234567']  // Parameters
);
```

---

## 🐛 استكشاف الأخطاء

### خطأ: "Invalid OAuth access token"
**الحل**: تأكد من أن System User Token صالح وليس منتهي الصلاحية.

### خطأ: "Message template not approved"
**الحل**: انتظر موافقة Meta على القالب أو تأكد من استخدام قالب معتمد.

### خطأ: "Phone number not verified"
**الحل**: تحقق من رقم الهاتف في WhatsApp Business Manager.

### خطأ: "Rate limit exceeded"
**الحل**: راجع حدود الإرسال الخاصة بحسابك (Messaging Limit Tier).

---

## 📞 الدعم والمراجع

### الوثائق الرسمية
- WhatsApp Cloud API: https://developers.facebook.com/docs/whatsapp/cloud-api
- Embedded Signup: https://developers.facebook.com/docs/whatsapp/embedded-signup
- Message Templates: https://developers.facebook.com/docs/whatsapp/message-templates

### مجتمع المطورين
- Facebook Developers Community: https://developers.facebook.com/community/
- Stack Overflow: https://stackoverflow.com/questions/tagged/whatsapp-business-api

---

## ✅ قائمة التحقق النهائية

قبل الإطلاق، تأكد من:

- [ ] إنشاء Facebook App وحساب Business Manager
- [ ] إعداد System User وAccess Token
- [ ] إنشاء Embedded Signup Configuration
- [ ] تكامل Facebook SDK في Frontend
- [ ] إعداد Backend Endpoints
- [ ] تكوين متغيرات البيئة (.env)
- [ ] اختبار عملية الربط
- [ ] إنشاء واعتماد Message Templates
- [ ] اختبار إرسال رسائل حقيقية
- [ ] تفعيل Webhooks لاستقبال الردود
- [ ] تأمين البيانات والتوكنات
- [ ] مراجعة حدود الإرسال (Rate Limits)
- [ ] إعداد نظام المراقبة (Monitoring)

---

## 🎉 تهانينا!

بعد إتمام هذه الخطوات، سيكون نظام MOTABEA جاهزاً لإرسال رسائل واتساب للمدارس بشكل احترافي وآمن.

---

**تم التوثيق بتاريخ**: 8 أكتوبر 2025  
**الإصدار**: 1.0  
**المطور**: MOTABEA Development Team
