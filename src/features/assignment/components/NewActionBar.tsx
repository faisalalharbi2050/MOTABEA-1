/**
 * شريط الإجراءات المطور لنظام إسناد المواد - مُحسّن للاحترافية
 * Enhanced Assignment System Action Bar - Professional Version
 */

import React, { useMemo, useState } from 'react';
import { useAssignment, useAssignmentActions } from '../store/assignmentStore';
import { 
  selectPlanSummaries, 
  selectFilterableTeachers 
} from '../store/teacherSelectors';

interface ActionBarProps {
  className?: string;
}

// تعريف نطاقات التنفيذ
type ExecutionScope = 'current' | 'selected' | 'all';

interface ScopeInfo {
  scope: ExecutionScope;
  label: string;
  description: string;
  teacherCount: number;
  enabled: boolean;
}

const ActionBar: React.FC<ActionBarProps> = ({ className }) => {
  const { state } = useAssignment();
  const actions = useAssignmentActions();
  const [activeScope, setActiveScope] = useState<ExecutionScope>('selected');
  const [focusedButton, setFocusedButton] = useState<string | null>(null);

  // حساب المعلمين في كل نطاق
  const scopeData = useMemo(() => {
    const currentTeacher = state.filters.selectedTeacherId 
      ? state.teachers.find(t => t.id === state.filters.selectedTeacherId)
      : null;
    
    const selectedTeachers = Array.from(state.ui.selectedTeacherIds);
    const filteredTeachers = selectFilterableTeachers(state);
    const allActiveTeachers = state.teachers.filter(t => t.isActive);

    const scopes: ScopeInfo[] = [
      {
        scope: 'current',
        label: 'المعلم الحالي',
        description: currentTeacher ? `${currentTeacher.name}` : 'لا يوجد معلم محدد',
        teacherCount: currentTeacher ? 1 : 0,
        enabled: currentTeacher !== null,
      },
      {
        scope: 'selected',
        label: 'المعلمين المحددين',
        description: `${selectedTeachers.length} معلم محدد`,
        teacherCount: selectedTeachers.length,
        enabled: selectedTeachers.length > 0,
      },
      {
        scope: 'all',
        label: 'جميع المعلمين',
        description: `${allActiveTeachers.length} معلم نشط`,
        teacherCount: allActiveTeachers.length,
        enabled: allActiveTeachers.length > 0,
      },
    ];

    return scopes;
  }, [state.teachers, state.ui.selectedTeacherIds, state.filters.selectedTeacherId]);

  // حساب الملخصات حسب النطاق المحدد
  const scopedSummary = useMemo(() => {
    let teacherIds: string[] = [];
    
    switch (activeScope) {
      case 'current':
        if (state.filters.selectedTeacherId) {
          teacherIds = [state.filters.selectedTeacherId];
        }
        break;
      case 'selected':
        teacherIds = Array.from(state.ui.selectedTeacherIds);
        break;
      case 'all':
        teacherIds = state.teachers.filter(t => t.isActive).map(t => t.id);
        break;
    }

    return selectPlanSummaries(state, teacherIds);
  }, [state, activeScope]);

  // معالجات الإجراءات
  const handleWhatsAppText = () => {
    const summary = scopedSummary;
    let message = `📊 ملخص إسناد المواد\n\n`;
    message += `👥 عدد المعلمين: ${summary.teacherCount}\n`;
    message += `⏰ إجمالي الحصص: ${summary.totalHours}\n`;
    message += `📈 متوسط الحمولة: ${summary.averageLoad} حصة\n\n`;
    
    summary.teacherSummaries.slice(0, 5).forEach((teacher, index) => {
      message += `${index + 1}. ${teacher.teacherName}\n`;
      message += `   ${teacher.specialization} - ${teacher.totalHours} حصة (${teacher.loadPercentage}%)\n\n`;
    });
    
    if (summary.teacherSummaries.length > 5) {
      message += `... و ${summary.teacherSummaries.length - 5} معلم آخر\n`;
    }
    
    // فتح WhatsApp أو نسخ النص
    if (navigator.share) {
      navigator.share({ text: message });
    } else {
      navigator.clipboard.writeText(message);
      // يمكن إضافة إشعار هنا
    }
  };

  const handlePrint = () => {
    // فتح نافذة طباعة مخصصة
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generatePrintHTML());
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const handleDownloadPDF = () => {
    // سيتم تنفيذها لاحقاً مع مكتبة PDF
    console.log('تنزيل PDF للنطاق:', activeScope, scopedSummary);
  };

  const handleDownloadCSV = () => {
    const summary = scopedSummary;
    let csvContent = 'اسم المعلم,التخصص,عدد المواد,إجمالي الحصص,الحد الأقصى,نسبة التحميل\n';
    
    summary.teacherSummaries.forEach(teacher => {
      csvContent += `"${teacher.teacherName}","${teacher.specialization}",${teacher.totalAssignments},${teacher.totalHours},${teacher.maxLoad},${teacher.loadPercentage}%\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `إسناد_المواد_${activeScope}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExportHTML = () => {
    // HTML دائماً لجميع المعلمين
    const allTeachersIds = state.teachers.filter(t => t.isActive).map(t => t.id);
    const allSummary = selectPlanSummaries(state, allTeachersIds);
    
    const htmlContent = generateHTMLReport(allSummary);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `تقرير_إسناد_المواد_كامل_${new Date().toISOString().split('T')[0]}.html`;
    link.click();
  };

  // دوال مساعدة لتوليد المحتوى
  const generatePrintHTML = (): string => {
    const summary = scopedSummary;
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>تقرير إسناد المواد</title>
          <style>
            body { font-family: 'Noto Kufi Arabic', Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .summary { margin-bottom: 30px; }
            .teacher-table { width: 100%; border-collapse: collapse; }
            .teacher-table th, .teacher-table td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            .teacher-table th { background-color: #f2f2f2; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>تقرير إسناد المواد</h1>
            <p>النطاق: ${scopeData.find(s => s.scope === activeScope)?.label} | التاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
          </div>
          <div class="summary">
            <h2>الملخص العام</h2>
            <p>عدد المعلمين: ${summary.teacherCount} | إجمالي الحصص: ${summary.totalHours} | المتوسط: ${summary.averageLoad}</p>
          </div>
          <table class="teacher-table">
            <thead>
              <tr>
                <th>اسم المعلم</th>
                <th>التخصص</th>
                <th>عدد المواد</th>
                <th>إجمالي الحصص</th>
                <th>نسبة التحميل</th>
              </tr>
            </thead>
            <tbody>
              ${summary.teacherSummaries.map(teacher => `
                <tr>
                  <td>${teacher.teacherName}</td>
                  <td>${teacher.specialization}</td>
                  <td>${teacher.totalAssignments}</td>
                  <td>${teacher.totalHours}</td>
                  <td>${teacher.loadPercentage}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
  };

  const generateHTMLReport = (summary: typeof scopedSummary): string => {
    // تقرير HTML مفصل لجميع المعلمين
    return generatePrintHTML().replace('النطاق: المعلمين المحددين', 'النطاق: جميع المعلمين');
  };

  // معالجة التنقل بالكيبورد
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void, buttonId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    } else if (e.key === 'Tab') {
      setFocusedButton(buttonId);
    }
  };

  return (
    <div className={`assignment-action-bar-enhanced ${className || ''}`} role="toolbar" aria-label="أدوات إسناد المواد">
      {/* أزرار الإجراءات - مُرتبة من اليمين إلى اليسار */}
      <div className="action-buttons-rtl" role="group" aria-label="إجراءات التقارير والتصدير">
        {/* تصدير HTML شامل */}
        <button
          className={`action-btn-enhanced html-btn ${focusedButton === 'html' ? 'focused' : ''}`}
          onClick={handleExportHTML}
          onKeyDown={(e) => handleKeyDown(e, handleExportHTML, 'html')}
          onFocus={() => setFocusedButton('html')}
          onBlur={() => setFocusedButton(null)}
          title="تصدير تقرير HTML شامل"
        >
          <i className="fas fa-file-code" aria-hidden="true"></i>
          <span>تصدير HTML</span>
        </button>

        {/* تنزيل CSV */}
        <button
          className={`action-btn-enhanced csv-btn ${focusedButton === 'csv' ? 'focused' : ''}`}
          onClick={handleDownloadCSV}
          onKeyDown={(e) => handleKeyDown(e, handleDownloadCSV, 'csv')}
          onFocus={() => setFocusedButton('csv')}
          onBlur={() => setFocusedButton(null)}
          title="تنزيل بيانات CSV"
        >
          <i className="fas fa-file-csv" aria-hidden="true"></i>
          <span>تنزيل CSV</span>
        </button>

        {/* تنزيل PDF */}
        <button
          className={`action-btn-enhanced pdf-btn ${focusedButton === 'pdf' ? 'focused' : ''}`}
          onClick={handleDownloadPDF}
          onKeyDown={(e) => handleKeyDown(e, handleDownloadPDF, 'pdf')}
          onFocus={() => setFocusedButton('pdf')}
          onBlur={() => setFocusedButton(null)}
          title="تنزيل تقرير PDF"
        >
          <i className="fas fa-file-pdf" aria-hidden="true"></i>
          <span>تنزيل PDF</span>
        </button>

        {/* طباعة */}
        <button
          className={`action-btn-enhanced print-btn ${focusedButton === 'print' ? 'focused' : ''}`}
          onClick={handlePrint}
          onKeyDown={(e) => handleKeyDown(e, handlePrint, 'print')}
          onFocus={() => setFocusedButton('print')}
          onBlur={() => setFocusedButton(null)}
          title="طباعة التقرير"
        >
          <i className="fas fa-print" aria-hidden="true"></i>
          <span>طباعة</span>
        </button>

        {/* واتساب نص */}
        <button
          className={`action-btn-enhanced whatsapp-btn ${focusedButton === 'whatsapp' ? 'focused' : ''}`}
          onClick={handleWhatsAppText}
          onKeyDown={(e) => handleKeyDown(e, handleWhatsAppText, 'whatsapp')}
          onFocus={() => setFocusedButton('whatsapp')}
          onBlur={() => setFocusedButton(null)}
          title="مشاركة عبر واتساب"
        >
          <i className="fab fa-whatsapp" aria-hidden="true"></i>
          <span>واتساب</span>
        </button>
      </div>
    </div>
  );
};

export default ActionBar;