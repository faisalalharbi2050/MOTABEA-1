/**
 * شريط الإجراءات المطور الاحترافي - إسناد المواد
 * Enhanced Professional Action Bar - Assignment Page
 */

import React, { useState } from 'react';
import { 
  Edit3,
  Trash2,
  AlertTriangle,
  X,
  Check,
  Table
} from 'lucide-react';
import { useAssignment, useAssignmentActions } from '../store/assignmentStore';
import toast from 'react-hot-toast';

interface EnhancedProfessionalActionBarProps {
  className?: string;
  selectedTeachers?: Set<string>; // إضافة المعلمين المحددين
  onShowTablePage?: () => void; // دالة لعرض صفحة الجدول
}

const EnhancedProfessionalActionBar: React.FC<EnhancedProfessionalActionBarProps> = ({ 
  className,
  selectedTeachers = new Set(),
  onShowTablePage
}) => {
  const { state } = useAssignment();
  const actions = useAssignmentActions();
  
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [showDeleteTeachersDialog, setShowDeleteTeachersDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // دالة لتصحيح العدد والمعدود
  const formatNumber = (num: number, singular: string, dual: string, plural: string): string => {
    if (num === 0) return `${num} ${singular}`;
    if (num === 1) return singular;
    if (num === 2) return dual;
    if (num >= 3 && num <= 10) return `${num} ${plural}`;
    return `${num} ${singular}`;
  };

  // زر فتح جدول الإسناد
  const handleOpenAssignmentTable = () => {
    if (onShowTablePage) {
      onShowTablePage(); // استدعاء الدالة لعرض الصفحة
    }
  };

  // 5. زر تعديل الإسناد
  const handleEditMode = () => {
    if (isEditMode) {
      toast.success('تم حفظ التعديلات', {
        icon: '💾',
        duration: 2000
      });
    } else {
      toast.success('وضع التعديل مفعّل - يمكنك الآن التعديل', {
        icon: '✏️',
        duration: 2000
      });
    }
    setIsEditMode(!isEditMode);
  };

  // 6. زر حذف إسناد معلم - يستخدم المعلمين المحددين من CheckBox
  const handleDeleteSelectedTeachers = () => {
    if (selectedTeachers.size === 0) {
      toast.error('الرجاء اختيار معلم أو أكثر من بطاقة المعلمون', {
        icon: '👨‍🏫',
        duration: 3000
      });
      return;
    }

    // فتح مربع الحوار الاحترافي
    setShowDeleteTeachersDialog(true);
  };

  // تأكيد حذف المعلمين المحددين
  const confirmDeleteTeachers = () => {
    let deletedCount = 0;
    selectedTeachers.forEach(teacherId => {
      const assignments = state.assignments.filter(a => a.teacherId === teacherId);
      assignments.forEach(assignment => {
        actions.deleteAssignment(assignment.id);
        deletedCount++;
      });
    });
    
    toast.success(`تم حذف ${deletedCount} إسناد لـ ${selectedTeachers.size} معلم`, {
      icon: '🗑️',
      duration: 3000
    });
    
    setShowDeleteTeachersDialog(false);
  };

  // 7. زر حذف إسناد الكل
  const handleDeleteAllAssignments = () => {
    setShowDeleteAllDialog(true);
  };

  const confirmDeleteAll = () => {
    const allAssignments = state.assignments.filter(a => a.status === 'active');
    
    allAssignments.forEach(assignment => {
      actions.deleteAssignment(assignment.id);
    });
    
    toast.success(`تم حذف ${allAssignments.length} إسناد`);
    setShowDeleteAllDialog(false);
  };

  const stats = {
    totalAssignments: state.assignments.filter(a => a.status === 'active').length,
    totalTeachers: state.teachers.filter(t => t.isActive).length
  };

  return (
    <>
      <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4 ${className || ''}`} dir="rtl">
        {/* الأزرار - في صف واحد مع ارتفاع محسّن */}
        <div className="grid grid-cols-4 gap-3 w-full" style={{ direction: 'rtl' }}>
          
          {/* 1. زر جدول الإسناد - الزر الجديد */}
          <button
            onClick={handleOpenAssignmentTable}
            className="flex items-center justify-center px-4 h-auto py-3 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap"
            style={{ 
              fontFamily: "'Noto Kufi Arabic', sans-serif",
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
            }}
          >
            <Table className="h-4 w-4 ml-2" />
            <span className="text-sm">جدول الإسناد</span>
          </button>

          {/* 2. زر تعديل الإسناد */}
          <button
            onClick={handleEditMode}
            className="flex items-center justify-center px-4 h-auto py-3 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap"
            style={{ 
              fontFamily: "'Noto Kufi Arabic', sans-serif",
              background: isEditMode ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
            }}
          >
            {isEditMode ? <Check className="h-4 w-4 ml-2" /> : <Edit3 className="h-4 w-4 ml-2" />}
            <span className="text-sm">{isEditMode ? 'حفظ التعديل' : 'تعديل الإسناد'}</span>
          </button>

          {/* 3. زر حذف إسناد معلم */}
          <button
            onClick={handleDeleteSelectedTeachers}
            className="flex items-center justify-center px-4 h-auto py-3 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap"
            style={{ 
              fontFamily: "'Noto Kufi Arabic', sans-serif",
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            }}
          >
            <Trash2 className="h-4 w-4 ml-2" />
            <span className="text-sm">حذف إسناد معلم</span>
          </button>

          {/* 4. زر حذف إسناد الكل */}
          <button
            onClick={handleDeleteAllAssignments}
            className="flex items-center justify-center px-4 h-auto py-3 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap"
            style={{ 
              fontFamily: "'Noto Kufi Arabic', sans-serif",
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            }}
          >
            <AlertTriangle className="h-4 w-4 ml-2" />
            <span className="text-sm">حذف إسناد الكل</span>
          </button>

        </div>
      </div>

      {/* مربع حوار احترافي لحذف إسنادات معلمين محددين */}
      {showDeleteTeachersDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <AlertTriangle className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                    تأكيد حذف الإسنادات
                  </h3>
                  <p className="text-white/90 text-sm mt-1">هذا الإجراء لا يمكن التراجع عنه</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-red-800 font-bold mb-2 flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    <span>سيتم حذف إسنادات المعلمين التالية:</span>
                  </p>
                  <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                    {Array.from(selectedTeachers).map(teacherId => {
                      const teacher = state.teachers.find(t => t.id === teacherId);
                      const assignments = state.assignments.filter(a => a.teacherId === teacherId);
                      return (
                        <div key={teacherId} className="bg-white border border-red-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900">{teacher?.name || 'غير معروف'}</span>
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                              {assignments.length} إسناد
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm flex items-start gap-2">
                    <span className="text-lg mt-0.5">💡</span>
                    <span>يمكنك إعادة إسناد المواد لاحقاً، لكن سيتم فقدان البيانات الحالية</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={confirmDeleteTeachers}
                  className="flex-1 px-4 py-3 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  style={{ 
                    fontFamily: "'Noto Kufi Arabic', sans-serif",
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    <span>نعم، احذف الإسنادات</span>
                  </div>
                </button>
                <button
                  onClick={() => setShowDeleteTeachersDialog(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold transition-all"
                  style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <X className="w-5 h-5" />
                    <span>إلغاء</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مربع حوار تأكيد حذف الكل */}
      {showDeleteAllDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
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
                أنت على وشك حذف <strong className="text-red-600">{formatNumber(stats.totalAssignments, 'إسناد واحد', 'إسنادين', 'إسنادات')}</strong> لجميع المعلمين ({stats.totalTeachers}).
              </p>
              <p className="text-red-600 font-semibold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                هذا الإجراء لا يمكن التراجع عنه!
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmDeleteAll}
                className="flex-1 px-4 py-3 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg"
                style={{ 
                  fontFamily: "'Noto Kufi Arabic', sans-serif",
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                }}
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

export default EnhancedProfessionalActionBar;
