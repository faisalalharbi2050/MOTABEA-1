/**
 * دوال التصدير المركزية - إسناد المواد
 * Central Export Functions
 */

import type { AssignmentState } from '../store/types';

/**
 * تصدير PDF محسّن مع دعم اللغة العربية - استخدام طباعة المتصفح
 */
export async function generateAssignmentPDF(state: AssignmentState): Promise<void> {
  try {
    // بيانات المدرسة
    const schoolData = JSON.parse(localStorage.getItem('schoolData') || '{}');
    const schoolName = schoolData.name || 'المدرسة';
    const administrators = JSON.parse(localStorage.getItem('administrators') || '[]');
    const educationalVice = administrators.find((admin: any) => admin.role === 'educational_vice');
    const principal = schoolData.principal || 'مدير المدرسة';

    const activeTeachers = state.teachers.filter(t => t.isActive);
    const activeAssignments = state.assignments.filter(a => a.status === 'active');
    
    // بناء بيانات الجدول
    const tableData: Array<{
      teacherName: string;
      specialization: string;
      subject: string;
      classrooms: string;
      teachingHours: number;
      waitingHours: number;
      totalHours: number;
    }> = [];

    activeTeachers.forEach((teacher) => {
      const teacherAssignments = activeAssignments.filter(a => a.teacherId === teacher.id);
      if (teacherAssignments.length === 0) return;

      const teachingHours = teacherAssignments.reduce((sum, a) => sum + a.hoursPerWeek, 0);
      const waitingHours = teacher.maxLoad - teacher.currentLoad;
      const totalHours = teachingHours + waitingHours;

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

      // إضافة صف لكل مادة
      Object.entries(subjectGroups).forEach(([subjectName, classrooms]) => {
        const classroomNames = classrooms.map(c => c.classroom).join(' - ');
        
        tableData.push({
          teacherName: teacher.name,
          specialization: teacher.specialization || '-',
          subject: subjectName,
          classrooms: classroomNames,
          teachingHours: teachingHours,
          waitingHours: waitingHours,
          totalHours: totalHours
        });
      });
    });

    // إنشاء HTML للطباعة
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('تعذر فتح نافذة الطباعة');
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير إسناد المواد الدراسية</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Noto Kufi Arabic', sans-serif;
            padding: 20px;
            direction: rtl;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 4px solid #6366f1;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #6366f1;
            font-size: 32px;
            margin-bottom: 10px;
            font-weight: 700;
          }
          .header .school-name {
            color: #1f2937;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 5px;
          }
          .header .date {
            color: #6b7280;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          th {
            background: #818cf8;
            color: white;
            padding: 15px 10px;
            text-align: center;
            font-weight: 700;
            font-size: 16px;
            border: 1px solid #818cf8;
          }
          td {
            padding: 12px 10px;
            text-align: center;
            border: 1px solid #e5e7eb;
            font-size: 14px;
            color: #374151;
          }
          tbody tr:nth-child(even) {
            background-color: #f9fafb;
          }
          tbody tr:hover {
            background-color: #eff6ff;
          }
          .footer {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
          }
          .signature {
            text-align: center;
          }
          .signature .title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 30px;
            font-size: 14px;
          }
          .signature .name {
            border-top: 2px solid #6366f1;
            padding-top: 10px;
            display: inline-block;
            min-width: 150px;
            font-weight: 700;
            color: #6366f1;
          }
          @media print {
            body { padding: 10px; }
            .header h1 { font-size: 28px; }
            th, td { padding: 10px 8px; font-size: 13px; }
          }
          @page {
            size: A4 landscape;
            margin: 15mm;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 تقرير إسناد المواد الدراسية</h1>
          <div class="school-name">${schoolName}</div>
          <div class="date">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')} - ${new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%">#</th>
              <th style="width: 20%">اسم المعلم</th>
              <th style="width: 15%">التخصص</th>
              <th style="width: 15%">المادة المسندة</th>
              <th style="width: 25%">الصف والفصل</th>
              <th style="width: 10%">نصاب الحصص</th>
              <th style="width: 10%">نصاب الانتظار</th>
              <th style="width: 10%">المجموع</th>
            </tr>
          </thead>
          <tbody>
            ${tableData.map((row, index) => `
              <tr>
                <td style="font-weight: 600; color: #6366f1;">${index + 1}</td>
                <td style="font-weight: 600; text-align: right; font-size: 14px;">${row.teacherName}</td>
                <td style="font-weight: 600; font-size: 14px;">${row.specialization}</td>
                <td style="font-weight: 600; font-size: 14px;">${row.subject}</td>
                <td style="text-align: right; font-size: 14px;">${row.classrooms}</td>
                <td style="font-weight: 700; color: #2563eb; font-size: 16px;">${row.teachingHours}</td>
                <td style="font-weight: 700; color: #16a34a; font-size: 16px;">${row.waitingHours}</td>
                <td style="font-weight: 700; color: ${row.totalHours > 24 ? '#ef4444' : '#000000'}; font-size: 16px;">
                  ${row.totalHours}${row.totalHours > 24 ? ' ⚠️' : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <div class="signature">
            <div class="title">وكيل الشؤون التعليمية</div>
            <div class="name">${educationalVice?.name || '_________________'}</div>
          </div>
          <div class="signature">
            <div class="title">مدير المدرسة</div>
            <div class="name">${principal || '_________________'}</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } catch (error) {
    console.error('خطأ في إنشاء PDF:', error);
    throw error;
  }
}

/**
 * تصدير Excel محسّن واحترافي
 */
export async function generateAssignmentExcel(state: AssignmentState): Promise<void> {
  try {
    const XLSX = await import('xlsx');
    
    // بيانات المدرسة
    const schoolData = JSON.parse(localStorage.getItem('schoolData') || '{}');
    const schoolName = schoolData.name || 'المدرسة';
    
    const activeTeachers = state.teachers.filter(t => t.isActive);
    const activeAssignments = state.assignments.filter(a => a.status === 'active');

    const rows: any[] = [];
    
    // رأس التقرير
    rows.push(['تقرير إسناد المواد الدراسية']);
    rows.push([schoolName]);
    rows.push([`التاريخ: ${new Date().toLocaleDateString('ar-SA')}`]);
    rows.push([]);
    
    // رأس الجدول
    rows.push(['م', 'اسم المعلم', 'التخصص', 'المادة المسندة', 'الصف والفصل', 'عدد الحصص', 'إجمالي النصاب']);
    
    let teacherIndex = 1;

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

      // إضافة صف لكل مادة
      Object.entries(subjectGroups).forEach(([subjectName, classrooms], index) => {
        const classroomNames = classrooms.map(c => c.classroom).join('، ');
        const subjectHours = classrooms.reduce((sum, c) => sum + c.hours, 0);

        rows.push([
          index === 0 ? teacherIndex : '',
          index === 0 ? teacher.name : '',
          index === 0 ? (teacher.specialization || '-') : '',
          subjectName,
          classroomNames,
          subjectHours,
          index === 0 ? totalHours : ''
        ]);
      });

      teacherIndex++;
    });

    // الإحصائيات
    rows.push([]);
    rows.push(['الإحصائيات']);
    rows.push(['إجمالي المعلمين', activeTeachers.length]);
    rows.push(['إجمالي الإسنادات', activeAssignments.length]);
    rows.push(['إجمالي الحصص', activeAssignments.reduce((sum, a) => sum + a.hoursPerWeek, 0)]);

    // إنشاء ورقة العمل
    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    // تنسيق الأعمدة
    const columnWidths = [
      { wch: 5 },  // م
      { wch: 25 }, // اسم المعلم
      { wch: 20 }, // التخصص
      { wch: 20 }, // المادة
      { wch: 30 }, // الفصول
      { wch: 12 }, // عدد الحصص
      { wch: 15 }  // إجمالي النصاب
    ];
    worksheet['!cols'] = columnWidths;

    // دمج خلايا العنوان
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // عنوان التقرير
      { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, // اسم المدرسة
      { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } }  // التاريخ
    ];

    // إنشاء كتاب العمل
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'إسناد المواد');
    
    // حفظ الملف
    XLSX.writeFile(workbook, `إسناد_المواد_${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('خطأ في إنشاء Excel:', error);
    throw error;
  }
}

/**
 * تصدير HTML كأكواد برمجية جاهزة للإضافة في قوقل كروم
 */
export async function generateAssignmentHTML(state: AssignmentState): Promise<void> {
  const activeTeachers = state.teachers.filter(t => t.isActive);
  const activeAssignments = state.assignments.filter(a => a.status === 'active');
  
  // بيانات المدرسة
  const schoolData = JSON.parse(localStorage.getItem('schoolData') || '{}');
  const schoolName = schoolData.name || 'المدرسة';

  // بناء بيانات JSON
  const assignmentsData: any[] = [];
  
  activeTeachers.forEach((teacher) => {
    const teacherAssignments = activeAssignments.filter(a => a.teacherId === teacher.id);
    if (teacherAssignments.length === 0) return;

    const totalHours = teacherAssignments.reduce((sum, a) => sum + a.hoursPerWeek, 0);
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

    assignmentsData.push({
      teacherId: teacher.id,
      teacherName: teacher.name,
      specialization: teacher.specialization || '',
      totalHours: totalHours,
      subjects: Object.entries(subjectGroups).map(([name, classrooms]) => ({
        name,
        classrooms: classrooms.map(c => c.classroom),
        hours: classrooms.reduce((sum, c) => sum + c.hours, 0)
      }))
    });
  });

  // إنشاء الأكواد البرمجية
  let html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>إسناد المواد - كود برمجي</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', sans-serif;
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 20px;
      direction: ltr;
      text-align: left;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: #252526;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    h1 {
      color: #4ec9b0;
      margin-bottom: 20px;
      font-size: 24px;
      border-bottom: 2px solid #4ec9b0;
      padding-bottom: 10px;
    }
    .info {
      background: #1e1e1e;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 4px solid #569cd6;
    }
    .info p {
      color: #ce9178;
      margin: 5px 0;
      font-size: 14px;
    }
    .code-section {
      margin-bottom: 30px;
    }
    .code-header {
      background: #007acc;
      color: white;
      padding: 10px 15px;
      border-radius: 6px 6px 0 0;
      font-weight: bold;
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .copy-btn {
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.4);
      color: white;
      padding: 5px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.3s;
    }
    .copy-btn:hover {
      background: rgba(255,255,255,0.3);
    }
    pre {
      background: #1e1e1e;
      padding: 20px;
      border-radius: 0 0 6px 6px;
      overflow-x: auto;
      border: 1px solid #3e3e3e;
    }
    code {
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.6;
    }
    .keyword { color: #569cd6; }
    .string { color: #ce9178; }
    .number { color: #b5cea8; }
    .function { color: #dcdcaa; }
    .comment { color: #6a9955; font-style: italic; }
    .property { color: #9cdcfe; }
    .operator { color: #d4d4d4; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📦 كود برمجي - إسناد المواد الدراسية</h1>
    
    <div class="info">
      <p><strong>المدرسة:</strong> ${schoolName}</p>
      <p><strong>التاريخ:</strong> ${new Date().toLocaleDateString('ar-SA')}</p>
      <p><strong>عدد المعلمين:</strong> ${assignmentsData.length}</p>
      <p><strong>عدد الإسنادات:</strong> ${activeAssignments.length}</p>
      <p><strong>الاستخدام:</strong> هذا الملف يحتوي على أكواد برمجية جاهزة لإضافتها في إضافة قوقل كروم</p>
    </div>

    <!-- قسم بيانات JSON -->
    <div class="code-section">
      <div class="code-header">
        <span>📄 بيانات JSON</span>
        <button class="copy-btn" onclick="copyCode('json-data')">نسخ الكود</button>
      </div>
      <pre id="json-data"><code><span class="comment">// بيانات إسناد المواد بصيغة JSON</span>
<span class="keyword">const</span> <span class="property">assignmentsData</span> <span class="operator">=</span> ${JSON.stringify(assignmentsData, null, 2)
    .replace(/"([^"]+)":/g, '<span class="property">$1</span>:')
    .replace(/: "([^"]+)"/g, ': <span class="string">"$1"</span>')
    .replace(/: (\d+)/g, ': <span class="number">$1</span>')
}<span class="operator">;</span></code></pre>
    </div>

    <!-- قسم كود JavaScript -->
    <div class="code-section">
      <div class="code-header">
        <span>⚡ كود JavaScript للمعالجة</span>
        <button class="copy-btn" onclick="copyCode('js-code')">نسخ الكود</button>
      </div>
      <pre id="js-code"><code><span class="comment">// دالة لعرض إسنادات معلم محدد</span>
<span class="keyword">function</span> <span class="function">getTeacherAssignments</span>(<span class="property">teacherId</span>) {
  <span class="keyword">return</span> assignmentsData.<span class="function">find</span>(<span class="property">t</span> <span class="operator">=></span> t.<span class="property">teacherId</span> <span class="operator">===</span> teacherId);
}

<span class="comment">// دالة للحصول على جميع المعلمين</span>
<span class="keyword">function</span> <span class="function">getAllTeachers</span>() {
  <span class="keyword">return</span> assignmentsData.<span class="function">map</span>(<span class="property">t</span> <span class="operator">=></span> ({
    id: t.<span class="property">teacherId</span>,
    name: t.<span class="property">teacherName</span>,
    totalHours: t.<span class="property">totalHours</span>
  }));
}

<span class="comment">// دالة للحصول على إجمالي الإحصائيات</span>
<span class="keyword">function</span> <span class="function">getStatistics</span>() {
  <span class="keyword">const</span> totalTeachers <span class="operator">=</span> assignmentsData.<span class="property">length</span>;
  <span class="keyword">const</span> totalHours <span class="operator">=</span> assignmentsData
    .<span class="function">reduce</span>((<span class="property">sum</span>, <span class="property">t</span>) <span class="operator">=></span> sum <span class="operator">+</span> t.<span class="property">totalHours</span>, <span class="number">0</span>);
  
  <span class="keyword">return</span> { totalTeachers, totalHours };
}

<span class="comment">// مثال على الاستخدام</span>
console.<span class="function">log</span>(<span class="string">'إجمالي المعلمين:'</span>, assignmentsData.<span class="property">length</span>);
console.<span class="function">log</span>(<span class="string">'الإحصائيات:'</span>, <span class="function">getStatistics</span>());</code></pre>
    </div>

    <!-- قسم كود HTML Component -->
    <div class="code-section">
      <div class="code-header">
        <span>🎨 مكون HTML لعرض البيانات</span>
        <button class="copy-btn" onclick="copyCode('html-component')">نسخ الكود</button>
      </div>
      <pre id="html-component"><code><span class="comment">// مكون React/Vue لعرض الإسنادات</span>
<span class="keyword">function</span> <span class="function">AssignmentDisplay</span>(<span class="operator">{</span> <span class="property">data</span> <span class="operator">}</span>) {
  <span class="keyword">return</span> (
    <span class="operator">&lt;</span><span class="keyword">div</span> className<span class="operator">=</span><span class="string">"assignments-container"</span><span class="operator">&gt;</span>
      {data.<span class="function">map</span>(<span class="property">teacher</span> <span class="operator">=></span> (
        <span class="operator">&lt;</span><span class="keyword">div</span> key<span class="operator">={</span>teacher.<span class="property">teacherId</span><span class="operator">}</span> className<span class="operator">=</span><span class="string">"teacher-card"</span><span class="operator">&gt;</span>
          <span class="operator">&lt;</span><span class="keyword">h3</span><span class="operator">&gt;{</span>teacher.<span class="property">teacherName</span><span class="operator">}&lt;/</span><span class="keyword">h3</span><span class="operator">&gt;</span>
          <span class="operator">&lt;</span><span class="keyword">p</span><span class="operator">&gt;</span>النصاب: {teacher.<span class="property">totalHours</span>} حصة<span class="operator">&lt;/</span><span class="keyword">p</span><span class="operator">&gt;</span>
          <span class="operator">&lt;</span><span class="keyword">ul</span><span class="operator">&gt;</span>
            {teacher.<span class="property">subjects</span>.<span class="function">map</span>(<span class="property">subject</span> <span class="operator">=></span> (
              <span class="operator">&lt;</span><span class="keyword">li</span> key<span class="operator">={</span>subject.<span class="property">name</span><span class="operator">}&gt;</span>
                {subject.<span class="property">name</span>} - {subject.<span class="property">classrooms</span>.<span class="function">join</span>(<span class="string">', '</span>)}
              <span class="operator">&lt;/</span><span class="keyword">li</span><span class="operator">&gt;</span>
            ))}
          <span class="operator">&lt;/</span><span class="keyword">ul</span><span class="operator">&gt;</span>
        <span class="operator">&lt;/</span><span class="keyword">div</span><span class="operator">&gt;</span>
      ))}
    <span class="operator">&lt;/</span><span class="keyword">div</span><span class="operator">&gt;</span>
  );
}</code></pre>
    </div>

  </div>

  <script>
    // دالة لنسخ الكود
    function copyCode(elementId) {
      const element = document.getElementById(elementId);
      const text = element.textContent;
      
      navigator.clipboard.writeText(text).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓ تم النسخ';
        btn.style.background = 'rgba(76, 175, 80, 0.3)';
        
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = 'rgba(255,255,255,0.2)';
        }, 2000);
      });
    }
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `إسناد_المواد_CODE_${new Date().toISOString().split('T')[0]}.html`;
  link.click();
}
