/**
 * اختبارات شاملة لمنشئي النصوص العربية
 * Comprehensive Tests for Arabic Text Builders
 */

import {
  buildTeacherAssignmentText,
  buildPlanAssignmentText
} from './textBuilders';
import type { TeacherAssignmentSummary, PlanSummary } from '../store/types';

/**
 * بيانات اختبار وهمية
 */
const mockTeacherSummary: TeacherAssignmentSummary = {
  teacherId: 'teacher-1',
  teacherName: 'أحمد محمد علي',
  specialization: 'اللغة العربية',
  totalHours: 18,
  maxLoad: 20,
  loadPercentage: 90,
  totalAssignments: 3,
  assignments: [
    {
      subjectId: 'subject-1',
      subjectName: 'النحو والصرف',
      classroomId: 'class-1',
      classroomName: 'الثاني الثانوي أ',
      hoursPerWeek: 6,
      semester: 'first' as const
    },
    {
      subjectId: 'subject-2',
      subjectName: 'الأدب والنصوص',
      classroomId: 'class-2',
      classroomName: 'الثالث الثانوي ب',
      hoursPerWeek: 8,
      semester: 'full' as const
    },
    {
      subjectId: 'subject-3',
      subjectName: 'البلاغة',
      classroomId: 'class-3',
      classroomName: 'الأول الثانوي ج',
      hoursPerWeek: 4,
      semester: 'second' as const
    }
  ]
};

const mockPlanSummary: PlanSummary = {
  teacherCount: 3,
  totalHours: 45,
  averageLoad: 15,
  lastUpdated: new Date().toISOString(),
  teacherSummaries: [
    mockTeacherSummary,
    {
      teacherId: 'teacher-2',
      teacherName: 'فاطمة عبدالرحمن',
      specialization: 'الرياضيات',
      totalHours: 14,
      maxLoad: 18,
      loadPercentage: 77.8,
      totalAssignments: 2,
      assignments: [
        {
          subjectId: 'subject-4',
          subjectName: 'الجبر',
          classroomId: 'class-4',
          classroomName: 'الثاني الثانوي أ',
          hoursPerWeek: 8,
          semester: 'full' as const
        },
        {
          subjectId: 'subject-5',
          subjectName: 'الهندسة',
          classroomId: 'class-5',
          classroomName: 'الأول الثانوي ب',
          hoursPerWeek: 6,
          semester: 'first' as const
        }
      ]
    },
    {
      teacherId: 'teacher-3',
      teacherName: 'خالد سليمان القرشي',
      specialization: 'الفيزياء',
      totalHours: 13,
      maxLoad: 20,
      loadPercentage: 65,
      totalAssignments: 2,
      assignments: [
        {
          subjectId: 'subject-6',
          subjectName: 'الفيزياء النووية',
          classroomId: 'class-6',
          classroomName: 'الثالث الثانوي أ',
          hoursPerWeek: 7,
          semester: 'second' as const
        },
        {
          subjectId: 'subject-7',
          subjectName: 'الكهرباء والمغناطيسية',
          classroomId: 'class-7',
          classroomName: 'الثاني الثانوي ب',
          hoursPerWeek: 6,
          semester: 'full' as const
        }
      ]
    }
  ]
};

/**
 * اختبارات وحدة بناء نص المعلم الواحد
 */
export function testTeacherAssignmentText(): TestResult[] {
  const results: TestResult[] = [];
  
  try {
    // اختبار النص الأساسي
    const basicText = buildTeacherAssignmentText(mockTeacherSummary);
    results.push({
      testName: 'بناء نص إسناد المعلم - أساسي',
      passed: basicText.includes('أحمد محمد علي') && 
               basicText.includes('اللغة العربية') && 
               basicText.includes('18/20 حصة'),
      output: basicText.substring(0, 200) + '...'
    });

    // اختبار النص بدون رأس
    const noHeaderText = buildTeacherAssignmentText(mockTeacherSummary, false);
    results.push({
      testName: 'بناء نص إسناد المعلم - بدون رأس',
      passed: !noHeaderText.includes('📋 **إسناد المواد**') && 
               noHeaderText.includes('أحمد محمد علي'),
      output: noHeaderText.substring(0, 150) + '...'
    });

    // اختبار النص بدون تفاصيل
    const noDetailsText = buildTeacherAssignmentText(mockTeacherSummary, true, false);
    results.push({
      testName: 'بناء نص إسناد المعلم - بدون تفاصيل',
      passed: !noDetailsText.includes('تفاصيل المواد المسندة') && 
               noDetailsText.includes('ملخص النصاب'),
      output: noDetailsText.substring(0, 150) + '...'
    });

    // اختبار التنسيق والرموز
    const hasEmojis = /[📋👤🎓📊🔴🟡🟢⚠️💡📍⏰📅📈]/.test(basicText);
    results.push({
      testName: 'وجود الرموز التعبيرية والتنسيق',
      passed: hasEmojis,
      output: 'تم العثور على رموز تعبيرية مناسبة'
    });

    // اختبار ترتيب المواد
    const orderedText = buildTeacherAssignmentText(mockTeacherSummary, true, true);
    const firstSubjectIndex = orderedText.indexOf('الأدب والنصوص'); // 8 حصص
    const secondSubjectIndex = orderedText.indexOf('النحو والصرف'); // 6 حصص
    results.push({
      testName: 'ترتيب المواد حسب عدد الحصص',
      passed: firstSubjectIndex < secondSubjectIndex,
      output: 'المواد مرتبة من الأكثر حصصاً للأقل'
    });

  } catch (error) {
    results.push({
      testName: 'بناء نص إسناد المعلم - معالجة الأخطاء',
      passed: false,
      output: `خطأ: ${error.message}`
    });
  }

  return results;
}

/**
 * اختبارات وحدة بناء خطة الإسناد المتعددة
 */
export function testPlanAssignmentText(): TestResult[] {
  const results: TestResult[] = [];
  
  try {
    // اختبار النص الأساسي للخطة
    const planText = buildPlanAssignmentText(mockPlanSummary, 'جميع المعلمين');
    results.push({
      testName: 'بناء نص خطة الإسناد - أساسي',
      passed: planText.includes('ملخص خطة إسناد المواد') && 
               planText.includes('عدد المعلمين: 3') && 
               planText.includes('إجمالي الحصص: 45'),
      output: planText.substring(0, 300) + '...'
    });

    // اختبار تحليل توزيع النصاب
    const analysisText = buildPlanAssignmentText(mockPlanSummary);
    const hasLoadAnalysis = analysisText.includes('تحليل توزيع النصاب') &&
                           analysisText.includes('حمولة عالية') &&
                           analysisText.includes('حمولة متوسطة');
    results.push({
      testName: 'تحليل توزيع النصاب',
      passed: hasLoadAnalysis,
      output: 'تم العثور على تحليل توزيع النصاب'
    });

    // اختبار النص مع تفاصيل المعلمين
    const detailedText = buildPlanAssignmentText(mockPlanSummary, 'المحدد', true, 5);
    results.push({
      testName: 'النص مع تفاصيل المعلمين',
      passed: detailedText.includes('قائمة المعلمين') && 
               detailedText.includes('أحمد محمد علي'),
      output: 'تم تضمين تفاصيل المعلمين'
    });

    // اختبار حدود عدد المعلمين
    const limitedText = buildPlanAssignmentText(mockPlanSummary, 'المحدد', true, 2);
    const teacherMatches = (limitedText.match(/👤/g) || []).length;
    results.push({
      testName: 'حد عدد المعلمين في التفاصيل',
      passed: teacherMatches <= 2,
      output: `عدد المعلمين المعروضين: ${teacherMatches}`
    });

  } catch (error) {
    results.push({
      testName: 'بناء نص خطة الإسناد - معالجة الأخطاء',
      passed: false,
      output: `خطأ: ${error.message}`
    });
  }

  return results;
}

/**
 * اختبارات تنسيق التواريخ والأوقات
 */
export function testDateTimeFormatting(): TestResult[] {
  const results: TestResult[] = [];
  
  try {
    const text = buildTeacherAssignmentText(mockTeacherSummary);
    const dateRegex = /التاريخ: .+ - \d{2}:\d{2}/;
    
    results.push({
      testName: 'تنسيق التاريخ والوقت بالعربية',
      passed: dateRegex.test(text),
      output: 'تم تنسيق التاريخ والوقت بصيغة عربية'
    });

    // اختبار تفرد التاريخ (يجب ألا يتكرر)
    const dateMatches = text.match(/التاريخ:/g);
    results.push({
      testName: 'عدم تكرار التاريخ',
      passed: dateMatches && dateMatches.length === 1,
      output: `عدد مرات ظهور التاريخ: ${dateMatches ? dateMatches.length : 0}`
    });

  } catch (error) {
    results.push({
      testName: 'تنسيق التاريخ - معالجة الأخطاء',
      passed: false,
      output: `خطأ: ${error.message}`
    });
  }

  return results;
}

/**
 * اختبارات رموز حالة النصاب
 */
export function testLoadStatusIcons(): TestResult[] {
  const results: TestResult[] = [];
  
  try {
    // اختبار حمولة عالية (90%)
    const highLoadText = buildTeacherAssignmentText(mockTeacherSummary);
    results.push({
      testName: 'رمز الحمولة العالية',
      passed: highLoadText.includes('🟡') || highLoadText.includes('🔴'),
      output: 'ظهر رمز مناسب للحمولة العالية'
    });

    // اختبار حمولة متوسطة
    const mediumLoadSummary = { 
      ...mockTeacherSummary, 
      totalHours: 14, 
      loadPercentage: 70 
    };
    const mediumLoadText = buildTeacherAssignmentText(mediumLoadSummary);
    results.push({
      testName: 'رمز الحمولة المتوسطة',
      passed: mediumLoadText.includes('🟢') || mediumLoadText.includes('🔵'),
      output: 'ظهر رمز مناسب للحمولة المتوسطة'
    });

    // اختبار حمولة منخفضة
    const lowLoadSummary = { 
      ...mockTeacherSummary, 
      totalHours: 8, 
      loadPercentage: 40 
    };
    const lowLoadText = buildTeacherAssignmentText(lowLoadSummary);
    results.push({
      testName: 'رمز الحمولة المنخفضة ورسالة التحسين',
      passed: lowLoadText.includes('💡') && lowLoadText.includes('يمكن زيادة النصاب'),
      output: 'ظهر رمز ورسالة مناسبة للحمولة المنخفضة'
    });

  } catch (error) {
    results.push({
      testName: 'رموز حالة النصاب - معالجة الأخطاء',
      passed: false,
      output: `خطأ: ${error.message}`
    });
  }

  return results;
}

/**
 * اختبارات تنسيق الفصول الدراسية
 */
export function testSemesterFormatting(): TestResult[] {
  const results: TestResult[] = [];
  
  try {
    const text = buildTeacherAssignmentText(mockTeacherSummary, true, true);
    
    results.push({
      testName: 'تنسيق الفصل الأول',
      passed: text.includes('الفصل الأول'),
      output: 'ظهر تنسيق الفصل الأول'
    });

    results.push({
      testName: 'تنسيق الفصل الثاني',
      passed: text.includes('الفصل الثاني'),
      output: 'ظهر تنسيق الفصل الثاني'
    });

    results.push({
      testName: 'تنسيق العام الكامل',
      passed: text.includes('العام الكامل'),
      output: 'ظهر تنسيق العام الكامل'
    });

  } catch (error) {
    results.push({
      testName: 'تنسيق الفصول - معالجة الأخطاء',
      passed: false,
      output: `خطأ: ${error.message}`
    });
  }

  return results;
}

/**
 * اختبارات طول النص وحدود المحتوى
 */
export function testTextLimitsAndLength(): TestResult[] {
  const results: TestResult[] = [];
  
  try {
    // اختبار النص الأساسي
    const basicText = buildTeacherAssignmentText(mockTeacherSummary);
    results.push({
      testName: 'طول النص الأساسي مناسب',
      passed: basicText.length > 100 && basicText.length < 2000,
      output: `طول النص: ${basicText.length} حرف`
    });

    // اختبار النص المختصر
    const shortText = buildTeacherAssignmentText(mockTeacherSummary, false, false);
    results.push({
      testName: 'النص المختصر أقصر من الكامل',
      passed: shortText.length < basicText.length,
      output: `طول النص المختصر: ${shortText.length} حرف`
    });

    // اختبار حدود خطة الإسناد
    const planText = buildPlanAssignmentText(mockPlanSummary);
    results.push({
      testName: 'طول نص خطة الإسناد مناسب',
      passed: planText.length > 200 && planText.length < 5000,
      output: `طول نص الخطة: ${planText.length} حرف`
    });

  } catch (error) {
    results.push({
      testName: 'حدود طول النص - معالجة الأخطاء',
      passed: false,
      output: `خطأ: ${error.message}`
    });
  }

  return results;
}

/**
 * تشغيل جميع الاختبارات وإرجاع النتائج
 */
export function runAllTextBuilderTests(): TestSuite {
  console.log('🧪 بدء اختبارات منشئي النصوص العربية...\n');

  const testSuites = [
    { name: 'نص إسناد المعلم', tests: testTeacherAssignmentText() },
    { name: 'نص خطة الإسناد', tests: testPlanAssignmentText() },
    { name: 'تنسيق التاريخ والوقت', tests: testDateTimeFormatting() },
    { name: 'رموز حالة النصاب', tests: testLoadStatusIcons() },
    { name: 'تنسيق الفصول الدراسية', tests: testSemesterFormatting() },
    { name: 'حدود طول النص', tests: testTextLimitsAndLength() }
  ];

  let totalTests = 0;
  let passedTests = 0;

  testSuites.forEach(suite => {
    console.log(`📝 مجموعة اختبارات: ${suite.name}`);
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

// تصدير الاختبارات للاستخدام الخارجي
export { runAllTextBuilderTests as default };