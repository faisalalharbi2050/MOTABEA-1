/**
 * تصدير PDF محسّن بدعم كامل للغة العربية
 * Enhanced PDF Export with Full Arabic Support
 */

import type { AssignmentState } from '../store/types';

/**
 * إنشاء جدول إسناد المواد بصيغة PDF مع دعم العربية
 */
export async function generateEnhancedAssignmentPDF(state: AssignmentState): Promise<void> {
  try {
    const { jsPDF } = await import('jspdf');
    require('jspdf-autotable');

    // بيانات المدرسة
    const schoolData = JSON.parse(localStorage.getItem('schoolData') || '{}');
    const schoolName = schoolData.name || 'المدرسة';
    const administrators = JSON.parse(localStorage.getItem('administrators') || '[]');
    const educationalVice = administrators.find((admin: any) => admin.role === 'educational_vice');
    const principal = schoolData.principal || 'مدير المدرسة';

    // إنشاء المستند
    const doc = new jsPDF({
      orientation: 'landscape', // أفقي للجدول الواسع
      unit: 'mm',
      format: 'a4'
    }) as any;

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // ======= رأس الصفحة =======
    let yPos = margin;

    // العنوان الرئيسي
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229); // أزرق
    doc.text('تقرير إسناد المواد الدراسية', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 8;

    // اسم المدرسة
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(schoolName, pageWidth / 2, yPos, { align: 'center' });

    yPos += 8;

    // التاريخ
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const today = new Date().toLocaleDateString('ar-SA');
    doc.text(`التاريخ: ${today}`, pageWidth - margin, yPos, { align: 'right' });

    yPos += 10;

    // ======= إعداد بيانات الجدول =======
    const activeTeachers = state.teachers.filter(t => t.isActive);
    const activeAssignments = state.assignments.filter(a => a.status === 'active');

    const tableData: any[] = [];

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

      // إضافة صف لكل مادة
      Object.entries(subjectGroups).forEach(([subjectName, classrooms], index) => {
        const classroomNames = classrooms.map(c => c.classroom).join('، ');
        const subjectHours = classrooms.reduce((sum, c) => sum + c.hours, 0);

        tableData.push([
          index === 0 ? teacher.name : '', // اسم المعلم فقط في أول صف
          subjectName,
          classroomNames,
          index === 0 ? totalHours.toString() : '' // إجمالي الحصص فقط في أول صف
        ]);
      });

      // سطر فارغ بين المعلمين
      tableData.push(['', '', '', '']);
    });

    // ======= رسم الجدول باستخدام autoTable =======
    doc.autoTable({
      startY: yPos,
      head: [['اسم المعلم', 'المادة المسندة', 'الصف والفصل', 'نصاب الحصص']],
      body: tableData,
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 4,
        halign: 'center',
        valign: 'middle',
        textColor: [0, 0, 0],
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [79, 70, 229], // أزرق
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 11,
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250], // رمادي فاتح
      },
      columnStyles: {
        0: { cellWidth: 50, halign: 'center' }, // اسم المعلم
        1: { cellWidth: 60, halign: 'center' }, // المادة
        2: { cellWidth: 80, halign: 'center' }, // الفصول
        3: { cellWidth: 35, halign: 'center' }, // النصاب
      },
      margin: { top: margin, right: margin, bottom: 40, left: margin },
      didDrawPage: function (data: any) {
        // التذييل في كل صفحة
        const pageCount = doc.internal.getNumberOfPages();
        const currentPage = doc.internal.getCurrentPageInfo().pageNumber;

        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(
          `صفحة ${currentPage} من ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      },
    });

    // ======= التذييل النهائي (التوقيعات) =======
    const finalY = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);

    // وكيل الشؤون التعليمية
    doc.text('وكيل الشؤون التعليمية:', pageWidth - margin - 60, finalY, { align: 'right' });
    doc.text(educationalVice?.name || '_______________', pageWidth - margin - 60, finalY + 7, { align: 'right' });

    // مدير المدرسة
    doc.text('مدير المدرسة:', margin + 60, finalY, { align: 'left' });
    doc.text(principal, margin + 60, finalY + 7, { align: 'left' });

    // ======= حفظ الملف =======
    const fileName = `إسناد_المواد_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error('خطأ في إنشاء PDF:', error);
    throw error;
  }
}
