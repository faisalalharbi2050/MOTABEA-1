/**
 * شريط الإجراءات الاحترافي المحدث - إسناد المواد
 * Professional Action Bar - Updated Version
 * 
 * التحديثات:
 * - الأزرار في اليمين بدلاً من اليسار
 * - تحويل نافذة التقارير إلى مربع dropdown
 * - إضافة زر تعديل الإسناد
 * - إضافة زر حذف إسناد معلم
 * - إضافة زر حذف إسناد الكل
 * - تحسين نص الواتساب (حذف علامات الاستفهام والعدد/المعدود)
 * - إزالة زر الإعدادات
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Share2,
  Edit3,
  Trash2,
  AlertTriangle,
  ChevronDown,
  X
} from 'lucide-react';
import { useAssignment, useAssignmentActions } from '../store/assignmentStore';
import { selectPlanSummaries } from '../store/teacherSelectors';

interface ProfessionalActionBarProps {
  className?: string;
}

const ProfessionalActionBar: React.FC<ProfessionalActionBarProps> = ({ className }) => {
  const { state } = useAssignment();
  const actions = useAssignmentActions();
  
  const [reportsMenuOpen, setReportsMenuOpen] = useState(false);
  const [editMenuOpen, setEditMenuOpen] = useState(false);
  const [deleteMenuOpen, setDeleteMenuOpen] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  
  const reportsMenuRef = useRef<HTMLDivElement>(null);
  const editMenuRef = useRef<HTMLDivElement>(null);
  const deleteMenuRef = useRef<HTMLDivElement>(null);

  // إغلاق القوائم عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (reportsMenuRef.current && !reportsMenuRef.current.contains(event.target as Node)) {
        setReportsMenuOpen(false);
      }
      if (editMenuRef.current && !editMenuRef.current.contains(event.target as Node)) {
        setEditMenuOpen(false);
      }
      if (deleteMenuRef.current && !deleteMenuRef.current.contains(event.target as Node)) {
        setDeleteMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // حساب عدد المعلمين والإسنادات
  const stats = useMemo(() => {
    const activeTeachers = state.teachers.filter(t => t.isActive);
    const activeAssignments = state.assignments.filter(a => a.status === 'active');
    const selectedTeachersCount = state.ui.selectedTeacherIds.size;
    
    return {
      totalTeachers: activeTeachers.length,
      totalAssignments: activeAssignments.length,
      selectedTeachersCount,
      hasSelection: selectedTeachersCount > 0
    };
  }, [state.teachers, state.assignments, state.ui.selectedTeacherIds]);

  // دالة لتصحيح العدد والمعدود
  const formatNumber = (num: number, singular: string, dual: string, plural: string): string => {
    if (num === 0) return `${num} ${singular}`;
    if (num === 1) return singular;
    if (num === 2) return dual;
    if (num >= 3 && num <= 10) return `${num} ${plural}`;
    return `${num} ${singular}`;
  };

  // معالج إرسال واتساب المحسن
  const handleWhatsAppShare = () => {
    const summary = selectPlanSummaries(state, Array.from(state.ui.selectedTeacherIds));
    
    let message = `📊 ملخص إسناد المواد\n\n`;
    message += `👥 عدد المعلمين: ${summary.teacherCount}\n`;
    message += `⏰ إجمالي ${formatNumber(summary.totalHours, 'حصة', 'حصتان', 'حصص')}\n`;
    message += `📈 متوسط الحمولة: ${formatNumber(summary.averageLoad, 'حصة', 'حصتان', 'حصص')}\n\n`;
    
    summary.teacherSummaries.slice(0, 5).forEach((teacher, index) => {
      message += `${index + 1}. ${teacher.teacherName}\n`;
      message += `   ${teacher.specialization} - ${formatNumber(teacher.totalHours, 'حصة', 'حصتان', 'حصص')} (${teacher.loadPercentage}%)\n\n`;
    });
    
    if (summary.teacherSummaries.length > 5) {
      message += `... و ${summary.teacherSummaries.length - 5} ${formatNumber(summary.teacherSummaries.length - 5, 'معلم', 'معلمان', 'معلمين')} آخر\n`;
    }
    
    // فتح WhatsApp
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // معالج الطباعة
  const handlePrint = () => {
    window.print();
  };

  // معالج تنزيل PDF
  const handleDownloadPDF = () => {
    console.log('تنزيل PDF');
    // سيتم التنفيذ لاحقاً
  };

  // معالج تنزيل CSV
  const handleDownloadCSV = () => {
    const summary = selectPlanSummaries(state, Array.from(state.ui.selectedTeacherIds));
    let csvContent = 'اسم المعلم,التخصص,عدد المواد,إجمالي الحصص,الحد الأقصى,نسبة التحميل\n';
    
    summary.teacherSummaries.forEach(teacher => {
      csvContent += `"${teacher.teacherName}","${teacher.specialization}",${teacher.totalAssignments},${teacher.totalHours},${teacher.maxLoad},${teacher.loadPercentage}%\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `إسناد_المواد_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // معالج تعديل الإسناد
  const handleBulkEdit = (scope: 'all' | 'selected' | 'one') => {
    console.log('تعديل الإسناد:', scope);
    setEditMenuOpen(false);
    // سيتم التنفيذ لاحقاً
  };

  // معالج حذف إسناد معلم
  const handleDeleteTeacherAssignments = (scope: 'selected' | 'one') => {
    const teachersToDelete = scope === 'selected' 
      ? Array.from(state.ui.selectedTeacherIds)
      : state.filters.selectedTeacherId 
        ? [state.filters.selectedTeacherId]
        : [];

    if (teachersToDelete.length === 0) {
      alert('الرجاء تحديد معلم أو معلمين أولاً');
      return;
    }

    const teacherNames = teachersToDelete
      .map(id => state.teachers.find(t => t.id === id)?.name)
      .filter(Boolean)
      .join('، ');

    if (confirm(`هل أنت متأكد من حذف جميع إسنادات ${formatNumber(teachersToDelete.length, 'المعلم', 'المعلمين', 'المعلمين')}:\n${teacherNames}؟`)) {
      teachersToDelete.forEach(teacherId => {
        const assignments = state.assignments.filter(a => a.teacherId === teacherId);
        assignments.forEach(assignment => {
          actions.deleteAssignment(assignment.id);
        });
      });
      setDeleteMenuOpen(false);
    }
  };

  // معالج حذف جميع الإسنادات
  const handleDeleteAllAssignments = () => {
    setShowDeleteAllDialog(true);
  };

  const confirmDeleteAll = () => {
    const allAssignments = state.assignments.filter(a => a.status === 'active');
    
    allAssignments.forEach(assignment => {
      actions.deleteAssignment(assignment.id);
    });
    
    setShowDeleteAllDialog(false);
    setDeleteMenuOpen(false);
  };

  return (
    <>
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4 ${className || ''}`} dir="rtl">
        {/* الأزرار - محاذاة لليمين */}
        <div className="flex items-center justify-end gap-3 flex-wrap">
          
          {/* زر إرسال عبر الواتساب */}
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
            style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
          >
            <Share2 className="h-4 w-4" />
            <span className="text-sm">إرسال عبر الواتساب</span>
          </button>

          {/* زر التقارير - قائمة منسدلة */}
          <div className="relative" ref={reportsMenuRef}>
            <button
              onClick={() => setReportsMenuOpen(!reportsMenuOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
              style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
            >
              <FileText className="h-4 w-4" />
              <span className="text-sm">التقارير</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${reportsMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* قائمة التقارير المنسدلة */}
            {reportsMenuOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <button
                  onClick={() => { handlePrint(); setReportsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors text-right"
                  style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
                >
                  <Printer className="h-4 w-4" />
                  <span className="text-sm font-semibold">طباعة</span>
                </button>
                
                <button
                  onClick={() => { handleDownloadPDF(); setReportsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-gray-700 hover:text-red-700 transition-colors text-right"
                  style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
                >
                  <Download className="h-4 w-4" />
                  <span className="text-sm font-semibold">تنزيل PDF</span>
                </button>
                
                <button
                  onClick={() => { handleDownloadCSV(); setReportsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 text-gray-700 hover:text-green-700 transition-colors text-right"
                  style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
                >
                  <Download className="h-4 w-4" />
                  <span className="text-sm font-semibold">تنزيل CSV</span>
                </button>
              </div>
            )}
          </div>

          {/* زر تعديل الإسناد - قائمة منسدلة */}
          <div className="relative" ref={editMenuRef}>
            <button
              onClick={() => setEditMenuOpen(!editMenuOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
              style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
            >
              <Edit3 className="h-4 w-4" />
              <span className="text-sm">تعديل الإسناد</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${editMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* قائمة التعديل المنسدلة */}
            {editMenuOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <button
                  onClick={() => handleBulkEdit('all')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition-colors text-right"
                  style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
                >
                  <Edit3 className="h-4 w-4" />
                  <span className="text-sm font-semibold">تعديل الكل دفعة واحدة</span>
                </button>
                
                <button
                  onClick={() => handleBulkEdit('selected')}
                  disabled={!stats.hasSelection}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition-colors text-right disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
                >
                  <Edit3 className="h-4 w-4" />
                  <span className="text-sm font-semibold">
                    تعديل المحددين ({stats.selectedTeachersCount})
                  </span>
                </button>
                
                <button
                  onClick={() => handleBulkEdit('one')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition-colors text-right"
                  style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
                >
                  <Edit3 className="h-4 w-4" />
                  <span className="text-sm font-semibold">تعديل معلم واحد</span>
                </button>
              </div>
            )}
          </div>

          {/* زر حذف إسناد معلم - قائمة منسدلة */}
          <div className="relative" ref={deleteMenuRef}>
            <button
              onClick={() => setDeleteMenuOpen(!deleteMenuOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
              style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-sm">حذف إسناد معلم</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${deleteMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* قائمة الحذف المنسدلة */}
            {deleteMenuOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <button
                  onClick={() => handleDeleteTeacherAssignments('selected')}
                  disabled={!stats.hasSelection}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 text-gray-700 hover:text-orange-700 transition-colors text-right disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-sm font-semibold">
                    حذف المحددين ({stats.selectedTeachersCount})
                  </span>
                </button>
                
                <button
                  onClick={() => handleDeleteTeacherAssignments('one')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 text-gray-700 hover:text-orange-700 transition-colors text-right"
                  style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-sm font-semibold">حذف معلم واحد</span>
                </button>
              </div>
            )}
          </div>

          {/* زر حذف إسناد الكل */}
          <button
            onClick={handleDeleteAllAssignments}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
            style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
          >
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">حذف إسناد الكل</span>
          </button>

        </div>
      </div>

      {/* مربع حوار تأكيد حذف الكل */}
      {showDeleteAllDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                تحذير: حذف جميع الإسنادات
              </h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-3" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                أنت على وشك حذف <strong className="text-red-600">{formatNumber(stats.totalAssignments, 'إسناد', 'إسنادين', 'إسنادات')}</strong> لجميع المعلمين ({stats.totalTeachers}).
              </p>
              <p className="text-red-600 font-semibold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                هذا الإجراء لا يمكن التراجع عنه!
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmDeleteAll}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-bold transition-all"
                style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
              >
                نعم، احذف الكل
              </button>
              <button
                onClick={() => setShowDeleteAllDialog(false)}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-bold transition-all"
                style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfessionalActionBar;
