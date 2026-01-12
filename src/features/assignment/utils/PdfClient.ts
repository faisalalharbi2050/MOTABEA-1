/**
 * عميل إنشاء ملفات PDF
 * PDF Generation Client
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AssignmentState, Teacher, Subject, Classroom, Assignment } from '../store/types';

// توسيع نوع jsPDF لدعم autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// إعدادات PDF الافتراضية
const PDF_CONFIG = {
  orientation: 'portrait' as 'portrait' | 'landscape',
  unit: 'mm' as 'mm',
  format: 'a4' as 'a4',
  margins: {
    top: 20,
    right: 15,
    bottom: 20,
    left: 15
  },
  fonts: {
    arabic: 'NotoKufiArabic',
    size: {
      title: 16,
      subtitle: 14,
      body: 10,
      small: 8
    }
  }
};

/**
 * فئة إنشاء PDF
 */
export class PdfClient {
  private doc: jsPDF;
  private pageHeight: number;
  private pageWidth: number;
  private currentY: number;

  constructor() {
    this.doc = new jsPDF(PDF_CONFIG.orientation, PDF_CONFIG.unit, PDF_CONFIG.format);
    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.currentY = PDF_CONFIG.margins.top;
    
    // تعيين اتجاه النص للعربية
    this.doc.setR2L(true);
    this.doc.setLanguage('ar');
  }

  /**
   * إضافة عنوان رئيسي
   */
  private addTitle(title: string, subtitle?: string): void {
    this.doc.setFontSize(PDF_CONFIG.fonts.size.title);
    this.doc.setFont('helvetica', 'bold');
    
    const titleWidth = this.doc.getTextWidth(title);
    const x = (this.pageWidth - titleWidth) / 2;
    
    this.doc.text(title, x, this.currentY);
    this.currentY += 10;
    
    if (subtitle) {
      this.doc.setFontSize(PDF_CONFIG.fonts.size.subtitle);
      this.doc.setFont('helvetica', 'normal');
      
      const subtitleWidth = this.doc.getTextWidth(subtitle);
      const subtitleX = (this.pageWidth - subtitleWidth) / 2;
      
      this.doc.text(subtitle, subtitleX, this.currentY);
      this.currentY += 8;
    }
    
    // خط فاصل
    this.doc.setLineWidth(0.5);
    this.doc.line(PDF_CONFIG.margins.left, this.currentY, this.pageWidth - PDF_CONFIG.margins.right, this.currentY);
    this.currentY += 10;
  }

  /**
   * إضافة معلومات التقرير
   */
  private addReportInfo(): void {
    const date = new Date().toLocaleDateString('ar-SA');
    const time = new Date().toLocaleTimeString('ar-SA');
    
    this.doc.setFontSize(PDF_CONFIG.fonts.size.small);
    this.doc.setFont('helvetica', 'normal');
    
    this.doc.text(`تاريخ التقرير: ${date}`, PDF_CONFIG.margins.right, this.currentY, { align: 'right' });
    this.doc.text(`وقت الإنشاء: ${time}`, PDF_CONFIG.margins.left, this.currentY);
    this.currentY += 15;
  }

  /**
   * إضافة جدول
   */
  private addTable(headers: string[], data: string[][], title?: string): void {
    if (title) {
      this.doc.setFontSize(PDF_CONFIG.fonts.size.subtitle);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(title, PDF_CONFIG.margins.right, this.currentY, { align: 'right' });
      this.currentY += 10;
    }

    const tableWidth = this.pageWidth - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right;
    const colWidth = tableWidth / headers.length;
    const rowHeight = 8;

    // رسم رؤوس الجدول
    this.doc.setFillColor(240, 240, 240);
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.1);
    
    let x = PDF_CONFIG.margins.right;
    headers.forEach((header, index) => {
      this.doc.rect(x - colWidth, this.currentY, colWidth, rowHeight, 'FD');
      
      this.doc.setFontSize(PDF_CONFIG.fonts.size.body);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(header, x - colWidth/2, this.currentY + 5, { align: 'center' });
      
      x -= colWidth;
    });
    
    this.currentY += rowHeight;

    // رسم صفوف البيانات
    this.doc.setFont('helvetica', 'normal');
    data.forEach((row, rowIndex) => {
      // تبديل لون الخلفية للصفوف
      if (rowIndex % 2 === 1) {
        this.doc.setFillColor(250, 250, 250);
      } else {
        this.doc.setFillColor(255, 255, 255);
      }

      x = PDF_CONFIG.margins.right;
      row.forEach((cell, colIndex) => {
        this.doc.rect(x - colWidth, this.currentY, colWidth, rowHeight, 'FD');
        
        // قطع النص الطويل
        let text = cell.toString();
        if (this.doc.getTextWidth(text) > colWidth - 4) {
          while (this.doc.getTextWidth(text + '...') > colWidth - 4 && text.length > 1) {
            text = text.slice(0, -1);
          }
          text += '...';
        }
        
        this.doc.text(text, x - colWidth/2, this.currentY + 5, { align: 'center' });
        x -= colWidth;
      });
      
      this.currentY += rowHeight;
      
      // التحقق من الحاجة لصفحة جديدة
      if (this.currentY > this.pageHeight - PDF_CONFIG.margins.bottom - 20) {
        this.doc.addPage();
        this.currentY = PDF_CONFIG.margins.top;
      }
    });

    this.currentY += 10;
  }

  /**
   * إضافة إحصائيات سريعة
   */
  private addStats(stats: { label: string; value: string | number }[]): void {
    const boxWidth = (this.pageWidth - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right) / 4;
    const boxHeight = 25;
    let x = PDF_CONFIG.margins.right;

    stats.forEach((stat, index) => {
      if (index > 0 && index % 4 === 0) {
        this.currentY += boxHeight + 5;
        x = PDF_CONFIG.margins.right;
      }

      // رسم صندوق
      this.doc.setDrawColor(200, 200, 200);
      this.doc.setFillColor(245, 245, 245);
      this.doc.rect(x - boxWidth, this.currentY, boxWidth, boxHeight, 'FD');

      // النص
      this.doc.setFontSize(PDF_CONFIG.fonts.size.body);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(stat.value.toString(), x - boxWidth/2, this.currentY + 8, { align: 'center' });
      
      this.doc.setFontSize(PDF_CONFIG.fonts.size.small);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(stat.label, x - boxWidth/2, this.currentY + 18, { align: 'center' });

      x -= boxWidth + 5;
    });

    this.currentY += boxHeight + 15;
  }

  /**
   * التحقق من الحاجة لصفحة جديدة
   */
  private checkPageBreak(neededSpace: number = 50): void {
    if (this.currentY + neededSpace > this.pageHeight - PDF_CONFIG.margins.bottom) {
      this.doc.addPage();
      this.currentY = PDF_CONFIG.margins.top;
    }
  }

  /**
   * إنشاء تقرير المعلمين
   */
  generateTeachersReport(state: AssignmentState): void {
    this.addTitle('تقرير المعلمين', 'نظام إسناد المواد');
    this.addReportInfo();

    // إحصائيات عامة
    const activeTeachers = state.teachers.filter(t => t.isActive).length;
    const totalAssignments = state.assignments.length;
    const avgLoad = state.teachers.length > 0 
      ? Math.round(state.teachers.reduce((sum, t) => sum + t.currentLoad, 0) / state.teachers.length)
      : 0;

    this.addStats([
      { label: 'إجمالي المعلمين', value: state.teachers.length },
      { label: 'المعلمون النشطون', value: activeTeachers },
      { label: 'إجمالي الإسناد', value: totalAssignments },
      { label: 'متوسط العبء', value: `${avgLoad} حصة` }
    ]);

    // جدول المعلمين
    const headers = ['اسم المعلم', 'التخصص', 'العبء الحالي', 'الحد الأقصى', 'النسبة', 'الحالة'];
    const data = state.teachers.map(teacher => {
      const assignments = state.assignments.filter(a => a.teacherId === teacher.id);
      const currentLoad = assignments.reduce((sum, a) => sum + a.hoursPerWeek, 0);
      const percentage = teacher.maxLoad > 0 ? Math.round((currentLoad / teacher.maxLoad) * 100) : 0;
      
      return [
        teacher.name,
        teacher.specialization,
        currentLoad.toString(),
        teacher.maxLoad.toString(),
        `${percentage}%`,
        teacher.isActive ? 'نشط' : 'غير نشط'
      ];
    });

    this.checkPageBreak(100);
    this.addTable(headers, data, 'قائمة المعلمين');
  }

  /**
   * إنشاء تقرير الإسناد
   */
  generateAssignmentsReport(state: AssignmentState): void {
    this.addTitle('تقرير الإسناد', 'توزيع المواد على المعلمين');
    this.addReportInfo();

    // إحصائيات الإسناد
    const activeAssignments = state.assignments.filter(a => a.status === 'active').length;
    const pendingAssignments = state.assignments.filter(a => a.status === 'pending').length;
    const totalHours = state.assignments.reduce((sum, a) => sum + a.hoursPerWeek, 0);

    this.addStats([
      { label: 'إجمالي الإسناد', value: state.assignments.length },
      { label: 'الإسناد النشط', value: activeAssignments },
      { label: 'قيد الانتظار', value: pendingAssignments },
      { label: 'إجمالي الحصص', value: totalHours }
    ]);

    // جدول الإسناد
    const headers = ['المعلم', 'المادة', 'الفصل', 'عدد الحصص', 'الحالة', 'ملاحظات'];
    const data = state.assignments.map(assignment => {
      const teacher = state.teachers.find(t => t.id === assignment.teacherId);
      const subject = state.subjects.find(s => s.id === assignment.subjectId);
      const classroom = state.classrooms.find(c => c.id === assignment.classroomId);
      
      return [
        teacher?.name || '',
        subject?.name || '',
        classroom?.name || '',
        assignment.hoursPerWeek.toString(),
        assignment.status === 'active' ? 'نشط' : assignment.status === 'pending' ? 'قيد الانتظار' : 'ملغى',
        assignment.notes || ''
      ];
    });

    this.checkPageBreak(100);
    this.addTable(headers, data, 'تفاصيل الإسناد');
  }

  /**
   * إنشاء تقرير معلم محدد
   */
  generateTeacherReport(state: AssignmentState, teacherId: string): void {
    const teacher = state.teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    this.addTitle(`تقرير المعلم: ${teacher.name}`, teacher.specialization);
    this.addReportInfo();

    const assignments = state.assignments.filter(a => a.teacherId === teacherId);
    const totalHours = assignments.reduce((sum, a) => sum + a.hoursPerWeek, 0);
    const subjectCount = new Set(assignments.map(a => a.subjectId)).size;
    const classroomCount = new Set(assignments.map(a => a.classroomId)).size;
    const loadPercentage = teacher.maxLoad > 0 ? Math.round((totalHours / teacher.maxLoad) * 100) : 0;

    this.addStats([
      { label: 'إجمالي الحصص', value: totalHours },
      { label: 'عدد المواد', value: subjectCount },
      { label: 'عدد الفصول', value: classroomCount },
      { label: 'نسبة العبء', value: `${loadPercentage}%` }
    ]);

    // تفاصيل الإسناد
    const headers = ['المادة', 'الفصل', 'عدد الحصص', 'الحالة', 'ملاحظات'];
    const data = assignments.map(assignment => {
      const subject = state.subjects.find(s => s.id === assignment.subjectId);
      const classroom = state.classrooms.find(c => c.id === assignment.classroomId);
      
      return [
        subject?.name || '',
        classroom?.name || '',
        assignment.hoursPerWeek.toString(),
        assignment.status === 'active' ? 'نشط' : assignment.status === 'pending' ? 'قيد الانتظار' : 'ملغى',
        assignment.notes || ''
      ];
    });

    this.checkPageBreak(100);
    this.addTable(headers, data, 'تفاصيل إسناد المعلم');
  }

  /**
   * إنشاء تقرير خطة الإسناد
   */
  generatePlanReport(state: AssignmentState): void {
    this.addTitle('خطة الإسناد الشاملة', 'توزيع المواد والفصول');
    this.addReportInfo();

    // إحصائيات الخطة
    const totalTeachers = state.teachers.length;
    const totalSubjects = state.subjects.length;
    const totalClassrooms = state.classrooms.length;
    const coveragePercentage = state.subjects.length > 0 
      ? Math.round((new Set(state.assignments.map(a => a.subjectId)).size / state.subjects.length) * 100)
      : 0;

    this.addStats([
      { label: 'عدد المعلمين', value: totalTeachers },
      { label: 'عدد المواد', value: totalSubjects },
      { label: 'عدد الفصول', value: totalClassrooms },
      { label: 'نسبة التغطية', value: `${coveragePercentage}%` }
    ]);

    // تقرير حسب المستوى
    const levels = ['primary', 'middle', 'high'] as const;
    const levelNames = { primary: 'الابتدائية', middle: 'المتوسطة', high: 'الثانوية' };

    levels.forEach(level => {
      const levelClassrooms = state.classrooms.filter(c => c.level === level);
      const levelAssignments = state.assignments.filter(a => {
        const classroom = state.classrooms.find(c => c.id === a.classroomId);
        return classroom?.level === level;
      });

      if (levelClassrooms.length > 0) {
        this.checkPageBreak(80);
        
        this.doc.setFontSize(PDF_CONFIG.fonts.size.subtitle);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`المرحلة ${levelNames[level]}`, PDF_CONFIG.margins.right, this.currentY, { align: 'right' });
        this.currentY += 10;

        const headers = ['الفصل', 'المادة', 'المعلم', 'عدد الحصص', 'الحالة'];
        const data = levelAssignments.map(assignment => {
          const teacher = state.teachers.find(t => t.id === assignment.teacherId);
          const subject = state.subjects.find(s => s.id === assignment.subjectId);
          const classroom = state.classrooms.find(c => c.id === assignment.classroomId);
          
          return [
            classroom?.name || '',
            subject?.name || '',
            teacher?.name || '',
            assignment.hoursPerWeek.toString(),
            assignment.status === 'active' ? 'نشط' : assignment.status === 'pending' ? 'قيد الانتظار' : 'ملغى'
          ];
        });

        this.addTable(headers, data);
      }
    });
  }

  /**
   * حفظ الملف
   */
  save(filename: string): void {
    const timestamp = new Date().toISOString().split('T')[0];
    this.doc.save(`${filename}_${timestamp}.pdf`);
  }

  /**
   * الحصول على البيانات كـ ArrayBuffer
   */
  getArrayBuffer(): ArrayBuffer {
    return this.doc.output('arraybuffer');
  }

  /**
   * الحصول على البيانات كـ Blob
   */
  getBlob(): Blob {
    return this.doc.output('blob');
  }
}

/**
 * واجهات سهلة للاستخدام
 */
export function generateTeachersPDF(state: AssignmentState): void {
  const pdf = new PdfClient();
  pdf.generateTeachersReport(state);
  pdf.save('تقرير_المعلمين');
}

export function generateAssignmentsPDF(state: AssignmentState): void {
  const pdf = new PdfClient();
  pdf.generateAssignmentsReport(state);
  pdf.save('تقرير_الإسناد');
}

export function generateTeacherPDF(state: AssignmentState, teacherId: string): void {
  const teacher = state.teachers.find(t => t.id === teacherId);
  if (!teacher) return;

  const pdf = new PdfClient();
  pdf.generateTeacherReport(state, teacherId);
  pdf.save(`تقرير_${teacher.name.replace(/\s+/g, '_')}`);
}

export function generatePlanPDF(state: AssignmentState): void {
  const pdf = new PdfClient();
  pdf.generatePlanReport(state);
  pdf.save('خطة_الإسناد');
}

/**
 * تنزيل PDF مباشر للمعلم باستخدام html2canvas
 */
export async function downloadTeacherPdf(teacherId: string, state: AssignmentState): Promise<void> {
  const teacher = state.teachers.find(t => t.id === teacherId);
  if (!teacher) {
    console.error('المعلم غير موجود');
    return;
  }

  try {
    // العثور على عنصر التقرير في DOM
    const reportElement = document.querySelector('.assignment-teacher-report') as HTMLElement;
    if (!reportElement) {
      console.error('عنصر التقرير غير موجود في الصفحة');
      return;
    }

    // إنشاء canvas من العنصر
    const canvas = await html2canvas(reportElement, {
      scale: 2, // جودة عالية
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: reportElement.scrollWidth,
      height: reportElement.scrollHeight,
      onclone: (clonedDoc) => {
        // إخفاء عناصر التحكم في النسخة المستنسخة
        const actionsElements = clonedDoc.querySelectorAll('.no-print, .assignment-report-actions');
        actionsElements.forEach(el => {
          (el as HTMLElement).style.display = 'none';
        });
      }
    });

    // تحويل إلى PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // عرض A4 بالمم
    const pageHeight = 295; // ارتفاع A4 بالمم
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // إضافة الصفحة الأولى
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // إضافة صفحات إضافية إذا لزم الأمر
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // تنزيل الملف
    const fileName = `Assignment_${teacher.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('خطأ في تنزيل PDF:', error);
    alert('حدث خطأ في تنزيل PDF. يرجى المحاولة مرة أخرى.');
  }
}

/**
 * تنزيل PDF مباشر للخطة باستخدام html2canvas  
 */
export async function downloadPlanPdf(selectedTeacherIds?: string[], state?: AssignmentState): Promise<void> {
  try {
    // العثور على عنصر التقرير في DOM
    const reportElement = document.querySelector('.assignment-plan-report') as HTMLElement;
    if (!reportElement) {
      console.error('عنصر تقرير الخطة غير موجود في الصفحة');
      return;
    }

    // تحديد نطاق التقرير
    let scopeLabel = 'الكل';
    if (selectedTeacherIds && selectedTeacherIds.length > 0) {
      if (selectedTeacherIds.length === 1) {
        const teacher = state?.teachers.find(t => t.id === selectedTeacherIds[0]);
        scopeLabel = teacher ? teacher.name : 'معلم_واحد';
      } else {
        scopeLabel = `مجموعة_${selectedTeacherIds.length}_معلمين`;
      }
    }

    // إنشاء canvas من العنصر
    const canvas = await html2canvas(reportElement, {
      scale: 2, // جودة عالية
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: reportElement.scrollWidth,
      height: reportElement.scrollHeight,
      onclone: (clonedDoc) => {
        // إخفاء عناصر التحكم في النسخة المستنسخة
        const actionsElements = clonedDoc.querySelectorAll('.no-print, .assignment-report-actions');
        actionsElements.forEach(el => {
          (el as HTMLElement).style.display = 'none';
        });
      }
    });

    // تحويل إلى PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // عرض A4 بالمم
    const pageHeight = 295; // ارتفاع A4 بالمم
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // إضافة الصفحة الأولى
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // إضافة صفحات إضافية إذا لزم الأمر
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // تنزيل الملف
    const fileName = `Assignment_Plan_${scopeLabel}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('خطأ في تنزيل PDF للخطة:', error);
    alert('حدث خطأ في تنزيل PDF. يرجى المحاولة مرة أخرى.');
  }
}