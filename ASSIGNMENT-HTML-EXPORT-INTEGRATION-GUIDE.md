# دليل النظام المطور لتصدير HTML وربط ActionBar

## ملخص التطوير المكتمل

تم تطوير وتحسين نظام تصدير HTML الشامل مع ربط ActionBar بجميع الوظائف المطلوبة بنجاح.

## المهام المكتملة

### المهمة 6: تصدير HTML للخطة الكاملة ✅

#### 1. ملف `sanitize.ts`
- **الموقع**: `src/features/assignment/export/sanitize.ts`
- **الوظائف الرئيسية**:
  - `escapeHtml()`: هروب الأحرف الخاصة في HTML
  - `stripControlChars()`: إزالة الأحرف التحكمية
  - `sanitizeForHtml()`: تنظيف شامل للنصوص
  - `sanitizeForJson()`: تنظيف للاستخدام في JSON
  - `sanitizeFilename()`: تنظيف أسماء الملفات

#### 2. ملف `htmlAllBuilder.ts` 
- **الوظيفة الرئيسية**: `buildPlanAllHtml(summaries, meta)`
- **المخرجات**:
  - HTML كامل مع `<!DOCTYPE html><html lang="ar" dir="rtl">`
  - `<head>` متكامل مع Meta tags و CSS مدمج
  - `<body>` يحتوي على:
    - Header: اسم المدرسة + عنوان التقرير + التاريخ
    - كتلة JSON مدمجة: `<script type="application/json" id="mutaaba-plan">`
    - أقسام المعلمين مع MARKERS: `<!-- START:ASSIGNMENTS -->` و `<!-- END:ASSIGNMENTS -->`
    - جداول بيانات مع صفوف `<tr data-subject data-class data-hours>`

#### 3. ملف `htmlAllDownload.ts`
- **الوظائف المطلوبة**:
  - `downloadPlanHtml(filename, html)`: تنزيل ملف HTML
  - `copyPlanHtmlToClipboard(html)`: نسخ HTML للحافظة
  - `openPlanHtmlPreview(html)`: فتح معاينة في نافذة جديدة
  - `createPlanHtmlExporter()`: مُصدِر شامل بجميع الوظائف

#### 4. مكون `HtmlExportAllMenu.tsx`
- **الخصائص**:
  - واجهة تفاعلية لإدخال اسم المدرسة وعنوان التقرير
  - خيارات تضمين التاريخ واسم ملف مخصص
  - أزرار: نسخ / تنزيل / معاينة
  - إحصائيات مباشرة: عدد المعلمين، الإسنادات، حجم الملف، صحة JSON

### المهمة 7: ربط ActionBar بكل الوظائف ✅

#### التحديثات على `ActionBar.tsx`:

1. **ربط واتساب**: يدعم النطاق المحدد والعام
   - المحدد: إرسال تقرير فردي للمعلم المحدد
   - العام: إرسال ملخص شامل

2. **ربط الطباعة**: `window.print()` مباشرة

3. **ربط تنزيل PDF**: يطبق منطق النطاق
   - معلم واحد محدد: `generateTeacherPDF()`
   - متعددين محددين: `generateTeachersPDF()`
   - الكل: `generatePlanPDF()`

4. **ربط تنزيل CSV**: يطبق منطق النطاق
   - معلم واحد محدد: `exportTeacherReportCSV()`
   - متعددين محددين: `exportTeachersCSV()`
   - الكل: `exportPlanCSV()`

5. **ربط تنزيل HTML**: فتح قائمة `HtmlExportAllMenu`
   - دائماً يصدر الكل (لا ينطبق عليه الفلتر)
   - JSON قابل للقراءة لإضافة كروم/مدرستي

#### منطق النطاق الموحد:
```typescript
const { scope } = getTargetScope();
// scope: 'selected' | 'all'
// يطبق على جميع الوظائف ما عدا HTML (دائماً الكل)
```

## الملفات الجديدة/المحدثة

### ملفات جديدة:
- `src/features/assignment/export/sanitize.ts`
- `src/features/assignment/export/exportTest.ts`

### ملفات محدثة:
- `src/features/assignment/export/htmlAllBuilder.ts` (إضافة `buildPlanAllHtml`)
- `src/features/assignment/export/htmlAllDownload.ts` (إضافة الدوال المطلوبة)
- `src/features/assignment/components/HtmlExportAllMenu.tsx` (تطوير كامل)
- `src/features/assignment/components/ActionBar.tsx` (ربط بالوظائف)
- `src/features/assignment/export/index.ts` (تحديث exports)

## طريقة الاستخدام

### 1. من ActionBar:
```typescript
// الأزرار الجديدة متاحة في ActionBar:
- واتساب: مشاركة حسب النطاق
- طباعة: window.print() مباشرة  
- PDF: تنزيل حسب النطاق
- CSV: تصدير حسب النطاق
- HTML: فتح قائمة التصدير الشامل
```

### 2. برمجياً:
```typescript
import { createPlanHtmlExporter } from '../export/htmlAllDownload';

const exporter = createPlanHtmlExporter(teacherSummaries, {
  title: 'خطة إسناد المواد',
  schoolName: 'مدرسة النموذج',
  includeDate: true
});

// الوظائف المتاحة:
exporter.download();     // تنزيل
await exporter.copy();   // نسخ للحافظة  
exporter.preview();      // معاينة
```

### 3. اختبار الوظائف:
```typescript
import { runAllTests } from '../export/exportTest';

// تشغيل اختبار شامل
const results = runAllTests();
console.log('حالة الاختبار:', results.success);
```

## مواصفات الملف الناتج

### اسم الملف:
- **النمط**: `Assignment_Plan_All_[yyyy-mm-dd].html`
- **مثال**: `Assignment_Plan_All_2025-10-23.html`

### محتوى HTML:
- **اللغة**: عربي مع `dir="rtl"`
- **التنسيق**: CSS مدمج محسن للطباعة
- **البيانات**: JSON مدمج قابل للاستخراج
- **العلامات**: MARKERS للمعالجة الآلية

### JSON المدمج:
```json
{
  "version": "1.0.0",
  "generatedAt": "2025-10-23T10:30:00.000Z", 
  "school": "اسم المدرسة",
  "meta": {
    "title": "خطة إسناد المواد الكاملة",
    "totalTeachers": 25,
    "totalAssignments": 150,
    "totalHours": 600
  },
  "teachers": [...]
}
```

## التحقق من الجودة

### اختبار JSON:
```javascript
const jsonData = JSON.parse(
  document.getElementById('mutaaba-plan').textContent
);
// يجب أن يعمل بدون أخطاء
```

### اختبار الطباعة:
- CSS محسن لـ `@media print`
- تكسير صفحات ذكي مع `break-inside: avoid`
- ألوان محفوظة مع `print-color-adjust: exact`

### اختبار RTL:
- عرض صحيح من اليمين لليسار
- محاذاة النصوص والجداول
- ترتيب الأعمدة مناسب للعربية

## الـ Commits المطلوبة

```bash
git add .
git commit -m "feat(assignment/export): HTML ذاتي + JSON لإضافة كروم/مدرستي

- إضافة sanitize.ts مع دوال escapeHtml و stripControlChars  
- تطوير buildPlanAllHtml في htmlAllBuilder.ts
- إضافة downloadPlanHtml و copyPlanHtmlToClipboard و openPlanHtmlPreview
- تطوير HtmlExportAllMenu.tsx مع خيارات متقدمة
- ربط ActionBar بجميع وظائف المشاركة والتقارير والتنزيل
- تطبيق منطق النطاق الموحد (المحدد/الكل)
- إضافة اختبارات شاملة exportTest.ts"

git commit -m "feat(assignment/actions): تكامل ActionBar/Details مع المشاركة والتقارير

- ربط أزرار واتساب بـ sendTeacherReport و sendSummaryReport
- ربط طباعة بـ window.print مباشرة
- ربط PDF بـ generateTeacherPDF حسب النطاق  
- ربط CSV بـ exportTeacherReportCSV حسب النطاق
- HTML دائماً شامل مع قائمة HtmlExportAllMenu
- تطبيق الفلاتر على النطاق المحدد فقط"
```

## حالة المشروع: ✅ مكتمل بنجاح

جميع المتطلبات تم تنفيذها بشكل احترافي مع:
- ✅ كود نظيف ومنظم
- ✅ معالجة الأخطاء الشاملة  
- ✅ واجهة مستخدم تفاعلية
- ✅ اختبارات شاملة
- ✅ توثيق كامل
- ✅ تكامل مع النظام الحالي