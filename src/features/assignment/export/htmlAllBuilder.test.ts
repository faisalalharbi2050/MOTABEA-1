/**
 * اختبارات شاملة لمنشئ HTML وتصدير التقارير
 * Comprehensive Tests for HTML Builder and Report Export
 */

import { HtmlAllBuilder } from './htmlAllBuilder';
import type { AssignmentState, Teacher, Assignment } from '../store/types';

/**
 * بيانات اختبار وهمية مبسطة
 */
const mockState: Partial<AssignmentState> = {
  teachers: [
    {
      id: 'teacher-1',
      name: 'أحمد محمد العتيبي',
      specialization: 'اللغة العربية',
      maxLoad: 20,
      currentLoad: 15,
      isActive: true,
      email: 'ahmed@school.edu.sa',
      phone: '0555123456',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  subjects: [
    {
      id: 'subject-1',
      name: 'النحو والصرف',
      code: 'AR101',
      requiredHours: 6,
      level: 'high',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  classrooms: [
    {
      id: 'classroom-1',
      name: 'الثاني الثانوي أ',
      grade: 'grade-11',
      section: 'A',
      level: 'high',
      capacity: 25,
      currentStudents: 23,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  assignments: [
    {
      id: 'assignment-1',
      teacherId: 'teacher-1',
      subjectId: 'subject-1',
      classroomId: 'classroom-1',
      hoursPerWeek: 6,
      semester: 'first',
      academicYear: '2024-2025',
      status: 'active',
      assignedAt: new Date().toISOString(),
      assignedBy: 'admin-1'
    }
  ]
};

/**
 * اختبارات بناء HTML الأساسي
 */
export function testBasicHtmlGeneration(): TestResult[] {
  const results: TestResult[] = [];

  try {
    // اختبار إنشاء HTML أساسي
    const builder = new HtmlAllBuilder();
    const basicHtml = builder.buildCompleteReport(mockState as AssignmentState);
    
    results.push({
      testName: 'إنشاء تقرير HTML أساسي',
      passed: basicHtml.includes('<!DOCTYPE html>') && 
               basicHtml.includes('<html dir="rtl"') &&
               basicHtml.includes('</html>'),
      output: `طول HTML: ${basicHtml.length} حرف`
    });

    // اختبار وجود العناصر الأساسية
    const hasRequiredElements = basicHtml.includes('<head>') &&
                               basicHtml.includes('<body>') &&
                               basicHtml.includes('<meta charset="UTF-8">');
    
    results.push({
      testName: 'وجود العناصر الأساسية',
      passed: hasRequiredElements,
      output: 'تم العثور على جميع العناصر الأساسية'
    });

    // اختبار البيانات العربية
    const hasArabicData = basicHtml.includes('أحمد محمد العتيبي') &&
                         basicHtml.includes('النحو والصرف') &&
                         basicHtml.includes('الثاني الثانوي أ');
    
    results.push({
      testName: 'وجود البيانات العربية',
      passed: hasArabicData,
      output: 'تم العثور على البيانات العربية في HTML'
    });

  } catch (error) {
    results.push({
      testName: 'بناء HTML الأساسي - معالجة الأخطاء',
      passed: false,
      output: `خطأ: ${error.message}`
    });
  }

  return results;
}

/**
 * اختبارات RTL والتوجه العربي
 */
export function testRtlSupport(): TestResult[] {
  const results: TestResult[] = [];

  try {
    // اختبار التوجه من اليمين لليسار
    const builder = new HtmlAllBuilder();
    const html = builder.buildCompleteReport(mockState as AssignmentState);
    
    results.push({
      testName: 'دعم RTL في العنصر الرئيسي',
      passed: html.includes('<html dir="rtl"') || html.includes('direction: rtl'),
      output: 'تم تعيين اتجاه RTL'
    });

    // اختبار الخطوط العربية
    const hasFontSupport = html.includes('Noto Kufi Arabic') ||
                          html.includes('Noto Sans Arabic') ||
                          html.includes('font-family');
    
    results.push({
      testName: 'دعم الخطوط العربية',
      passed: hasFontSupport,
      output: 'تم تضمين خطوط عربية مناسبة'
    });

    // اختبار CSS للطباعة العربية
    const hasPrintStyles = html.includes('@media print') ||
                          html.includes('print-styles') ||
                          html.includes('@page');
    
    results.push({
      testName: 'أنماط الطباعة العربية',
      passed: hasPrintStyles,
      output: 'تم تضمين أنماط الطباعة'
    });

  } catch (error) {
    results.push({
      testName: 'دعم RTL - معالجة الأخطاء',
      passed: false,
      output: `خطأ: ${error.message}`
    });
  }

  return results;
}

/**
 * اختبارات JSON المدمج وبيانات التطبيق
 */
export function testEmbeddedJson(): TestResult[] {
  const results: TestResult[] = [];

  try {
    const builder = new HtmlAllBuilder();
    const html = builder.buildCompleteReport(mockState as AssignmentState);

    // اختبار وجود بيانات JSON
    const hasJsonData = html.includes('<script type="application/json"') ||
                       html.includes('data-assignment-data') ||
                       html.includes('window.assignmentData');
    
    results.push({
      testName: 'وجود بيانات JSON مدمجة',
      passed: hasJsonData,
      output: hasJsonData ? 'تم العثور على بيانات JSON مدمجة' : 'لم يتم العثور على بيانات JSON'
    });

    // اختبار صحة JSON
    let jsonValid = false;
    try {
      // محاولة استخراج JSON من HTML
      const jsonMatch = html.match(/<script[^>]*type="application\/json"[^>]*>(.*?)<\/script>/s);
      if (jsonMatch && jsonMatch[1]) {
        JSON.parse(jsonMatch[1]);
        jsonValid = true;
      }
    } catch {
      jsonValid = false;
    }

    results.push({
      testName: 'صحة تركيب JSON',
      passed: jsonValid,
      output: jsonValid ? 'JSON صالح ويمكن تحليله' : 'JSON غير صالح أو غير موجود'
    });

    // اختبار data attributes
    const hasDataAttributes = html.includes('data-teacher-count') ||
                             html.includes('data-assignment-count') ||
                             html.includes('data-report-type');
    
    results.push({
      testName: 'وجود data attributes',
      passed: hasDataAttributes,
      output: hasDataAttributes ? 'تم العثور على data attributes' : 'لم يتم العثور على data attributes'
    });

  } catch (error) {
    results.push({
      testName: 'JSON المدمج - معالجة الأخطاء',
      passed: false,
      output: `خطأ: ${error.message}`
    });
  }

  return results;
}

/**
 * اختبارات الأنماط الداخلية والاكتفاء الذاتي
 */
export function testSelfContainment(): TestResult[] {
  const results: TestResult[] = [];

  try {
    const builder = new HtmlAllBuilder();
    const html = builder.buildCompleteReport(mockState as AssignmentState);

    // اختبار الأنماط الداخلية
    const hasInternalStyles = html.includes('<style>') ||
                             html.includes('<style type="text/css">');
    
    results.push({
      testName: 'وجود أنماط CSS داخلية',
      passed: hasInternalStyles,
      output: hasInternalStyles ? 'تم تضمين أنماط CSS داخلية' : 'لا توجد أنماط داخلية'
    });

    // اختبار عدم وجود روابط خارجية
    const hasExternalLinks = html.includes('<link rel="stylesheet"') ||
                            html.includes('href="http') ||
                            html.includes('src="http');
    
    results.push({
      testName: 'عدم الاعتماد على ملفات خارجية',
      passed: !hasExternalLinks,
      output: hasExternalLinks ? 'يحتوي على روابط خارجية' : 'ملف مكتف ذاتياً'
    });

    // اختبار حجم الملف المعقول
    const fileSizeKB = html.length / 1024;
    const reasonableSize = fileSizeKB < 500; // أقل من 500 كيلوبايت
    
    results.push({
      testName: 'حجم ملف معقول',
      passed: reasonableSize,
      output: `حجم الملف: ${fileSizeKB.toFixed(2)} كيلوبايت`
    });

  } catch (error) {
    results.push({
      testName: 'الاكتفاء الذاتي - معالجة الأخطاء',
      passed: false,
      output: `خطأ: ${error.message}`
    });
  }

  return results;
}

/**
 * اختبارات الجداول والبيانات المنظمة
 */
export function testTableStructure(): TestResult[] {
  const results: TestResult[] = [];

  try {
    const builder = new HtmlAllBuilder();
    const html = builder.buildCompleteReport(mockState as AssignmentState);

    // اختبار وجود جداول
    const hasTables = html.includes('<table') && html.includes('</table>');
    
    results.push({
      testName: 'وجود جداول في التقرير',
      passed: hasTables,
      output: hasTables ? 'تم العثور على جداول' : 'لا توجد جداول'
    });

    // اختبار رؤوس الجداول العربية
    const hasArabicHeaders = html.includes('<th>') &&
                            (html.includes('اسم المعلم') ||
                             html.includes('التخصص') ||
                             html.includes('عدد الحصص'));
    
    results.push({
      testName: 'رؤوس الجداول العربية',
      passed: hasArabicHeaders,
      output: hasArabicHeaders ? 'رؤوس الجداول بالعربية' : 'رؤوس الجداول غير واضحة'
    });

    // اختبار تنسيق الجداول للطباعة
    const hasTablePrintStyles = html.includes('table') &&
                               (html.includes('border-collapse') ||
                                html.includes('print-table') ||
                                html.includes('@media print'));
    
    results.push({
      testName: 'تنسيق الجداول للطباعة',
      passed: hasTablePrintStyles,
      output: hasTablePrintStyles ? 'جداول منسقة للطباعة' : 'تنسيق الطباعة غير واضح'
    });

  } catch (error) {
    results.push({
      testName: 'بنية الجداول - معالجة الأخطاء',
      passed: false,
      output: `خطأ: ${error.message}`
    });
  }

  return results;
}

/**
 * اختبارات المعلومات الوصفية والتاريخ
 */
export function testMetadata(): TestResult[] {
  const results: TestResult[] = [];

  try {
    const builder = new HtmlAllBuilder();
    const html = builder.buildCompleteReport(mockState as AssignmentState);

    // اختبار معلومات التاريخ والوقت
    const currentYear = new Date().getFullYear().toString();
    const hasTimestamp = html.includes(currentYear) ||
                        html.includes('التاريخ') ||
                        html.includes('تاريخ التقرير');
    
    results.push({
      testName: 'وجود معلومات التاريخ',
      passed: hasTimestamp,
      output: hasTimestamp ? 'تم تضمين معلومات التاريخ' : 'معلومات التاريخ غير واضحة'
    });

    // اختبار عنوان التقرير
    const hasTitle = html.includes('<title>') ||
                    html.includes('تقرير إسناد المواد') ||
                    html.includes('assignment');
    
    results.push({
      testName: 'وجود عنوان التقرير',
      passed: hasTitle,
      output: hasTitle ? 'تم تضمين عنوان مناسب' : 'العنوان غير واضح'
    });

    // اختبار meta tags للعربية
    const hasArabicMeta = html.includes('lang="ar"') ||
                         html.includes('charset="UTF-8"') ||
                         html.includes('dir="rtl"');
    
    results.push({
      testName: 'Meta tags للغة العربية',
      passed: hasArabicMeta,
      output: hasArabicMeta ? 'Meta tags صحيحة للعربية' : 'Meta tags غير كافية'
    });

  } catch (error) {
    results.push({
      testName: 'المعلومات الوصفية - معالجة الأخطاء',
      passed: false,
      output: `خطأ: ${error.message}`
    });
  }

  return results;
}

/**
 * تشغيل جميع اختبارات HTML Export
 */
export function runAllHtmlExportTests(): TestSuite {
  console.log('📄 بدء اختبارات تصدير HTML...\n');

  const testSuites = [
    { name: 'بناء HTML الأساسي', tests: testBasicHtmlGeneration() },
    { name: 'دعم RTL', tests: testRtlSupport() },
    { name: 'JSON المدمج', tests: testEmbeddedJson() },
    { name: 'الاكتفاء الذاتي', tests: testSelfContainment() },
    { name: 'بنية الجداول', tests: testTableStructure() },
    { name: 'المعلومات الوصفية', tests: testMetadata() }
  ];

  let totalTests = 0;
  let passedTests = 0;

  testSuites.forEach(suite => {
    console.log(`📄 مجموعة اختبارات: ${suite.name}`);
    suite.tests.forEach(test => {
      totalTests++;
      const status = test.passed ? '✅' : '❌';
      console.log(`  ${status} ${test.testName}`);
      if (!test.passed || process.env.NODE_ENV === 'development') {
        console.log(`     النتيجة: ${test.output}`);
      }
      if (test.passed) passedTests++;
    });
    console.log('');
  });

  const successRate = Math.round((passedTests / totalTests) * 100);
  console.log(`📊 النتيجة النهائية: ${passedTests}/${totalTests} (${successRate}%)`);

  return {
    totalTests,
    passedTests,
    successRate,
    suites: testSuites.map(suite => ({
      name: suite.name,
      tests: suite.tests
    }))
  };
}

// تعريفات الأنواع
interface TestResult {
  testName: string;
  passed: boolean;
  output: string;
}

interface TestSuite {
  totalTests: number;
  passedTests: number;
  successRate: number;
  suites: Array<{
    name: string;
    tests: TestResult[];
  }>;
}

export { runAllHtmlExportTests as default };