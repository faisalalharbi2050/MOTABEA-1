/**
 * شريط الإجراءات الرئيسي لنظام إسناد المواد
 * Assignment System Action Bar
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useAssignment, useAssignmentActions } from '../store/assignmentStore';
import { TeacherSummary } from '../export/htmlAllBuilder';
import { 
  createPlanHtmlExporter,
  downloadPlanHtml,
  generateFilenameWithDate
} from '../export/htmlAllDownload';
import { 
  exportPlanCSV,
  exportTeacherReportCSV,
  exportAssignmentsCSV,
  exportTeachersCSV
} from '../utils/csv';
import { 
  generateTeachersPDF,
  generateTeacherPDF,
  generateAssignmentsPDF,
  generatePlanPDF
} from '../utils/PdfClient';
import {
  sendTeacherReport,
  sendSummaryReport
} from '../utils/whatsapp';
import HtmlExportAllMenu from './HtmlExportAllMenu';

interface ActionBarProps {
  className?: string;
}

const ActionBar: React.FC<ActionBarProps> = ({ className }) => {
  const { state } = useAssignment();
  const actions = useAssignmentActions();
  const [showHtmlExportMenu, setShowHtmlExportMenu] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // إحصائيات سريعة
  const stats = {
    totalTeachers: state.teachers.filter(t => t.isActive).length,
    totalSubjects: state.subjects.filter(s => s.isActive).length,
    totalClassrooms: state.classrooms.filter(c => c.isActive).length,
    totalAssignments: state.assignments.filter(a => a.status === 'active').length,
  };

  // الحصول على المعلمين المحددين أو جميع المعلمين
  const getTargetScope = useCallback(() => {
    const selectedTeachers = Array.from(state.ui.selectedTeacherIds);
    if (selectedTeachers.length > 0) {
      return {
        teachers: state.teachers.filter(t => selectedTeachers.includes(t.id)),
        assignments: state.assignments.filter(a => selectedTeachers.includes(a.teacherId)),
        scope: 'selected' as const
      };
    }
    
    return {
      teachers: state.teachers,
      assignments: state.assignments,
      scope: 'all' as const
    };
  }, [state.teachers, state.assignments, state.ui.selectedTeacherIds]);

  // تحويل بيانات المعلمين إلى ملخصات للتصدير
  const createTeacherSummaries = useCallback((): TeacherSummary[] => {
    const { teachers, assignments } = getTargetScope();
    
    return teachers.map(teacher => {
      const teacherAssignments = assignments.filter(a => a.teacherId === teacher.id);
      const totalHours = teacherAssignments.reduce((sum, a) => sum + a.hoursPerWeek, 0);
      
      return {
        id: teacher.id,
        name: teacher.name,
        quota: teacher.maxLoad || 24,
        assignments: teacherAssignments.map(assignment => {
          const subject = state.subjects.find(s => s.id === assignment.subjectId);
          const classroom = state.classrooms.find(c => c.id === assignment.classroomId);
          
          return {
            id: assignment.id,
            subjectId: assignment.subjectId,
            subjectName: subject?.name || 'مادة غير معروفة',
            classroomId: assignment.classroomId,
            classroomName: classroom?.name || 'فصل غير معروف',
            hours: assignment.hoursPerWeek
          };
        }),
        totals: {
          totalHours,
          remainingQuota: Math.max(0, teacher.maxLoad - totalHours),
          utilizationRate: teacher.maxLoad > 0 ? (totalHours / teacher.maxLoad) * 100 : 0
        }
      };
    });
  }, [state, getTargetScope]);

  // دوال الأكشن للمشاركة والتقارير
  const handleWhatsAppShare = useCallback(async () => {
    setIsProcessing(true);
    try {
      const { scope } = getTargetScope();
      if (scope === 'selected' && state.ui.selectedTeacherIds.size === 1) {
        // إرسال تقرير معلم محدد
        const teacherId = Array.from(state.ui.selectedTeacherIds)[0];
        sendTeacherReport(state, teacherId, '', {
          format: 'detailed'
        });
      } else {
        // إرسال تقرير عام
        sendSummaryReport(state, '', {
          format: 'detailed'
        });
      }
    } catch (error) {
      console.error('خطأ في مشاركة واتساب:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [state, getTargetScope]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    setIsProcessing(true);
    try {
      const { scope } = getTargetScope();
      if (scope === 'selected' && state.ui.selectedTeacherIds.size === 1) {
        const teacherId = Array.from(state.ui.selectedTeacherIds)[0];
        generateTeacherPDF(state, teacherId);
      } else if (scope === 'selected') {
        // تنزيل PDF للمعلمين المحددين
        generateTeachersPDF(state);
      } else {
        // تنزيل PDF شامل
        generatePlanPDF(state);
      }
    } catch (error) {
      console.error('خطأ في تنزيل PDF:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [state, getTargetScope]);

  const handleDownloadCSV = useCallback(() => {
    setIsProcessing(true);
    try {
      const { scope } = getTargetScope();
      if (scope === 'selected' && state.ui.selectedTeacherIds.size === 1) {
        const teacherId = Array.from(state.ui.selectedTeacherIds)[0];
        exportTeacherReportCSV(state, teacherId);
      } else if (scope === 'selected') {
        // تصدير CSV للمعلمين المحددين (سيتم استخدام المرشح)
        exportTeachersCSV(state);
      } else {
        // تصدير CSV شامل
        exportPlanCSV(state);
      }
    } catch (error) {
      console.error('خطأ في تنزيل CSV:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [state, getTargetScope]);

  const handleDownloadHTML = useCallback(() => {
    setShowHtmlExportMenu(true);
  }, []);

  // تبديل وضع العرض
  const handleViewModeChange = (mode: 'grid' | 'list' | 'matrix') => {
    actions.setViewMode(mode);
  };

  // التراجع والإعادة
  const handleUndo = () => {
    if (state.history.canUndo) {
      actions.undo();
    }
  };

  const handleRedo = () => {
    if (state.history.canRedo) {
      actions.redo();
    }
  };

  // اختصارات لوحة المفاتيح
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z للتراجع
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl+Y أو Ctrl+Shift+Z للإعادة
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`space-y-6 ${className || ''}`} dir="rtl">
      {/* Header - مماثل لصفحة الجداول */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إسناد المواد</h1>
          <p className="text-gray-600">إدارة وتوزيع المواد الدراسية على المعلمين</p>
        </div>
        
        {/* إحصائيات */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{stats.totalTeachers}</div>
            <div className="text-sm text-blue-800">معلم</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{stats.totalSubjects}</div>
            <div className="text-sm text-green-800">مادة</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{stats.totalClassrooms}</div>
            <div className="text-sm text-purple-800">فصل</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{stats.totalAssignments}</div>
            <div className="text-sm text-orange-800">إسناد</div>
          </div>
        </div>
      </div>

      {/* Toolbar - شريط الأدوات */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* أزرار التراجع والإعادة */}
          <div className="flex items-center gap-2">
            <button
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                !state.history.canUndo 
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
              onClick={handleUndo}
              disabled={!state.history.canUndo}
              title="التراجع (Ctrl+Z)"
            >
              <i className="fas fa-undo text-sm" aria-hidden="true"></i>
              <span className="text-sm">تراجع</span>
            </button>
            
            <button
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                !state.history.canRedo 
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
              onClick={handleRedo}
              disabled={!state.history.canRedo}
              title="الإعادة (Ctrl+Y)"
            >
              <i className="fas fa-redo text-sm" aria-hidden="true"></i>
              <span className="text-sm">إعادة</span>
            </button>
          </div>

          {/* أزرار المشاركة والتقارير */}
          <div className="flex items-center gap-3">
            {/* زر واتساب */}
            <button
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg border hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              onClick={handleWhatsAppShare}
              disabled={isProcessing}
              title={state.ui.selectedTeacherIds.size > 0 ? "مشاركة المحدد عبر واتساب" : "مشاركة الكل عبر واتساب"}
            >
              <i className="fab fa-whatsapp text-sm" aria-hidden="true"></i>
              <span className="text-sm">واتساب</span>
            </button>

            {/* زر الطباعة */}
            <button
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg border hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              onClick={handlePrint}
              disabled={isProcessing}
              title="طباعة التقرير"
            >
              <i className="fas fa-print text-sm" aria-hidden="true"></i>
              <span className="text-sm">طباعة</span>
            </button>

            {/* زر تنزيل PDF */}
            <button
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg border hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              onClick={handleDownloadPDF}
              disabled={isProcessing}
              title={state.ui.selectedTeacherIds.size > 0 ? "تنزيل PDF للمحدد" : "تنزيل PDF للكل"}
            >
              <i className="fas fa-file-pdf text-sm" aria-hidden="true"></i>
              <span className="text-sm">PDF</span>
            </button>

            {/* زر تنزيل CSV */}
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg border hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              onClick={handleDownloadCSV}
              disabled={isProcessing}
              title={state.ui.selectedTeacherIds.size > 0 ? "تنزيل CSV للمحدد" : "تنزيل CSV للكل"}
            >
              <i className="fas fa-file-csv text-sm" aria-hidden="true"></i>
              <span className="text-sm">CSV</span>
            </button>

            {/* زر تنزيل HTML الكامل */}
            <button
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg border hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              onClick={handleDownloadHTML}
              disabled={isProcessing}
              title="تصدير HTML الكامل مع JSON للإضافات"
            >
              <i className="fas fa-code text-sm" aria-hidden="true"></i>
              <span className="text-sm">HTML</span>
            </button>

            {/* زر إعدادات */}
            <button
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg border hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              onClick={() => {/* سيتم تطبيقه لاحقاً */}}
              title="الإعدادات"
            >
              <i className="fas fa-cog text-sm" aria-hidden="true"></i>
              <span className="text-sm">إعدادات</span>
            </button>
          </div>
        </div>
      </div>

      {/* قائمة تصدير HTML */}
      {showHtmlExportMenu && (
        <HtmlExportAllMenu
          summaries={createTeacherSummaries()}
          isLoading={isProcessing}
          onClose={() => setShowHtmlExportMenu(false)}
          isVisible={showHtmlExportMenu}
        />
      )}
    </div>
  );
};

export default ActionBar;