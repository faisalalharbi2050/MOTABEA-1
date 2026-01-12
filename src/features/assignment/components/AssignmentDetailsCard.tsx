/**
 * بطاقة تفاصيل الإسناد - تعرض ملخص الإسنادات للمعلم أو المعلمين المحددين
 * Assignment Details Card Component - Enhanced with Accordion
 */

import React, { useMemo, useState } from 'react';
import { User, BookOpen, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useAssignment } from '../store/assignmentStore';

interface AssignmentDetailsCardProps {
  selectedTeachers: Set<string>;
  onClearSelection?: () => void;
}

const AssignmentDetailsCard: React.FC<AssignmentDetailsCardProps> = ({
  selectedTeachers,
  onClearSelection,
}) => {
  const { state } = useAssignment();
  const [expandedTeachers, setExpandedTeachers] = useState<Set<string>>(new Set());

  // toggle expanded state for a teacher
  const toggleTeacher = (teacherId: string) => {
    setExpandedTeachers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teacherId)) {
        newSet.delete(teacherId);
      } else {
        newSet.add(teacherId);
      }
      return newSet;
    });
  };

  // جمع تفاصيل المعلمين المحددين
  const teacherDetails = useMemo(() => {
    return Array.from(selectedTeachers).map(teacherId => {
      const teacher = state.teachers.find(t => t.id === teacherId);
      if (!teacher) return null;

      const teacherAssignments = state.assignments.filter(
        a => a.teacherId === teacherId && a.status === 'active'
      );

      const totalHours = teacherAssignments.reduce((sum, a) => sum + a.hoursPerWeek, 0);
      const maxLoad = teacher.maxLoad || 24;
      const percentage = (totalHours / maxLoad) * 100;

      // تجميع الإسنادات حسب المادة
      const subjectGroups = teacherAssignments.reduce((groups, assignment) => {
        const subject = state.subjects.find(s => s.id === assignment.subjectId);
        const classroom = state.classrooms.find(c => c.id === assignment.classroomId);
        
        if (!subject) return groups;

        const subjectName = subject.name;
        if (!groups[subjectName]) {
          groups[subjectName] = [];
        }
        
        groups[subjectName].push({
          classroomName: classroom?.name || 'فصل غير معروف',
          hours: assignment.hoursPerWeek,
        });

        return groups;
      }, {} as Record<string, Array<{ classroomName: string; hours: number }>>);

      return {
        teacher,
        totalHours,
        maxLoad,
        percentage,
        subjectGroups,
      };
    }).filter(Boolean);
  }, [selectedTeachers, state.teachers, state.assignments, state.subjects, state.classrooms]);

  // لون الشريط حسب النسبة
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (selectedTeachers.size === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-xl shadow-lg border-2 border-blue-200 p-6 mb-4" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
            <User className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
            تفاصيل الإسناد
          </h3>
        </div>
        <button
          onClick={onClearSelection}
          className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
          title="إلغاء التحديد"
        >
          <X className="h-5 w-5 text-gray-600 group-hover:text-red-600" />
        </button>
      </div>

      {/* تفاصيل كل معلم مع Accordion */}
      <div className="space-y-2">
        {teacherDetails.map((details, index) => {
          if (!details) return null;
          
          const { teacher, totalHours, maxLoad, percentage, subjectGroups } = details;
          const isExpanded = expandedTeachers.has(teacher.id);

          return (
            <div
              key={teacher.id}
              className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden transition-all duration-300"
            >
              {/* رأس قابل للنقر */}
              <button
                onClick={() => toggleTeacher(teacher.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' }}>
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-right">
                    <h4 className="text-base font-bold text-gray-800" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                      {teacher.name}
                    </h4>
                    {teacher.specialization && (
                      <p className="text-xs text-gray-500" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                        {teacher.specialization}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* شريط النصاب المصغر */}
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-600" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                        النصاب:
                      </span>
                      <span className="text-sm font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif", color: '#6366f1' }}>
                        {totalHours}/{maxLoad}
                      </span>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(percentage)} transition-all duration-300`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* أيقونة التوسيع */}
                  <div className="p-1 rounded-full bg-gray-100">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                </div>
              </button>

              {/* المحتوى القابل للتوسيع */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50 animate-in slide-in-from-top-2 duration-200">
                  {Object.keys(subjectGroups).length > 0 ? (
                    <div className="space-y-2 pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4" style={{ color: '#6366f1' }} />
                        <h5 className="text-sm font-bold text-gray-700" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                          المواد المسندة ({Object.keys(subjectGroups).length})
                        </h5>
                      </div>
                      {Object.entries(subjectGroups).map(([subjectName, classrooms]) => {
                        const totalSubjectHours = classrooms.reduce((sum, c) => sum + c.hours, 0);
                        
                        return (
                          <div key={subjectName} className="rounded-lg p-3 border border-gray-200 bg-white">
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-bold text-gray-800 text-sm" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                                {subjectName}
                              </span>
                              <span className="text-white text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: '#6366f1' }}>
                                {totalSubjectHours} {totalSubjectHours === 1 ? 'حصة' : totalSubjectHours === 2 ? 'حصتان' : 'حصص'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {classrooms.map((classroom, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-blue-50 text-gray-700 px-2 py-1 rounded border"
                                  style={{ fontFamily: "'Noto Kufi Arabic', sans-serif", borderColor: '#818cf8' }}
                                >
                                  {classroom.classroomName}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      <p style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                        لا توجد إسنادات لهذا المعلم
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignmentDetailsCard;
