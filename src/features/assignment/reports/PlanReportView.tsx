/**
 * عرض تقرير الخطة الشاملة لإسناد المواد
 * Comprehensive Assignment Plan Report View
 */

import React, { useMemo, useCallback } from 'react';
import './print.css';
import { useNavigate } from 'react-router-dom';
import { useAssignment } from '../store/assignmentStore';
import { 
  selectActiveTeachers,
  selectActiveSubjects,
  selectActiveClassrooms,
  selectActiveAssignments,
  selectStatistics,
  selectUnassignedSubjects,
  selectOverloadedTeachers,
  selectIncompleteClassrooms
} from '../store/selectors';
import { exportData } from '../utils/csv';
import { downloadPlanPdf } from '../utils/PdfClient';

const PlanReportView: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAssignment();
  
  // البيانات الأساسية
  const teachers = selectActiveTeachers(state);
  const subjects = selectActiveSubjects(state);
  const classrooms = selectActiveClassrooms(state);
  const assignments = selectActiveAssignments(state);
  const statistics = selectStatistics(state);

  // وظائف التصدير
  const handleCSVDownload = useCallback(() => {
    exportData('plan', state);
  }, [state]);

  const handlePDFDownload = useCallback(async () => {
    await downloadPlanPdf(undefined, state);
  }, [state]);
  
  // المشاكل والتحديات
  const issues = {
    unassignedSubjects: selectUnassignedSubjects(state),
    overloadedTeachers: selectOverloadedTeachers(state),
    incompleteClassrooms: selectIncompleteClassrooms(state),
  };

  // إحصائيات شاملة
  const comprehensiveStats = useMemo(() => {
    // التوزيع حسب المرحلة
    const levelDistribution = {
      primary: {
        subjects: subjects.filter(s => s.level === 'primary').length,
        classrooms: classrooms.filter(c => c.level === 'primary').length,
        assignments: assignments.filter(a => {
          const subject = subjects.find(s => s.id === a.subjectId);
          return subject?.level === 'primary';
        }).length,
      },
      middle: {
        subjects: subjects.filter(s => s.level === 'middle').length,
        classrooms: classrooms.filter(c => c.level === 'middle').length,
        assignments: assignments.filter(a => {
          const subject = subjects.find(s => s.id === a.subjectId);
          return subject?.level === 'middle';
        }).length,
      },
      high: {
        subjects: subjects.filter(s => s.level === 'high').length,
        classrooms: classrooms.filter(c => c.level === 'high').length,
        assignments: assignments.filter(a => {
          const subject = subjects.find(s => s.id === a.subjectId);
          return subject?.level === 'high';
        }).length,
      },
    };

    // التوزيع حسب الفصل الدراسي
    const semesterDistribution = {
      first: assignments.filter(a => a.semester === 'first').length,
      second: assignments.filter(a => a.semester === 'second').length,
      full: assignments.filter(a => a.semester === 'full').length,
    };

    // إحصائيات الحمل
    const loadStats = {
      averageLoad: teachers.length > 0 
        ? Math.round(statistics.teacherLoad.reduce((sum, tl) => sum + tl.percentage, 0) / teachers.length)
        : 0,
      underloaded: statistics.teacherLoad.filter(tl => tl.percentage < 50).length,
      optimal: statistics.teacherLoad.filter(tl => tl.percentage >= 50 && tl.percentage < 90).length,
      overloaded: statistics.teacherLoad.filter(tl => tl.percentage >= 90).length,
    };

    // تغطية المواد
    const coverageStats = {
      fullyAssigned: statistics.subjectCoverage.filter(sc => sc.coverage >= 100).length,
      partiallyAssigned: statistics.subjectCoverage.filter(sc => sc.coverage > 0 && sc.coverage < 100).length,
      unassigned: statistics.subjectCoverage.filter(sc => sc.coverage === 0).length,
    };

    return {
      levelDistribution,
      semesterDistribution,
      loadStats,
      coverageStats,
    };
  }, [teachers, subjects, classrooms, assignments, statistics]);

  const levelLabels = {
    primary: 'الابتدائية',
    middle: 'المتوسطة',
    high: 'الثانوية',
  };

  return (
    <div className="assignment-plan-report">
      {/* رأس التقرير المطور */}
      <div className="assignment-report-header">
        {/* معلومات المدرسة والتاريخ */}
        <div className="assignment-report-school-info">
          <div className="assignment-school-name">
            {state.settings.schoolName || 'اسم المدرسة'}
          </div>
          <div className="assignment-report-date">
            تاريخ التقرير: {new Date().toLocaleDateString('ar-EG', {
              weekday: 'long',
              year: 'numeric',
              month: 'long', 
              day: 'numeric'
            })}
          </div>
          <div className="assignment-report-scope">
            نطاق التقرير: جميع المعلمين والمواد ({teachers.length} معلم، {subjects.length} مادة)
          </div>
        </div>

        <div className="assignment-report-title-section">
          <h1 className="assignment-report-title">تقرير الخطة الشاملة لإسناد المواد</h1>
          <div className="assignment-report-subtitle">
            خطة إسناد شاملة للعام الدراسي: {state.settings.academicYear}
          </div>
          <div className="assignment-report-breadcrumb no-print">
            <button 
              onClick={() => navigate('/assignment')}
              className="assignment-breadcrumb-link"
            >
              إسناد المواد
            </button>
            <i className="fas fa-chevron-left" aria-hidden="true"></i>
            <span>تقرير الخطة الشاملة</span>
          </div>
        </div>
        
        <div className="assignment-report-actions no-print">
          <button 
            className="assignment-btn assignment-btn-sm"
            onClick={() => window.print()}
            title="طباعة التقرير أو حفظه كـ PDF"
          >
            <i className="fas fa-print" aria-hidden="true"></i>
            <span>طباعة</span>
          </button>
          <button 
            className="assignment-btn assignment-btn-sm info"
            onClick={handleCSVDownload}
            title="تنزيل التقرير كملف CSV"
          >
            <i className="fas fa-file-csv" aria-hidden="true"></i>
            <span>CSV</span>
          </button>
          <button 
            className="assignment-btn assignment-btn-sm primary"
            onClick={handlePDFDownload}
            title="تنزيل التقرير كملف PDF (مباشر)"
          >
            <i className="fas fa-file-pdf" aria-hidden="true"></i>
            <span>تنزيل PDF</span>
          </button>
          <button 
            className="assignment-btn assignment-btn-sm success"
            onClick={() => {/* مشاركة واتساب */}}
            title="مشاركة التقرير عبر واتساب"
          >
            <i className="fab fa-whatsapp" aria-hidden="true"></i>
            <span>واتساب</span>
          </button>
          <button 
            className="assignment-btn assignment-btn-sm warning"
            onClick={() => {/* تصدير HTML */}}
          >
            <i className="fas fa-code" aria-hidden="true"></i>
            <span>HTML</span>
          </button>
        </div>
      </div>

      {/* ملخص تنفيذي */}
      <div className="assignment-report-section">
        <h2 className="assignment-section-title">الملخص التنفيذي</h2>
        <div className="assignment-executive-summary">
          <div className="assignment-summary-grid">
            <div className="assignment-summary-card">
              <div className="assignment-summary-number">{teachers.length}</div>
              <div className="assignment-summary-label">معلم</div>
            </div>
            <div className="assignment-summary-card">
              <div className="assignment-summary-number">{subjects.length}</div>
              <div className="assignment-summary-label">مادة</div>
            </div>
            <div className="assignment-summary-card">
              <div className="assignment-summary-number">{classrooms.length}</div>
              <div className="assignment-summary-label">فصل</div>
            </div>
            <div className="assignment-summary-card">
              <div className="assignment-summary-number">{assignments.length}</div>
              <div className="assignment-summary-label">إسناد</div>
            </div>
          </div>
          
          <div className="assignment-coverage-overview">
            <div className="assignment-coverage-item">
              <span className="assignment-coverage-label">تغطية المواد:</span>
              <span className="assignment-coverage-value">
                {Math.round((comprehensiveStats.coverageStats.fullyAssigned / subjects.length) * 100)}%
              </span>
            </div>
            <div className="assignment-coverage-item">
              <span className="assignment-coverage-label">متوسط حمل المعلمين:</span>
              <span className="assignment-coverage-value">{comprehensiveStats.loadStats.averageLoad}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* التوزيع حسب المراحل */}
      <div className="assignment-report-section">
        <h2 className="assignment-section-title">التوزيع حسب المراحل التعليمية</h2>
        <div className="assignment-level-stats">
          {Object.entries(comprehensiveStats.levelDistribution).map(([level, stats]) => (
            <div key={level} className="assignment-level-stat-card">
              <h3 className="assignment-level-stat-title">
                المرحلة {levelLabels[level as keyof typeof levelLabels]}
              </h3>
              <div className="assignment-level-stat-grid">
                <div className="assignment-level-stat-item">
                  <span className="assignment-stat-number">{stats.subjects}</span>
                  <span className="assignment-stat-label">مادة</span>
                </div>
                <div className="assignment-level-stat-item">
                  <span className="assignment-stat-number">{stats.classrooms}</span>
                  <span className="assignment-stat-label">فصل</span>
                </div>
                <div className="assignment-level-stat-item">
                  <span className="assignment-stat-number">{stats.assignments}</span>
                  <span className="assignment-stat-label">إسناد</span>
                </div>
                <div className="assignment-level-stat-item">
                  <span className="assignment-stat-number">
                    {stats.subjects > 0 ? Math.round((stats.assignments / (stats.subjects * stats.classrooms)) * 100) : 0}%
                  </span>
                  <span className="assignment-stat-label">التغطية</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* حالة المعلمين */}
      <div className="assignment-report-section">
        <h2 className="assignment-section-title">حالة المعلمين</h2>
        
        {/* إحصائيات الحمل */}
        <div className="assignment-teacher-load-stats">
          <div className="assignment-load-distribution">
            <div className="assignment-load-category">
              <div className="assignment-load-count">{comprehensiveStats.loadStats.underloaded}</div>
              <div className="assignment-load-label">تحت الحمل (&lt;50%)</div>
              <div className="assignment-load-color underload"></div>
            </div>
            <div className="assignment-load-category">
              <div className="assignment-load-count">{comprehensiveStats.loadStats.optimal}</div>
              <div className="assignment-load-label">حمل مثالي (50-90%)</div>
              <div className="assignment-load-color optimal"></div>
            </div>
            <div className="assignment-load-category">
              <div className="assignment-load-count">{comprehensiveStats.loadStats.overloaded}</div>
              <div className="assignment-load-label">محمّل زائد (≥90%)</div>
              <div className="assignment-load-color overload"></div>
            </div>
          </div>
        </div>

        {/* أفضل 5 معلمين من ناحية الحمل */}
        <div className="assignment-top-teachers">
          <h3>المعلمون الأكثر حملاً</h3>
          <div className="assignment-teachers-table">
            <table>
              <thead>
                <tr>
                  <th>المعلم</th>
                  <th>التخصص</th>
                  <th>الحمل الحالي</th>
                  <th>النسبة</th>
                  <th>عدد المواد</th>
                </tr>
              </thead>
              <tbody>
                {statistics.teacherLoad
                  .sort((a, b) => b.percentage - a.percentage)
                  .slice(0, 5)
                  .map(teacherLoad => {
                    const teacher = teachers.find(t => t.id === teacherLoad.teacherId);
                    const teacherSubjects = assignments
                      .filter(a => a.teacherId === teacherLoad.teacherId)
                      .map(a => subjects.find(s => s.id === a.subjectId))
                      .filter((s, i, arr) => s && arr.findIndex(sub => sub?.id === s.id) === i);
                    
                    return (
                      <tr key={teacherLoad.teacherId}>
                        <td>{teacher?.name}</td>
                        <td>{teacher?.specialization}</td>
                        <td>{teacherLoad.currentLoad}/{teacherLoad.maxLoad}</td>
                        <td>
                          <span className={`assignment-load-percentage ${
                            teacherLoad.percentage >= 90 ? 'high' :
                            teacherLoad.percentage >= 70 ? 'medium' : 'low'
                          }`}>
                            {teacherLoad.percentage}%
                          </span>
                        </td>
                        <td>{teacherSubjects.length}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* حالة المواد */}
      <div className="assignment-report-section">
        <h2 className="assignment-section-title">حالة المواد</h2>
        
        {/* إحصائيات التغطية */}
        <div className="assignment-subject-coverage-stats">
          <div className="assignment-coverage-distribution">
            <div className="assignment-coverage-category">
              <div className="assignment-coverage-count">{comprehensiveStats.coverageStats.fullyAssigned}</div>
              <div className="assignment-coverage-label">مسندة كاملة</div>
              <div className="assignment-coverage-color complete"></div>
            </div>
            <div className="assignment-coverage-category">
              <div className="assignment-coverage-count">{comprehensiveStats.coverageStats.partiallyAssigned}</div>
              <div className="assignment-coverage-label">مسندة جزئياً</div>
              <div className="assignment-coverage-color partial"></div>
            </div>
            <div className="assignment-coverage-category">
              <div className="assignment-coverage-count">{comprehensiveStats.coverageStats.unassigned}</div>
              <div className="assignment-coverage-label">غير مسندة</div>
              <div className="assignment-coverage-color unassigned"></div>
            </div>
          </div>
        </div>

        {/* المواد غير المسندة */}
        {issues.unassignedSubjects.length > 0 && (
          <div className="assignment-unassigned-subjects">
            <h3>المواد غير المسندة</h3>
            <div className="assignment-subjects-grid">
              {issues.unassignedSubjects.map(subject => (
                <div key={subject.id} className="assignment-unassigned-subject">
                  <div className="assignment-subject-name">{subject.name}</div>
                  <div className="assignment-subject-details">
                    <span className="assignment-subject-code">{subject.code}</span>
                    <span className="assignment-subject-level">
                      {levelLabels[subject.level]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* المشاكل والتحديات */}
      {(issues.overloadedTeachers.length > 0 || issues.incompleteClassrooms.length > 0 || issues.unassignedSubjects.length > 0) && (
        <div className="assignment-report-section">
          <h2 className="assignment-section-title">المشاكل والتحديات</h2>
          
          <div className="assignment-issues-grid">
            {/* المعلمون المحمّلون زائد */}
            {issues.overloadedTeachers.length > 0 && (
              <div className="assignment-issue-card">
                <h3 className="assignment-issue-title">
                  <i className="fas fa-exclamation-triangle text-warning" aria-hidden="true"></i>
                  معلمون محمّلون زائد ({issues.overloadedTeachers.length})
                </h3>
                <ul className="assignment-issue-list">
                  {issues.overloadedTeachers.slice(0, 3).map(teacher => (
                    <li key={teacher.id}>
                      {teacher.name} - {teacher.specialization}
                    </li>
                  ))}
                  {issues.overloadedTeachers.length > 3 && (
                    <li>... و{issues.overloadedTeachers.length - 3} معلمين آخرين</li>
                  )}
                </ul>
              </div>
            )}

            {/* الفصول غير المكتملة */}
            {issues.incompleteClassrooms.length > 0 && (
              <div className="assignment-issue-card">
                <h3 className="assignment-issue-title">
                  <i className="fas fa-exclamation-circle text-info" aria-hidden="true"></i>
                  فصول غير مكتملة الإسناد ({issues.incompleteClassrooms.length})
                </h3>
                <ul className="assignment-issue-list">
                  {issues.incompleteClassrooms.slice(0, 3).map(classroom => (
                    <li key={classroom.id}>
                      {classroom.name} ({classroom.grade} - {classroom.section})
                    </li>
                  ))}
                  {issues.incompleteClassrooms.length > 3 && (
                    <li>... و{issues.incompleteClassrooms.length - 3} فصول أخرى</li>
                  )}
                </ul>
              </div>
            )}

            {/* المواد غير المسندة */}
            {issues.unassignedSubjects.length > 0 && (
              <div className="assignment-issue-card">
                <h3 className="assignment-issue-title">
                  <i className="fas fa-times-circle text-danger" aria-hidden="true"></i>
                  مواد غير مسندة ({issues.unassignedSubjects.length})
                </h3>
                <ul className="assignment-issue-list">
                  {issues.unassignedSubjects.slice(0, 3).map(subject => (
                    <li key={subject.id}>
                      {subject.name} ({subject.code})
                    </li>
                  ))}
                  {issues.unassignedSubjects.length > 3 && (
                    <li>... و{issues.unassignedSubjects.length - 3} مواد أخرى</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* التوصيات */}
      <div className="assignment-report-section">
        <h2 className="assignment-section-title">التوصيات</h2>
        <div className="assignment-recommendations">
          <ul className="assignment-recommendations-list">
            {comprehensiveStats.loadStats.underloaded > 0 && (
              <li>
                <i className="fas fa-lightbulb text-warning" aria-hidden="true"></i>
                يوجد {comprehensiveStats.loadStats.underloaded} معلمين تحت الحمل المطلوب، يمكن إسناد مواد إضافية لهم
              </li>
            )}
            
            {issues.overloadedTeachers.length > 0 && (
              <li>
                <i className="fas fa-balance-scale text-info" aria-hidden="true"></i>
                يُنصح بإعادة توزيع الحصص للمعلمين المحملين زائد لتحسين التوازن
              </li>
            )}
            
            {issues.unassignedSubjects.length > 0 && (
              <li>
                <i className="fas fa-clipboard-check text-success" aria-hidden="true"></i>
                إكمال إسناد المواد المتبقية ({issues.unassignedSubjects.length} مادة) لضمان التغطية الكاملة
              </li>
            )}
            
            {comprehensiveStats.coverageStats.fullyAssigned / subjects.length >= 0.8 && (
              <li>
                <i className="fas fa-thumbs-up text-success" aria-hidden="true"></i>
                التغطية العامة للمواد جيدة، مع التركيز على التحسينات الطفيفة
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* تذييل التقرير */}
      <div className="assignment-report-footer">
        <div className="assignment-report-meta">
          <p>تم إنشاء هذا التقرير في: {new Date().toLocaleString('ar-EG')}</p>
          <p>إجمالي البيانات: {teachers.length} معلم، {subjects.length} مادة، {classrooms.length} فصل، {assignments.length} إسناد</p>
          <p>نظام إدارة إسناد المواد - مُتابَع</p>
        </div>
      </div>
    </div>
  );
};

export default PlanReportView;