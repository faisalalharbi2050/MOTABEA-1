/**
 * بطاقة المادة مع الفصول والإسنادات
 * Subject Card with Classrooms and Assignments
 */

import React, { useState, useMemo } from 'react';
import { useAssignment, useAssignmentActions } from '../store/assignmentStore';
import { 
  selectTeacherById,
  selectAssignmentsByClassroom,
  selectSubjectTotalHours 
} from '../store/selectors';
import type { Subject, Classroom, Assignment } from '../store/types';
import AssignInlinePicker from './AssignInlinePicker';

interface SubjectCardProps {
  subject: Subject;
  assignments: Assignment[];
  classrooms: Classroom[];
  className?: string;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ 
  subject, 
  assignments, 
  classrooms,
  className 
}) => {
  const { state } = useAssignment();
  const actions = useAssignmentActions();
  const [expandedClassroom, setExpandedClassroom] = useState<string | null>(null);

  // حساب التقدم العام للمادة
  const progress = useMemo(() => {
    const totalHours = selectSubjectTotalHours(state, subject.id);
    const requiredHours = subject.requiredHours * classrooms.length;
    const percentage = requiredHours > 0 ? (totalHours / requiredHours) * 100 : 0;
    
    return {
      totalHours,
      requiredHours,
      percentage: Math.min(percentage, 100),
      isComplete: percentage >= 100,
      isOverAssigned: percentage > 100,
    };
  }, [subject, assignments, classrooms, state]);

  // تجميع الإسنادات حسب الفصل
  const assignmentsByClassroom = useMemo(() => {
    const grouped = new Map();
    
    classrooms.forEach(classroom => {
      const classroomAssignments = assignments.filter(a => a.classroomId === classroom.id);
      grouped.set(classroom.id, {
        classroom,
        assignments: classroomAssignments,
        totalHours: classroomAssignments.reduce((sum, a) => sum + a.hoursPerWeek, 0),
        isAssigned: classroomAssignments.length > 0,
        teachers: classroomAssignments.map(a => selectTeacherById(state, a.teacherId)).filter(Boolean),
      });
    });
    
    return grouped;
  }, [assignments, classrooms, state]);

  // تحديد/إلغاء تحديد المادة
  const handleSubjectSelect = () => {
    actions.toggleItemSelection(subject.id);
  };

  // توسيع/طي تفاصيل الفصل
  const toggleClassroomExpansion = (classroomId: string) => {
    setExpandedClassroom(expandedClassroom === classroomId ? null : classroomId);
  };

  // حذف إسناد
  const handleDeleteAssignment = (assignmentId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الإسناد؟')) {
      actions.deleteAssignment(assignmentId);
    }
  };

  const isSelected = state.ui.selectedItems.includes(subject.id);

  return (
    <div className={`assignment-subject-card ${isSelected ? 'selected' : ''} ${className || ''}`}>
      {/* رأس بطاقة المادة */}
      <div className="assignment-subject-card-header" onClick={handleSubjectSelect}>
        <div className="assignment-subject-title-section">
          <h4 className="assignment-subject-title">{subject.name}</h4>
          <div className="assignment-subject-meta">
            <span className="assignment-subject-code">{subject.code}</span>
            <span className="assignment-subject-level">
              {subject.level === 'primary' && 'ابتدائي'}
              {subject.level === 'middle' && 'متوسط'}
              {subject.level === 'high' && 'ثانوي'}
            </span>
          </div>
        </div>
        
        <div className="assignment-subject-progress">
          <div className="assignment-progress-info">
            <span className="assignment-progress-text">
              {progress.totalHours}/{progress.requiredHours} حصة
            </span>
            <span className={`assignment-progress-percentage ${progress.isOverAssigned ? 'over' : progress.isComplete ? 'complete' : ''}`}>
              {Math.round(progress.percentage)}%
            </span>
          </div>
          <div className="assignment-progress-bar">
            <div 
              className={`assignment-progress-fill ${
                progress.isOverAssigned ? 'over' : progress.isComplete ? 'complete' : ''
              }`}
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
        </div>

        {/* مؤشر التحديد */}
        {isSelected && (
          <div className="assignment-selection-indicator">
            <i className="fas fa-check" aria-hidden="true"></i>
          </div>
        )}
      </div>

      {/* جسم البطاقة - قائمة الفصول */}
      <div className="assignment-subject-body">
        <div className="assignment-classroom-list">
          {Array.from(assignmentsByClassroom.values()).map(({ classroom, assignments: classroomAssignments, totalHours, isAssigned, teachers }) => (
            <div 
              key={classroom.id}
              className={`assignment-classroom-item ${isAssigned ? 'assigned' : 'unassigned'}`}
            >
              {/* معلومات الفصل الأساسية */}
              <div className="assignment-classroom-header">
                <div className="assignment-classroom-info">
                  <span className="assignment-classroom-name">
                    {classroom.name}
                  </span>
                  <span className="assignment-classroom-details">
                    ({classroom.grade} - {classroom.section})
                  </span>
                </div>

                <div className="assignment-classroom-assignment">
                  {isAssigned ? (
                    <div className="assignment-assigned-info">
                      <span className="assignment-hours">{totalHours} حصة</span>
                      {teachers.length > 0 && (
                        <span className="assignment-teacher">
                          {teachers[0]?.name}
                          {teachers.length > 1 && ` +${teachers.length - 1}`}
                        </span>
                      )}
                      <button
                        className="assignment-expand-btn"
                        onClick={() => toggleClassroomExpansion(classroom.id)}
                        title={expandedClassroom === classroom.id ? 'طي التفاصيل' : 'توسيع التفاصيل'}
                      >
                        <i className={`fas fa-chevron-${expandedClassroom === classroom.id ? 'up' : 'down'}`} aria-hidden="true"></i>
                      </button>
                    </div>
                  ) : (
                    <AssignInlinePicker
                      subjectId={subject.id}
                      classroomId={classroom.id}
                      onAssignmentCreated={() => {
                        // يتم تحديث الحالة تلقائياً من خلال المخزن
                      }}
                    />
                  )}
                </div>
              </div>

              {/* تفاصيل الإسنادات (عند التوسيع) */}
              {isAssigned && expandedClassroom === classroom.id && (
                <div className="assignment-classroom-details">
                  <div className="assignment-assignments-list">
                    {classroomAssignments.map(assignment => {
                      const teacher = selectTeacherById(state, assignment.teacherId);
                      return (
                        <div key={assignment.id} className="assignment-detail-item">
                          <div className="assignment-detail-info">
                            <span className="assignment-teacher-name">
                              {teacher?.name || 'معلم غير معروف'}
                            </span>
                            <span className="assignment-hours-detail">
                              {assignment.hoursPerWeek} حصة/أسبوع
                            </span>
                            <span className="assignment-semester">
                              {assignment.semester === 'first' && 'الفصل الأول'}
                              {assignment.semester === 'second' && 'الفصل الثاني'}
                              {assignment.semester === 'full' && 'العام الكامل'}
                            </span>
                          </div>
                          
                          <div className="assignment-detail-actions">
                            <button
                              className="assignment-action-btn edit"
                              onClick={() => {
                                // فتح نافذة تحرير الإسناد
                              }}
                              title="تحرير الإسناد"
                            >
                              <i className="fas fa-edit" aria-hidden="true"></i>
                            </button>
                            <button
                              className="assignment-action-btn delete"
                              onClick={() => handleDeleteAssignment(assignment.id)}
                              title="حذف الإسناد"
                            >
                              <i className="fas fa-trash" aria-hidden="true"></i>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* إضافة إسناد إضافي */}
                  <div className="assignment-add-more">
                    <AssignInlinePicker
                      subjectId={subject.id}
                      classroomId={classroom.id}
                      placeholder="إضافة معلم آخر..."
                      onAssignmentCreated={() => {
                        // يتم تحديث الحالة تلقائياً
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ملخص المادة */}
        <div className="assignment-subject-summary">
          <div className="assignment-summary-stats">
            <span className="assignment-summary-stat">
              <i className="fas fa-chalkboard-teacher" aria-hidden="true"></i>
              {assignments.length} إسناد
            </span>
            <span className="assignment-summary-stat">
              <i className="fas fa-clock" aria-hidden="true"></i>
              {progress.totalHours} حصة
            </span>
            <span className="assignment-summary-stat">
              <i className="fas fa-door-open" aria-hidden="true"></i>
              {Array.from(assignmentsByClassroom.values()).filter(item => item.isAssigned).length}/{classrooms.length} فصل
            </span>
          </div>

          {/* أزرار الإجراءات */}
          <div className="assignment-subject-actions">
            <button
              className="assignment-btn assignment-btn-sm"
              onClick={() => {
                // عرض تقرير المادة
              }}
              title="عرض تقرير المادة"
            >
              <i className="fas fa-chart-line" aria-hidden="true"></i>
            </button>
            <button
              className="assignment-btn assignment-btn-sm success"
              onClick={() => {
                // مشاركة تفاصيل المادة
              }}
              title="مشاركة تفاصيل المادة"
            >
              <i className="fas fa-share" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        {/* تحذيرات وملاحظات */}
        {progress.isOverAssigned && (
          <div className="assignment-card-warning">
            <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
            <span>تحذير: الحصص المسندة تتجاوز المطلوب</span>
          </div>
        )}
        
        {assignmentsByClassroom.size === 0 && (
          <div className="assignment-card-info">
            <i className="fas fa-info-circle" aria-hidden="true"></i>
            <span>لا توجد فصول متاحة لهذه المرحلة</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectCard;