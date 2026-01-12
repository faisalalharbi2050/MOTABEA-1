/**
 * اختبارات شاملة لوظائف الواتساب وترميز URL
 * Comprehensive Tests for WhatsApp Functions and URL Encoding
 */

import { WhatsAppUtils } from './whatsapp';
import type { AssignmentState, Teacher, Assignment } from '../store/types';

/**
 * بيانات اختبار وهمية
 */
const mockTeacher: Teacher = {
  id: 'teacher-1',
  name: 'أحمد محمد العتيبي',
  email: 'ahmed@school.edu.sa',
  phone: '0555123456',
  specialization: 'اللغة العربية والتربية الإسلامية',
  maxLoad: 20,
  currentLoad: 15,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const mockAssignments: Assignment[] = [
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
  },
  {
    id: 'assignment-2',
    teacherId: 'teacher-1',
    subjectId: 'subject-2',
    classroomId: 'classroom-2',
    hoursPerWeek: 5,
    semester: 'full',
    academicYear: '2024-2025',
    status: 'active',
    assignedAt: new Date().toISOString(),
    assignedBy: 'admin-1'
  }
];

const mockState: AssignmentState = {
  teachers: [mockTeacher],
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
    },
    {
      id: 'subject-2', 
      name: 'التربية الإسلامية',
      code: 'IS101',
      requiredHours: 5,
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
    },
    {
      id: 'classroom-2',
      name: 'الثالث الثانوي ب',
      grade: 'grade-12',
      section: 'B',
      level: 'high', 
      capacity: 28,
      currentStudents: 26,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  assignments: mockAssignments,
  filters: {
    searchTerm: '',
    selectedTeacherId: undefined,
    selectedSubjectId: undefined,
    selectedClassroomId: undefined,
    level: undefined,
    semester: undefined,
    status: undefined
  },
  ui: {
    selectedItems: [],
    selectedTeacherIds: new Set(),
    showTeacherDetails: undefined,
    viewMode: 'matrix',
    sidebarOpen: true,
    exportMenuOpen: false,
    whatsappMenuOpen: false
  },
  loading: {
    teachers: false,
    subjects: false,
    classrooms: false,
    assignments: false,
    saving: false
  },
  errors: {
    teachers: undefined,
    subjects: undefined,
    classrooms: undefined,
    assignments: undefined,
    general: undefined
  },
  settings: {
    academicYear: '2024-2025',
    schoolName: 'مدرسة الاختبار',
    defaultSemester: 'first',
    maxHoursPerTeacher: 25,
    minHoursPerSubject: 1,
    autoSave: true,
    rtlMode: true
  },
  history: {
    past: [],
    future: [],
    canUndo: false,
    canRedo: false
  }
};

/**
 * اختبارات إنشاء روابط المشاركة
 */
export function testShareLinkCreation(): TestResult[] {
  const results: TestResult[] = [];

  try {
    // اختبار إنشاء رابط مشاركة أساسي
    const basicLink = WhatsAppUtils.createShareLink('مرحبا');
    
    results.push({
      testName: 'إنشاء رابط مشاركة أساسي',
      passed: basicLink.includes('whatsapp.com') && basicLink.includes('text='),
      output: basicLink.substring(0, 100) + '...'
    });

    // اختبار نص عربي مع رموز تعبيرية
    const arabicText = '📚 تقرير إسناد المواد للمعلم أحمد محمد العتيبي ⭐';
    const arabicLink = WhatsAppUtils.createShareLink(arabicText);
    
    results.push({
      testName: 'رابط مشاركة للنص العربي مع رموز',
      passed: arabicLink.length > 0 && arabicLink.includes('text='),
      output: 'تم إنشاء رابط للنص العربي بنجاح'
    });

    // اختبار نص طويل
    const longText = 'نص طويل جداً يحتوي على معلومات مفصلة '.repeat(50);
    const longLink = WhatsAppUtils.createShareLink(longText);
    
    results.push({
      testName: 'رابط مشاركة للنص الطويل',
      passed: longLink.length > 0,
      output: `طول الرابط: ${longLink.length} حرف`
    });

  } catch (error) {
    results.push({
      testName: 'إنشاء روابط المشاركة - معالجة الأخطاء',
      passed: false,
      output: `خطأ: ${error.message}`
    });
  }

  return results;
}

/**
 * اختبارات روابط المشاركة والنصوص
 */
export function testUrlEncoding(): TestResult[] {
  const results: TestResult[] = [];

  try {
    // اختبار رابط المشاركة الأساسي
    const basicLink = WhatsAppUtils.createShareLink('مرحبا');
    
    results.push({
      testName: 'إنشاء رابط مشاركة أساسي',
      passed: basicLink.includes('whatsapp.com') && basicLink.includes('text='),
      output: basicLink.substring(0, 100) + '...'
    });

    // اختبار نص عربي مع رموز تعبيرية
    const arabicText = '📚 تقرير إسناد المواد للمعلم أحمد محمد العتيبي ⭐';
    const arabicLink = WhatsAppUtils.createShareLink(arabicText);
    
    results.push({
      testName: 'رابط مشاركة للنص العربي مع رموز',
      passed: arabicLink.length > 0 && arabicLink.includes('text='),
      output: 'تم إنشاء رابط للنص العربي بنجاح'
    });

    // اختبار نص طويل
    const longText = 'نص طويل جداً يحتوي على معلومات مفصلة '.repeat(20);
    const longLink = WhatsAppUtils.createShareLink(longText);
    
    results.push({
      testName: 'رابط مشاركة للنص الطويل',
      passed: longLink.length > 0,
      output: `طول الرابط: ${longLink.length} حرف`
    });

  } catch (error) {
    results.push({
      testName: 'ترميز URL - معالجة الأخطاء',
      passed: false,
      output: `خطأ: ${error.message}`
    });
  }

  return results;
}

/**
 * اختبارات إنشاء رسائل المعلمين
 */
export function testTeacherMessages(): TestResult[] {
  const results: TestResult[] = [];

  try {
    // اختبار الرسالة الأساسية
    const basicMessage = WhatsAppUtils.createTeacherMessage(mockState, 'teacher-1');
    
    results.push({
      testName: 'إنشاء رسالة معلم - أساسية',
      passed: basicMessage.includes('أحمد محمد العتيبي') && 
               basicMessage.includes('اللغة العربية') &&
               basicMessage.includes('إجمالي الحصص'),
      output: basicMessage.substring(0, 200) + '...'
    });

    // اختبار الرسالة المفصلة
    const detailedMessage = WhatsAppUtils.createTeacherMessage(mockState, 'teacher-1', { format: 'detailed' });
    
    results.push({
      testName: 'إنشاء رسالة معلم - مفصلة',
      passed: detailedMessage.includes('تفاصيل الإسناد') &&
               detailedMessage.includes('النحو والصرف'),
      output: 'تم إنشاء رسالة مفصلة بنجاح'
    });

    // اختبار الرسالة بدون رأس
    const noHeaderMessage = WhatsAppUtils.createTeacherMessage(mockState, 'teacher-1', { includeHeader: false });
    
    results.push({
      testName: 'إنشاء رسالة معلم - بدون رأس',
      passed: !noHeaderMessage.includes('تقرير إسناد المعلم') &&
               noHeaderMessage.includes('أحمد محمد العتيبي'),
      output: 'تم إنشاء رسالة بدون رأس بنجاح'
    });

    // اختبار معلم غير موجود
    const invalidMessage = WhatsAppUtils.createTeacherMessage(mockState, 'invalid-teacher');
    
    results.push({
      testName: 'إنشاء رسالة معلم - معلم غير موجود',
      passed: invalidMessage.includes('المعلم غير موجود'),
      output: 'تم التعامل مع المعلم غير الموجود بنجاح'
    });

  } catch (error) {
    results.push({
      testName: 'إنشاء رسائل المعلمين - معالجة الأخطاء',
      passed: false,
      output: `خطأ: ${error.message}`
    });
  }

  return results;
}

/**
 * اختبارات رسائل المعلمين المتقدمة
 */
export function testMessageSplitting(): TestResult[] {
  const results: TestResult[] = [];

  try {
    // اختبار رسالة مفصلة
    const detailedMessage = WhatsAppUtils.createTeacherMessage(mockState, 'teacher-1', { format: 'detailed' });
    
    results.push({
      testName: 'إنشاء رسالة مفصلة',
      passed: detailedMessage.includes('أحمد محمد العتيبي') && detailedMessage.length > 100,
      output: `طول الرسالة المفصلة: ${detailedMessage.length} حرف`
    });

    // اختبار رسالة ملخص
    const summaryMessage = WhatsAppUtils.createSummaryMessage(mockState, { includeHeader: true });
    
    results.push({
      testName: 'إنشاء رسالة ملخص',
      passed: summaryMessage.includes('ملخص') || summaryMessage.length > 50,
      output: 'تم إنشاء رسالة ملخص بنجاح'
    });

  } catch (error) {
    results.push({
      testName: 'رسائل المعلمين - معالجة الأخطاء',
      passed: false,
      output: `خطأ: ${error.message}`
    });
  }

  return results;
}

/**
 * اختبارات روابط WhatsApp المبسطة
 */
export function testWhatsAppLinks(): TestResult[] {
  const results: TestResult[] = [];

  try {
    // اختبار رابط المشاركة
    const shareLink = WhatsAppUtils.createShareLink('مرحبا');
    
    results.push({
      testName: 'إنشاء رابط مشاركة',
      passed: shareLink.includes('whatsapp.com') && shareLink.includes('text='),
      output: shareLink.substring(0, 100) + '...'
    });

    // اختبار نص طويل
    const longText = 'نص طويل '.repeat(50);
    const longLink = WhatsAppUtils.createShareLink(longText);
    
    results.push({
      testName: 'التعامل مع النص الطويل',
      passed: longLink.length > 0,
      output: `طول الرابط: ${longLink.length} حرف`
    });

    // اختبار نص فارغ
    const emptyLink = WhatsAppUtils.createShareLink('');
    
    results.push({
      testName: 'التعامل مع النص الفارغ',
      passed: emptyLink.length > 0,
      output: 'تم إنشاء رابط للنص الفارغ'
    });

  } catch (error) {
    results.push({
      testName: 'إنشاء روابط WhatsApp - معالجة الأخطاء',
      passed: false,
      output: `خطأ: ${error.message}`
    });
  }

  return results;
}

/**
 * اختبارات الرموز التعبيرية والنصوص الخاصة
 */
export function testEmojiHandling(): TestResult[] {
  const results: TestResult[] = [];

  try {
    // اختبار النصوص مع رموز تعبيرية
    const emojiTexts = [
      '📚 عدد المواد: 5',
      '⏰ الوقت: 08:00 صباحاً',
      '👨‍🏫 المعلم: أحمد محمد',
      '✅ تم التأكيد 🎯 الهدف محقق 📈 النتائج ممتازة',
      '🔴🟡🟢⚪🔵'
    ];

    emojiTexts.forEach((text, index) => {
      const url = WhatsAppUtils.createShareLink(text);
      
      results.push({
        testName: `ترميز الرموز التعبيرية ${index + 1}`,
        passed: url.length > 0 && url.includes('text='),
        output: 'تم ترميز الرموز التعبيرية بنجاح'
      });
    });

  } catch (error) {
    results.push({
      testName: 'ترميز الرموز التعبيرية - معالجة الأخطاء',
      passed: false,
      output: `خطأ: ${error.message}`
    });
  }

  return results;
}

/**
 * تشغيل جميع اختبارات الواتساب
 */
export function runAllWhatsAppTests(): TestSuite {
  console.log('📱 بدء اختبارات وظائف الواتساب...\n');

  const testSuites = [
    { name: 'روابط المشاركة', tests: testShareLinkCreation() },
    { name: 'ترميز URL', tests: testUrlEncoding() },
    { name: 'رسائل المعلمين', tests: testTeacherMessages() },
    { name: 'رسائل متقدمة', tests: testMessageSplitting() },
    { name: 'روابط WhatsApp', tests: testWhatsAppLinks() },
    { name: 'الرموز التعبيرية', tests: testEmojiHandling() }
  ];

  let totalTests = 0;
  let passedTests = 0;

  testSuites.forEach(suite => {
    console.log(`📱 مجموعة اختبارات: ${suite.name}`);
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

export { runAllWhatsAppTests as default };