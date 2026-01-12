# دليل البدء السريع - نظام رسائل واتساب MOTABEA
## Quick Start Guide

---

## 🚀 البدء السريع (للتطوير والاختبار)

### 1. تشغيل قاعدة البيانات
```bash
# افتح MySQL وقم بتنفيذ:
mysql -u root -p

# داخل MySQL:
source database/whatsapp_tables.sql
```

### 2. تشغيل الخادم الخلفي
```bash
# في مجلد المشروع:
node server/index.js

# أو استخدام nodemon للتطوير:
npx nodemon server/index.js
```

### 3. تشغيل الواجهة الأمامية
```bash
# في نافذة terminal أخرى:
npm run dev
```

### 4. الوصول للنظام
- **الواجهة الأمامية**: http://localhost:3000
- **الخادم الخلفي**: http://localhost:5001
- **صفحة الرسائل**: http://localhost:3000/dashboard/whatsapp

---

## 🧪 اختبار النظام (بدون اتصال حقيقي)

### اختبار رحلة المستخدم الكاملة:

#### 1. تسجيل الدخول
- **اسم المستخدم**: `admin`
- **كلمة المرور**: `admin123`

#### 2. الانتقال لصفحة الرسائل
من القائمة الجانبية: **الرسائل** أو اذهب مباشرة لـ:
```
http://localhost:3000/dashboard/whatsapp
```

#### 3. اختبار الاشتراك
1. انقر على **"إدارة الرسائل"**
2. ستظهر حالة "غير مشترك"
3. اختر باقة وانقر **"اشترك الآن"**
4. ستفتح صفحة دفع تجريبية
5. انقر **"✅ إتمام الدفع (محاكاة)"**
6. سيتم توجيهك للنظام مع اشتراك نشط

#### 4. اختبار ربط واتساب
1. بعد تفعيل الاشتراك
2. انقر **"ربط رقم واتساب"**
3. (في التطوير: سيفتح نافذة Meta - يمكن إغلاقها)
4. للمحاكاة: استخدم API مباشرة

---

## 🔧 اختبار APIs مباشرة

### 1. فحص حالة الاشتراك
```bash
curl -X GET http://localhost:5001/api/subscription/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIn0.fake_token_for_dev"
```

### 2. تفعيل اشتراك يدوياً
```bash
curl -X POST http://localhost:5001/api/stripe/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_123",
        "client_reference_id": "school_1",
        "metadata": {
          "school_id": "school_1",
          "package_type": "package_5000"
        }
      }
    }
  }'
```

### 3. ربط واتساب يدوياً
```bash
curl -X POST http://localhost:5001/api/whatsapp/save-config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIn0.fake_token_for_dev" \
  -d '{
    "phoneNumberId": "123456789",
    "businessAccountId": "987654321",
    "phoneNumber": "+966501234567"
  }'
```

### 4. إرسال رسالة تجريبية
```bash
curl -X POST http://localhost:5001/api/messages/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIn0.fake_token_for_dev" \
  -d '{
    "recipientPhoneNumber": "+966501234567",
    "templateName": "student_absence",
    "templateParameters": ["أحمد محمد", "2025-10-08"]
  }'
```

---

## 📦 الملفات المهمة

### الملفات الجديدة:
1. **`database/whatsapp_tables.sql`** - جداول قاعدة البيانات
2. **`WHATSAPP-EMBEDDED-SIGNUP-GUIDE.md`** - دليل تنفيذ Meta Embedded Signup
3. **`WHATSAPP-DEVELOPMENT-REPORT.md`** - تقرير شامل للتطوير
4. **`WHATSAPP-QUICK-START.md`** - هذا الملف

### الملفات المعدلة:
1. **`src/pages/Dashboard/WhatsAppMessagingPage.tsx`** - صفحة الرسائل المحدثة
2. **`server/index.js`** - APIs جديدة للرسائل والاشتراكات

---

## 🎯 الخطوات التالية

### للتطوير المستمر:

#### 1. تفعيل Facebook App
راجع الملف: `WHATSAPP-EMBEDDED-SIGNUP-GUIDE.md`
- إنشاء Facebook App
- الحصول على App ID و Secret
- إعداد System User Token

#### 2. تفعيل Stripe
```bash
# تثبيت Stripe
npm install stripe

# في ملف .env:
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

#### 3. اختبار Stripe Webhooks محلياً
```bash
# تثبيت Stripe CLI
stripe listen --forward-to localhost:5001/api/stripe/webhooks

# في نافذة أخرى:
stripe trigger checkout.session.completed
```

#### 4. استبدال Mock Database بـ MySQL
في `server/index.js`، استبدل:
```javascript
// القديم:
const subscription = mockDatabase.subscriptions?.find(...)

// الجديد:
const [rows] = await db.query(
  'SELECT * FROM subscriptions WHERE school_id = ?',
  [schoolId]
);
const subscription = rows[0];
```

---

## 🐛 حل المشاكل الشائعة

### المشكلة: "Cannot connect to database"
**الحل**:
```bash
# تحقق من تشغيل MySQL
sudo service mysql start  # Linux
brew services start mysql  # macOS
```

### المشكلة: "Port 5001 already in use"
**الحل**:
```bash
# ابحث عن العملية
lsof -i :5001  # macOS/Linux
netstat -ano | findstr :5001  # Windows

# أوقف العملية أو غيّر البورت في server/index.js:
const PORT = process.env.PORT || 5002;
```

### المشكلة: "JWT token invalid"
**الحل**: استخدم التوكن التجريبي:
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIn0.fake_token_for_dev';
```

### المشكلة: "WhatsApp API returns 401"
**الحل**: في بيئة التطوير، يتم محاكاة الاستجابة. لاختبار حقيقي:
1. احصل على System User Token من Meta
2. أضفه في `.env`:
```env
WHATSAPP_SYSTEM_ACCESS_TOKEN=your_real_token
```

---

## 📊 فحص البيانات

### عرض الاشتراكات في قاعدة البيانات:
```sql
-- في MySQL:
USE motabea_db;

SELECT * FROM subscriptions;
SELECT * FROM whatsapp_configurations;
SELECT * FROM whatsapp_message_log;
```

### حذف البيانات التجريبية:
```sql
TRUNCATE TABLE subscriptions;
TRUNCATE TABLE whatsapp_configurations;
TRUNCATE TABLE subscription_transactions;
TRUNCATE TABLE whatsapp_message_log;
```

---

## 🎨 تخصيص الباقات

في `server/index.js` - endpoint `create-checkout-session`:

```javascript
const packages = {
  'package_1000': { messages: 1000, price: 100, duration_months: 3 },
  'package_5000': { messages: 5000, price: 400, duration_months: 6 },
  'package_10000': { messages: 10000, price: 700, duration_months: 12 },
  
  // أضف باقة جديدة:
  'package_custom': { messages: 20000, price: 1200, duration_months: 12 }
};
```

وفي `WhatsAppMessagingPage.tsx`:
```typescript
{ messages: 20000, price: 1200, popular: false }
```

---

## 📞 دعم إضافي

### الوثائق الكاملة:
- **دليل Embedded Signup**: `WHATSAPP-EMBEDDED-SIGNUP-GUIDE.md`
- **تقرير التطوير**: `WHATSAPP-DEVELOPMENT-REPORT.md`
- **Schema قاعدة البيانات**: `database/whatsapp_tables.sql`

### روابط مفيدة:
- WhatsApp Cloud API Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
- Stripe Docs: https://stripe.com/docs/api
- Meta Business Manager: https://business.facebook.com

---

## ✅ قائمة التحقق السريعة

- [ ] MySQL يعمل
- [ ] جداول قاعدة البيانات منشأة
- [ ] الخادم الخلفي يعمل على http://localhost:5001
- [ ] الواجهة الأمامية تعمل على http://localhost:3000
- [ ] يمكن تسجيل الدخول كـ admin
- [ ] صفحة الرسائل تفتح بدون أخطاء
- [ ] يمكن "محاكاة" عملية الاشتراك
- [ ] حالة الاشتراك تتغير من inactive إلى active

---

## 🚀 جاهز للبدء!

الآن لديك نظام متكامل لإدارة رسائل واتساب. اتبع الخطوات أعلاه وابدأ بالاختبار!

للأسئلة أو المساعدة، راجع الملفات التوثيقية الأخرى.

**بالتوفيق!** 🎉

---

**تم التحديث**: 8 أكتوبر 2025  
**الإصدار**: 1.0  
