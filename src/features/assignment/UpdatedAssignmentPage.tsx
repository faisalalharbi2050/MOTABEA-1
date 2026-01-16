/**
 * صفحة إسناد المواد المحدثة - الإصدار الاحترافي المطور
 * Updated Assignment Page - Professional Enhanced Version
 */

import React, { useState } from 'react';
import { AssignmentProvider, useAssignment, useAssignmentActions } from './store/assignmentStore';
import AssignmentPageHeader from './components/AssignmentPageHeader';
import EnhancedProfessionalActionBar from './components/EnhancedProfessionalActionBar';
import AssignmentDetailsCard from './components/AssignmentDetailsCard';
import TeacherColumn from './components/TeacherColumn';
import ClassroomSubjectColumn from './components/ClassroomSubjectColumn';
import AssignmentTablePage from './components/AssignmentTablePage';
import Snackbar from './components/Snackbar';
import { sendTeacherReport, sendSummaryReport } from './utils/whatsapp';
import { loadSampleData } from './data/sampleData';
import { autoDistribute } from './utils/autoDistribute';
import toast from 'react-hot-toast';

const AssignmentPageContent: React.FC = () => {
  const { state } = useAssignment();
  const actions = useAssignmentActions();
  const [selectedTeachers, setSelectedTeachers] = useState<Set<string>>(new Set());
  const [showTablePage, setShowTablePage] = useState(false); // حالة لعرض صفحة الجدول

  // معالجة اختيار/إلغاء اختيار المعلم
  const handleToggleTeacher = (teacherId: string) => {
    setSelectedTeachers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teacherId)) {
        newSet.delete(teacherId);
      } else {
        newSet.add(teacherId);
      }
      return newSet;
    });
  };

  // معالجة النقر على مادة
  const handleSubjectClick = (classroomId: string, subjectId: string) => {
    const subject = state.subjects.find(s => s.id === subjectId);
    const classroom = state.classrooms.find(c => c.id === classroomId);

    if (!subject || !classroom) {
      toast.error('خطأ في البيانات');
      return;
    }

    // التحقق من وجود إسناد سابق
    const existingAssignment = state.assignments.find(
      a => a.classroomId === classroomId && 
           a.subjectId === subjectId && 
           a.status === 'active'
    );

    // إذا كانت المادة مسندة بالفعل
    if (existingAssignment) {
      // التحقق من أن هناك معلم محدد
      if (selectedTeachers.size === 0) {
        toast.error(
          <div className="flex items-center gap-2" dir="rtl" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
            <span className="text-lg">⚠️</span>
            <div>
              <div className="font-bold">تنبيه!</div>
              <div className="text-xs opacity-90">الرجاء اختيار معلم من بطاقة المعلمون لإلغاء الإسناد</div>
            </div>
          </div>,
          {
            duration: 3500,
            style: {
              background: '#f59e0b',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }
          }
        );
        return;
      }

      if (selectedTeachers.size > 1) {
        toast.error(
          <div className="flex items-center gap-2" dir="rtl" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
            <span className="text-lg">⚠️</span>
            <div>
              <div className="font-bold">تنبيه!</div>
              <div className="text-xs opacity-90">الرجاء اختيار معلم واحد فقط</div>
            </div>
          </div>,
          {
            duration: 3500,
            style: {
              background: '#f59e0b',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }
          }
        );
        return;
      }

      const selectedTeacherId = Array.from(selectedTeachers)[0];
      
      // التحقق من أن المادة مسندة للمعلم المحدد حالياً
      if (existingAssignment.teacherId !== selectedTeacherId) {
        const assignedTeacher = state.teachers.find(t => t.id === existingAssignment.teacherId);
        toast.error(
          <div className="flex items-center gap-2" dir="rtl" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
            <span className="text-lg">❌</span>
            <div>
              <div className="font-bold">خطأ في الإسناد!</div>
              <div className="text-xs opacity-90">{`هذه المادة مسندة للمعلم ${assignedTeacher?.name || 'آخر'}`}</div>
            </div>
          </div>,
          {
            duration: 4000,
            style: {
              background: '#ef4444',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }
          }
        );
        return;
      }

      // إلغاء الإسناد
      actions.deleteAssignment(existingAssignment.id);
      toast.success(
        <div className="flex items-center gap-2" dir="rtl" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
          <span className="text-lg">✅</span>
          <div>
            <div className="font-bold">تم الإلغاء بنجاح!</div>
            <div className="text-xs opacity-90">{`تم إلغاء إسناد ${subject.name} في ${classroom.name}`}</div>
          </div>
        </div>,
        {
          duration: 3500,
          style: {
            background: '#8779fb',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(135, 121, 251, 0.3)'
          }
        }
      );
      return;
    }

    // إذا لم تكن مسندة، نتحقق من اختيار معلم
    if (selectedTeachers.size === 0) {
      toast.error(
        <div className="flex items-center gap-2" dir="rtl" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
          <span className="text-lg">👨‍🏫</span>
          <div>
            <div className="font-bold">تنبيه!</div>
            <div className="text-xs opacity-90">الرجاء اختيار معلم من بطاقة المعلمون أولاً</div>
          </div>
        </div>,
        {
          duration: 3500,
          style: {
            background: '#f59e0b',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }
        }
      );
      return;
    }

    if (selectedTeachers.size > 1) {
      toast.error(
        <div className="flex items-center gap-2" dir="rtl" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
          <span className="text-lg">⚠️</span>
          <div>
            <div className="font-bold">تنبيه!</div>
            <div className="text-xs opacity-90">الرجاء اختيار معلم واحد فقط للإسناد</div>
          </div>
        </div>,
        {
          duration: 3500,
          style: {
            background: '#f59e0b',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }
        }
      );
      return;
    }

    const teacherId = Array.from(selectedTeachers)[0];
    const teacher = state.teachers.find(t => t.id === teacherId);

    if (!teacher) {
      toast.error('خطأ في البيانات');
      return;
    }

    // إضافة الإسناد الجديد
    const newAssignment = {
      id: `assignment-${Date.now()}`,
      teacherId,
      subjectId,
      classroomId,
      hoursPerWeek: subject.requiredHours,
      semester: 'first' as const,
      academicYear: state.settings.academicYear,
      status: 'active' as const,
      assignedAt: new Date().toISOString(),
      assignedBy: 'current-user', // يجب استبدالها بمعرف المستخدم الحقيقي
    };

    actions.addAssignment(newAssignment);
    toast.success(
      <div className="flex items-center gap-2" dir="rtl" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
        <span className="text-lg">✨</span>
        <div>
          <div className="font-bold">تم الإسناد بنجاح!</div>
          <div className="text-xs opacity-90">{`${subject.name} في ${classroom.name} ← ${teacher.name}`}</div>
        </div>
      </div>,
      {
        duration: 4000,
        style: {
          background: '#10b981',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        }
      }
    );
  };

  // معالجة إرسال واتساب
  const handleWhatsAppShare = () => {
    if (selectedTeachers.size === 0) {
      alert('الرجاء اختيار معلم أو أكثر');
      return;
    }

    if (selectedTeachers.size === 1) {
      const teacherId = Array.from(selectedTeachers)[0];
      sendTeacherReport(state, teacherId, '', { format: 'detailed' });
    } else {
      sendSummaryReport(state, '', { format: 'detailed' });
    }
  };

  // معالجة التوزيع التلقائي الذكي
  const handleAutoDistribute = () => {
    // إظهار رسالة جاري العمل
    const loadingToast = toast.loading('جاري تحليل البيانات وتوزيع الحصص...', {
      style: {
        background: '#fff',
        color: '#333',
        fontFamily: "'Noto Kufi Arabic', sans-serif"
      }
    });

    setTimeout(() => {
      try {
        const result = autoDistribute(
          state.teachers,
          state.subjects,
          state.classrooms,
          state.assignments,
          'current-user'
        );

        toast.dismiss(loadingToast);

        if (result.newAssignments.length === 0) {
          toast(
            <div className="flex items-center gap-2" dir="rtl" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
              <span className="text-lg">ℹ️</span>
              <div>
                <div className="font-bold">لم يتم إنشاء إسنادات جديدة</div>
                <div className="text-xs opacity-90">قد تكون جميع المواد مسندة أو المعلمون المتاحون مشغولون/يمتلكون نصاباً مكتملاً.</div>
              </div>
            </div>,
            {
              duration: 4000,
              style: {
                background: '#f59e0b',
                color: 'white',
              }
            }
          );
          return;
        }

        // حفظ الحالة للتراجع
        actions.saveStateToHistory();

        // إضافة الإسنادات الجديدة
        result.newAssignments.forEach(assignment => {
          actions.addAssignment(assignment);
        });

        toast.success(
          <div className="flex items-center gap-2" dir="rtl" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
            <span className="text-lg">✨</span>
            <div>
              <div className="font-bold">تم التوزيع الذكي بنجاح!</div>
              <div className="text-xs opacity-90">{`تم إنشاء ${result.newAssignments.length} إسناد جديد تلقائياً.`}</div>
            </div>
          </div>,
          {
            duration: 5000,
            style: {
              background: '#655ac1',
              color: 'white',
              fontFamily: "'Noto Kufi Arabic', sans-serif"
            }
          }
        );

      } catch (error) {
        console.error('Auto distribution error:', error);
        toast.dismiss(loadingToast);
        toast.error('حدث خطأ أثناء التوزيع التلقائي');
      }
    }, 1000); // تأخير بسيط لمحاكاة المعالجة
  };

  // إذا كانت صفحة الجدول مفتوحة، عرضها بدلاً من الصفحة الرئيسية
  if (showTablePage) {
    return <AssignmentTablePage onClose={() => setShowTablePage(false)} />;
  }

  return (
    <div className="min-h-screen pt-1 pb-6 px-6" style={{ background: 'linear-gradient(to bottom right, #f8f7ff, #e5e1fe)' }} dir="rtl">
      <div className="max-w-[1920px] mx-auto">
        {/* شريط العنوان */}
        <AssignmentPageHeader />

        {/* شريط الأزرار المطور الاحترافي */}
        <EnhancedProfessionalActionBar 
          selectedTeachers={selectedTeachers}
          onShowTablePage={() => setShowTablePage(true)}
          onAutoDistribute={handleAutoDistribute}
        />

        {/* بطاقة التفاصيل */}
        {selectedTeachers.size > 0 && (
          <AssignmentDetailsCard
            selectedTeachers={selectedTeachers}
            onClearSelection={() => setSelectedTeachers(new Set())}
          />
        )}

        {/* نظام الأعمدة الثلاثة */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* عمود المعلمين - أصغر */}
          <div className="lg:col-span-4">
            <TeacherColumn
              selectedTeachers={selectedTeachers}
              onToggleTeacher={handleToggleTeacher}
            />
          </div>

          {/* عمود الفصول والمواد - أكبر */}
          <div className="lg:col-span-8">
            <ClassroomSubjectColumn
              selectedTeachers={selectedTeachers}
              onSubjectClick={handleSubjectClick}
            />
          </div>
        </div>

        {/* الإشعارات */}
        <Snackbar />
      </div>
    </div>
  );
};

interface AssignmentPageProps {
  initialData?: {
    teachers?: any[];
    subjects?: any[];
    classrooms?: any[];
    assignments?: any[];
  };
  useSampleData?: boolean; // خيار لاستخدام البيانات التجريبية
}

const UpdatedAssignmentPage: React.FC<AssignmentPageProps> = ({ 
  initialData,
  useSampleData = true // افتراضياً نستخدم البيانات التجريبية
}) => {
  // تحميل البيانات التجريبية إذا طُلب ذلك
  const data = useSampleData ? loadSampleData() : initialData;
  
  return (
    <AssignmentProvider initialData={data}>
      <AssignmentPageContent />
    </AssignmentProvider>
  );
};

export default UpdatedAssignmentPage;
