/**
 * الشريط الجانبي للمعلمين
 * Teachers Sidebar Rail
 */

import React, { useMemo } from 'react';
import { useAssignment, useAssignmentActions } from '../store/assignmentStore';
import { 
  selectFilteredTeachers, 
  selectTeacherWorkload, 
  selectAssignmentsByTeacher,
  selectTeacherSubjects,
  selectTeacherClassrooms
} from '../store/selectors';

interface TeacherRailProps {
  className?: string;
}

const TeacherRail: React.FC<TeacherRailProps> = ({ className }) => {
  const { state } = useAssignment();
  const actions = useAssignmentActions();
  
  // البيانات المفلترة
  const filteredTeachers = selectFilteredTeachers(state);
  const isCollapsed = !state.ui.sidebarOpen;

  // ترتيب المعلمين حسب الحمل
  const sortedTeachers = useMemo(() => {
    return [...filteredTeachers].sort((a, b) => {
      const loadA = selectTeacherWorkload(state, a.id);
      const loadB = selectTeacherWorkload(state, b.id);
      const percentageA = a.maxLoad > 0 ? (loadA / a.maxLoad) * 100 : 0;
      const percentageB = b.maxLoad > 0 ? (loadB / b.maxLoad) * 100 : 0;
      
      // ترتيب من الأعلى حملاً إلى الأقل
      return percentageB - percentageA;
    });
  }, [filteredTeachers, state]);

  // تحديد المعلم
  const handleTeacherSelect = (teacherId: string) => {
    const isSelected = state.ui.selectedItems.includes(teacherId);
    if (isSelected) {
      actions.selectItems(state.ui.selectedItems.filter(id => id !== teacherId));
    } else {
      actions.selectItems([...state.ui.selectedItems, teacherId]);
    }
  };

  // عرض تفاصيل المعلم
  const handleShowDetails = (teacherId: string) => {
    const isCurrentlyShown = state.ui.showTeacherDetails === teacherId;
    actions.showTeacherDetails(isCurrentlyShown ? undefined : teacherId);
  };

  // حساب نسبة الحمل ولونها
  const getLoadInfo = (teacher: any) => {
    const currentLoad = selectTeacherWorkload(state, teacher.id);
    const percentage = teacher.maxLoad > 0 ? (currentLoad / teacher.maxLoad) * 100 : 0;
    
    let loadClass = 'low';
    if (percentage >= 90) loadClass = 'high';
    else if (percentage >= 70) loadClass = 'medium';
    
    return {
      currentLoad,
      percentage: Math.round(percentage),
      loadClass,
      displayText: `${currentLoad}/${teacher.maxLoad}`,
    };
  };

  return (
    <aside className={`assignment-teacher-rail ${isCollapsed ? 'collapsed' : ''} ${className || ''}`}>
      {/* رأس الشريط الجانبي */}
      <div className="assignment-teacher-rail-header">
        {!isCollapsed && (
          <>
            <h3>المعلمون ({filteredTeachers.length})</h3>
            <div className="assignment-teacher-rail-actions">
              <button
                className="assignment-btn assignment-btn-sm"
                onClick={() => actions.clearSelection()}
                title="مسح التحديد"
                disabled={state.ui.selectedItems.length === 0}
              >
                <i className="fas fa-times" aria-hidden="true"></i>
              </button>
            </div>
          </>
        )}
        
        {isCollapsed && (
          <div className="assignment-teacher-rail-icon">
            <i className="fas fa-users" aria-hidden="true"></i>
          </div>
        )}
      </div>

      {/* قائمة المعلمين */}
      <div className="assignment-teacher-list-container">
        <ul className="assignment-teacher-list" role="listbox" aria-label="قائمة المعلمين">
          {sortedTeachers.map((teacher) => {
            const loadInfo = getLoadInfo(teacher);
            const isSelected = state.ui.selectedItems.includes(teacher.id);
            const isShowingDetails = state.ui.showTeacherDetails === teacher.id;
            const assignments = selectAssignmentsByTeacher(state, teacher.id);
            const subjects = selectTeacherSubjects(state, teacher.id);
            const classrooms = selectTeacherClassrooms(state, teacher.id);

            return (
              <li
                key={teacher.id}
                className={`assignment-teacher-item ${isSelected ? 'selected' : ''} ${isShowingDetails ? 'active' : ''}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleTeacherSelect(teacher.id)}
              >
                {/* محتوى المعلم العادي */}
                <div className="assignment-teacher-content">
                  {/* اسم المعلم والتخصص */}
                  <div className="assignment-teacher-main">
                    <div className="assignment-teacher-name" title={teacher.name}>
                      {isCollapsed ? teacher.name.split(' ')[0] : teacher.name}
                    </div>
                    {!isCollapsed && (
                      <div className="assignment-teacher-specialization" title={teacher.specialization}>
                        {teacher.specialization}
                      </div>
                    )}
                  </div>

                  {/* معلومات الحمل */}
                  <div className="assignment-teacher-load">
                    {!isCollapsed && (
                      <span className="assignment-teacher-load-text">
                        {loadInfo.displayText} ({loadInfo.percentage}%)
                      </span>
                    )}
                    <div className="assignment-teacher-load-bar">
                      <div
                        className={`assignment-teacher-load-fill ${loadInfo.loadClass}`}
                        style={{ width: `${Math.min(loadInfo.percentage, 100)}%` }}
                        title={`الحمل الحالي: ${loadInfo.percentage}%`}
                      ></div>
                    </div>
                  </div>

                  {/* أزرار الإجراءات */}
                  {!isCollapsed && (
                    <div className="assignment-teacher-actions">
                      <button
                        className={`assignment-teacher-action-btn ${isShowingDetails ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowDetails(teacher.id);
                        }}
                        title={isShowingDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                      >
                        <i className={`fas fa-${isShowingDetails ? 'chevron-up' : 'chevron-down'}`} aria-hidden="true"></i>
                      </button>
                    </div>
                  )}
                </div>

                {/* تفاصيل المعلم (تظهر عند الطلب) */}
                {isShowingDetails && !isCollapsed && (
                  <div className="assignment-teacher-details">
                    {/* إحصائيات سريعة */}
                    <div className="assignment-teacher-stats">
                      <div className="assignment-teacher-stat">
                        <span className="assignment-stat-value">{assignments.length}</span>
                        <span className="assignment-stat-label">إسناد</span>
                      </div>
                      <div className="assignment-teacher-stat">
                        <span className="assignment-stat-value">{subjects.length}</span>
                        <span className="assignment-stat-label">مادة</span>
                      </div>
                      <div className="assignment-teacher-stat">
                        <span className="assignment-stat-value">{classrooms.length}</span>
                        <span className="assignment-stat-label">فصل</span>
                      </div>
                    </div>

                    {/* المواد المسندة */}
                    {subjects.length > 0 && (
                      <div className="assignment-teacher-subjects">
                        <h5>المواد:</h5>
                        <ul className="assignment-subject-list">
                          {subjects.map(subject => (
                            <li key={subject.id} className="assignment-subject-item">
                              <span className="assignment-subject-name">{subject.name}</span>
                              <span className="assignment-subject-code">({subject.code})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* الفصول المسندة */}
                    {classrooms.length > 0 && (
                      <div className="assignment-teacher-classrooms">
                        <h5>الفصول:</h5>
                        <ul className="assignment-classroom-list">
                          {classrooms.map(classroom => (
                            <li key={classroom.id} className="assignment-classroom-item">
                              <span className="assignment-classroom-name">{classroom.name}</span>
                              <span className="assignment-classroom-grade">({classroom.grade} - {classroom.section})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* أزرار الإجراءات التفصيلية */}
                    <div className="assignment-teacher-detail-actions">
                      <button
                        className="assignment-btn assignment-btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // انتقال إلى تقرير المعلم
                        }}
                        title="عرض التقرير الكامل"
                      >
                        <i className="fas fa-file-alt" aria-hidden="true"></i>
                        <span>التقرير</span>
                      </button>
                      <button
                        className="assignment-btn assignment-btn-sm success"
                        onClick={(e) => {
                          e.stopPropagation();
                          // إرسال واتساب للمعلم
                        }}
                        title="إرسال واتساب"
                      >
                        <i className="fab fa-whatsapp" aria-hidden="true"></i>
                        <span>واتساب</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* مؤشر التحديد */}
                {isSelected && (
                  <div className="assignment-selection-indicator">
                    <i className="fas fa-check" aria-hidden="true"></i>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* رسالة عدم وجود معلمين */}
        {filteredTeachers.length === 0 && (
          <div className="assignment-empty-state">
            <div className="assignment-empty-icon">
              <i className="fas fa-users" aria-hidden="true"></i>
            </div>
            {!isCollapsed && (
              <>
                <div className="assignment-empty-title">لا يوجد معلمون</div>
                <div className="assignment-empty-text">
                  {state.filters.searchTerm || Object.values(state.filters).some(f => f) 
                    ? 'لم يتم العثور على معلمين مطابقين للفلاتر المحددة'
                    : 'لم يتم إضافة أي معلمين بعد'
                  }
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* معلومات سريعة في الأسفل */}
      {!isCollapsed && filteredTeachers.length > 0 && (
        <div className="assignment-teacher-rail-footer">
          <div className="assignment-quick-stats">
            <div className="assignment-quick-stat">
              <span className="assignment-stat-label">متوسط الحمل:</span>
              <span className="assignment-stat-value">
                {Math.round(
                  sortedTeachers.reduce((sum, teacher) => {
                    const load = selectTeacherWorkload(state, teacher.id);
                    return sum + (teacher.maxLoad > 0 ? (load / teacher.maxLoad) * 100 : 0);
                  }, 0) / sortedTeachers.length || 0
                )}%
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default TeacherRail;