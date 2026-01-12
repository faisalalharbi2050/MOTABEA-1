/**
 * دالة تصدير إسناد المواد إلى Excel
 * Export Assignment to Excel Utility
 */

import type { AssignmentState } from '../store/types';

export const generateAssignmentExcel = async (state: AssignmentState) => {
  try {
    // استيراد XLSX
    const XLSX = await import('xlsx');
  const activeTeachers = state.teachers.filter(t => t.isActive);
  const activeAssignments = state.assignments.filter(a => a.status === 'active');

  // إعداد البيانات
  const rows: any[] = [];

  // العنوان
  rows.push(['تقرير إسناد المواد الدراسية']);
  rows.push([]);
  rows.push(['التاريخ:', new Date().toLocaleDateString('ar-SA')]);
  rows.push([]);

  // رأس الجدول
  rows.push(['اسم المعلم', 'التخصص', 'المادة المسندة', 'الصف والفصل', 'عدد الحصص', 'إجمالي الحصص']);

  activeTeachers.forEach((teacher) => {
    const teacherAssignments = activeAssignments.filter(a => a.teacherId === teacher.id);
    
    if (teacherAssignments.length === 0) return;

    const totalHours = teacherAssignments.reduce((sum, a) => sum + a.hoursPerWeek, 0);

    // تجميع حسب المادة
    const subjectGroups: { [key: string]: Array<{ classroom: string; hours: number }> } = {};
    
    teacherAssignments.forEach(assignment => {
      const subject = state.subjects.find(s => s.id === assignment.subjectId);
      const classroom = state.classrooms.find(c => c.id === assignment.classroomId);
      
      if (!subject) return;
      
      const subjectName = subject.name;
      if (!subjectGroups[subjectName]) {
        subjectGroups[subjectName] = [];
      }
      
      subjectGroups[subjectName].push({
        classroom: classroom?.name || 'غير معروف',
        hours: assignment.hoursPerWeek
      });
    });

    // إضافة كل مادة في صف منفصل
    Object.entries(subjectGroups).forEach(([subjectName, classrooms], index) => {
      const classroomNames = classrooms.map(c => c.classroom).join(', ');
      const subjectHours = classrooms.reduce((sum, c) => sum + c.hours, 0);

      rows.push([
        index === 0 ? teacher.name : '', // اسم المعلم فقط في أول صف
        index === 0 ? teacher.specialization || '-' : '', // التخصص فقط في أول صف
        subjectName,
        classroomNames,
        subjectHours,
        index === 0 ? totalHours : '' // الإجمالي فقط في أول صف
      ]);
    });

    // صف فارغ بين المعلمين
    rows.push([]);
  });

  // إضافة إحصائيات
  rows.push([]);
  rows.push(['الإحصائيات']);
  rows.push(['إجمالي المعلمين:', activeTeachers.length]);
  rows.push(['إجمالي الإسنادات:', activeAssignments.length]);
  rows.push(['إجمالي الحصص:', activeAssignments.reduce((sum, a) => sum + a.hoursPerWeek, 0)]);

  // إنشاء ورقة العمل
  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  // تنسيق العرض
  const columnWidths = [
    { wch: 25 }, // اسم المعلم
    { wch: 20 }, // التخصص
    { wch: 20 }, // المادة
    { wch: 25 }, // الفصول
    { wch: 12 }, // عدد الحصص
    { wch: 15 }  // الإجمالي
  ];
  worksheet['!cols'] = columnWidths;

  // إنشاء المصنف
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'إسناد المواد');

  // حفظ الملف
  XLSX.writeFile(workbook, `إسناد_المواد_${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('خطأ في إنشاء Excel:', error);
    throw error;
  }
};
