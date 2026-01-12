/**
 * عرض تقرير المعلم المفرد
 * Individual Teacher Report View
 */

import React, { useMemo, useCallback } from 'react';
import './print.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssignment } from '../store/assignmentStore';
import { 
  selectTeacherById,
  selectAssignmentsByTeacher,
  selectTeacherSubjects,
  selectTeacherClassrooms,
  selectTeacherWorkload
} from '../store/selectors';
import { exportTeacherReportCSV } from '../utils/csv';
import { downloadTeacherPdf } from '../utils/PdfClient';

interface TeacherReportViewProps {
  teacherId?: string; // إما من الـ URL أو مُمرر مباشرة
}

const TeacherReportView: React.FC<TeacherReportViewProps> = ({ teacherId: propTeacherId }) => {
  const params = useParams();
  const navigate = useNavigate();
  const { state } = useAssignment();
  
  const teacherId = propTeacherId || params.id;
  const teacher = teacherId ? selectTeacherById(state, teacherId) : null;
  const assignments = teacherId ? selectAssignmentsByTeacher(state, teacherId) : [];
  const subjects = teacherId ? selectTeacherSubjects(state, teacherId) : [];
  const classrooms = teacherId ? selectTeacherClassrooms(state, teacherId) : [];
  const workload = teacherId ? selectTeacherWorkload(state, teacherId) : 0;

  // وظائف التصدير
  const handleCSVDownload = useCallback(() => {
    if (teacherId) {
      exportTeacherReportCSV(state, teacherId);
    }
  }, [state, teacherId]);

  const handlePDFDownload = useCallback(async () => {
    if (teacherId && teacher) {
      await downloadTeacherPdf(teacherId, state);
    }
  }, [teacherId, teacher, state]);

  // حساب الإحصائيات التفصيلية
  const statistics = useMemo(() => {
    if (!teacher) return null;

    const workloadPercentage = teacher.maxLoad > 0 ? (workload / teacher.maxLoad) * 100 : 0;
    
    // تجميع الحصص حسب الفصل الدراسي
    const semesterBreakdown = assignments.reduce((acc, assignment) => {
      if (!acc[assignment.semester]) {
        acc[assignment.semester] = 0;
      }
      acc[assignment.semester] += assignment.hoursPerWeek;
      return acc;
    }, {} as Record<string, number>);

    // تجميع الحصص حسب المرحلة
    const levelBreakdown = assignments.reduce((acc, assignment) => {
      const subject = state.subjects.find(s => s.id === assignment.subjectId);
      const level = subject?.level || 'unknown';
      if (!acc[level]) {
        acc[level] = 0;
      }
      acc[level] += assignment.hoursPerWeek;
      return acc;
    }, {} as Record<string, number>);

    return {
      workloadPercentage: Math.round(workloadPercentage * 100) / 100,
      remainingCapacity: Math.max(0, teacher.maxLoad - workload),
      semesterBreakdown,
      levelBreakdown,
      averageHoursPerSubject: subjects.length > 0 ? Math.round((workload / subjects.length) * 100) / 100 : 0,
      subjectsCount: subjects.length,
      classroomsCount: classrooms.length,
      assignmentsCount: assignments.length,
    };
  }, [teacher, assignments, subjects, classrooms, workload, state.subjects]);

  if (!teacher) {
    return (
      <div className="assignment-report-error">
        <div className="assignment-empty-state">
          <div className="assignment-empty-icon">
            <i className="fas fa-user-times" aria-hidden="true"></i>
          </div>
          <div className="assignment-empty-title">المعلم غير موجود</div>
          <div className="assignment-empty-text">
            لم يتم العثور على المعلم المطلوب أو تم حذفه
          </div>
          <div className="assignment-empty-actions">
            <button 
              className="assignment-btn"
              onClick={() => navigate('/assignment')}
            >
              العودة للإسناد
            </button>
          </div>
        </div>
      </div>
    );
  }

  const semesterLabels = {
    first: 'الفصل الأول',
    second: 'الفصل الثاني',
    full: 'العام الكامل',
  };

  const levelLabels = {
    primary: 'الابتدائي',
    middle: 'المتوسط',
    high: 'الثانوي',
  };

  return (
    <div className="assignment-teacher-report">
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
            نطاق التقرير: معلم واحد ({teacher.name})
          </div>
        </div>

        <div className="assignment-report-title-section">
          <h1 className="assignment-report-title">تقرير إسناد المواد - المعلم</h1>
          <div className="assignment-report-subtitle">
            تقرير شامل عن إسناد المواد للمعلم: {teacher.name}
          </div>
          <div className="assignment-report-breadcrumb no-print">
            <button 
              onClick={() => navigate('/assignment')}
              className="assignment-breadcrumb-link"
            >
              إسناد المواد
            </button>
            <i className="fas fa-chevron-left" aria-hidden="true"></i>
            <span>تقرير المعلم</span>
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
        </div>
      </div>

      {/* معلومات المعلم الأساسية */}
      <div className="assignment-report-section">
        <h2 className="assignment-section-title">معلومات المعلم</h2>
        <div className="assignment-teacher-info-grid">
          <div className="assignment-info-item">
            <span className="assignment-info-label">الاسم:</span>
            <span className="assignment-info-value">{teacher.name}</span>
          </div>
          <div className="assignment-info-item">
            <span className="assignment-info-label">التخصص:</span>
            <span className="assignment-info-value">{teacher.specialization}</span>
          </div>
          <div className="assignment-info-item">
            <span className="assignment-info-label">البريد الإلكتروني:</span>
            <span className="assignment-info-value">{teacher.email || 'غير محدد'}</span>
          </div>
          <div className="assignment-info-item">
            <span className="assignment-info-label">الهاتف:</span>
            <span className="assignment-info-value">{teacher.phone || 'غير محدد'}</span>
          </div>
          <div className="assignment-info-item">
            <span className="assignment-info-label">الحد الأقصى للحصص:</span>
            <span className="assignment-info-value">{teacher.maxLoad} حصة/أسبوع</span>
          </div>
          <div className="assignment-info-item">
            <span className="assignment-info-label">الحالة:</span>
            <span className={`assignment-status ${teacher.isActive ? 'active' : 'inactive'}`}>
              {teacher.isActive ? 'نشط' : 'غير نشط'}
            </span>
          </div>
        </div>
      </div>

      {/* إحصائيات الحمل */}
      <div className="assignment-report-section">
        <h2 className="assignment-section-title">إحصائيات الحمل</h2>
        <div className="assignment-workload-stats">
          <div className="assignment-workload-card">
            <div className="assignment-workload-number">{workload}</div>
            <div className="assignment-workload-label">الحصص الحالية</div>
          </div>
          <div className="assignment-workload-card">
            <div className="assignment-workload-number">{statistics?.workloadPercentage}%</div>
            <div className="assignment-workload-label">نسبة الحمل</div>
          </div>
          <div className="assignment-workload-card">
            <div className="assignment-workload-number">{statistics?.remainingCapacity}</div>
            <div className="assignment-workload-label">الحصص المتبقية</div>
          </div>
          <div className="assignment-workload-card">
            <div className="assignment-workload-number">{statistics?.averageHoursPerSubject}</div>
            <div className="assignment-workload-label">متوسط الحصص/مادة</div>
          </div>
        </div>
        
        {/* شريط تقدم الحمل */}
        <div className="assignment-workload-progress">
          <div className="assignment-workload-bar">
            <div 
              className={`assignment-workload-fill ${
                statistics!.workloadPercentage >= 90 ? 'high' :
                statistics!.workloadPercentage >= 70 ? 'medium' : 'low'
              }`}
              style={{ width: `${Math.min(statistics!.workloadPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="assignment-workload-labels">
            <span>0</span>
            <span>{teacher.maxLoad}</span>
          </div>
        </div>
      </div>

      {/* تفاصيل المواد والإسنادات */}
      <div className="assignment-report-section">
        <h2 className="assignment-section-title">المواد والإسنادات</h2>
        <div className="assignment-assignments-table">
          <table>
            <thead>
              <tr>
                <th>المادة</th>
                <th>الفصل</th>
                <th>الحصص/أسبوع</th>
                <th>الفصل الدراسي</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(assignment => {
                const subject = state.subjects.find(s => s.id === assignment.subjectId);
                const classroom = state.classrooms.find(c => c.id === assignment.classroomId);
                
                return (
                  <tr key={assignment.id}>
                    <td>
                      <div className="assignment-subject-cell">
                        <div className="assignment-subject-name">
                          {subject?.name || 'مادة غير معروفة'}
                        </div>
                        <div className="assignment-subject-code">
                          {subject?.code}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="assignment-classroom-cell">
                        <div className="assignment-classroom-name">
                          {classroom?.name || 'فصل غير معروف'}
                        </div>
                        <div className="assignment-classroom-details">
                          {classroom?.grade} - {classroom?.section}
                        </div>
                      </div>
                    </td>
                    <td className="assignment-hours-cell">
                      {assignment.hoursPerWeek}
                    </td>
                    <td>
                      {semesterLabels[assignment.semester] || assignment.semester}
                    </td>
                    <td>
                      <span className={`assignment-status ${assignment.status}`}>
                        {assignment.status === 'active' ? 'نشط' :
                         assignment.status === 'pending' ? 'معلق' : 'ملغى'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {assignments.length === 0 && (
          <div className="assignment-empty-state">
            <div className="assignment-empty-icon">
              <i className="fas fa-clipboard-list" aria-hidden="true"></i>
            </div>
            <div className="assignment-empty-title">لا توجد إسنادات</div>
            <div className="assignment-empty-text">
              لم يتم إسناد أي مواد لهذا المعلم بعد
            </div>
          </div>
        )}
      </div>

      {/* توزيع الحصص */}
      {statistics && (
        <div className="assignment-report-section">
          <h2 className="assignment-section-title">توزيع الحصص</h2>
          <div className="assignment-distribution-grid">
            {/* توزيع حسب الفصل الدراسي */}
            <div className="assignment-distribution-card">
              <h3>حسب الفصل الدراسي</h3>
              <div className="assignment-distribution-items">
                {Object.entries(statistics.semesterBreakdown).map(([semester, hours]) => (
                  <div key={semester} className="assignment-distribution-item">
                    <span className="assignment-distribution-label">
                      {semesterLabels[semester as keyof typeof semesterLabels] || semester}
                    </span>
                    <span className="assignment-distribution-value">
                      {hours} حصة
                    </span>
                    <div className="assignment-distribution-bar">
                      <div 
                        className="assignment-distribution-fill"
                        style={{ width: `${(hours / workload) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* توزيع حسب المرحلة */}
            <div className="assignment-distribution-card">
              <h3>حسب المرحلة</h3>
              <div className="assignment-distribution-items">
                {Object.entries(statistics.levelBreakdown).map(([level, hours]) => (
                  <div key={level} className="assignment-distribution-item">
                    <span className="assignment-distribution-label">
                      {levelLabels[level as keyof typeof levelLabels] || level}
                    </span>
                    <span className="assignment-distribution-value">
                      {hours} حصة
                    </span>
                    <div className="assignment-distribution-bar">
                      <div 
                        className="assignment-distribution-fill"
                        style={{ width: `${(hours / workload) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* معلومات إضافية */}
      <div className="assignment-report-section">
        <h2 className="assignment-section-title">معلومات إضافية</h2>
        <div className="assignment-additional-info">
          <div className="assignment-info-item">
            <span className="assignment-info-label">تاريخ الإنشاء:</span>
            <span className="assignment-info-value">
              {new Date(teacher.createdAt).toLocaleDateString('ar-EG')}
            </span>
          </div>
          <div className="assignment-info-item">
            <span className="assignment-info-label">آخر تحديث:</span>
            <span className="assignment-info-value">
              {new Date(teacher.updatedAt).toLocaleDateString('ar-EG')}
            </span>
          </div>
          <div className="assignment-info-item">
            <span className="assignment-info-label">عدد المواد:</span>
            <span className="assignment-info-value">{statistics?.subjectsCount} مادة</span>
          </div>
          <div className="assignment-info-item">
            <span className="assignment-info-label">عدد الفصول:</span>
            <span className="assignment-info-value">{statistics?.classroomsCount} فصل</span>
          </div>
        </div>
      </div>

      {/* تذييل التقرير */}
      <div className="assignment-report-footer">
        <div className="assignment-report-meta">
          <p>تم إنشاء هذا التقرير في: {new Date().toLocaleString('ar-EG')}</p>
          <p>السنة الدراسية: {state.settings.academicYear}</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherReportView;