/**
 * دالة تصدير إسناد المواد إلى HTML لمنصة مدرستي
 * Export Assignment to HTML for Madrasati Platform
 */

import type { AssignmentState } from '../store/types';

export const generateAssignmentHTML = async (state: AssignmentState) => {
  const activeTeachers = state.teachers.filter(t => t.isActive);
  const activeAssignments = state.assignments.filter(a => a.status === 'active');

  let html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>إسناد المواد - منصة مدرستي</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      direction: rtl;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      text-align: center;
      color: #4f46e5;
      margin-bottom: 10px;
      font-size: 28px;
    }
    .date {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
    }
    .teacher-card {
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
    }
    .teacher-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 2px solid #4f46e5;
    }
    .teacher-name {
      font-size: 20px;
      font-weight: bold;
      color: #1f2937;
    }
    .teacher-specialization {
      color: #6b7280;
      font-size: 14px;
    }
    .total-hours {
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 16px;
    }
    .subject-row {
      display: flex;
      align-items: center;
      padding: 12px;
      margin-bottom: 8px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      transition: all 0.3s ease;
    }
    .subject-row:hover {
      border-color: #4f46e5;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.1);
    }
    .subject-name {
      flex: 1;
      font-weight: bold;
      color: #374151;
      font-size: 16px;
    }
    .classrooms {
      flex: 2;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .classroom-tag {
      background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 500;
    }
    .hours-badge {
      background: #10b981;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: bold;
      font-size: 14px;
      margin-right: 10px;
    }
    .stats {
      margin-top: 40px;
      padding: 20px;
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      border-radius: 8px;
      color: white;
      display: flex;
      justify-content: space-around;
      text-align: center;
    }
    .stat-item {
      flex: 1;
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .stat-label {
      font-size: 14px;
      opacity: 0.9;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>تقرير إسناد المواد الدراسية</h1>
    <div class="date">التاريخ: ${new Date().toLocaleDateString('ar-SA')}</div>
    
    <div class="teachers-list">
`;

  activeTeachers.forEach((teacher) => {
    const teacherAssignments = activeAssignments.filter(a => a.teacherId === teacher.id);
    
    if (teacherAssignments.length === 0) return;

    const totalHours = teacherAssignments.reduce((sum, a) => sum + a.hoursPerWeek, 0);

    // تجميع حسب المادة
    const subjectGroups: { [key: string]: Array<{ classroom: string; hours: number }> } = {};
    
    teacherAssignments.forEach(assignment => {
      const subject = state.subjects.find(s => s.id === assignment.subjectId);
      const classroom = state.classrooms.find(c => c.id === assignment.classroomId);
      
      if (!subject) return;
      
      const subjectName = subject.name;
      if (!subjectGroups[subjectName]) {
        subjectGroups[subjectName] = [];
      }
      
      subjectGroups[subjectName].push({
        classroom: classroom?.name || 'غير معروف',
        hours: assignment.hoursPerWeek
      });
    });

    html += `
      <div class="teacher-card">
        <div class="teacher-header">
          <div>
            <div class="teacher-name">${teacher.name}</div>
            <div class="teacher-specialization">${teacher.specialization || 'التخصص غير محدد'}</div>
          </div>
          <div class="total-hours">${totalHours} ${totalHours === 1 ? 'حصة' : totalHours === 2 ? 'حصتان' : 'حصص'}</div>
        </div>
        <div class="subjects-list">
`;

    Object.entries(subjectGroups).forEach(([subjectName, classrooms]) => {
      const subjectHours = classrooms.reduce((sum, c) => sum + c.hours, 0);
      
      html += `
          <div class="subject-row">
            <div class="subject-name">${subjectName}</div>
            <div class="classrooms">
`;

      classrooms.forEach(c => {
        html += `              <span class="classroom-tag">${c.classroom}</span>\n`;
      });

      html += `
            </div>
            <div class="hours-badge">${subjectHours} ${subjectHours === 1 ? 'حصة' : subjectHours === 2 ? 'حصتان' : 'حصص'}</div>
          </div>
`;
    });

    html += `
        </div>
      </div>
`;
  });

  const totalAssignedHours = activeAssignments.reduce((sum, a) => sum + a.hoursPerWeek, 0);

  html += `
    </div>
    
    <div class="stats">
      <div class="stat-item">
        <div class="stat-value">${activeTeachers.length}</div>
        <div class="stat-label">عدد المعلمين</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${activeAssignments.length}</div>
        <div class="stat-label">عدد الإسنادات</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${totalAssignedHours}</div>
        <div class="stat-label">إجمالي الحصص</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  // إنشاء وتحميل الملف
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `إسناد_المواد_منصة_مدرستي_${new Date().toISOString().split('T')[0]}.html`;
  link.click();
};
