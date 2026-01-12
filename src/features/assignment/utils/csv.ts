/**
 * أدوات تصدير بيانات CSV
 * CSV Export Utilities
 */

import { AssignmentState, Teacher, Subject, Classroom, Assignment } from '../store/types';

// أنواع التقارير القابلة للتصدير
export type ExportType = 'teachers' | 'assignments' | 'workload' | 'subjects' | 'classrooms' | 'plan';

// واجهة بيانات التصدير
export interface ExportData {
  headers: string[];
  rows: string[][];
}

/**
 * تحويل النص إلى تنسيق CSV آمن
 */
function escapeCSV(text: string | number): string {
  if (typeof text === 'number') return text.toString();
  if (!text) return '';
  
  const str = text.toString();
  // إذا كان النص يحتوي على فاصلة أو علامات اقتباس أو أسطر جديدة
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    // استبدال علامات الاقتباس المزدوجة وإحاطة النص بعلامات اقتباس
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * تحويل بيانات إلى تنسيق CSV
 */
function convertToCSV(data: ExportData): string {
  const csvRows: string[] = [];
  
  // إضافة الرؤوس
  csvRows.push(data.headers.map(header => escapeCSV(header)).join(','));
  
  // إضافة الصفوف
  data.rows.forEach(row => {
    csvRows.push(row.map(cell => escapeCSV(cell)).join(','));
  });
  
  return csvRows.join('\n');
}

/**
 * تنزيل ملف CSV
 */
function downloadCSV(content: string, filename: string): void {
  // إضافة BOM للتعامل مع النصوص العربية
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * تصدير بيانات المعلمين
 */
export function exportTeachersCSV(state: AssignmentState): void {
  const data: ExportData = {
    headers: [
      'الرقم',
      'اسم المعلم',
      'التخصص',
      'الحالة',
      'عدد المواد',
      'عدد الفصول',
      'إجمالي الحصص',
      'الحد الأقصى للحصص'
    ],
    rows: []
  };

  state.teachers.forEach((teacher, index) => {
    const assignments = state.assignments.filter(a => a.teacherId === teacher.id);
    const subjectCount = new Set(assignments.map(a => a.subjectId)).size;
    const classroomCount = new Set(assignments.map(a => a.classroomId)).size;
    const totalPeriods = assignments.reduce((sum, a) => sum + a.hoursPerWeek, 0);

    data.rows.push([
      (index + 1).toString(),
      teacher.name,
      teacher.specialization || '',
      teacher.isActive ? 'نشط' : 'غير نشط',
      subjectCount.toString(),
      classroomCount.toString(),
      totalPeriods.toString(),
      teacher.maxLoad.toString()
    ]);
  });

  const csv = convertToCSV(data);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `المعلمين_${timestamp}.csv`);
}

/**
 * تصدير بيانات الإسناد
 */
export function exportAssignmentsCSV(state: AssignmentState): void {
  const data: ExportData = {
    headers: [
      'الرقم',
      'المعلم',
      'المادة',
      'الفصل',
      'عدد الحصص',
      'حالة الإسناد',
      'ملاحظات'
    ],
    rows: []
  };

  state.assignments.forEach((assignment, index) => {
    const teacher = state.teachers.find(t => t.id === assignment.teacherId);
    const subject = state.subjects.find(s => s.id === assignment.subjectId);
    const classroom = state.classrooms.find(c => c.id === assignment.classroomId);

    data.rows.push([
      (index + 1).toString(),
      teacher?.name || '',
      subject?.name || '',
      classroom?.name || '',
      assignment.hoursPerWeek.toString(),
      assignment.status === 'active' ? 'نشط' : assignment.status === 'pending' ? 'قيد الانتظار' : 'ملغى',
      assignment.notes || ''
    ]);
  });

  const csv = convertToCSV(data);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `الإسناد_${timestamp}.csv`);
}

/**
 * تصدير تقرير العبء التدريسي
 */
export function exportWorkloadCSV(state: AssignmentState): void {
  const data: ExportData = {
    headers: [
      'المعلم',
      'التخصص',
      'إجمالي الحصص',
      'الحد الأقصى',
      'النسبة المئوية',
      'حالة العبء',
      'عدد المواد',
      'عدد الفصول'
    ],
    rows: []
  };

  state.teachers.forEach(teacher => {
    const assignments = state.assignments.filter(a => a.teacherId === teacher.id);
    const totalPeriods = assignments.reduce((sum, a) => sum + a.hoursPerWeek, 0);
    const maxPeriods = teacher.maxLoad;
    const percentage = maxPeriods > 0 ? Math.round((totalPeriods / maxPeriods) * 100) : 0;
    
    let workloadStatus = '';
    if (percentage >= 100) workloadStatus = 'عبء مرتفع';
    else if (percentage >= 80) workloadStatus = 'عبء متوسط';
    else workloadStatus = 'عبء منخفض';

    const subjectCount = new Set(assignments.map(a => a.subjectId)).size;
    const classroomCount = new Set(assignments.map(a => a.classroomId)).size;

    data.rows.push([
      teacher.name,
      teacher.specialization || '',
      totalPeriods.toString(),
      maxPeriods.toString(),
      `${percentage}%`,
      workloadStatus,
      subjectCount.toString(),
      classroomCount.toString()
    ]);
  });

  const csv = convertToCSV(data);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `العبء_التدريسي_${timestamp}.csv`);
}

/**
 * تصدير بيانات المواد
 */
export function exportSubjectsCSV(state: AssignmentState): void {
  const data: ExportData = {
    headers: [
      'الرقم',
      'اسم المادة',
      'الرمز',
      'المرحلة',
      'عدد الحصص الأسبوعية',
      'عدد المعلمين',
      'عدد الفصول المُدرسة',
      'إجمالي الحصص'
    ],
    rows: []
  };

  state.subjects.forEach((subject, index) => {
    const assignments = state.assignments.filter(a => a.subjectId === subject.id);
    const teacherCount = new Set(assignments.map(a => a.teacherId)).size;
    const classroomCount = assignments.length;
    const totalPeriods = assignments.reduce((sum, a) => sum + a.hoursPerWeek, 0);

    data.rows.push([
      (index + 1).toString(),
      subject.name,
      subject.code || '',
      subject.level || '',
      subject.requiredHours.toString(),
      teacherCount.toString(),
      classroomCount.toString(),
      totalPeriods.toString()
    ]);
  });

  const csv = convertToCSV(data);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `المواد_${timestamp}.csv`);
}

/**
 * تصدير بيانات الفصول
 */
export function exportClassroomsCSV(state: AssignmentState): void {
  const data: ExportData = {
    headers: [
      'الرقم',
      'اسم الفصل',
      'المرحلة',
      'عدد الطلاب',
      'عدد المواد',
      'عدد المعلمين',
      'إجمالي الحصص'
    ],
    rows: []
  };

  state.classrooms.forEach((classroom, index) => {
    const assignments = state.assignments.filter(a => a.classroomId === classroom.id);
    const subjectCount = assignments.length;
    const teacherCount = new Set(assignments.map(a => a.teacherId)).size;
    const totalPeriods = assignments.reduce((sum, a) => sum + a.hoursPerWeek, 0);

    data.rows.push([
      (index + 1).toString(),
      classroom.name,
      classroom.level || '',
      classroom.currentStudents.toString(),
      subjectCount.toString(),
      teacherCount.toString(),
      totalPeriods.toString()
    ]);
  });

  const csv = convertToCSV(data);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `الفصول_${timestamp}.csv`);
}

/**
 * تصدير خطة الإسناد الشاملة
 */
export function exportPlanCSV(state: AssignmentState): void {
  const data: ExportData = {
    headers: [
      'المعلم',
      'التخصص',
      'المادة',
      'الفصل',
      'المرحلة',
      'عدد الحصص',
      'الحالة',
      'ملاحظات'
    ],
    rows: []
  };

  // ترتيب البيانات حسب المعلم ثم المادة ثم الفصل
  const sortedAssignments = [...state.assignments].sort((a, b) => {
    const teacherA = state.teachers.find(t => t.id === a.teacherId)?.name || '';
    const teacherB = state.teachers.find(t => t.id === b.teacherId)?.name || '';
    if (teacherA !== teacherB) return teacherA.localeCompare(teacherB);
    
    const subjectA = state.subjects.find(s => s.id === a.subjectId)?.name || '';
    const subjectB = state.subjects.find(s => s.id === b.subjectId)?.name || '';
    if (subjectA !== subjectB) return subjectA.localeCompare(subjectB);
    
    const classroomA = state.classrooms.find(c => c.id === a.classroomId)?.name || '';
    const classroomB = state.classrooms.find(c => c.id === b.classroomId)?.name || '';
    return classroomA.localeCompare(classroomB);
  });

  sortedAssignments.forEach(assignment => {
    const teacher = state.teachers.find(t => t.id === assignment.teacherId);
    const subject = state.subjects.find(s => s.id === assignment.subjectId);
    const classroom = state.classrooms.find(c => c.id === assignment.classroomId);

    data.rows.push([
      teacher?.name || '',
      teacher?.specialization || '',
      subject?.name || '',
      classroom?.name || '',
      classroom?.level || subject?.level || '',
      assignment.hoursPerWeek.toString(),
      assignment.status === 'active' ? 'نشط' : assignment.status === 'pending' ? 'قيد الانتظار' : 'ملغى',
      assignment.notes || ''
    ]);
  });

  const csv = convertToCSV(data);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `خطة_الإسناد_${timestamp}.csv`);
}

/**
 * تصدير تقرير شامل لمعلم محدد
 */
export function exportTeacherReportCSV(state: AssignmentState, teacherId: string): void {
  const teacher = state.teachers.find(t => t.id === teacherId);
  if (!teacher) return;

  const assignments = state.assignments.filter(a => a.teacherId === teacherId);
  
  const data: ExportData = {
    headers: [
      'المادة',
      'رمز المادة',
      'الفصل',
      'المرحلة',
      'عدد الحصص',
      'عدد الطلاب',
      'الحالة',
      'ملاحظات'
    ],
    rows: []
  };

  assignments.forEach(assignment => {
    const subject = state.subjects.find(s => s.id === assignment.subjectId);
    const classroom = state.classrooms.find(c => c.id === assignment.classroomId);

    data.rows.push([
      subject?.name || '',
      subject?.code || '',
      classroom?.name || '',
      classroom?.level || subject?.level || '',
      assignment.hoursPerWeek.toString(),
      classroom?.currentStudents.toString() || '',
      assignment.status === 'active' ? 'نشط' : assignment.status === 'pending' ? 'قيد الانتظار' : 'ملغى',
      assignment.notes || ''
    ]);
  });

  const csv = convertToCSV(data);
  const timestamp = new Date().toISOString().split('T')[0];
  const teacherName = teacher.name.replace(/\s+/g, '_');
  downloadCSV(csv, `تقرير_${teacherName}_${timestamp}.csv`);
}

/**
 * واجهة موحدة لتصدير جميع الأنواع
 */
export function exportData(type: ExportType, state: AssignmentState, teacherId?: string): void {
  switch (type) {
    case 'teachers':
      exportTeachersCSV(state);
      break;
    case 'assignments':
      exportAssignmentsCSV(state);
      break;
    case 'workload':
      exportWorkloadCSV(state);
      break;
    case 'subjects':
      exportSubjectsCSV(state);
      break;
    case 'classrooms':
      exportClassroomsCSV(state);
      break;
    case 'plan':
      exportPlanCSV(state);
      break;
    default:
      console.warn(`نوع التصدير غير مدعوم: ${type}`);
  }
}

/**
 * تصدير تقرير معلم محدد
 */
export function exportTeacherData(state: AssignmentState, teacherId: string): void {
  exportTeacherReportCSV(state, teacherId);
}