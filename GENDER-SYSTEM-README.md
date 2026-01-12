# 🔄 نظام تحويل النصوص حسب نوع المدرسة (بنين/بنات)

## 📖 نظرة سريعة

هذا النظام يحول النصوص تلقائياً من مذكر إلى مؤنث في جميع صفحات المشروع بناءً على نوع المدرسة المختار في صفحة بيانات المدرسة.

---

## 🚀 كيفية الاستخدام في 3 خطوات

### 1️⃣ استيراد الـ Hook
```javascript
import { useSchool } from '../../contexts/SchoolContext';
```

### 2️⃣ استخدام الدوال
```javascript
const MyPage = () => {
  const { getTeacherTitle, getStudentsTitle } = useSchool();
  
  return (
    <div>
      <h1>{getTeachersTitle()}</h1>
      <button>إضافة {getTeacherTitle()}</button>
    </div>
  );
};
```

### 3️⃣ النتيجة
- **بنين:** "المعلمون" + "إضافة معلم"
- **بنات:** "المعلمات" + "إضافة معلمة"

---

## 📚 الدوال المتاحة

### دوال الأفراد (مفرد):
```javascript
getTeacherTitle()      // معلم / معلمة
getStudentTitle()      // طالب / طالبة
getAdminTitle()        // إداري / إدارية
getCounselorTitle()    // مرشد / مرشدة
getPrincipalTitle()    // مدير المدرسة / مديرة المدرسة
getVicePrincipalTitle() // وكيل المدرسة / وكيلة المدرسة
getSupervisorTitle()   // الموجه الطلابي / الموجهة الطلابية
```

### دوال الجمع:
```javascript
getTeachersTitle()     // المعلمون / المعلمات
getStudentsTitle()     // الطلاب / الطالبات
getAdminsTitle()       // الإداريون / الإداريات
```

### دالة مخصصة:
```javascript
getGenderedText(maleText, femaleText)
// مثال:
getGenderedText('مشرف', 'مشرفة')
getGenderedText('رئيس القسم', 'رئيسة القسم')
```

---

## 💡 أمثلة عملية

### مثال 1: صفحة بسيطة
```javascript
import { useSchool } from '../../contexts/SchoolContext';

const TeachersPage = () => {
  const { getTeacherTitle, getTeachersTitle } = useSchool();

  return (
    <div>
      <h1>إدارة {getTeachersTitle()}</h1>
      <button>إضافة {getTeacherTitle()} جديد</button>
      <p>عدد {getTeachersTitle()}: 25</p>
    </div>
  );
};
```

### مثال 2: في نموذج
```javascript
const TeacherForm = () => {
  const { getTeacherTitle } = useSchool();

  return (
    <form>
      <label>اسم {getTeacherTitle()}:</label>
      <input placeholder={`أدخل اسم ${getTeacherTitle()}`} />
      
      <button>حفظ بيانات {getTeacherTitle()}</button>
    </form>
  );
};
```

### مثال 3: في جدول
```javascript
const StudentsTable = () => {
  const { getStudentTitle, getStudentsTitle } = useSchool();

  return (
    <table>
      <thead>
        <tr>
          <th>اسم {getStudentTitle()}</th>
          <th>رقم {getStudentTitle()}</th>
          <th>الفصل</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan="3">لا يوجد {getStudentsTitle()}</td>
        </tr>
      </tbody>
    </table>
  );
};
```

### مثال 4: في الرسائل
```javascript
const Notifications = () => {
  const { getTeacherTitle, getStudentsTitle } = useSchool();

  const handleAdd = () => {
    alert(`تم إضافة ${getTeacherTitle()} بنجاح`);
  };

  const handleDelete = () => {
    const confirmed = confirm(`هل تريد حذف هذا ${getTeacherTitle()}؟`);
    if (confirmed) {
      console.log('تم الحذف');
    }
  };

  return (
    <div>
      <p>تم تسجيل 10 {getStudentsTitle()} جدد</p>
      <p>{getTeacherTitle()} محمد قام بتحديث الدرجات</p>
    </div>
  );
};
```

### مثال 5: نصوص مخصصة
```javascript
const CustomPage = () => {
  const { getGenderedText } = useSchool();

  return (
    <div>
      <h1>{getGenderedText('المشرف التربوي', 'المشرفة التربوية')}</h1>
      <p>{getGenderedText('رئيس القسم', 'رئيسة القسم')}</p>
      <button>{getGenderedText('المسؤول', 'المسؤولة')}</button>
    </div>
  );
};
```

---

## 📋 جدول مرجعي سريع

| الدالة | بنين | بنات |
|--------|------|------|
| `getTeacherTitle()` | معلم | معلمة |
| `getTeachersTitle()` | المعلمون | المعلمات |
| `getStudentTitle()` | طالب | طالبة |
| `getStudentsTitle()` | الطلاب | الطالبات |
| `getAdminTitle()` | إداري | إدارية |
| `getAdminsTitle()` | الإداريون | الإداريات |
| `getCounselorTitle()` | مرشد | مرشدة |
| `getPrincipalTitle()` | مدير المدرسة | مديرة المدرسة |
| `getVicePrincipalTitle()` | وكيل المدرسة | وكيلة المدرسة |
| `getSupervisorTitle()` | الموجه الطلابي | الموجهة الطلابية |

---

## ✅ أفضل الممارسات

### ✓ افعل:
```javascript
// استخدم الدوال الجاهزة عندما تكون متاحة
const { getTeacherTitle } = useSchool();
<span>{getTeacherTitle()}</span>

// استخدم getGenderedText للنصوص المخصصة
const { getGenderedText } = useSchool();
<span>{getGenderedText('مشرف', 'مشرفة')}</span>
```

### ✗ لا تفعل:
```javascript
// ❌ لا تستخدم نصوص ثابتة
<span>معلم</span>

// ❌ لا تستخدم شروط يدوية
{schoolType === 'male' ? 'معلم' : 'معلمة'}
```

---

## 🔍 استكشاف الأخطاء

### المشكلة: "Cannot find name 'getTeacherTitle'"
**الحل:**
```javascript
// تأكد من استيراد الدالة
const { getTeacherTitle } = useSchool();
```

### المشكلة: "useSchool must be used within a SchoolProvider"
**الحل:**
تأكد من أن المكون داخل `<SchoolProvider>` في `App.jsx`

### المشكلة: النصوص لا تتغير
**الحل:**
1. تحقق من حفظ نوع المدرسة في صفحة بيانات المدرسة
2. أعد تحميل الصفحة

---

## 📦 متطلبات الاستخدام

1. ✅ المشروع يحتوي على `SchoolContext.jsx`
2. ✅ `App.jsx` يحتوي على `<SchoolProvider>`
3. ✅ تم حفظ نوع المدرسة في صفحة بيانات المدرسة

---

## 🎯 الخلاصة

هذا النظام يجعل المشروع:
- ✅ متوافق مع مدارس البنين والبنات
- ✅ سهل الصيانة (تغيير من مكان واحد)
- ✅ احترافي وموحد
- ✅ خالي من الأخطاء اللغوية

**استخدمه في جميع صفحات المشروع! 🚀**

---

**تم التحديث:** 5 نوفمبر 2025  
**الإصدار:** 2.0
