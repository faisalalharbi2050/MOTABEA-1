# 🖨️ نظام طباعة الانتظار اليومي - دليل المطور

## 📌 نظرة عامة

هذا المستند يشرح كيفية عمل نظام الطباعة في صفحة الانتظار اليومي لمطوري MOTABEA.

## 🏗️ البنية الأساسية

```
src/
├── components/
│   └── DailyWaiting/
│       └── PDFGenerator.tsx         # المكون الرئيسي للطباعة
├── pages/
│   └── DailyWaiting/
│       └── DailyWaitingPage.tsx     # الصفحة الرئيسية
└── styles/
    ├── print.css                    # أنماط الطباعة العامة
    └── daily-waiting.css            # أنماط محددة
```

## 🔧 المكونات

### 1. PDFGenerator Component

```typescript
interface PDFGeneratorProps {
  assignments: WaitingAssignment[];
  selectedDate: string;
  schoolInfo: {
    name: string;
    principalName: string;
    vicePrincipalName: string;
  };
}
```

**الوظائف الرئيسية**:
- `handleDirectPrint()`: الطباعة المباشرة
- `handleGeneratePDF()`: إنشاء ملف PDF
- `convertToHijri()`: تحويل التاريخ للهجري
- `getDayName()`: الحصول على اسم اليوم

### 2. PDFPreview Component
معاينة المستند قبل الطباعة

### 3. PDFPrintView Component
العرض الفعلي للطباعة (يستخدم inline styles)

## 📝 هيكل البيانات

### WaitingAssignment
```typescript
interface WaitingAssignment {
  id: string;
  absentTeacherId: string;
  absentTeacherName: string;
  substituteTeacherId: string;
  substituteTeacherName: string;
  periodNumber: number;
  className: string;
  subject: string;
  date: string;
  isHidden?: boolean;
  isNotificationSent?: boolean;
}
```

## 🎨 أنماط الطباعة

### 1. print.css
الأنماط العامة للطباعة:
```css
@media print {
  @page {
    size: A4 portrait;
    margin: 1.5cm;
  }
  
  .print\:hidden {
    display: none !important;
  }
  
  .print\:block {
    display: block !important;
  }
}
```

### 2. Inline Styles في PDFPrintView
لضمان ظهور التنسيق:
```jsx
<div style={{
  backgroundColor: 'white',
  padding: '32px',
  direction: 'rtl'
}}>
```

## 🔄 آلية العمل

### 1. تجميع البيانات
```javascript
const groupedAssignments = assignments.reduce((acc, assignment) => {
  const key = assignment.absentTeacherId;
  if (!acc[key]) {
    acc[key] = {
      absentTeacherName: assignment.absentTeacherName,
      assignments: []
    };
  }
  acc[key].assignments.push(assignment);
  return acc;
}, {});
```

### 2. الطباعة
```javascript
const handleDirectPrint = () => {
  setTimeout(() => {
    window.print();
  }, 100);
};
```
**ملاحظة**: الـ `setTimeout` ضروري لضمان تحميل المحتوى المخفي

### 3. العرض
```jsx
{/* محتوى الشاشة */}
<div className="print:hidden">
  {/* الأزرار والإعدادات */}
</div>

{/* محتوى الطباعة */}
<div className="hidden print:block">
  <PDFPrintView {...props} />
</div>
```

## 🛠️ التخصيص

### 1. تعديل النص التمهيدي
في `PDFPrintView.tsx`:
```jsx
<p style={{...}}>
  نظراً لغياب زميلنا المعلم 
  <strong>{teacher.absentTeacherName}</strong>
  // ... بقية النص
</p>
```

### 2. تعديل تنسيق الجدول
```jsx
<table style={{
  width: '100%',
  borderCollapse: 'collapse',
  border: '2px solid #1f2937'
}}>
```

### 3. إضافة حقول جديدة
1. أضف الحقل في interface
2. عدّل الجدول في PDFPreview
3. عدّل الجدول في PDFPrintView
4. حدّث الأنماط

## 🐛 حل المشاكل

### المشكلة: الصفحة فارغة عند الطباعة
**السبب**: المحتوى المخفي لم يتم تحميله
**الحل**: استخدم `setTimeout` في `handleDirectPrint`

### المشكلة: الألوان لا تظهر
**السبب**: إعدادات المتصفح
**الحل**: 
```css
* {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
```

### المشكلة: الجدول مكسور عبر الصفحات
**الحل**:
```css
.page-break-inside-avoid {
  page-break-inside: avoid;
}
```

## 📚 الدوال المساعدة

### convertToHijri
```javascript
const convertToHijri = (gregorianDate: string): string => {
  const date = new Date(gregorianDate);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear() - 579}هـ`;
};
```
**ملاحظة**: هذا تحويل تقريبي، للدقة استخدم مكتبة متخصصة

### getDayName
```javascript
const getDayName = (date: string): string => {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayIndex = new Date(date).getDay();
  return days[dayIndex];
};
```

## 🧪 الاختبار

### 1. اختبار سريع
افتح `test-print-daily-waiting.html` في المتصفح

### 2. اختبار كامل
```javascript
// في console المتصفح
window.print();
```

### 3. اختبار البيانات
```javascript
console.log('Assignments:', assignments);
console.log('Grouped:', groupedAssignments);
```

## 🔐 Best Practices

### 1. استخدم Inline Styles للطباعة
❌ **خطأ**:
```jsx
<div className="bg-blue-100">
```

✅ **صحيح**:
```jsx
<div style={{ backgroundColor: '#dbeafe' }}>
```

### 2. اختبر على متصفحات متعددة
- Chrome (الأفضل)
- Edge
- Firefox
- Safari

### 3. استخدم setTimeout للطباعة
```javascript
setTimeout(() => window.print(), 100);
```

### 4. أضف print-color-adjust
```css
* {
  print-color-adjust: exact;
}
```

## 📖 المراجع

- [MDN: @media print](https://developer.mozilla.org/en-US/docs/Web/CSS/@media)
- [CSS Print Best Practices](https://www.smashingmagazine.com/2018/05/print-stylesheets-in-2018/)
- [React Print Components](https://github.com/gregnb/react-to-print)

## 🔄 التحديثات المستقبلية

### قصيرة المدى
- [ ] إضافة شعار المدرسة
- [ ] تحسين التحويل الهجري
- [ ] إضافة رمز QR

### طويلة المدى
- [ ] تصدير إلى Excel
- [ ] توقيع إلكتروني
- [ ] أرشفة تلقائية
- [ ] قوالب متعددة

## 📞 الدعم التقني

للمساعدة التقنية:
1. راجع الوثائق
2. افحص console المتصفح
3. استخدم React DevTools
4. تحقق من Network tab

## 🎯 نصائح للأداء

### 1. تقليل الحجم
- استخدم CSS modules
- قلل من inline styles عند الإمكان
- استخدم lazy loading

### 2. تحسين الطباعة
- استخدم @page للتحكم بالصفحات
- قلل من الصور والأيقونات
- استخدم خطوط web fonts

### 3. الذاكرة
- امسح البيانات القديمة
- استخدم useMemo للبيانات الكبيرة
- تجنب re-renders غير الضرورية

## ✅ Checklist للمطور

عند إضافة ميزة جديدة للطباعة:
- [ ] أضف الأنماط في print.css
- [ ] حدّث PDFPrintView
- [ ] حدّث PDFPreview
- [ ] اختبر على متصفحات متعددة
- [ ] وثّق التغييرات
- [ ] حدّث الأمثلة

---

**آخر تحديث**: 3 أكتوبر 2025  
**الإصدار**: 1.0.0  
**المطور**: فريق MOTABEA
