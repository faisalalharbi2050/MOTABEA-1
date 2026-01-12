/**
 * منتقي الإسناد المضمن
 * Inline Assignment Picker
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAssignment, useAssignmentActions } from '../store/assignmentStore';
import { selectActiveTeachers, selectTeacherWorkload } from '../store/selectors';
import { validateAssignment } from '../store/validators';
import type { ID, Assignment } from '../store/types';

interface AssignInlinePickerProps {
  subjectId: ID;
  classroomId: ID;
  placeholder?: string;
  onAssignmentCreated?: (assignment: Assignment) => void;
  className?: string;
}

const AssignInlinePicker: React.FC<AssignInlinePickerProps> = ({
  subjectId,
  classroomId,
  placeholder = "اختر معلم...",
  onAssignmentCreated,
  className
}) => {
  const { state } = useAssignment();
  const actions = useAssignmentActions();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<ID>('');
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(2);
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // الحصول على المعلمين المتاحين
  const availableTeachers = selectActiveTeachers(state).filter(teacher => {
    // يمكن إضافة منطق إضافي هنا لتصفية المعلمين المناسبين
    return teacher.isActive;
  });

  // ترتيب المعلمين حسب الحمل الحالي (الأقل حملاً أولاً)
  const sortedTeachers = [...availableTeachers].sort((a, b) => {
    const loadA = selectTeacherWorkload(state, a.id);
    const loadB = selectTeacherWorkload(state, b.id);
    const percentageA = a.maxLoad > 0 ? (loadA / a.maxLoad) * 100 : 0;
    const percentageB = b.maxLoad > 0 ? (loadB / b.maxLoad) * 100 : 0;
    
    return percentageA - percentageB;
  });

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // إنشاء الإسناد
  const handleCreateAssignment = async () => {
    if (!selectedTeacherId) return;

    setIsCreating(true);

    try {
      const newAssignment: Assignment = {
        id: `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        teacherId: selectedTeacherId,
        subjectId,
        classroomId,
        hoursPerWeek,
        semester: state.settings.defaultSemester,
        academicYear: state.settings.academicYear,
        status: 'active',
        assignedAt: new Date().toISOString(),
        assignedBy: 'current-user', // سيتم استبدالها بمعرف المستخدم الحالي
      };

      // التحقق من صحة الإسناد
      const validation = validateAssignment(newAssignment, state, state.assignments);
      
      if (!validation.isValid) {
        alert(`خطأ في الإسناد:\n${validation.errors.join('\n')}`);
        return;
      }

      // عرض التحذيرات إن وجدت
      if (validation.warnings.length > 0) {
        const proceed = confirm(
          `تحذيرات:\n${validation.warnings.join('\n')}\n\nهل تريد المتابعة؟`
        );
        if (!proceed) return;
      }

      // حفظ الحالة الحالية في التاريخ قبل الإضافة
      actions.saveStateToHistory();
      
      // إضافة الإسناد
      actions.addAssignment(newAssignment);

      // إعادة تعيين النموذج
      setSelectedTeacherId('');
      setHoursPerWeek(2);
      setIsOpen(false);

      // استدعاء callback إذا كان موجوداً
      onAssignmentCreated?.(newAssignment);

    } catch (error) {
      console.error('خطأ في إنشاء الإسناد:', error);
      alert('حدث خطأ في إنشاء الإسناد. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsCreating(false);
    }
  };

  // معلومات المعلم المختار
  const selectedTeacher = selectedTeacherId ? 
    availableTeachers.find(t => t.id === selectedTeacherId) : null;

  return (
    <div className={`assignment-inline-picker ${className || ''}`} ref={dropdownRef}>
      {/* زر فتح المنتقي */}
      <button
        className={`assignment-picker-button ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isCreating}
        type="button"
      >
        {isCreating ? (
          <>
            <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
            <span>جارٍ الإنشاء...</span>
          </>
        ) : selectedTeacher ? (
          <>
            <i className="fas fa-user" aria-hidden="true"></i>
            <span>{selectedTeacher.name}</span>
          </>
        ) : (
          <>
            <i className="fas fa-plus" aria-hidden="true"></i>
            <span>{placeholder}</span>
          </>
        )}
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} assignment-picker-arrow`} aria-hidden="true"></i>
      </button>

      {/* قائمة منبثقة للاختيار */}
      {isOpen && (
        <div className="assignment-picker-dropdown">
          {/* حقل عدد الحصص */}
          <div className="assignment-picker-hours">
            <label className="assignment-picker-label">عدد الحصص الأسبوعية:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(parseInt(e.target.value) || 1)}
              className="assignment-picker-input"
            />
          </div>

          {/* قائمة المعلمين */}
          <div className="assignment-picker-teachers">
            <div className="assignment-picker-label">اختر المعلم:</div>
            <div className="assignment-picker-options">
              {sortedTeachers.map(teacher => {
                const currentLoad = selectTeacherWorkload(state, teacher.id);
                const percentage = teacher.maxLoad > 0 ? (currentLoad / teacher.maxLoad) * 100 : 0;
                const newLoad = currentLoad + hoursPerWeek;
                const newPercentage = teacher.maxLoad > 0 ? (newLoad / teacher.maxLoad) * 100 : 0;
                const isOverloaded = newLoad > teacher.maxLoad;
                const isSelected = selectedTeacherId === teacher.id;

                return (
                  <div
                    key={teacher.id}
                    className={`assignment-picker-option ${isSelected ? 'selected' : ''} ${isOverloaded ? 'overloaded' : ''}`}
                    onClick={() => setSelectedTeacherId(teacher.id)}
                  >
                    <div className="assignment-picker-teacher-info">
                      <div className="assignment-picker-teacher-name">
                        {teacher.name}
                      </div>
                      <div className="assignment-picker-teacher-load">
                        <span className="assignment-current-load">
                          الحمل الحالي: {currentLoad}/{teacher.maxLoad} ({Math.round(percentage)}%)
                        </span>
                        {hoursPerWeek > 0 && (
                          <span className={`assignment-new-load ${isOverloaded ? 'overloaded' : ''}`}>
                            → {newLoad}/{teacher.maxLoad} ({Math.round(newPercentage)}%)
                            {isOverloaded && ' ⚠️'}
                          </span>
                        )}
                      </div>
                      <div className="assignment-picker-teacher-specialization">
                        {teacher.specialization}
                      </div>
                    </div>
                    
                    {/* شريط تقدم الحمل */}
                    <div className="assignment-picker-load-bar">
                      <div 
                        className={`assignment-picker-load-fill current ${
                          percentage >= 90 ? 'high' : percentage >= 70 ? 'medium' : 'low'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                      {hoursPerWeek > 0 && (
                        <div 
                          className={`assignment-picker-load-fill preview ${isOverloaded ? 'overloaded' : ''}`}
                          style={{ 
                            left: `${Math.min(percentage, 100)}%`,
                            width: `${Math.min(newPercentage - percentage, 100 - percentage)}%`
                          }}
                        ></div>
                      )}
                    </div>

                    {/* أيقونة التحديد */}
                    {isSelected && (
                      <div className="assignment-picker-check">
                        <i className="fas fa-check" aria-hidden="true"></i>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="assignment-picker-actions">
            <button
              className="assignment-btn assignment-btn-sm"
              onClick={() => setIsOpen(false)}
              disabled={isCreating}
            >
              إلغاء
            </button>
            <button
              className="assignment-btn assignment-btn-sm primary"
              onClick={handleCreateAssignment}
              disabled={!selectedTeacherId || isCreating}
            >
              {isCreating ? 'جارٍ الإنشاء...' : 'إنشاء الإسناد'}
            </button>
          </div>

          {/* رسائل تحذيرية */}
          {selectedTeacher && hoursPerWeek > 0 && (
            <div className="assignment-picker-validation">
              {(() => {
                const currentLoad = selectTeacherWorkload(state, selectedTeacher.id);
                const newLoad = currentLoad + hoursPerWeek;
                
                if (newLoad > selectedTeacher.maxLoad) {
                  return (
                    <div className="assignment-validation-warning">
                      <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
                      <span>تحذير: سيتجاوز هذا الإسناد الحد الأقصى للمعلم</span>
                    </div>
                  );
                } else if (newLoad > selectedTeacher.maxLoad * 0.9) {
                  return (
                    <div className="assignment-validation-info">
                      <i className="fas fa-info-circle" aria-hidden="true"></i>
                      <span>ملاحظة: سيقارب هذا الإسناد الحد الأقصى للمعلم</span>
                    </div>
                  );
                }
                
                return null;
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignInlinePicker;