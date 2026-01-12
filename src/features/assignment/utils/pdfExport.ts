/**
 * دالة تصدير إسناد المواد إلى PDF
 * Export Assignment to PDF Utility
 */

import type { AssignmentState } from '../store/types';

export const generateAssignmentPDF = async (state: AssignmentState) => {
  try {
    // استيراد jsPDF
    const jsPDF = (await import('jspdf')).jsPDF;
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // الحصول على بيانات المدرسة
  const schoolData = JSON.parse(localStorage.getItem('schoolData') || '{}');
  const schoolName = schoolData.name || 'المدرسة';

  // الحصول على وكيل الشؤون التعليمية
  const administrators = JSON.parse(localStorage.getItem('administrators') || '[]');
  const educationalVice = administrators.find((admin: any) => admin.role === 'educational_vice');
  const principal = schoolData.principal || 'مدير المدرسة';

  // العنوان الرئيسي
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('تقرير إسناد المواد الدراسية', pageWidth / 2, margin + 10, { align: 'center' });

  // اسم المدرسة
  doc.setFontSize(14);
  doc.text(schoolName, pageWidth / 2, margin + 20, { align: 'center' });

  // التاريخ
  const today = new Date().toLocaleDateString('ar-SA');
  doc.setFontSize(10);
  doc.text(`التاريخ: ${today}`, pageWidth - margin, margin + 30, { align: 'right' });

  let yPos = margin + 45;

  // رأس الجدول
  const headers = ['اسم المعلم', 'المادة المسندة', 'الصف والفصل', 'نصاب الحصص'];
  const colWidths = [50, 45, 40, 35];
  let xPos = margin;

  doc.setFillColor(79, 70, 229); // #4f46e5
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');

  headers.forEach((header, i) => {
    doc.rect(xPos, yPos, colWidths[i], 10, 'F');
    doc.text(header, xPos + colWidths[i] / 2, yPos + 7, { align: 'center' });
    xPos += colWidths[i];
  });

  yPos += 10;

  // البيانات
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const activeTeachers = state.teachers.filter(t => t.isActive);
  const activeAssignments = state.assignments.filter(a => a.status === 'active');

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

    // طباعة كل مادة في صف منفصل
    Object.entries(subjectGroups).forEach(([subjectName, classrooms], index) => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = margin;
      }

      xPos = margin;

      // اسم المعلم (فقط في أول صف)
      if (index === 0) {
        doc.text(teacher.name, xPos + colWidths[0] / 2, yPos + 7, { align: 'center' });
      }
      doc.rect(xPos, yPos, colWidths[0], 10);
      xPos += colWidths[0];

      // المادة المسندة
      doc.text(subjectName, xPos + colWidths[1] / 2, yPos + 7, { align: 'center' });
      doc.rect(xPos, yPos, colWidths[1], 10);
      xPos += colWidths[1];

      // الصف والفصل
      const classroomNames = classrooms.map(c => c.classroom).join(', ');
      doc.text(classroomNames, xPos + colWidths[2] / 2, yPos + 7, { align: 'center' });
      doc.rect(xPos, yPos, colWidths[2], 10);
      xPos += colWidths[2];

      // نصاب الحصص (فقط في أول صف)
      if (index === 0) {
        doc.text(totalHours.toString(), xPos + colWidths[3] / 2, yPos + 7, { align: 'center' });
      }
      doc.rect(xPos, yPos, colWidths[3], 10);

      yPos += 10;
    });
  });

  // الذيل - التوقيعات
  yPos = pageHeight - 30;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');

  // وكيل الشؤون التعليمية على اليمين
  doc.text('وكيل الشؤون التعليمية', pageWidth - margin - 60, yPos, { align: 'right' });
  doc.text(educationalVice?.name || '_______________', pageWidth - margin - 60, yPos + 7, { align: 'right' });

  // مدير المدرسة على اليسار
  doc.text('مدير المدرسة', margin + 60, yPos, { align: 'left' });
  doc.text(principal, margin + 60, yPos + 7, { align: 'left' });

  // حفظ الملف
  doc.save(`إسناد_المواد_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('خطأ في إنشاء PDF:', error);
    throw error;
  }
};
