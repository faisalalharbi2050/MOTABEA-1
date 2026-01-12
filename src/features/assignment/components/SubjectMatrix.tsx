/**
 * مصفوفة المواد والفصول لنظام إسناد المواد
 * Subject-Classroom Assignment Matrix
 */

import React, { useMemo } from 'react';
import { useAssignment, useAssignmentActions } from '../store/assignmentStore';
import { 
  selectFilteredSubjects, 
  selectActiveClassrooms,
  selectAssignmentsBySubject,
  selectAssignmentsByClassroom,
  selectSubjectTotalHours 
} from '../store/selectors';
import SubjectCard from './SubjectCard';

interface SubjectMatrixProps {
  className?: string;
}

const SubjectMatrix: React.FC<SubjectMatrixProps> = ({ className }) => {
  const { state } = useAssignment();
  const actions = useAssignmentActions();
  
  // البيانات المفلترة
  const filteredSubjects = selectFilteredSubjects(state);
  const activeClassrooms = selectActiveClassrooms(state);

  // ترتيب المواد حسب المرحلة ثم الاسم
  const sortedSubjects = useMemo(() => {
    return [...filteredSubjects].sort((a, b) => {
      // ترتيب المراحل: ابتدائي، متوسط، ثانوي
      const levelOrder = { primary: 1, middle: 2, high: 3 };
      const levelDiff = levelOrder[a.level] - levelOrder[b.level];
      
      if (levelDiff !== 0) return levelDiff;
      
      // ثم بالاسم أبجدياً
      return a.name.localeCompare(b.name, 'ar');
    });
  }, [filteredSubjects]);

  // حساب إحصائيات المصفوفة
  const matrixStats = useMemo(() => {
    const totalAssignments = state.assignments.filter(a => a.status === 'active').length;
    const assignedSubjects = new Set(state.assignments.map(a => a.subjectId)).size;
    const assignedClassrooms = new Set(state.assignments.map(a => a.classroomId)).size;
    
    return {
      totalSubjects: filteredSubjects.length,
      totalClassrooms: activeClassrooms.length,
      totalAssignments,
      assignedSubjects,
      assignedClassrooms,
      unassignedSubjects: filteredSubjects.length - assignedSubjects,
      coverage: filteredSubjects.length > 0 ? Math.round((assignedSubjects / filteredSubjects.length) * 100) : 0,
    };
  }, [filteredSubjects, activeClassrooms, state.assignments]);

  // تجميع المواد حسب المرحلة
  const subjectsByLevel = useMemo(() => {
    const groups = {
      primary: sortedSubjects.filter(s => s.level === 'primary'),
      middle: sortedSubjects.filter(s => s.level === 'middle'),
      high: sortedSubjects.filter(s => s.level === 'high'),
    };
    
    return Object.entries(groups).filter(([_, subjects]) => subjects.length > 0);
  }, [sortedSubjects]);

  const levelLabels = {
    primary: 'المرحلة الابتدائية',
    middle: 'المرحلة المتوسطة',
    high: 'المرحلة الثانوية',
  };

  return (
    <div className={`assignment-subject-matrix ${className || ''}`}>
      {/* معلومات المصفوفة */}
      <div className="assignment-matrix-header">
        <div className="assignment-matrix-stats">
          <div className="assignment-matrix-stat">
            <span className="assignment-stat-number">{matrixStats.totalSubjects}</span>
            <span className="assignment-stat-label">مادة</span>
          </div>
          <div className="assignment-matrix-stat">
            <span className="assignment-stat-number">{matrixStats.totalClassrooms}</span>
            <span className="assignment-stat-label">فصل</span>
          </div>
          <div className="assignment-matrix-stat">
            <span className="assignment-stat-number">{matrixStats.totalAssignments}</span>
            <span className="assignment-stat-label">إسناد</span>
          </div>
          <div className="assignment-matrix-stat">
            <span className="assignment-stat-number">{matrixStats.coverage}%</span>
            <span className="assignment-stat-label">التغطية</span>
          </div>
        </div>

        {/* تحذيرات */}
        {matrixStats.unassignedSubjects > 0 && (
          <div className="assignment-matrix-warning">
            <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
            <span>يوجد {matrixStats.unassignedSubjects} مواد غير مسندة</span>
          </div>
        )}
      </div>

      {/* المحتوى الرئيسي */}
      <div className="assignment-matrix-content">
        {subjectsByLevel.map(([level, subjects]) => (
          <div key={level} className="assignment-level-section">
            {/* عنوان المرحلة */}
            <div className="assignment-level-header" style={{ 
              background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <h3 className="assignment-level-title" style={{ color: '#ffffff', margin: 0 }}>
                {levelLabels[level as keyof typeof levelLabels]}
              </h3>
              <div className="assignment-level-stats" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <span className="assignment-level-count" style={{ color: '#ffffff', fontSize: '0.875rem' }}>
                  {subjects.length} {subjects.length === 1 ? 'مادة' : subjects.length === 2 ? 'مادتان' : 'مواد'}
                </span>
                <span className="assignment-level-assignments" style={{ color: '#ffffff', fontSize: '0.875rem' }}>
                  {subjects.reduce((total, subject) => {
                    return total + selectAssignmentsBySubject(state, subject.id).length;
                  }, 0)} {(() => {
                    const count = subjects.reduce((total, subject) => {
                      return total + selectAssignmentsBySubject(state, subject.id).length;
                    }, 0);
                    return count === 1 ? 'إسناد' : count === 2 ? 'إسنادان' : 'إسنادات';
                  })()}
                </span>
              </div>
            </div>

            {/* شبكة المواد */}
            <div className="assignment-subjects-grid">
              {subjects.map(subject => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  assignments={selectAssignmentsBySubject(state, subject.id)}
                  classrooms={activeClassrooms.filter(c => c.level === subject.level)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* حالة فارغة */}
        {sortedSubjects.length === 0 && (
          <div className="assignment-matrix-empty">
            <div className="assignment-empty-state">
              <div className="assignment-empty-icon">
                <i className="fas fa-book-open" aria-hidden="true"></i>
              </div>
              <div className="assignment-empty-title">لا توجد مواد</div>
              <div className="assignment-empty-text">
                {state.filters.searchTerm || Object.values(state.filters).some(f => f) 
                  ? 'لم يتم العثور على مواد مطابقة للفلاتر المحددة'
                  : 'لم يتم إضافة أي مواد بعد'
                }
              </div>
              <div className="assignment-empty-actions">
                {(state.filters.searchTerm || Object.values(state.filters).some(f => f)) && (
                  <button
                    className="assignment-btn assignment-btn-sm"
                    onClick={actions.clearFilters}
                  >
                    <i className="fas fa-times" aria-hidden="true"></i>
                    <span>مسح الفلاتر</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* معلومات إضافية في الأسفل */}
      {sortedSubjects.length > 0 && (
        <div className="assignment-matrix-footer">
          <div className="assignment-matrix-summary">
            <div className="assignment-summary-section">
              <h4>ملخص التغطية:</h4>
              <div className="assignment-coverage-bars">
                {subjectsByLevel.map(([level, subjects]) => {
                  const assignedCount = subjects.filter(subject => 
                    selectAssignmentsBySubject(state, subject.id).length > 0
                  ).length;
                  const coverage = subjects.length > 0 ? (assignedCount / subjects.length) * 100 : 0;
                  
                  return (
                    <div key={level} className="assignment-coverage-bar">
                      <div className="assignment-coverage-label">
                        {levelLabels[level as keyof typeof levelLabels]}
                      </div>
                      <div className="assignment-coverage-progress">
                        <div 
                          className="assignment-coverage-fill"
                          style={{ width: `${coverage}%` }}
                        ></div>
                      </div>
                      <div className="assignment-coverage-text">
                        {assignedCount}/{subjects.length} ({Math.round(coverage)}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* إجراءات سريعة */}
            <div className="assignment-summary-actions">
              <button
                className="assignment-btn assignment-btn-sm"
                onClick={() => {
                  // إظهار تقرير شامل
                }}
                title="عرض التقرير الشامل"
              >
                <i className="fas fa-chart-bar" aria-hidden="true"></i>
                <span>التقرير الشامل</span>
              </button>
              
              <button
                className="assignment-btn assignment-btn-sm primary"
                onClick={actions.toggleExportMenu}
                title="تصدير البيانات"
              >
                <i className="fas fa-download" aria-hidden="true"></i>
                <span>تصدير</span>
              </button>
              
              <button
                className="assignment-btn assignment-btn-sm success"
                onClick={actions.toggleWhatsAppMenu}
                title="مشاركة عبر واتساب"
              >
                <i className="fab fa-whatsapp" aria-hidden="true"></i>
                <span>مشاركة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectMatrix;