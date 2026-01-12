/**
 * بناة النصوص العربية المهيكلة لنظام إسناد المواد
 * Structured Arabic Text Builders for Assignment System
 */

import type { TeacherAssignmentSummary, PlanSummary } from '../store/types';

/**
 * تحويل أسماء الفصول الدراسية إلى نص عربي
 */
const formatSemester = (semester: 'first' | 'second' | 'full'): string => {
  switch (semester) {
    case 'first': return 'الفصل الأول';
    case 'second': return 'الفصل الثاني';
    case 'full': return 'العام الكامل';
    default: return 'غير محدد';
  }
};

/**
 * تحديد حالة النصاب وإرجاع رمز مناسب
 */
const getLoadStatusIcon = (percentage: number): string => {
  if (percentage >= 95) return '🔴'; // حمولة عالية جداً
  if (percentage >= 85) return '🟡'; // حمولة عالية
  if (percentage >= 70) return '🟢'; // حمولة متوسطة
  if (percentage >= 50) return '🔵'; // حمولة منخفضة
  return '⚪'; // لا توجد حمولة
};

/**
 * تنسيق التاريخ والوقت باللغة العربية
 */
const formatDateTime = (): string => {
  const now = new Date();
  const date = now.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const time = now.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return `${date} - ${time}`;
};

/**
 * بناء نص إسناد معلم واحد
 */
export const buildTeacherAssignmentText = (
  summary: TeacherAssignmentSummary,
  includeHeader: boolean = true,
  includeDetails: boolean = true
): string => {
  const loadIcon = getLoadStatusIcon(summary.loadPercentage);
  let text = '';

  if (includeHeader) {
    text += '📋 **إسناد المواد**\n';
    text += `التاريخ: ${formatDateTime()}\n`;
    text += '─'.repeat(30) + '\n\n';
  }

  // معلومات المعلم الأساسية
  text += `👤 **${summary.teacherName}**\n`;
  text += `🎓 التخصص: ${summary.specialization}\n\n`;

  // ملخص النصاب
  text += `📊 **ملخص النصاب:**\n`;
  text += `${loadIcon} الحمولة: ${summary.totalHours}/${summary.maxLoad} حصة (${summary.loadPercentage}%)\n`;
  text += `📚 عدد المواد: ${summary.totalAssignments}\n\n`;

  // حالة النصاب
  if (summary.loadPercentage >= 95) {
    text += '⚠️ **تحذير:** المعلم يتجاوز الحد المسموح للنصاب\n\n';
  } else if (summary.loadPercentage >= 85) {
    text += '⚡ **ملاحظة:** المعلم يقترب من الحد الأقصى للنصاب\n\n';
  } else if (summary.loadPercentage < 50) {
    text += '💡 **ملاحظة:** يمكن زيادة النصاب للمعلم\n\n';
  }

  if (includeDetails && summary.assignments.length > 0) {
    text += '📋 **تفاصيل المواد المسندة:**\n';
    text += '─'.repeat(25) + '\n';
    
    // ترتيب المواد حسب عدد الحصص (من الأكثر للأقل)
    const sortedAssignments = [...summary.assignments].sort((a, b) => b.hoursPerWeek - a.hoursPerWeek);
    
    sortedAssignments.forEach((assignment, index) => {
      text += `${index + 1}. **${assignment.subjectName}**\n`;
      text += `   📍 الفصل: ${assignment.classroomName}\n`;
      text += `   ⏰ الحصص: ${assignment.hoursPerWeek} أسبوعياً\n`;
      text += `   📅 الفترة: ${formatSemester(assignment.semester)}\n`;
      if (index < sortedAssignments.length - 1) text += '\n';
    });

    text += '\n' + '─'.repeat(25) + '\n';
    text += `📈 **الإجمالي:** ${summary.totalHours} حصة أسبوعياً\n`;
  }

  return text;
};

/**
 * بناء نص خطة إسناد متعددة المعلمين
 */
export const buildPlanAssignmentText = (
  summaries: PlanSummary,
  scopeLabel: string = 'المحدد',
  includeTeacherDetails: boolean = false,
  maxTeachersInDetails: number = 10
): string => {
  let text = '';

  // الرأس
  text += '📊 **ملخص خطة إسناد المواد**\n';
  text += `النطاق: ${scopeLabel}\n`;
  text += `التاريخ: ${formatDateTime()}\n`;
  text += '═'.repeat(35) + '\n\n';

  // الإحصائيات الإجمالية
  text += '📈 **الإحصائيات الإجمالية:**\n';
  text += `👥 عدد المعلمين: ${summaries.teacherCount}\n`;
  text += `⏰ إجمالي الحصص: ${summaries.totalHours} حصة\n`;
  text += `📊 متوسط النصاب: ${summaries.averageLoad} حصة/معلم\n\n`;

  // تحليل توزيع النصاب
  const loadAnalysis = analyzeLoadDistribution(summaries.teacherSummaries);
  text += '🎯 **تحليل توزيع النصاب:**\n';
  text += `🔴 حمولة عالية (≥90%): ${loadAnalysis.highLoad} معلم\n`;
  text += `🟡 حمولة متوسطة (70-89%): ${loadAnalysis.mediumLoad} معلم\n`;
  text += `🟢 حمولة منخفضة (<70%): ${loadAnalysis.lowLoad} معلم\n`;
  
  if (loadAnalysis.overloaded > 0) {
    text += `\n⚠️ **تنبيه:** ${loadAnalysis.overloaded} معلم يتجاوز الحد المسموح\n`;
  }
  
  if (loadAnalysis.underloaded > 0) {
    text += `\n💡 **فرصة:** ${loadAnalysis.underloaded} معلم يمكن زيادة نصابه\n`;
  }

  text += '\n';

  // قائمة المعلمين (إختيارية ومحدودة)
  if (includeTeacherDetails && summaries.teacherSummaries.length > 0) {
    text += '👥 **قائمة المعلمين:**\n';
    text += '─'.repeat(30) + '\n';
    
    const teachersToShow = summaries.teacherSummaries.slice(0, maxTeachersInDetails);
    
    teachersToShow.forEach((teacher, index) => {
      const loadIcon = getLoadStatusIcon(teacher.loadPercentage);
      text += `${index + 1}. ${loadIcon} **${teacher.teacherName}**\n`;
      text += `   🎓 ${teacher.specialization}\n`;
      text += `   📊 ${teacher.totalHours}/${teacher.maxLoad} حصة (${teacher.loadPercentage}%)\n`;
      text += `   📚 ${teacher.totalAssignments} مادة\n`;
      if (index < teachersToShow.length - 1) text += '\n';
    });

    if (summaries.teacherSummaries.length > maxTeachersInDetails) {
      const remaining = summaries.teacherSummaries.length - maxTeachersInDetails;
      text += `\n... و ${remaining} معلم آخر\n`;
    }

    text += '\n' + '─'.repeat(30) + '\n';
  }

  // توصيات وملاحظات
  const recommendations = generateRecommendations(summaries);
  if (recommendations.length > 0) {
    text += '💡 **التوصيات:**\n';
    recommendations.forEach((rec, index) => {
      text += `${index + 1}. ${rec}\n`;
    });
    text += '\n';
  }

  // معلومات إضافية
  text += '📌 **معلومات إضافية:**\n';
  text += `🕒 آخر تحديث: ${new Date(summaries.lastUpdated).toLocaleString('ar-SA')}\n`;
  text += `🏫 نظام MOTABEA لإدارة المدارس\n`;

  return text;
};

/**
 * تحليل توزيع الأحمال على المعلمين
 */
const analyzeLoadDistribution = (teachers: TeacherAssignmentSummary[]) => {
  const analysis = {
    highLoad: 0,      // 90% فأكثر
    mediumLoad: 0,    // 70-89%
    lowLoad: 0,       // أقل من 70%
    overloaded: 0,    // أكثر من 100%
    underloaded: 0,   // أقل من 50%
  };

  teachers.forEach(teacher => {
    const load = teacher.loadPercentage;
    
    if (load >= 90) analysis.highLoad++;
    else if (load >= 70) analysis.mediumLoad++;
    else analysis.lowLoad++;
    
    if (load > 100) analysis.overloaded++;
    if (load < 50) analysis.underloaded++;
  });

  return analysis;
};

/**
 * توليد توصيات بناءً على تحليل البيانات
 */
const generateRecommendations = (summaries: PlanSummary): string[] => {
  const recommendations: string[] = [];
  const teachers = summaries.teacherSummaries;
  
  if (teachers.length === 0) {
    return ['لا توجد بيانات كافية لتوليد توصيات'];
  }

  // فحص التوزيع
  const overloadedTeachers = teachers.filter(t => t.loadPercentage > 100);
  const underloadedTeachers = teachers.filter(t => t.loadPercentage < 50);
  const balancedTeachers = teachers.filter(t => t.loadPercentage >= 70 && t.loadPercentage <= 90);

  // توصيات للحمولة الزائدة
  if (overloadedTeachers.length > 0) {
    recommendations.push(`إعادة توزيع الأحمال على ${overloadedTeachers.length} معلم متجاوز للحد`);
  }

  // توصيات لاستغلال الطاقات
  if (underloadedTeachers.length > 0 && overloadedTeachers.length > 0) {
    recommendations.push(`استغلال طاقة ${underloadedTeachers.length} معلم لديهم نصاب منخفض`);
  }

  // توصيات للتوازن
  if (balancedTeachers.length / teachers.length > 0.8) {
    recommendations.push('توزيع متوازن ممتاز - حافظ على هذا التوزيع');
  }

  // توصيات للمتوسط
  if (summaries.averageLoad < 15) {
    recommendations.push('إمكانية زيادة عدد الحصص أو المواد الإضافية');
  } else if (summaries.averageLoad > 22) {
    recommendations.push('النظر في تقليل الأحمال أو زيادة عدد المعلمين');
  }

  return recommendations.length > 0 ? recommendations : ['التوزيع الحالي مقبول'];
};

/**
 * بناء نص مختصر للمشاركة السريعة
 */
export const buildQuickShareText = (summaries: PlanSummary, scopeLabel: string): string => {
  const loadAnalysis = analyzeLoadDistribution(summaries.teacherSummaries);
  
  let text = `📊 ${scopeLabel}\n`;
  text += `👥 ${summaries.teacherCount} معلم | ⏰ ${summaries.totalHours} حصة | 📊 متوسط: ${summaries.averageLoad}\n`;
  
  if (loadAnalysis.overloaded > 0) {
    text += `⚠️ ${loadAnalysis.overloaded} متجاوز للحد\n`;
  }
  
  text += `🕒 ${formatDateTime()}`;
  return text;
};

/**
 * بناء نص لمعلم واحد (مختصر)
 */
export const buildQuickTeacherText = (summary: TeacherAssignmentSummary): string => {
  const loadIcon = getLoadStatusIcon(summary.loadPercentage);
  
  let text = `${loadIcon} ${summary.teacherName}\n`;
  text += `🎓 ${summary.specialization}\n`;
  text += `📊 ${summary.totalHours}/${summary.maxLoad} (${summary.loadPercentage}%) | 📚 ${summary.totalAssignments} مادة\n`;
  text += `🕒 ${formatDateTime()}`;
  
  return text;
};