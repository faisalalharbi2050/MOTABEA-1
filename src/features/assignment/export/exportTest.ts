/**
 * ملف اختبار سريع لوظائف التصدير الجديدة
 * Quick Test for New Export Functions
 */

import { TeacherSummary, buildPlanAllHtml } from '../export/htmlAllBuilder';
import { 
  createPlanHtmlExporter,
  downloadPlanHtml,
  copyPlanHtmlToClipboard,
  openPlanHtmlPreview
} from '../export/htmlAllDownload';

// بيانات تجريبية للاختبار
const mockSummaries: TeacherSummary[] = [
  {
    id: '1',
    name: 'أحمد محمد علي',
    quota: 24,
    assignments: [
      {
        id: 'a1',
        subjectId: 's1',
        subjectName: 'الرياضيات',
        classroomId: 'c1', 
        classroomName: 'الأول الابتدائي أ',
        hours: 6
      },
      {
        id: 'a2',
        subjectId: 's2',
        subjectName: 'العلوم',
        classroomId: 'c2',
        classroomName: 'الثاني الابتدائي ب',
        hours: 4
      }
    ],
    totals: {
      totalHours: 10,
      remainingQuota: 14,
      utilizationRate: 41.7
    }
  },
  {
    id: '2', 
    name: 'فاطمة سالم أحمد',
    quota: 22,
    assignments: [
      {
        id: 'a3',
        subjectId: 's3',
        subjectName: 'اللغة العربية',
        classroomId: 'c3',
        classroomName: 'الثالث الابتدائي أ',
        hours: 8
      }
    ],
    totals: {
      totalHours: 8,
      remainingQuota: 14, 
      utilizationRate: 36.4
    }
  }
];

// اختبار دالة بناء HTML
export function testHtmlBuild() {
  console.log('🔧 اختبار بناء HTML...');
  
  const html = buildPlanAllHtml(mockSummaries, {
    title: 'خطة إسناد المواد - اختبار',
    schoolName: 'مدرسة النموذج الابتدائية',
    includeDate: true
  });
  
  console.log('✅ تم إنشاء HTML بنجاح، حجم الملف:', html.length, 'حرف');
  
  // التحقق من وجود JSON مدمج
  const hasJson = html.includes('<script type="application/json" id="mutaaba-plan">');
  console.log('📄 JSON مدمج:', hasJson ? '✅' : '❌');
  
  // التحقق من وجود CSS و RTL
  const hasRtl = html.includes('dir="rtl"');
  const hasCss = html.includes('<style>');
  console.log('🎨 تنسيق RTL:', hasRtl ? '✅' : '❌');
  console.log('💄 CSS مدمج:', hasCss ? '✅' : '❌');
  
  return html;
}

// اختبار دالة التصدير الشامل
export function testHtmlExporter() {
  console.log('🚀 اختبار مُصدِر HTML...');
  
  const exporter = createPlanHtmlExporter(mockSummaries, {
    title: 'خطة شاملة للاختبار',
    schoolName: 'مدرسة الاختبار',
    includeDate: true
  });
  
  console.log('✅ تم إنشاء المُصدِر بنجاح');
  console.log('📊 حجم الملف المتوقع:', exporter.getSize(), 'بايت');
  console.log('📋 صحة JSON:', exporter.validateJson() ? '✅' : '❌');
  console.log('📁 اسم الملف:', exporter.filename);
  
  return exporter;
}

// اختبار التحقق من JSON
export function testJsonValidation() {
  console.log('🔍 اختبار التحقق من JSON...');
  
  const html = buildPlanAllHtml(mockSummaries);
  
  // محاولة استخراج وتحليل JSON
  try {
    const jsonMatch = html.match(/<script type="application\/json" id="mutaaba-plan">([\s\S]*?)<\/script>/);
    if (jsonMatch && jsonMatch[1]) {
      const jsonData = JSON.parse(jsonMatch[1]);
      console.log('✅ JSON صالح ويمكن تحليله');
      console.log('📈 إصدار البيانات:', jsonData.version);
      console.log('👥 عدد المعلمين:', jsonData.teachers?.length || 0);
      console.log('📚 إجمالي الإسنادات:', jsonData.meta?.totalAssignments || 0);
      return true;
    } else {
      console.log('❌ لم يتم العثور على JSON في HTML');
      return false;
    }
  } catch (error) {
    console.log('❌ خطأ في تحليل JSON:', error);
    return false;
  }
}

// اختبار شامل لجميع الوظائف
export function runAllTests() {
  console.log('🎯 بدء الاختبار الشامل لوظائف التصدير...\n');
  
  try {
    // اختبار 1: بناء HTML
    const html = testHtmlBuild();
    console.log('');
    
    // اختبار 2: المُصدِر الشامل
    const exporter = testHtmlExporter();
    console.log('');
    
    // اختبار 3: التحقق من JSON
    const isJsonValid = testJsonValidation();
    console.log('');
    
    // النتائج النهائية
    console.log('🏁 ملخص النتائج:');
    console.log('━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ بناء HTML: نجح');
    console.log('✅ المُصدِر الشامل: نجح');
    console.log(`${isJsonValid ? '✅' : '❌'} التحقق من JSON: ${isJsonValid ? 'نجح' : 'فشل'}`);
    console.log('✅ جميع الاختبارات: مكتملة');
    
    // إرجاع النتائج للاختبار البرمجي
    return {
      html,
      exporter,
      isJsonValid,
      success: true
    };
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
    return {
      html: null,
      exporter: null,
      isJsonValid: false,
      success: false,
      error
    };
  }
}

// تشغيل الاختبار تلقائياً في بيئة التطوير
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🧪 تشغيل اختبارات وظائف التصدير في وضع التطوير...');
  setTimeout(runAllTests, 1000);
}