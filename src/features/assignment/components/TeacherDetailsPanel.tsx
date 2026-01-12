/**
 * لوحة تفاصيل المعلم المتزامنة
 * Synchronized Teacher Details Panel
 */

import React, { useMemo, useState } from 'react';
import { useAssignment } from '../store/assignmentStore';
import { selectAssignmentSummaryByTeacher, selectPlanSummaries } from '../store/teacherSelectors';

interface TeacherDetailsPanelProps {
  className?: string;
}

const TeacherDetailsPanel: React.FC<TeacherDetailsPanelProps> = ({ className }) => {
  const { state } = useAssignment();
  const [viewMode, setViewMode] = useState<'single' | 'multi'>('single');
  
  // تحديد المعلمين للعرض حسب الوضع
  const displayData = useMemo(() => {
    const selectedTeachers = Array.from(state.ui.selectedTeacherIds);
    
    if (viewMode === 'single' && selectedTeachers.length > 0) {
      // عرض أول معلم محدد
      const teacherId = selectedTeachers[0];
      const teacher = state.teachers.find(t => t.id === teacherId);
      const summary = selectAssignmentSummaryByTeacher(state, teacherId);
      
      return {
        mode: 'single' as const,
        teacher,
        summary,
        count: 1
      };
    } else if (selectedTeachers.length > 0) {
      // عرض ملخص متعدد
      const summaries = selectPlanSummaries(state, selectedTeachers);
      return {
        mode: 'multi' as const,
        summaries,
        count: selectedTeachers.length
      };
    } else {
      return {
        mode: 'empty' as const,
        count: 0
      };
    }
  }, [state, viewMode]);

  // معالجات الأزرار السريعة
  const handleWhatsApp = () => {
    if (displayData.mode === 'single' && displayData.summary) {
      const summary = displayData.summary;
      let message = `📋 إسناد المواد - ${summary.teacherName}\n\n`;
      message += `🎓 التخصص: ${summary.specialization}\n`;
      message += `📊 إجمالي المواد: ${summary.totalAssignments}\n`;
      message += `⏰ إجمالي الحصص: ${summary.totalHours}/${summary.maxLoad} (${summary.loadPercentage}%)\n\n`;
      
      summary.assignments.forEach((assignment, index) => {
        message += `${index + 1}. ${assignment.subjectName}\n`;
        message += `   الفصل: ${assignment.classroomName}\n`;
        message += `   الحصص: ${assignment.hoursPerWeek} أسبوعياً\n\n`;
      });
      
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } else if (displayData.mode === 'multi' && displayData.summaries) {
      const summaries = displayData.summaries;
      let message = `📊 ملخص إسناد المواد - ${summaries.teacherCount} معلم\n\n`;
      message += `⏰ إجمالي الحصص: ${summaries.totalHours}\n`;
      message += `📈 متوسط الحمولة: ${summaries.averageLoad} حصة\n\n`;
      
      summaries.teacherSummaries.slice(0, 10).forEach((teacher, index) => {
        message += `${index + 1}. ${teacher.teacherName}\n`;
        message += `   ${teacher.specialization} - ${teacher.totalHours} حصة (${teacher.loadPercentage}%)\n\n`;
      });
      
      if (summaries.teacherSummaries.length > 10) {
        message += `... و ${summaries.teacherSummaries.length - 10} معلم آخر`;
      }
      
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
  };

  const handlePrint = () => {
    const printContent = generatePrintContent();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadCSV = () => {
    let csvContent = '';
    let filename = '';

    if (displayData.mode === 'single' && displayData.summary) {
      const summary = displayData.summary;
      csvContent = 'المادة,الفصل,حصص/أسبوع,الفصل الدراسي\n';
      summary.assignments.forEach(assignment => {
        csvContent += `"${assignment.subjectName}","${assignment.classroomName}",${assignment.hoursPerWeek},"${assignment.semester}"\n`;
      });
      filename = `إسناد_${summary.teacherName}_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (displayData.mode === 'multi' && displayData.summaries) {
      csvContent = 'اسم المعلم,التخصص,عدد المواد,إجمالي الحصص,الحد الأقصى,نسبة التحميل\n';
      displayData.summaries.teacherSummaries.forEach(teacher => {
        csvContent += `"${teacher.teacherName}","${teacher.specialization}",${teacher.totalAssignments},${teacher.totalHours},${teacher.maxLoad},${teacher.loadPercentage}%\n`;
      });
      filename = `ملخص_إسناد_المواد_${displayData.count}_معلم_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const generatePrintContent = (): string => {
    if (displayData.mode === 'single' && displayData.summary) {
      const summary = displayData.summary;
      return `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
          <head>
            <meta charset="UTF-8">
            <title>تفاصيل إسناد - ${summary.teacherName}</title>
            <style>
              body { font-family: 'Noto Kufi Arabic', Arial, sans-serif; margin: 20px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
              .summary { margin-bottom: 30px; background: #f9f9f9; padding: 15px; border-radius: 5px; }
              .assignments-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              .assignments-table th, .assignments-table td { border: 1px solid #ddd; padding: 10px; text-align: right; }
              .assignments-table th { background-color: #f2f2f2; font-weight: bold; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>تفاصيل إسناد المواد</h1>
              <h2>${summary.teacherName}</h2>
              <p>التاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
            </div>
            
            <div class="summary">
              <h3>الملخص العام</h3>
              <p><strong>التخصص:</strong> ${summary.specialization}</p>
              <p><strong>عدد المواد:</strong> ${summary.totalAssignments}</p>
              <p><strong>إجمالي الحصص:</strong> ${summary.totalHours}/${summary.maxLoad} (${summary.loadPercentage}%)</p>
            </div>

            <table class="assignments-table">
              <thead>
                <tr>
                  <th>المادة</th>
                  <th>الفصل</th>
                  <th>حصص/أسبوع</th>
                  <th>الفصل الدراسي</th>
                </tr>
              </thead>
              <tbody>
                ${summary.assignments.map(assignment => `
                  <tr>
                    <td>${assignment.subjectName}</td>
                    <td>${assignment.classroomName}</td>
                    <td>${assignment.hoursPerWeek}</td>
                    <td>${assignment.semester === 'first' ? 'الأول' : assignment.semester === 'second' ? 'الثاني' : 'كامل'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;
    }
    return '';
  };

  if (displayData.mode === 'empty') {
    return (
      <div className={`teacher-details-panel empty ${className || ''}`}>
        <div className="empty-state">
          <i className="fas fa-user-slash"></i>
          <h3>لا يوجد معلم محدد</h3>
          <p>اختر معلماً من الشريط الجانبي لعرض تفاصيل إسناد المواد</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`teacher-details-panel ${className || ''}`}>
      {/* رأس اللوحة */}
      <div className="panel-header">
        <div className="header-info">
          {displayData.mode === 'single' && displayData.teacher ? (
            <>
              <h3>{displayData.teacher.name}</h3>
              <span className="teacher-spec">{displayData.teacher.specialization}</span>
            </>
          ) : (
            <>
              <h3>ملخص متعدد</h3>
              <span className="teacher-count">{displayData.count} معلم محدد</span>
            </>
          )}
        </div>

        {/* أزرار التحكم */}
        <div className="panel-actions">
          {displayData.count > 1 && (
            <div className="view-toggle">
              <button
                className={`toggle-btn ${viewMode === 'single' ? 'active' : ''}`}
                onClick={() => setViewMode('single')}
              >
                فردي
              </button>
              <button
                className={`toggle-btn ${viewMode === 'multi' ? 'active' : ''}`}
                onClick={() => setViewMode('multi')}
              >
                متعدد
              </button>
            </div>
          )}

          {/* أزرار سريعة */}
          <div className="quick-actions">
            <button
              className="action-btn whatsapp"
              onClick={handleWhatsApp}
              title="مشاركة عبر واتساب"
            >
              <i className="fab fa-whatsapp"></i>
            </button>
            <button
              className="action-btn print"
              onClick={handlePrint}
              title="طباعة"
            >
              <i className="fas fa-print"></i>
            </button>
            <button
              className="action-btn download"
              onClick={handleDownloadCSV}
              title="تحميل CSV"
            >
              <i className="fas fa-download"></i>
            </button>
          </div>
        </div>
      </div>

      {/* محتوى اللوحة */}
      <div className="panel-content">
        {displayData.mode === 'single' && displayData.summary ? (
          /* عرض معلم واحد */
          <div className="single-teacher-view">
            {/* ملخص النصاب */}
            <div className="workload-summary">
              <div className="summary-cards">
                <div className="summary-card">
                  <div className="card-value">{displayData.summary.totalAssignments}</div>
                  <div className="card-label">مادة</div>
                </div>
                <div className="summary-card">
                  <div className="card-value">{displayData.summary.totalHours}</div>
                  <div className="card-label">حصة/أسبوع</div>
                </div>
                <div className="summary-card">
                  <div className="card-value">{displayData.summary.loadPercentage}%</div>
                  <div className="card-label">نسبة التحميل</div>
                </div>
              </div>
              
              {/* شريط الحمولة */}
              <div className="load-indicator">
                <div className="load-bar">
                  <div
                    className={`load-fill ${
                      displayData.summary.loadPercentage > 90 ? 'high' : 
                      displayData.summary.loadPercentage > 70 ? 'medium' : 'low'
                    }`}
                    style={{ width: `${Math.min(displayData.summary.loadPercentage, 100)}%` }}
                  />
                </div>
                <span className="load-text">
                  {displayData.summary.totalHours}/{displayData.summary.maxLoad} حصة
                </span>
              </div>
            </div>

            {/* جدول المواد المسندة */}
            <div className="assignments-table-container">
              <h4>المواد المسندة</h4>
              {displayData.summary.assignments.length > 0 ? (
                <table className="assignments-table">
                  <thead>
                    <tr>
                      <th>المادة</th>
                      <th>الفصل</th>
                      <th>حصص/أسبوع</th>
                      <th>الفصل الدراسي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.summary.assignments.map((assignment, index) => (
                      <tr key={index}>
                        <td>{assignment.subjectName}</td>
                        <td>{assignment.classroomName}</td>
                        <td className="hours-cell">{assignment.hoursPerWeek}</td>
                        <td className="semester-cell">
                          {assignment.semester === 'first' ? 'الأول' : 
                           assignment.semester === 'second' ? 'الثاني' : 'كامل'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td colSpan={2}><strong>الإجمالي</strong></td>
                      <td className="hours-cell"><strong>{displayData.summary.totalHours}</strong></td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <div className="no-assignments">
                  <i className="fas fa-inbox"></i>
                  <span>لا توجد مواد مسندة</span>
                </div>
              )}
            </div>
          </div>
        ) : displayData.mode === 'multi' && displayData.summaries ? (
          /* عرض متعدد */
          <div className="multi-teachers-view">
            {/* إحصائيات إجمالية */}
            <div className="multi-summary">
              <div className="summary-grid">
                <div className="summary-item">
                  <i className="fas fa-users"></i>
                  <span>{displayData.summaries.teacherCount} معلم</span>
                </div>
                <div className="summary-item">
                  <i className="fas fa-clock"></i>
                  <span>{displayData.summaries.totalHours} حصة</span>
                </div>
                <div className="summary-item">
                  <i className="fas fa-chart-line"></i>
                  <span>متوسط: {displayData.summaries.averageLoad}</span>
                </div>
              </div>
            </div>

            {/* قائمة المعلمين */}
            <div className="teachers-summary-list">
              {displayData.summaries.teacherSummaries.map((teacher, index) => (
                <div key={teacher.teacherId} className="teacher-summary-card">
                  <div className="card-header">
                    <span className="teacher-name">{teacher.teacherName}</span>
                    <span className="teacher-spec">{teacher.specialization}</span>
                  </div>
                  <div className="card-stats">
                    <span className="stat">{teacher.totalAssignments} مادة</span>
                    <span className="stat">{teacher.totalHours} حصة</span>
                    <span className={`stat percentage ${
                      teacher.loadPercentage > 90 ? 'high' : 
                      teacher.loadPercentage > 70 ? 'medium' : 'low'
                    }`}>
                      {teacher.loadPercentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TeacherDetailsPanel;